<?php

namespace App\Http\Controllers\Transporter;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(protected NotificationService $notifications) {}

    public function incoming(Request $request)
    {
        $query = Booking::with(['farmer', 'transportRequest', 'vehicle'])
            ->whereHas('vehicle', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::with(['farmer', 'vehicle'])
            ->whereHas('vehicle', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })->findOrFail($id);

        $action = $request->validate([
            'action' => 'required|in:accept,reject',
        ])['action'];

        $farmer = $booking->farmer;

        if ($action === 'accept') {
            $booking->update(['status' => 'confirmed']);

            // Notify farmer their booking was accepted
            if ($farmer) {
                $this->notifications->notify(
                    $farmer,
                    'Booking Confirmed! ✅',
                    "Your booking #{$booking->id} for vehicle {$booking->vehicle->model} has been accepted by the transporter.",
                    $booking->id
                );
            }

            return response()->json(['message' => 'Booking accepted.', 'booking' => $booking]);
        }

        if ($action === 'reject') {
            $booking->update(['status' => 'cancelled']);

            // Restore remaining capacity
            $booking->vehicle()->increment('remaining_capacity_kg', $booking->booked_weight_kg);

            // Restore transport request to open
            $booking->transportRequest()->update(['status' => 'open']);

            // Notify farmer their booking was rejected
            if ($farmer) {
                $this->notifications->notify(
                    $farmer,
                    'Booking Rejected ❌',
                    "Your booking #{$booking->id} was rejected by the transporter. Your request has been reopened — you can find another transporter.",
                    $booking->id
                );
            }

            return response()->json(['message' => 'Booking rejected.', 'booking' => $booking]);
        }
    }
}
