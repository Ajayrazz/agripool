<?php
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use App\Models\TransportRequest;

// 1. Ensure a vehicle route exists
$transporter = User::where('role', 'transporter')->first();
$vehicle = Vehicle::where('user_id', $transporter->id)->first();

$route = VehicleRoute::firstOrCreate(
    ['vehicle_id' => $vehicle->id, 'destination' => 'Delhi', 'departure_date' => '2026-06-01'],
    [
        'origin' => 'Ludhiana',
        'origin_lat' => 30.9010,
        'origin_lng' => 75.8573,
        'dest_lat' => 28.6139,
        'dest_lng' => 77.2090,
        'departure_time' => '08:00',
        'price_per_kg' => 2.5
    ]
);

// 2. Create a test transport request for a farmer
$farmer = User::where('role', 'farmer')->first();
$request = TransportRequest::firstOrCreate(
    ['farmer_id' => $farmer->id, 'destination' => 'Delhi', 'required_date' => '2026-06-01'],
    [
        'pickup_location' => 'Ludhiana',
        'pickup_lat' => 30.9010,
        'pickup_lng' => 75.8573,
        'cargo_weight_kg' => 500,
        'produce_type' => 'Wheat',
        'status' => 'open'
    ]
);

// 3. Output token and ID
$token = $farmer->createToken('test')->plainTextToken;
echo "Token: $token\n";
echo "RequestID: {$request->id}\n";
