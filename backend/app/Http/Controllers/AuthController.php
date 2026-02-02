<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SuperAdmin;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

        // Find user (regular users only for now)
        $user = User::where('email', $email)->first();

        if (!$user) {
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

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not registered'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Invalidate reset token and revoke existing API tokens
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successful']);
    }
}
