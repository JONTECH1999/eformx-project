<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        $user = User::create($validated);

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
        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
