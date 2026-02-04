<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SuperAdmin;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
                // Block login for inactive users
                if (isset($user->status) && strcasecmp($user->status, 'Active') !== 0) {
                    return response()->json(['message' => 'Account is inactive. Please contact an administrator.'], 403);
                }
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

    /**
     * Send a password reset link (logged mail in dev).
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        // Find user (check both Users and SuperAdmins)
        $user = User::where('email', $email)->first();
        $admin = null;
        
        if (!$user) {
            $admin = SuperAdmin::where('email', $email)->first();
        }

        if (!$user && !$admin) {
            return response()->json(['message' => 'Email not registered'], 404);
        }

        // Generate token and upsert into password_reset_tokens
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => $token, 'created_at' => now()]
        );

        // Build reset URL for SPA
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $resetUrl = rtrim($frontend, '/') . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        // Send email (logged via mailer 'log' by default)
        Mail::raw("Click to reset your password: $resetUrl", function ($message) use ($email) {
            $message->to($email)->subject('Password Reset');
        });

        return response()->json(['message' => 'Reset link sent']);
    }

    /**
     * Reset password using token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !hash_equals($record->token, $request->token)) {
            return response()->json(['message' => 'Invalid or expired token'], 400);
        }

        // Check both Users and SuperAdmins
        $user = User::where('email', $request->email)->first();
        $admin = null;
        
        if (!$user) {
            $admin = SuperAdmin::where('email', $request->email)->first();
        }

        if (!$user && !$admin) {
            return response()->json(['message' => 'Email not registered'], 404);
        }

        // Update password for the found account
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
            // Revoke existing API tokens
            $user->tokens()->delete();
        } else {
            $admin->password = Hash::make($request->password);
            $admin->save();
            // Revoke existing API tokens
            $admin->tokens()->delete();
        }

        // Invalidate reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successful']);
    }

    /**
     * Update the authenticated user's profile (name/email/password).
     * Works for both SuperAdmin and regular User.
     */
    public function updateProfile(Request $request)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Determine validation rules based on model/table
        if ($authUser instanceof SuperAdmin) {
            $rules = [
                'name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes','required','email:rfc,dns', Rule::unique('super_admins')->ignore($authUser->id)],
                'password' => 'sometimes|nullable|string|min:6',
            ];
        } else { // regular User
            $rules = [
                'name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes','required','email:rfc,dns', Rule::unique('users')->ignore($authUser->id)],
                'password' => 'sometimes|nullable|string|min:6',
            ];
        }

        $validated = $request->validate($rules);

        // Apply updates
        if (array_key_exists('name', $validated)) {
            $authUser->name = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $authUser->email = $validated['email'];
        }
        if (array_key_exists('password', $validated) && !empty($validated['password'])) {
            $authUser->password = Hash::make($validated['password']);
        }

        $authUser->save();

        // Normalize response similar to login payload
        $payload = [
            'id' => $authUser->id,
            'name' => $authUser->name,
            'email' => $authUser->email,
            'role' => $authUser instanceof SuperAdmin ? 'Super Admin' : 'User',
        ];

        return response()->json($payload);
    }

    /**
     * Change the authenticated user's password (requires current password).
     * Works for both SuperAdmin and regular User.
     */
    public function changePassword(Request $request)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $authUser->password = Hash::make($validated['password']);
        $authUser->save();

        // Revoke other tokens but keep the current session token alive
        $current = $request->user()->currentAccessToken();
        if ($current) {
            $authUser->tokens()->where('id', '!=', $current->id)->delete();
        } else {
            $authUser->tokens()->delete();
        }

        return response()->json(['message' => 'Password updated successfully']);
    }
}
