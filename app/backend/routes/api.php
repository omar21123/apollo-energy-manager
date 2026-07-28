<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ForgotPasswordController;

// 1. AUTHENTICATION ROUTES (/api/auth/register, /api/auth/login, etc.)
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->name('password.reset');

    Route::middleware('auth:api')->group(function () {
        
        // Email Verification Request Route
        Route::post('/email/verify', [VerificationController::class, 'sendVerificationEmail']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
    });
});

// 2. PUBLIC EMAIL VERIFICATION CONFIRMATION ROUTE
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->name('verification.verify');

// 3. PROTECTED API RESOURCES (Requires valid JWT token)
Route::middleware('auth:api')->group(function () {
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
});