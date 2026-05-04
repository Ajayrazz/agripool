<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleRoute>
 */
class VehicleRouteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vehicle_id'     => Vehicle::factory(),
            'origin'         => fake()->city(),
            'destination'    => fake()->city(),
            'origin_lat'     => fake()->latitude(8, 37),
            'origin_lng'     => fake()->longitude(68, 97),
            'dest_lat'       => fake()->latitude(8, 37),
            'dest_lng'       => fake()->longitude(68, 97),
            'departure_date' => now()->addDays(3)->toDateString(),
            'departure_time' => '08:00:00',
            'price_per_kg'   => fake()->randomFloat(2, 2, 20),
        ];
    }
}
