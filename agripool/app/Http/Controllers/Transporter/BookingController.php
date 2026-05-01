<?php

namespace App\Http\Controllers\Transporter;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function incoming(Request $request)
    {
        $query = Booking::with(['farmer', 'transportRequest', 'vehicle'])
            ->whereHas('vehicle', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::whereHas('vehicle', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $action = $request->validate([
            'action' => 'required|in:accept,reject',
        ])['action'];

        if ($action === 'accept') {
            $booking->update(['status' => 'confirmed']);
            return response()->json(['message' => 'Booking accepted.', 'booking' => $booking]);
        }

        if ($action === 'reject') {
            $booking->update(['status' => 'cancelled']);
            
            // Restore remaining capacity
            $booking->vehicle()->increment('remaining_capacity_kg', $booking->booked_weight_kg);

            return response()->json(['message' => 'Booking rejected.', 'booking' => $booking]);
        }
    }
}
