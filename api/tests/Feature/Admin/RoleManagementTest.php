<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $adminToken;
    protected $permissions;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'Admin', 'slug' => 'admin']);
        Role::create(['name' => 'User', 'slug' => 'user']);

        // Create permissions
        $this->permissions = [
            Permission::create(['name' => 'View Users', 'slug' => 'view-users']),
            Permission::create(['name' => 'Create Users', 'slug' => 'create-users']),
            Permission::create(['name' => 'Edit Users', 'slug' => 'edit-users']),
            Permission::create(['name' => 'Delete Users', 'slug' => 'delete-users']),
        ];

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $this->adminUser->roles()->attach(1); // Admin role
        $this->adminUser->is_superadmin = true;
        $this->adminUser->save();

        // Create a token for the admin user
        $this->adminToken = $this->adminUser->createToken('admin-token')->plainTextToken;
    }

    public function test_admin_can_list_roles()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->getJson('/api/admin/roles');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'slug', 'description', 'permissions', 'created_at', 'updated_at'],
                     ],
                 ]);
    }

    public function test_admin_can_create_role()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/roles', [
            'name' => 'Editor',
            'slug' => 'editor',
            'description' => 'Editor role with limited permissions',
            'permissions' => [1, 3], // View Users and Edit Users
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'name', 'slug', 'description', 'permissions', 'created_at', 'updated_at',
                 ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Editor',
            'slug' => 'editor',
            'description' => 'Editor role with limited permissions',
        ]);

        // Check if permissions were attached
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $response['id'],
            'permission_id' => 1,
        ]);
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $response['id'],
            'permission_id' => 3,
        ]);
    }

    public function test_admin_can_update_role()
    {
        // Create a role to update
        $role = Role::create([
            'name' => 'Moderator',
            'slug' => 'moderator',
            'description' => 'Moderator role',
        ]);
        $role->permissions()->attach([1, 2]); // View Users and Create Users

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->putJson('/api/admin/roles/' . $role->id, [
            'name' => 'Senior Moderator',
            'slug' => 'senior-moderator',
            'description' => 'Senior Moderator role with more permissions',
            'permissions' => [1, 2, 3], // Add Edit Users permission
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'name' => 'Senior Moderator',
                     'slug' => 'senior-moderator',
                     'description' => 'Senior Moderator role with more permissions',
                 ]);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'Senior Moderator',
            'slug' => 'senior-moderator',
            'description' => 'Senior Moderator role with more permissions',
        ]);

        // Check if permissions were updated
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => 1,
        ]);
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => 2,
        ]);
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => 3,
        ]);
    }

    public function test_admin_can_delete_custom_role()
    {
        // Create a role to delete
        $role = Role::create([
            'name' => 'Temporary',
            'slug' => 'temporary',
            'description' => 'Temporary role',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/roles/' . $role->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Role deleted successfully',
                 ]);

        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
    }

    public function test_admin_cannot_delete_default_roles()
    {
        // Try to delete the admin role (ID 1)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/roles/1');

        $response->assertStatus(403)
                 ->assertJson([
                     'message' => 'Cannot delete default role',
                 ]);

        $this->assertDatabaseHas('roles', [
            'id' => 1,
            'slug' => 'admin',
        ]);
    }

    public function test_validation_errors_when_creating_role()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/roles', [
            'name' => '', // Empty name
            'slug' => 'admin', // Duplicate slug
            'permissions' => [999], // Non-existent permission
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'slug', 'permissions.0']);
    }
}
