<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BookingService;
use App\Models\Booking;
use App\Exceptions\InsufficientCapacityException;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function index(Request $request)
    {
        $bookings = Booking::with(['vehicle', 'transportRequest'])
            ->where('farmer_id', $request->user()->id)
            ->latest()
            ->paginate(10);
            
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'request_id' => 'required|exists:transport_requests,id',
            'route_id' => 'required|exists:vehicle_routes,id',
        ]);

        try {
            $booking = $this->bookingService->createBooking($data, $request->user());
            return response()->json(['message' => 'Booking created successfully', 'booking' => $booking], 201);
        } catch (InsufficientCapacityException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, Booking $booking)
    {
        if ($booking->farmer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $booking->load(['vehicle', 'vehicle.user', 'transportRequest', 'trackingUpdates']);
        
        return response()->json($booking);
    }

    public function cancel(Request $request, Booking $booking)
    {
        if ($booking->farmer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Booking cannot be cancelled in its current state.'], 400);
        }

        DB::transaction(function () use ($booking) {
            $booking->status = 'cancelled';
            $booking->save();

            $vehicle = $booking->vehicle()->lockForUpdate()->first();
            if ($vehicle) {
                $vehicle->remaining_capacity_kg += $booking->booked_weight_kg;
                $vehicle->save();
            }

            $booking->transportRequest()->update(['status' => 'open']);
        });

        return response()->json(['message' => 'Booking cancelled successfully', 'booking' => $booking]);
    }
}
