<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\TransportRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    public function definition(): array
    {
        $weight = fake()->randomFloat(0, 100, 500);

        return [
            'farmer_id'        => User::factory()->farmer(),
            'vehicle_id'       => Vehicle::factory(),
            'request_id'       => TransportRequest::factory(),
            'booked_weight_kg' => $weight,
            'total_cost'       => $weight * fake()->randomFloat(2, 2, 15),
            'status'           => 'pending',
            'cancellation_reason' => null,
        ];
    }
}
