<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::middleware('role:farmer')->group(function () {
            Route::apiResource('requests', \App\Http\Controllers\Farmer\RequestController::class)->except(['update']);
            Route::get('matches', [\App\Http\Controllers\Shared\MatchingController::class, 'index']);
        });

        Route::middleware('role:transporter')->prefix('transporter')->group(function () {
            Route::apiResource('vehicles', \App\Http\Controllers\Transporter\VehicleController::class);
            Route::apiResource('vehicles.routes', \App\Http\Controllers\Transporter\RouteController::class)->shallow();
            Route::get('bookings/incoming', [\App\Http\Controllers\Transporter\BookingController::class, 'incoming']);
            Route::patch('bookings/{booking}/status', [\App\Http\Controllers\Transporter\BookingController::class, 'updateStatus']);
        });
    });
});
