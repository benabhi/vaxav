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
    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create permissions
        Permission::create(['name' => 'View Users', 'slug' => 'users.view']);
        Permission::create(['name' => 'Create Users', 'slug' => 'users.create']);
        Permission::create(['name' => 'Edit Users', 'slug' => 'users.edit']);
        Permission::create(['name' => 'Delete Users', 'slug' => 'users.delete']);
        Permission::create(['name' => 'View Roles', 'slug' => 'roles.view']);
        Permission::create(['name' => 'Create Roles', 'slug' => 'roles.create']);
        Permission::create(['name' => 'Edit Roles', 'slug' => 'roles.edit']);
        Permission::create(['name' => 'Delete Roles', 'slug' => 'roles.delete']);

        // Create roles
        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $userRole = Role::create(['name' => 'User', 'slug' => 'user']);

        // Assign permissions to admin role
        $adminRole->permissions()->attach([1, 2, 3, 4, 5, 6, 7, 8]);

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

    public function test_admin_can_list_roles()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->getJson('/api/admin/roles');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'slug', 'permissions', 'created_at', 'updated_at'],
                     ],
                     'total',
                 ]);
    }

    public function test_admin_can_create_role()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/roles', [
            'name' => 'Editor',
            'slug' => 'editor',
            'permissions' => [1, 5], // View Users, View Roles
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'name', 'slug', 'permissions', 'created_at', 'updated_at',
                 ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Editor',
            'slug' => 'editor',
        ]);

        $this->assertDatabaseHas('permission_role', [
            'role_id' => $response['id'],
            'permission_id' => 1,
        ]);
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $response['id'],
            'permission_id' => 5,
        ]);
    }

    public function test_admin_can_update_role()
    {
        $role = Role::create(['name' => 'Moderator', 'slug' => 'moderator']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->putJson('/api/admin/roles/' . $role->id, [
            'name' => 'Updated Moderator',
            'slug' => 'updated-moderator',
            'permissions' => [1, 2, 5, 6], // View/Create Users, View/Create Roles
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'name' => 'Updated Moderator',
                     'slug' => 'updated-moderator',
                 ]);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'Updated Moderator',
            'slug' => 'updated-moderator',
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
            'permission_id' => 5,
        ]);
        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => 6,
        ]);
    }

    public function test_admin_can_delete_custom_role()
    {
        $role = Role::create(['name' => 'Custom Role', 'slug' => 'custom-role']);

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
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/roles/1');

        $response->assertStatus(403)
                 ->assertJson([
                     'message' => 'Cannot delete default roles',
                 ]);

        $this->assertDatabaseHas('roles', [
            'id' => 1,
        ]);
    }

    public function test_validation_errors_when_creating_role()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/roles', [
            'name' => '', // Empty name
            'permissions' => [999], // Non-existent permission
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'permissions.0']);
    }
}
