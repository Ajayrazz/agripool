<?php

namespace Tests\Feature;

use App\Models\TransportRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingTest extends TestCase
{
    use RefreshDatabase;

    private string $baseUrl = '/api/v1';

    /**
     * Shared fixture: one farmer, one transporter, one vehicle,
     * one route on a given date/destination, one transport request.
     */
    private function makeScenario(array $vehicleOverrides = [], array $routeOverrides = [], array $requestOverrides = []): array
    {
        $farmer      = User::factory()->farmer()->create();
        $transporter = User::factory()->transporter()->create();

        $vehicle = Vehicle::factory()->create(array_merge([
            'user_id'               => $transporter->id,
            'total_capacity_kg'     => 2000,
            'remaining_capacity_kg' => 2000,
            'is_available'          => true,
        ], $vehicleOverrides));

        $route = VehicleRoute::factory()->create(array_merge([
            'vehicle_id'     => $vehicle->id,
            'destination'    => 'Mumbai',
            'departure_date' => '2026-12-01',
            'origin_lat'     => 18.5204,
            'origin_lng'     => 73.8567,
            'price_per_kg'   => 5.00,
        ], $routeOverrides));

        $transportRequest = TransportRequest::factory()->create(array_merge([
            'farmer_id'       => $farmer->id,
            'destination'     => 'Mumbai',
            'required_date'   => '2026-12-01',
            'pickup_lat'      => 18.5204,
            'pickup_lng'      => 73.8567,
            'cargo_weight_kg' => 500,
            'status'          => 'open',
        ], $requestOverrides));

        return [$farmer, $vehicle, $route, $transportRequest];
    }

    // ─────────────────────────────────────────
    // Happy path
    // ─────────────────────────────────────────

    /** @test */
    public function matching_returns_vehicles_on_the_correct_route_and_date(): void
    {
        [$farmer, $vehicle, $route, $request] = $this->makeScenario();

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();

        $routeIds = collect($response->json('data'))->pluck('id');
        $this->assertTrue($routeIds->contains($route->id));
    }

    /** @test */
    public function matching_excludes_routes_on_a_different_date(): void
    {
        // Route on wrong date
        [$farmer, , , $request] = $this->makeScenario(
            routeOverrides: ['departure_date' => '2026-11-01'] // different date
        );

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    // ─────────────────────────────────────────
    // Capacity exclusion
    // ─────────────────────────────────────────

    /** @test */
    public function matching_excludes_vehicles_with_insufficient_capacity(): void
    {
        // Farmer needs 500 kg, but vehicle only has 100 kg remaining
        [$farmer, , , $request] = $this->makeScenario(
            vehicleOverrides: ['total_capacity_kg' => 2000, 'remaining_capacity_kg' => 100],
            requestOverrides: ['cargo_weight_kg' => 500]
        );

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    /** @test */
    public function matching_includes_vehicles_with_exactly_sufficient_capacity(): void
    {
        // Farmer needs exactly 500 kg, vehicle has exactly 500 kg remaining
        [$farmer, $vehicle, $route, $request] = $this->makeScenario(
            vehicleOverrides: ['total_capacity_kg' => 2000, 'remaining_capacity_kg' => 500],
            requestOverrides: ['cargo_weight_kg' => 500]
        );

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();
        $routeIds = collect($response->json('data'))->pluck('id');
        $this->assertTrue($routeIds->contains($route->id));
    }

    // ─────────────────────────────────────────
    // Availability exclusion
    // ─────────────────────────────────────────

    /** @test */
    public function matching_excludes_unavailable_vehicles(): void
    {
        [$farmer, , , $request] = $this->makeScenario(
            vehicleOverrides: ['is_available' => false]
        );

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    // ─────────────────────────────────────────
    // Distance ordering
    // ─────────────────────────────────────────

    /** @test */
    public function matching_returns_results_ordered_by_proximity(): void
    {
        $farmer      = User::factory()->farmer()->create();
        $transporter = User::factory()->transporter()->create();

        // Vehicle A — far from pickup (lat 28, lng 77) — Delhi
        $vehicleA = Vehicle::factory()->create([
            'user_id' => $transporter->id, 'remaining_capacity_kg' => 2000, 'is_available' => true,
        ]);
        $routeA = VehicleRoute::factory()->create([
            'vehicle_id' => $vehicleA->id, 'destination' => 'Mumbai',
            'departure_date' => '2026-12-01',
            'origin_lat' => 28.6139, 'origin_lng' => 77.2090, // Delhi
        ]);

        // Vehicle B — close to pickup (lat 18.5, lng 73.8) — Pune
        $vehicleB = Vehicle::factory()->create([
            'user_id' => $transporter->id, 'remaining_capacity_kg' => 2000, 'is_available' => true,
        ]);
        $routeB = VehicleRoute::factory()->create([
            'vehicle_id' => $vehicleB->id, 'destination' => 'Mumbai',
            'departure_date' => '2026-12-01',
            'origin_lat' => 18.52, 'origin_lng' => 73.86, // near Pune
        ]);

        // Farmer request from Pune
        $request = TransportRequest::factory()->create([
            'farmer_id'       => $farmer->id,
            'destination'     => 'Mumbai',
            'required_date'   => '2026-12-01',
            'pickup_lat'      => 18.5204,
            'pickup_lng'      => 73.8567,
            'cargo_weight_kg' => 100,
            'status'          => 'open',
        ]);

        $response = $this->actingAs($farmer)
                         ->getJson("{$this->baseUrl}/matches?request_id={$request->id}");

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->values();

        // Closer vehicle B must come first
        $this->assertEquals($routeB->id, $ids->first());
        $this->assertEquals($routeA->id, $ids->last());
    }

    // ─────────────────────────────────────────
    // Authorization
    // ─────────────────────────────────────────

    /** @test */
    public function a_farmer_cannot_view_matches_for_another_farmers_request(): void
    {
        $farmerA = User::factory()->farmer()->create();
        $farmerB = User::factory()->farmer()->create();

        $request = TransportRequest::factory()->create([
            'farmer_id'   => $farmerA->id,
            'destination' => 'Mumbai',
            'required_date' => '2026-12-01',
        ]);

        // FarmerB tries to query farmerA's request
        $this->actingAs($farmerB)
             ->getJson("{$this->baseUrl}/matches?request_id={$request->id}")
             ->assertStatus(403);
    }
}
