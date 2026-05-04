<?php

namespace App\Http\Controllers\Transporter;

use App\Http\Controllers\Controller;
use App\Models\VehicleRoute;
use App\Models\Vehicle;
use App\Http\Requests\StoreRouteRequest;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $routes = VehicleRoute::whereHas('vehicle', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->get();

        return response()->json($routes);
    }

    public function store(StoreRouteRequest $request, Vehicle $vehicle)
    {

        if ($vehicle->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to this vehicle.'], 403);
        }

        $route = $vehicle->routes()->create($request->validated());

        return response()->json($route, 201);
    }

    public function update(Request $request, $id)
    {
        $route = VehicleRoute::whereHas('vehicle', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $data = $request->validate([
            'origin' => 'string|max:255',
            'destination' => 'string|max:255',
            'departure_date' => 'date|after_or_equal:today',
            'departure_time' => 'date_format:H:i',
            'price_per_kg' => 'numeric|min:0.01',
        ]);

        $route->update($data);

        return response()->json($route);
    }
}
