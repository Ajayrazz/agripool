<?php

namespace App\Http\Controllers\Transporter;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Http\Requests\StoreVehicleRequest;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->vehicles);
    }

    public function store(StoreVehicleRequest $request)
    {
        $data = $request->validated();
        $data['remaining_capacity_kg'] = $data['total_capacity_kg'];

        $vehicle = $request->user()->vehicles()->create($data);

        return response()->json($vehicle, 201);
    }

    public function update(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        $data = $request->validate([
            'vehicle_type' => 'in:truck,mini-truck,pickup',
            'model' => 'string|max:255',
            'is_available' => 'boolean',
        ]);

        $vehicle->update($data);

        return response()->json($vehicle);
    }

    public function destroy(Request $request, $id)
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        if ($vehicle->bookings()->whereNotIn('status', ['completed', 'cancelled'])->exists()) {
            return response()->json(['message' => 'Cannot delete vehicle with active bookings.'], 403);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully.']);
    }
}
