<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SuperAdmin;
use App\Mail\AccountCreatedMail;
use App\Mail\AccountDeletedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\Notification;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request)
    {
        // Only SuperAdmin can list users
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $users = User::latest()->get();
        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        // Only SuperAdmin can create users
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Require RFC-compliant email and a resolvable domain
            'email' => 'required|email:rfc,dns|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        // Capture raw password for email, then hash for storage
        $rawPassword = $validated['password'];
        $validated['password'] = Hash::make($rawPassword);

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        $user = User::create($validated);

        // Notify success to the acting SuperAdmin (role-aware)
        $createdRole = $user->role ?: 'User';
        $createdRoleLabel = (strtolower($createdRole) === 'super admin')
            ? 'Super Admin'
            : ucwords(strtolower($createdRole));

        Notification::create([
            'title' => $createdRoleLabel . ' Account Created',
            'message' => $createdRoleLabel . ' account created: ' . $user->email,
            'type' => 'success',
            'recipient_admin_id' => $request->user()->id,
        ]);

        // Prevent duplicate emails across super_admins and users was enforced earlier,
        // but double-check: if a SuperAdmin exists with same email rollback and error.
        if (SuperAdmin::where('email', $user->email)->exists()) {
            // delete created user to avoid duplicates
            $user->delete();
            Notification::create([
                'title' => 'Account Creation Failed',
                'message' => 'Email already registered as a Super Admin: ' . $validated['email'],
                'type' => 'error',
                'recipient_admin_id' => $request->user()->id,
            ]);
            return response()->json(['message' => 'Email already registered as a Super Admin'], 422);
        }

        // Send credentials email to admin/creator accounts
        $role = $validated['role'] ?? null;
        if ($role && in_array(strtolower($role), ['admin', 'creator'])) {
            try {
                Mail::to($user->email)->send(new AccountCreatedMail($user->name, $user->email, $rawPassword));
            } catch (\Throwable $e) {
                Log::error('Failed to send AccountCreatedMail', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
                // Do not block user creation on mail failure
                Notification::create([
                    'title' => 'Mail Delivery Warning',
                    'message' => 'Failed to send credentials email to: ' . $user->email,
                    'type' => 'warning',
                    'recipient_admin_id' => $request->user()->id,
                ]);
            }
        }

        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, $id)
    {
        // Only SuperAdmin can view specific user
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        // Only SuperAdmin can update users
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // If the ID does not exist in users table, it might belong to SuperAdmin.
        // Handle cross-table role conversion when changing roles.
        $user = User::find($id);
        if (!$user) {
            // If converting from Super Admin to Admin/User, the frontend may still call /users/{id}
            // Try to fetch as SuperAdmin and convert if requested
            $asAdmin = SuperAdmin::find($id);
            if (!$asAdmin) {
                // Preserve original error message semantics
                return response()->json(['message' => "No query results for model [App\\Models\\User] $id"], 404);
            }
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // RFC email + DNS domain check on update as well
            'email' => ['sometimes', 'required', 'email:rfc,dns', Rule::unique('users')->ignore($user?->id)],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        // Prevent updating email to one that belongs to a SuperAdmin
        if (array_key_exists('email', $validated) && SuperAdmin::where('email', $validated['email'])->exists()) {
            Notification::create([
                'title' => 'Update Failed',
                'message' => 'Email belongs to a Super Admin: ' . $validated['email'],
                'type' => 'error',
                'recipient_admin_id' => $request->user()->id,
            ]);
            return response()->json(['message' => 'Email already registered as a Super Admin'], 422);
        }

        // Hash password if provided
        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Don't update password if not provided
        }

        // If this request targets an existing User record
        if ($user) {
            // Prevent updating email to one that belongs to a SuperAdmin
            if (array_key_exists('email', $validated) && SuperAdmin::where('email', $validated['email'])->exists()) {
                return response()->json(['message' => 'Email already registered as a Super Admin'], 422);
            }

            // Hash password if provided
            if (isset($validated['password']) && !empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']); // Don't update password if not provided
            }

            // If changing role to Super Admin, convert across tables
            if (isset($validated['role']) && strcasecmp($validated['role'], 'Super Admin') === 0) {
                // Block if a SuperAdmin with this email already exists
                if (SuperAdmin::where('email', $user->email)->exists()) {
                    return response()->json(['message' => 'Email already registered as a Super Admin'], 422);
                }

                // Create SuperAdmin with existing hashed password
                $admin = SuperAdmin::create([
                    'name' => $validated['name'] ?? $user->name,
                    'email' => $validated['email'] ?? $user->email,
                    'password' => $user->password,
                ]);

                // Delete the original user
                $user->delete();

                return response()->json([
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => 'Super Admin',
                    'status' => 'Active',
                ]);
            }

            // Normal user update
            $user->update($validated);
            return response()->json($user);
        }

        // Otherwise, converting a SuperAdmin to regular User via /users/{id}
        $admin = SuperAdmin::findOrFail($id);

        // If email collides with existing user, use that record; otherwise create
        $existingUser = User::where('email', $admin->email)->first();

        if ($existingUser) {
            // Update existing user with provided fields
            $payload = [
                'name' => $validated['name'] ?? $existingUser->name ?? $admin->name,
                'email' => $validated['email'] ?? $existingUser->email ?? $admin->email,
                'role' => $validated['role'] ?? ($existingUser->role ?: 'Admin'),
                'status' => $validated['status'] ?? ($existingUser->status ?: 'Active'),
            ];
            if (isset($validated['password']) && !empty($validated['password'])) {
                $payload['password'] = Hash::make($validated['password']);
            } else {
                $payload['password'] = $existingUser->password ?? $admin->password; // keep current/historical
            }
            $existingUser->update($payload);
            // Delete SuperAdmin record after conversion
            $admin->delete();
            return response()->json($existingUser);
        }

        // Create a new user with fields (carry over hashed password)
        $newUser = User::create([
            'name' => $validated['name'] ?? $admin->name,
            'email' => $validated['email'] ?? $admin->email,
            'password' => isset($validated['password']) && !empty($validated['password'])
                ? Hash::make($validated['password'])
                : $admin->password,
            'role' => $validated['role'] ?? 'Admin',
            'status' => $validated['status'] ?? 'Active',
        ]);

        // Delete SuperAdmin record after conversion
        $admin->delete();

        return response()->json($newUser);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, $id)
    {
        // Only SuperAdmin can delete users
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::findOrFail($id);

        // Capture details before deletion
        $name = $user->name;
        $email = $user->email;
        $role = $user->role ?: 'User';
        $roleLabel = (strtolower($role) === 'super admin') ? 'Super Admin' : ucwords(strtolower($role));

        $user->delete();

        // Notify user about deletion (best-effort)
        try {
            Mail::to($email)->send(new AccountDeletedMail($name, $email));
        } catch (\Throwable $e) {
            Log::error('Failed to send AccountDeletedMail', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            // Emit a warning notification if mail fails
            Notification::create([
                'title' => 'Mail Delivery Warning',
                'message' => 'Failed to send account deletion email to: ' . $email,
                'type' => 'warning',
                'recipient_admin_id' => $request->user()->id,
            ]);
        }

        // Emit a success notification for the acting Super Admin (role-aware)
        Notification::create([
            'title' => $roleLabel . ' Account Deleted',
            'message' => $roleLabel . ' account deleted: ' . $email,
            'type' => 'success',
            'recipient_admin_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
