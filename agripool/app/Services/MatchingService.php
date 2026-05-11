<?php

namespace App\Services;

use App\Models\TransportRequest;
use App\Models\VehicleRoute;

class MatchingService
{
    public function findMatches(TransportRequest $request)
    {
        return VehicleRoute::with(['vehicle', 'vehicle.user'])
            ->whereRaw('LOWER(destination) = ?', [strtolower($request->destination)])
            ->where('departure_date', $request->required_date)
            ->whereHas('vehicle', function($q) use ($request) {
                $q->where('is_available', true)
                  ->where('remaining_capacity_kg', '>=', $request->cargo_weight_kg);
            })
            ->selectRaw('*, (ABS(origin_lat - ?) + ABS(origin_lng - ?)) as distance', [
                $request->pickup_lat,
                $request->pickup_lng
            ])
            ->orderBy('distance', 'asc');
    }
}
