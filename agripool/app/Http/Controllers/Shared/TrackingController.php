<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TrackingUpdate;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    /**
     * Status progression — each key can only move to the values listed.
     * Going backward is forbidden.
     */
    private const ALLOWED_TRANSITIONS = [
        'pending'    => ['confirmed'],
        'confirmed'  => ['in_transit'],
        'in_transit' => ['delivered'],
        'delivered'  => ['completed'],
        'completed'  => [],   // terminal — no further transitions
        'cancelled'  => [],   // terminal
    ];

    public function __construct(protected NotificationService $notifications) {}

    /**
     * POST /api/v1/bookings/{booking}/track
     *
     * Transporter posts a tracking update.
     * Authorization: the booking's vehicle must be owned by the authenticated transporter.
     */
    public function store(Request $request, Booking $booking)
    {
        // 1. Verify the transporter owns the vehicle on this booking
        if ($booking->vehicle->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized. This booking does not belong to your vehicle.'], 403);
        }

        // 2. Validate input
        $data = $request->validate([
            'status'      => 'required|in:pending,confirmed,in_transit,delivered,completed',
            'notes'       => 'nullable|string|max:255',
            'current_lat' => 'nullable|numeric|between:-90,90',
            'current_lng' => 'nullable|numeric|between:-180,180',
        ]);

        // 3. Enforce forward-only status progression
        $currentStatus = $booking->status;
        $newStatus     = $data['status'];
        $allowed       = self::ALLOWED_TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowed)) {
            return response()->json([
                'message' => "Invalid status transition. Booking is '{$currentStatus}'. Allowed next: [" . implode(', ', $allowed) . "].",
            ], 422);
        }

        // 4. Create the tracking update record
        $update = TrackingUpdate::create([
            'booking_id'  => $booking->id,
            'status'      => $newStatus,
            'notes'       => $data['notes'] ?? null,
            'current_lat' => $data['current_lat'] ?? null,
            'current_lng' => $data['current_lng'] ?? null,
            'recorded_at' => now(),
        ]);

        // 5. Update booking status to match
        $booking->update(['status' => $newStatus]);
        if ($newStatus === 'delivered') {
            $booking->transportRequest()->update(['status' => 'completed']);
        }

        // 6. Notify the farmer about the status change
        $farmer = $booking->farmer;
        if ($farmer) {
            $statusLabels = [
                'confirmed'  => 'Confirmed',
                'in_transit' => 'In Transit 🚛',
                'delivered'  => 'Delivered 📦',
                'completed'  => 'Completed 🎉',
            ];
            $label = $statusLabels[$newStatus] ?? ucfirst($newStatus);

            $this->notifications->notify(
                $farmer,
                "Booking #{$booking->id}: {$label}",
                $data['notes'] ?? "Your shipment status has been updated to '{$label}'.",
                $booking->id
            );
        }

        return response()->json([
            'message' => 'Tracking update posted successfully.',
            'update'  => $update,
            'booking' => $booking->fresh(),
        ], 201);
    }
}
