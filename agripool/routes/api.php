<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Farmer\BookingController as FarmerBookingController;
use App\Http\Controllers\Shared\TrackingController;
use App\Http\Controllers\Shared\NotificationController;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);

        // ── Farmer routes ───────────────────────────────────────────────
        Route::middleware('role:farmer')->group(function () {
            Route::apiResource('requests', \App\Http\Controllers\Farmer\RequestController::class)->except(['update']);
            Route::get('matches', [\App\Http\Controllers\Shared\MatchingController::class, 'index']);

            // Farmer Booking Routes
            Route::get('farmer/bookings',                 [FarmerBookingController::class, 'index']);
            Route::post('farmer/bookings',                [FarmerBookingController::class, 'store']);
            Route::get('farmer/bookings/{booking}',       [FarmerBookingController::class, 'show']);
            Route::post('farmer/bookings/{booking}/cancel', [FarmerBookingController::class, 'cancel']);
            
            // Payment Routes
            Route::post('farmer/payments/create-order', [\App\Http\Controllers\Farmer\PaymentController::class, 'createOrder']);
            Route::post('farmer/payments/verify', [\App\Http\Controllers\Farmer\PaymentController::class, 'verify']);
        });

        // ── Transporter routes ──────────────────────────────────────────
        Route::middleware('role:transporter')->prefix('transporter')->group(function () {
            Route::apiResource('vehicles', \App\Http\Controllers\Transporter\VehicleController::class);
            Route::apiResource('vehicles.routes', \App\Http\Controllers\Transporter\RouteController::class)->shallow();
            Route::get('bookings/incoming',                       [\App\Http\Controllers\Transporter\BookingController::class, 'incoming']);
            Route::patch('bookings/{booking}/status',             [\App\Http\Controllers\Transporter\BookingController::class, 'updateStatus']);
        });

        // ── Shared (any authenticated role) ────────────────────────────
        // Tracking
        Route::post('bookings/{booking}/track', [TrackingController::class, 'store']);

        // Notifications
        Route::get('notifications',                   [NotificationController::class, 'index']);
        Route::put('notifications/read-all',          [NotificationController::class, 'markAllRead']);
        Route::put('notifications/{id}/read',         [NotificationController::class, 'markRead']);

        // ── Admin routes ───────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/stats', [\App\Http\Controllers\Admin\AdminController::class, 'stats']);
            Route::get('/users', [\App\Http\Controllers\Admin\AdminController::class, 'users']);
            Route::put('/users/{user}', [\App\Http\Controllers\Admin\AdminController::class, 'updateUser']);
            Route::get('/bookings', [\App\Http\Controllers\Admin\AdminController::class, 'allBookings']);
            Route::get('/disputes', [\App\Http\Controllers\Admin\AdminController::class, 'disputes']);
            Route::put('/disputes/{booking}/resolve', [\App\Http\Controllers\Admin\AdminController::class, 'resolveDispute']);
        });
    });
});

