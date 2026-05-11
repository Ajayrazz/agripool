<?php
$user = \App\Models\User::where('role', 'transporter')->first();
if (!$user) {
    echo "No transporter found.\n";
    exit(1);
}
$vehicle = \App\Models\Vehicle::where('user_id', $user->id)->first();
if (!$vehicle) {
    echo "No vehicle found for transporter.\n";
    exit(1);
}
$token = $user->createToken('test')->plainTextToken;
echo "Token: $token\n";
echo "Vehicle ID: {$vehicle->id}\n";
