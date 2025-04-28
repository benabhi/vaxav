<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $adminToken;
    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $userRole = Role::create(['name' => 'User', 'slug' => 'user']);

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $this->adminUser->roles()->attach($adminRole);
        $this->adminUser->is_superadmin = true;
        $this->adminUser->save();

        // Create a token for the admin user
        $this->adminToken = $this->adminUser->createToken('admin-token')->plainTextToken;

        // Create a regular user
        $this->regularUser = User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
        ]);
        $this->regularUser->roles()->attach($userRole);
    }

    public function test_admin_can_list_users()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'email', 'roles', 'created_at', 'updated_at'],
                     ],
                     'total',
                 ]);
    }

    public function test_admin_can_create_user()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => [2], // User role
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'name', 'email', 'roles', 'created_at', 'updated_at',
                 ]);

        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'new@example.com',
        ]);

        $this->assertDatabaseHas('role_user', [
            'user_id' => $response['id'],
            'role_id' => 2,
        ]);
    }

    public function test_admin_can_update_user()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->putJson('/api/admin/users/' . $this->regularUser->id, [
            'name' => 'Updated User',
            'email' => 'updated@example.com',
            'roles' => [1, 2], // Admin and User roles
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'name' => 'Updated User',
                     'email' => 'updated@example.com',
                 ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->regularUser->id,
            'name' => 'Updated User',
            'email' => 'updated@example.com',
        ]);

        // Check if roles were updated
        $this->assertDatabaseHas('role_user', [
            'user_id' => $this->regularUser->id,
            'role_id' => 1,
        ]);
        $this->assertDatabaseHas('role_user', [
            'user_id' => $this->regularUser->id,
            'role_id' => 2,
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $userToDelete = User::factory()->create([
            'name' => 'User to Delete',
            'email' => 'delete@example.com',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/users/' . $userToDelete->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'User deleted successfully',
                 ]);

        $this->assertDatabaseMissing('users', [
            'id' => $userToDelete->id,
        ]);
    }

    public function test_regular_user_cannot_access_admin_routes()
    {
        // Create a token for the regular user
        $regularToken = $this->regularUser->createToken('user-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $regularToken,
        ])->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_validation_errors_when_creating_user()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/users', [
            'name' => '', // Empty name
            'email' => 'not-an-email', // Invalid email
            'password' => 'short', // Short password
            'roles' => [999], // Non-existent role
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'email', 'password', 'roles.0']);
    }
}
