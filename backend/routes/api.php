<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormResponseController;
use App\Http\Controllers\UserController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/forms/{id}/public', [FormController::class, 'showPublic']);
Route::post('/forms/{formId}/responses', [FormResponseController::class, 'store']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Form CRUD
    Route::apiResource('forms', FormController::class);

    // Form analytics and responses
    Route::get('/forms/{id}/analytics', [FormController::class, 'analytics']);
    Route::get('/forms/{formId}/responses', [FormResponseController::class, 'index']);

    // User management (for SuperAdmin)
    Route::apiResource('users', UserController::class);
});
