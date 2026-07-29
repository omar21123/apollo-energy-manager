<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ForgotPasswordController;

Route::prefix('auth')->group(function () {

    // Public authentication routes
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])
        ->middleware('throttle:password-reset');

    Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])
        ->middleware('throttle:password-reset');

    Route::get('/reset-password/validate', [ForgotPasswordController::class, 'validateToken'])
        ->middleware('throttle:password-reset');

    // Protected authentication routes
    Route::middleware(['auth:api', 'throttle:api'])->group(function () {
        Route::post('/email/verify', [VerificationController::class, 'sendVerificationEmail']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
    });
});

// Public email verification
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware('throttle:api')
    ->name('verification.verify');

// Protected resources
Route::middleware(['auth:api', 'throttle:api'])->group(function () {
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
});