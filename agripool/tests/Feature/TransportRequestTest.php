<?php

namespace Tests\Feature;

use App\Models\TransportRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransportRequestTest extends TestCase
{
    use RefreshDatabase;

    private string $baseUrl = '/api/v1';

    // ─────────────────────────────────────────
    // Create
    // ─────────────────────────────────────────

    /** @test */
    public function a_farmer_can_create_a_transport_request(): void
    {
        $farmer = User::factory()->farmer()->create();

        $response = $this->actingAs($farmer)->postJson("{$this->baseUrl}/requests", [
            'pickup_location' => 'Pune',
            'destination'     => 'Mumbai',
            'pickup_lat'      => 18.5204,
            'pickup_lng'      => 73.8567,
            'cargo_weight_kg' => 500,
            'produce_type'    => 'Wheat',
            'required_date'   => now()->addDays(5)->toDateString(),
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('transport_requests', [
            'farmer_id'   => $farmer->id,
            'destination' => 'Mumbai',
            'status'      => 'open',
        ]);
    }

    /** @test */
    public function creation_fails_when_required_date_is_in_the_past(): void
    {
        $farmer = User::factory()->farmer()->create();

        $response = $this->actingAs($farmer)->postJson("{$this->baseUrl}/requests", [
            'pickup_location' => 'Pune',
            'destination'     => 'Mumbai',
            'pickup_lat'      => 18.5204,
            'pickup_lng'      => 73.8567,
            'cargo_weight_kg' => 500,
            'produce_type'    => 'Wheat',
            'required_date'   => now()->subDay()->toDateString(), // yesterday
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['required_date']);
    }

    /** @test */
    public function a_transporter_cannot_create_a_transport_request(): void
    {
        $transporter = User::factory()->transporter()->create();

        $response = $this->actingAs($transporter)->postJson("{$this->baseUrl}/requests", [
            'pickup_location' => 'Pune',
            'destination'     => 'Mumbai',
            'pickup_lat'      => 18.52,
            'pickup_lng'      => 73.85,
            'cargo_weight_kg' => 500,
            'produce_type'    => 'Wheat',
            'required_date'   => now()->addDays(5)->toDateString(),
        ]);

        // Role middleware should return 403
        $response->assertStatus(403);
    }

    // ─────────────────────────────────────────
    // Index — ownership isolation
    // ─────────────────────────────────────────

    /** @test */
    public function a_farmer_can_only_see_their_own_requests(): void
    {
        $farmerA = User::factory()->farmer()->create();
        $farmerB = User::factory()->farmer()->create();

        // FarmerA creates 2 requests, FarmerB creates 1
        TransportRequest::factory()->count(2)->create(['farmer_id' => $farmerA->id]);
        TransportRequest::factory()->count(1)->create(['farmer_id' => $farmerB->id]);

        $response = $this->actingAs($farmerA)->getJson("{$this->baseUrl}/requests");

        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('farmer_id')->unique()->values();

        // Should only see farmerA's requests
        $this->assertCount(1, $ids);
        $this->assertEquals($farmerA->id, $ids->first());
        $this->assertCount(2, $response->json('data'));
    }
}
