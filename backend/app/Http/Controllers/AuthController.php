<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SuperAdmin;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Try SuperAdmin first
        $admin = SuperAdmin::where('email', $request->email)->first();

        if ($admin) {
            if (Hash::check($request->password, $admin->password)) {
                // Create Sanctum token for SuperAdmin
                $token = $admin->createToken('auth-token')->plainTextToken;

                return response()->json([
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => 'Super Admin',
                    'token' => $token,
                ]);
            }

            // Email exists, password incorrect
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        // Try regular User
        $user = User::where('email', $request->email)->first();

        if ($user) {
            if (Hash::check($request->password, $user->password)) {
                // Create Sanctum token
                $token = $user->createToken('auth-token')->plainTextToken;

                return response()->json([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'User',
                    'token' => $token,
                ]);
            }

            // Email exists, password incorrect
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        // No matching account found
        return response()->json(['message' => 'Email not registered'], 404);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
