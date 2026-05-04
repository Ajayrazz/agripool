<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private string $baseUrl = '/api/v1';

    // ─────────────────────────────────────────
    // Registration
    // ─────────────────────────────────────────

    /** @test */
    public function a_user_can_register_as_farmer(): void
    {
        $response = $this->postJson("{$this->baseUrl}/register", [
            'name'                  => 'Ali Farmer',
            'email'                 => 'ali@farm.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'farmer',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['access_token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'ali@farm.com', 'role' => 'farmer']);
    }

    /** @test */
    public function a_user_can_register_as_transporter(): void
    {
        $response = $this->postJson("{$this->baseUrl}/register", [
            'name'                  => 'Ravi Transporter',
            'email'                 => 'ravi@transport.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'transporter',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'ravi@transport.com', 'role' => 'transporter']);
    }

    /** @test */
    public function a_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->farmer()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson("{$this->baseUrl}/login", [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'user'])
                 ->assertJsonPath('user.id', $user->id);
    }

    /** @test */
    public function login_fails_with_wrong_password(): void
    {
        $user = User::factory()->farmer()->create(['password' => bcrypt('correct')]);

        $response = $this->postJson("{$this->baseUrl}/login", [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        // The AuthController returns 422 with validation-style errors for invalid credentials
        $response->assertStatus(422);
    }

    /** @test */
    public function logout_revokes_the_token(): void
    {
        $user  = User::factory()->farmer()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Confirm /me works
        $this->withToken($token)->getJson("{$this->baseUrl}/me")->assertOk();

        // In RefreshDatabase tests, the Sanctum guard re-uses the same stateless token
        // lookup. We assert logout itself succeeds (200) and the token row is deleted.
        $this->withToken($token)->postJson("{$this->baseUrl}/logout")->assertOk();

        // Token row must be gone from personal_access_tokens
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id'   => $user->id,
            'tokenable_type' => User::class,
        ]);
    }
}
