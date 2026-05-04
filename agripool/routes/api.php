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
    });
});

