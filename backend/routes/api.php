<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormResponseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\NotificationController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::get('/forms/{id}/public', [FormController::class, 'showPublic']);
Route::post('/forms/{formId}/responses', [FormResponseController::class, 'store']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Update own profile (SuperAdmin or User)
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    // Change own password (requires current password)
    Route::put('/profile/password', [AuthController::class, 'changePassword']);

    // Form CRUD
    Route::apiResource('forms', FormController::class);

    // Form analytics and responses
    Route::get('/forms/{id}/analytics', [FormController::class, 'analytics']);
    Route::get('/forms/{formId}/responses', [FormResponseController::class, 'index']);

    // User management (for SuperAdmin)
    Route::apiResource('users', UserController::class);
    // SuperAdmin management (list/create/update/delete)
    Route::apiResource('super-admins', SuperAdminController::class)->only(['index','store','update','destroy']);

    // Notifications for SuperAdmin
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
});
