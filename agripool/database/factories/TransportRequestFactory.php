<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransportRequest>
 */
class TransportRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farmer_id'        => User::factory()->farmer(),
            'pickup_location'  => fake()->city(),
            'destination'      => fake()->city(),
            'pickup_lat'       => fake()->latitude(8, 37),
            'pickup_lng'       => fake()->longitude(68, 97),
            'cargo_weight_kg'  => fake()->randomFloat(0, 100, 2000),
            'produce_type'     => fake()->randomElement(['Wheat', 'Rice', 'Maize', 'Cotton']),
            'required_date'    => now()->addDays(5)->toDateString(),
            'status'           => 'open',
        ];
    }
}
