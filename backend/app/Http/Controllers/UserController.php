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

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // RFC email + DNS domain check on update as well
            'email' => ['sometimes', 'required', 'email:rfc,dns', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        // Hash password if provided
        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Don't update password if not provided
        }

        $user->update($validated);

        return response()->json($user);
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

        $user->delete();

        // Notify user about deletion (best-effort)
        try {
            Mail::to($email)->send(new AccountDeletedMail($name, $email));
        } catch (\Throwable $e) {
            Log::error('Failed to send AccountDeletedMail', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
