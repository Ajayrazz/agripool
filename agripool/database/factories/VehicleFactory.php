<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    public function definition(): array
    {
        $total = fake()->randomFloat(0, 1000, 10000);

        return [
            'user_id'               => User::factory()->transporter(),
            'registration_no'       => strtoupper(fake()->unique()->bothify('??##??##')),
            'vehicle_type'          => fake()->randomElement(['truck', 'mini-truck', 'pickup']),
            'total_capacity_kg'     => $total,
            'remaining_capacity_kg' => $total,
            'model'                 => fake()->randomElement(['Tata 407', 'Eicher Pro', 'Ashok Leyland', 'Mahindra Bolero']),
            'is_available'          => true,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(fn () => ['is_available' => false]);
    }

    public function withCapacity(float $total, float $remaining = null): static
    {
        return $this->state(fn () => [
            'total_capacity_kg'     => $total,
            'remaining_capacity_kg' => $remaining ?? $total,
        ]);
    }
}
