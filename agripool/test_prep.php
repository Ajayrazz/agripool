<?php
echo "T1=" . App\Models\User::where('role', 'transporter')->first()->createToken('test')->plainTextToken . "\n";
echo "F1=" . App\Models\User::where('role', 'farmer')->first()->createToken('test')->plainTextToken . "\n";
