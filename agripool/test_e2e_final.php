<?php
require 'vendor/autoload.php';
use GuzzleHttp\Client;
$client = new Client([
    'base_uri' => 'http://localhost:8000/api/v1/', 
    'http_errors' => false,
    'headers' => ['Accept' => 'application/json', 'Content-Type' => 'application/json']
]);

$transporterToken = "16|wVzgxBS68hY0crYzW3vlBizhu043108sBbTS7YCsca18b87e";
$farmerToken = "17|rwIwViS5whFLYo3vDouJELg9tODfPEnROY1wpegce4c9eae5";

echo "=== Step 1: Transporter Schedules Route ===\n";
$res = $client->post('transporter/vehicles/1/routes', [
    'headers' => ['Authorization' => "Bearer $transporterToken"],
    'json' => [
        'origin' => 'Ludhiana', 'destination' => 'Delhi',
        'origin_lat' => 30.9010, 'origin_lng' => 75.8573,
        'dest_lat' => 28.6139, 'dest_lng' => 77.2090,
        'departure_date' => '2026-06-01', 'departure_time' => '08:00',
        'price_per_kg' => 2.5
    ]
]);
if ($res->getStatusCode() === 201) echo "PASS: Route scheduled successfully.\n";
else { echo "FAIL: Route scheduling failed. " . $res->getBody() . "\n"; exit(1); }

echo "\n=== Step 2: Farmer Posts Request ===\n";
$res = $client->post('requests', [
    'headers' => ['Authorization' => "Bearer $farmerToken"],
    'json' => [
        'pickup_location' => 'Ludhiana', 'destination' => 'Delhi',
        'pickup_lat' => 30.9010, 'pickup_lng' => 75.8573,
        'cargo_weight_kg' => 500, 'produce_type' => 'Wheat', 'required_date' => '2026-06-01'
    ]
]);
if ($res->getStatusCode() === 201) {
    $reqData = json_decode($res->getBody(), true);
    $requestId = $reqData['request']['id'] ?? $reqData['data']['id'] ?? $reqData['id'] ?? null;
    echo "PASS: Transport request posted successfully. Request ID: $requestId\n";
} else {
    echo "FAIL: Transport request failed. " . $res->getBody() . "\n"; exit(1);
}

echo "\n=== Step 3: Farmer Views Matches ===\n";
$res = $client->get("matches?request_id=$requestId", [
    'headers' => ['Authorization' => "Bearer $farmerToken"]
]);
$matchesData = json_decode($res->getBody(), true);
$matches = $matchesData['data'] ?? [];
if (count($matches) > 0) {
    $routeId = $matches[0]['id'];
    $vehicleId = $matches[0]['vehicle_id'];
    echo "PASS: Found " . count($matches) . " matches. Vehicle ID: $vehicleId, Route ID: $routeId\n";
} else {
    echo "FAIL: No matches found.\n"; exit(1);
}

echo "\n=== Step 4: Farmer Books Vehicle ===\n";
$res = $client->post('farmer/bookings', [
    'headers' => ['Authorization' => "Bearer $farmerToken"],
    'json' => [
        'request_id' => $requestId,
        'vehicle_id' => $vehicleId,
        'route_id' => $routeId,
        'booked_weight_kg' => 500
    ]
]);
if ($res->getStatusCode() === 201) {
    echo "PASS: Booking created successfully.\n";
} else {
    echo "FAIL: Booking failed. " . $res->getBody() . "\n"; exit(1);
}

echo "\n=== Step 5: Transporter Sees Booking ===\n";
$res = $client->get('transporter/bookings/incoming', [
    'headers' => ['Authorization' => "Bearer $transporterToken"]
]);
$incomingData = json_decode($res->getBody(), true);
$bookings = $incomingData['data'] ?? $incomingData;
$found = false;
foreach ($bookings as $b) {
    if ($b['request_id'] == $requestId && $b['status'] === 'pending') {
        $found = true;
        break;
    }
}
if ($found) echo "PASS: Booking found in transporter's incoming list.\n";
else echo "FAIL: Booking not found in incoming list.\n";
