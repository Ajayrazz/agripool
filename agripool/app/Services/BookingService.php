<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\VehicleRoute;
use App\Models\TransportRequest;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Exceptions\InsufficientCapacityException;

class BookingService
{
    public function createBooking(array $data, User $farmer): Booking
    {
        return DB::transaction(function () use ($data, $farmer) {
            $vehicle = Vehicle::where('id', $data['vehicle_id'])->lockForUpdate()->firstOrFail();
            $route = VehicleRoute::findOrFail($data['route_id']);
            $transportRequest = TransportRequest::where('id', $data['request_id'])
                                                ->where('farmer_id', $farmer->id)
                                                ->firstOrFail();

            if ($vehicle->remaining_capacity_kg < $transportRequest->cargo_weight_kg) {
                throw new InsufficientCapacityException('Vehicle does not have enough remaining capacity.');
            }

            $totalCost = $transportRequest->cargo_weight_kg * $route->price_per_kg;

            $booking = Booking::create([
                'farmer_id' => $farmer->id,
                'vehicle_id' => $vehicle->id,
                'request_id' => $transportRequest->id,
                'booked_weight_kg' => $transportRequest->cargo_weight_kg,
                'total_cost' => $totalCost,
                'status' => 'pending',
            ]);

            $vehicle->remaining_capacity_kg -= $transportRequest->cargo_weight_kg;
            $vehicle->save();

            $transportRequest->update(['status' => 'booked']);

            return $booking;
        });
    }
}
