<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordValidationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that registration requires a strong password.
     *
     * @return void
     */
    public function test_registration_requires_strong_password()
    {
        // Test password too short
        $response1 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'short',
            'password_confirmation' => 'short',
        ]);

        $response1->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without uppercase
        $response2 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'password123!',
            'password_confirmation' => 'password123!',
        ]);

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without lowercase
        $response3 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'PASSWORD123!',
            'password_confirmation' => 'PASSWORD123!',
        ]);

        $response3->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without number
        $response4 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'Password!',
            'password_confirmation' => 'Password!',
        ]);

        $response4->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without special character
        $response5 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response5->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test valid password
        $response6 = $this->postJson('/api/auth/register', [
            'name'               => 'TestUser123',
            'email'              => 'test@example.com',
            'email_confirmation' => 'test@example.com',
            'password'           => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response6->assertStatus(200);
    }

    /**
     * Test that profile update requires a strong password.
     *
     * @return void
     */
    public function test_profile_update_requires_strong_password()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // Test password too short
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'short',
            'password_confirmation' => 'short',
        ]);

        $response1->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without uppercase
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'password123!',
            'password_confirmation' => 'password123!',
        ]);

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without lowercase
        $response3 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'PASSWORD123!',
            'password_confirmation' => 'PASSWORD123!',
        ]);

        $response3->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without number
        $response4 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'Password!',
            'password_confirmation' => 'Password!',
        ]);

        $response4->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password without special character
        $response5 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response5->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test valid password
        $response6 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response6->assertStatus(200);
    }
}
