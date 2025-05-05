<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that an authenticated user can view their profile.
     *
     * @return void
     */
    public function test_authenticated_user_can_view_profile()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // Get user profile
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJson([
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ]);
    }

    /**
     * Test that an authenticated user can update their profile.
     *
     * @return void
     */
    public function test_authenticated_user_can_update_profile()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // New profile data
        $updatedData = [
            'name'  => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
        ];

        // Update user profile
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Perfil actualizado correctamente',
                'user'    => [
                    'id'    => $user->id,
                    'name'  => $updatedData['name'],
                    'email' => $updatedData['email'],
                ]
            ]);

        // Check that the database was updated
        $this->assertDatabaseHas('users', [
            'id'    => $user->id,
            'name'  => $updatedData['name'],
            'email' => $updatedData['email'],
        ]);
    }

    /**
     * Test that an authenticated user can update their password.
     *
     * @return void
     */
    public function test_authenticated_user_can_update_password()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // New profile data with password
        $updatedData = [
            'name'                  => $user->name,
            'email'                 => $user->email,
            'password'              => 'Newpassword123!',
            'password_confirmation' => 'Newpassword123!',
        ];

        // Update user profile
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Perfil actualizado correctamente',
            ]);

        // No podemos probar el inicio de sesión directamente en este test
        // porque estamos usando Sanctum y no el guard web
    }

    /**
     * Test that unauthenticated users cannot access profile endpoints.
     *
     * @return void
     */
    public function test_unauthenticated_users_cannot_access_profile()
    {
        // Try to get profile without authentication
        $response = $this->getJson('/api/auth/profile');
        $response->assertStatus(401);

        // Try to update profile without authentication
        $updateResponse = $this->putJson('/api/auth/profile', [
            'name'  => 'Test User',
            'email' => 'test@example.com',
        ]);
        $updateResponse->assertStatus(401);
    }

    /**
     * Test validation errors when updating profile.
     *
     * @return void
     */
    public function test_validation_errors_when_updating_profile()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // Create another user to test email uniqueness
        $anotherUser = User::factory()->create();

        // Test empty name
        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
                    'name'  => '',
                    'email' => $user->email,
                ]);

        $response1->assertStatus(422)
            ->assertJsonValidationErrors(['name']);

        // Test invalid email
        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
                    'name'  => $user->name,
                    'email' => 'not-an-email',
                ]);

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Test email already in use
        $response3 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
                    'name'  => $user->name,
                    'email' => $anotherUser->email,
                ]);

        $response3->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Test password confirmation mismatch
        $response4 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
                    'name'                  => $user->name,
                    'email'                 => $user->email,
                    'password'              => 'newpassword123',
                    'password_confirmation' => 'differentpassword',
                ]);

        $response4->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test password too short
        $response5 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/auth/profile', [
                    'name'                  => $user->name,
                    'email'                 => $user->email,
                    'password'              => 'short',
                    'password_confirmation' => 'short',
                ]);

        $response5->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
