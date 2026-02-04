<?php

namespace App\Http\Controllers;

use App\Models\SuperAdmin;
use App\Models\User;
use App\Mail\AccountCreatedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SuperAdminController extends Controller
{
    /**
     * Display a listing of super admins.
     */
    public function index(Request $request)
    {
        // Only SuperAdmin can list super admins
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $admins = SuperAdmin::latest()->get()->map(function ($a) {
            return [
                'id' => $a->id,
                'name' => $a->name,
                'email' => $a->email,
                'role' => 'Super Admin',
                'status' => 'Active',
            ];
        });

        return response()->json($admins);
    }

    /**
     * Store a newly created SuperAdmin.
     */
    public function store(Request $request)
    {
        // Only SuperAdmin can create other SuperAdmins
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc,dns|unique:super_admins,email',
            'password' => 'required|string|min:6',
        ]);

        // Prevent creating a SuperAdmin when a regular user with same email exists
        if (User::where('email', $validated['email'])->exists()) {
            return response()->json(['message' => 'Email already registered as a regular user'], 422);
        }

        $rawPassword = $validated['password'];
        $validated['password'] = Hash::make($rawPassword);

        $admin = SuperAdmin::create($validated);

        // Optionally send credentials email (best-effort)
        try {
            Mail::to($admin->email)->send(new AccountCreatedMail($admin->name, $admin->email, $rawPassword));
        } catch (\Throwable $e) {
            Log::error('Failed to send SuperAdmin AccountCreatedMail', [
                'email' => $admin->email,
                'error' => $e->getMessage(),
            ]);
        }

        // Return a payload consistent with frontend expectations
        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'Super Admin',
            'status' => 'Active',
        ], 201);
    }

    /**
     * Update a SuperAdmin. Supports conversion to regular User when role changes.
     */
    public function update(Request $request, $id)
    {
        // Only SuperAdmin can update super admins
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $admin = SuperAdmin::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes','required','email:rfc,dns','unique:super_admins,email,' . $admin->id],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'nullable|string|max:50',
        ]);

        // If role is changing to Admin/User, convert account to users table
        if (isset($validated['role']) && strcasecmp($validated['role'], 'Super Admin') !== 0) {
            // Ensure we don't duplicate users by email
            $existingUser = User::where('email', $admin->email)->first();

            $payload = [
                'name' => $validated['name'] ?? $admin->name,
                'email' => $validated['email'] ?? $admin->email,
                // If password provided, hash; otherwise carry over hashed password
                'password' => (isset($validated['password']) && !empty($validated['password']))
                    ? \Illuminate\Support\Facades\Hash::make($validated['password'])
                    : $admin->password,
                'role' => $validated['role'] ?? 'Admin',
                'status' => 'Active',
            ];

            if ($existingUser) {
                $existingUser->update($payload);
                $admin->delete();
                return response()->json($existingUser);
            }

            $newUser = User::create($payload);
            $admin->delete();

            return response()->json($newUser);
        }

        // Regular update (stays Super Admin)
        if (isset($validated['name'])) $admin->name = $validated['name'];
        if (isset($validated['email'])) $admin->email = $validated['email'];
        if (isset($validated['password']) && !empty($validated['password'])) {
            $admin->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $admin->save();

        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'Super Admin',
            'status' => 'Active',
        ]);
    }
}
