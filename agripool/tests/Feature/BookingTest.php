<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\TransportRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private string $baseUrl = '/api/v1';

    /**
     * Helper: create a complete booking scenario.
     * Returns [$farmer, $transporter, $vehicle, $route, $transportRequest]
     */
    private function makeBookingScenario(float $vehicleCapacity = 1000, float $cargoWeight = 500): array
    {
        $farmer      = User::factory()->farmer()->create();
        $transporter = User::factory()->transporter()->create();

        $vehicle = Vehicle::factory()->create([
            'user_id'               => $transporter->id,
            'total_capacity_kg'     => $vehicleCapacity,
            'remaining_capacity_kg' => $vehicleCapacity,
        ]);

        $route = VehicleRoute::factory()->create([
            'vehicle_id'     => $vehicle->id,
            'price_per_kg'   => 5.00,
            'departure_date' => now()->addDays(3)->toDateString(),
        ]);

        $transportRequest = TransportRequest::factory()->create([
            'farmer_id'       => $farmer->id,
            'cargo_weight_kg' => $cargoWeight,
            'required_date'   => now()->addDays(3)->toDateString(),
            'status'          => 'open',
        ]);

        return [$farmer, $transporter, $vehicle, $route, $transportRequest];
    }

    // ─────────────────────────────────────────
    // Booking creation
    // ─────────────────────────────────────────

    /** @test */
    public function a_booking_is_created_and_vehicle_capacity_is_decremented(): void
    {
        [$farmer, , $vehicle, $route, $transportRequest] = $this->makeBookingScenario(1000, 500);

        $response = $this->actingAs($farmer)->postJson("{$this->baseUrl}/farmer/bookings", [
            'vehicle_id' => $vehicle->id,
            'request_id' => $transportRequest->id,
            'route_id'   => $route->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('booking.status', 'pending')
                 ->assertJsonPath('booking.booked_weight_kg', 500);

        // total_cost: 500 kg × ₹5 = 2500 (may be int or float in JSON)
        $this->assertEquals(2500, $response->json('booking.total_cost'));

        // Vehicle capacity must have dropped by 500
        $this->assertDatabaseHas('vehicles', [
            'id'                    => $vehicle->id,
            'remaining_capacity_kg' => 500,
        ]);

        // Transport request must be marked booked
        $this->assertDatabaseHas('transport_requests', [
            'id'     => $transportRequest->id,
            'status' => 'booked',
        ]);
    }

    /** @test */
    public function a_second_booking_exceeding_capacity_returns_422(): void
    {
        // Vehicle has 1000 kg total. First booking will use 900 kg, leaving 100 kg.
        // Second farmer requests 500 kg — should fail.
        [$farmer1, , $vehicle, $route, $req1] = $this->makeBookingScenario(1000, 900);

        // First booking succeeds
        $this->actingAs($farmer1)->postJson("{$this->baseUrl}/farmer/bookings", [
            'vehicle_id' => $vehicle->id,
            'request_id' => $req1->id,
            'route_id'   => $route->id,
        ])->assertStatus(201);

        // Now remaining = 100 kg. Second farmer requests 500 kg.
        $farmer2 = User::factory()->farmer()->create();
        $req2    = TransportRequest::factory()->create([
            'farmer_id'       => $farmer2->id,
            'cargo_weight_kg' => 500,
            'required_date'   => now()->addDays(3)->toDateString(),
            'status'          => 'open',
        ]);

        $response = $this->actingAs($farmer2)->postJson("{$this->baseUrl}/farmer/bookings", [
            'vehicle_id' => $vehicle->id,
            'request_id' => $req2->id,
            'route_id'   => $route->id,
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['message' => 'Vehicle does not have enough remaining capacity.']);

        // Vehicle capacity must still be 100 (no partial decrement)
        $this->assertDatabaseHas('vehicles', [
            'id'                    => $vehicle->id,
            'remaining_capacity_kg' => 100,
        ]);
    }

    // ─────────────────────────────────────────
    // Cancellation
    // ─────────────────────────────────────────

    /** @test */
    public function cancelling_a_booking_restores_vehicle_capacity(): void
    {
        [$farmer, , $vehicle, $route, $transportRequest] = $this->makeBookingScenario(1000, 400);

        // Create the booking
        $createRes = $this->actingAs($farmer)->postJson("{$this->baseUrl}/farmer/bookings", [
            'vehicle_id' => $vehicle->id,
            'request_id' => $transportRequest->id,
            'route_id'   => $route->id,
        ]);
        $createRes->assertStatus(201);

        $bookingId = $createRes->json('booking.id');

        // Vehicle should now have 600 kg remaining
        $this->assertDatabaseHas('vehicles', [
            'id'                    => $vehicle->id,
            'remaining_capacity_kg' => 600,
        ]);

        // Cancel the booking
        $cancelRes = $this->actingAs($farmer)->postJson(
            "{$this->baseUrl}/farmer/bookings/{$bookingId}/cancel",
            ['cancellation_reason' => 'Changed plans']
        );

        $cancelRes->assertOk()
                  ->assertJsonPath('booking.status', 'cancelled');

        // Vehicle capacity must be fully restored to 1000
        $this->assertDatabaseHas('vehicles', [
            'id'                    => $vehicle->id,
            'remaining_capacity_kg' => 1000,
        ]);

        // Transport request must be reopened
        $this->assertDatabaseHas('transport_requests', [
            'id'     => $transportRequest->id,
            'status' => 'open',
        ]);

        // Cancellation reason persisted
        $this->assertDatabaseHas('bookings', [
            'id'                  => $bookingId,
            'cancellation_reason' => 'Changed plans',
        ]);
    }

    /** @test */
    public function cancelling_an_already_cancelled_booking_returns_400(): void
    {
        [$farmer, , $vehicle, $route, $transportRequest] = $this->makeBookingScenario(1000, 200);

        $createRes = $this->actingAs($farmer)->postJson("{$this->baseUrl}/farmer/bookings", [
            'vehicle_id' => $vehicle->id,
            'request_id' => $transportRequest->id,
            'route_id'   => $route->id,
        ]);
        $bookingId = $createRes->json('booking.id');

        // Cancel once — succeeds
        $this->actingAs($farmer)->postJson("{$this->baseUrl}/farmer/bookings/{$bookingId}/cancel");

        // Cancel again — should fail
        $this->actingAs($farmer)
             ->postJson("{$this->baseUrl}/farmer/bookings/{$bookingId}/cancel")
             ->assertStatus(400);
    }
}
