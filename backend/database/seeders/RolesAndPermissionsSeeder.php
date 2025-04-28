<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Illuminate\Cache\CacheManager::class]->forget('spatie.permission.cache');

        // Create permissions
        $permissions = [
            // User management
            ['name' => 'View Users', 'slug' => 'users.view'],
            ['name' => 'Create Users', 'slug' => 'users.create'],
            ['name' => 'Edit Users', 'slug' => 'users.edit'],
            ['name' => 'Delete Users', 'slug' => 'users.delete'],

            // Role management
            ['name' => 'View Roles', 'slug' => 'roles.view'],
            ['name' => 'Create Roles', 'slug' => 'roles.create'],
            ['name' => 'Edit Roles', 'slug' => 'roles.edit'],
            ['name' => 'Delete Roles', 'slug' => 'roles.delete'],

            // Permission management
            ['name' => 'View Permissions', 'slug' => 'permissions.view'],
            ['name' => 'Assign Permissions', 'slug' => 'permissions.assign'],

            // Pilot management
            ['name' => 'View All Pilots', 'slug' => 'pilots.view.all'],
            ['name' => 'Edit All Pilots', 'slug' => 'pilots.edit.all'],
            ['name' => 'Delete All Pilots', 'slug' => 'pilots.delete.all'],

            // Ship management
            ['name' => 'View All Ships', 'slug' => 'ships.view.all'],
            ['name' => 'Edit All Ships', 'slug' => 'ships.edit.all'],
            ['name' => 'Delete All Ships', 'slug' => 'ships.delete.all'],

            // Market management
            ['name' => 'Moderate Market', 'slug' => 'market.moderate'],

            // System management
            ['name' => 'Access Admin Panel', 'slug' => 'admin.access'],
            ['name' => 'Manage System Settings', 'slug' => 'system.settings'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create roles and assign permissions

        // SuperAdmin role
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'slug' => 'superadmin',
            'description' => 'Super Administrator with all permissions',
        ]);

        // Assign all permissions to superadmin
        $superAdminRole->permissions()->attach(Permission::all());

        // Admin role
        $adminRole = Role::create([
            'name' => 'Administrator',
            'slug' => 'admin',
            'description' => 'Administrator with most permissions',
        ]);

        // Assign specific permissions to admin
        $adminPermissions = Permission::whereIn('slug', [
            'users.view', 'users.create', 'users.edit',
            'roles.view',
            'permissions.view',
            'pilots.view.all', 'pilots.edit.all',
            'ships.view.all', 'ships.edit.all',
            'market.moderate',
            'admin.access',
        ])->get();

        $adminRole->permissions()->attach($adminPermissions);

        // Moderator role
        $moderatorRole = Role::create([
            'name' => 'Moderator',
            'slug' => 'moderator',
            'description' => 'Moderator with limited permissions',
        ]);

        // Assign specific permissions to moderator
        $moderatorPermissions = Permission::whereIn('slug', [
            'users.view',
            'pilots.view.all',
            'ships.view.all',
            'market.moderate',
            'admin.access',
        ])->get();

        $moderatorRole->permissions()->attach($moderatorPermissions);

        // User role
        $userRole = Role::create([
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Regular user with basic permissions',
        ]);

        // No additional permissions for regular users

        // Assign superadmin role to the first user (if exists)
        $user = User::first();
        if ($user) {
            $user->roles()->attach($superAdminRole);
        }
    }
}
