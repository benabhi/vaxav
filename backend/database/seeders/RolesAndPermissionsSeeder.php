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

            // Universe management
            ['name' => 'View Universe', 'slug' => 'universe.view'],
            ['name' => 'Manage Regions', 'slug' => 'universe.regions'],
            ['name' => 'Manage Constellations', 'slug' => 'universe.constellations'],
            ['name' => 'Manage Solar Systems', 'slug' => 'universe.solar-systems'],
            ['name' => 'Manage Stars', 'slug' => 'universe.stars'],
            ['name' => 'Manage Planets', 'slug' => 'universe.planets'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                ['name' => $permission['name']]
            );
        }

        // Create roles and assign permissions

        // SuperAdmin role
        $superAdminRole = Role::updateOrCreate(
            ['slug' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'description' => 'Super Administrator with all permissions',
            ]
        );

        // Assign all permissions to superadmin
        $superAdminRole->permissions()->sync(Permission::all()->pluck('id')->toArray());

        // Admin role
        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrator',
                'description' => 'Administrator with most permissions',
            ]
        );

        // Assign specific permissions to admin
        $adminPermissions = Permission::whereIn('slug', [
            'users.view', 'users.create', 'users.edit',
            'roles.view',
            'permissions.view',
            'pilots.view.all', 'pilots.edit.all',
            'ships.view.all', 'ships.edit.all',
            'market.moderate',
            'admin.access',
            'universe.view', 'universe.regions', 'universe.constellations',
            'universe.solar-systems', 'universe.stars', 'universe.planets',
        ])->get();

        $adminRole->permissions()->sync($adminPermissions->pluck('id')->toArray());

        // Moderator role
        $moderatorRole = Role::updateOrCreate(
            ['slug' => 'moderator'],
            [
                'name' => 'Moderator',
                'description' => 'Moderator with limited permissions',
            ]
        );

        // Assign specific permissions to moderator
        $moderatorPermissions = Permission::whereIn('slug', [
            'users.view',
            'pilots.view.all',
            'ships.view.all',
            'market.moderate',
            'admin.access',
            'universe.view',
        ])->get();

        $moderatorRole->permissions()->sync($moderatorPermissions->pluck('id')->toArray());

        // User role
        $userRole = Role::updateOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'User',
                'description' => 'Regular user with basic permissions',
            ]
        );

        // No additional permissions for regular users

        // Assign superadmin role to the first user (if exists)
        $user = User::first();
        if ($user) {
            $user->roles()->sync([$superAdminRole->id]);
        }
    }
}
