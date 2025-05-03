<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class AssignSkillPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener roles
        $superAdminRole = Role::where('slug', 'superadmin')->first();
        $adminRole = Role::where('slug', 'admin')->first();
        $moderatorRole = Role::where('slug', 'moderator')->first();
        
        if (!$superAdminRole || !$adminRole || !$moderatorRole) {
            return;
        }
        
        // El superadmin ya tiene todos los permisos
        
        // Asignar permisos al admin
        $adminPermissions = Permission::whereIn('slug', [
            'skills.view', 'skills.create', 'skills.edit',
            'skill_categories.view', 'skill_categories.create', 'skill_categories.edit'
        ])->get();
        
        if ($adminPermissions->count() > 0) {
            $adminRole->permissions()->syncWithoutDetaching($adminPermissions);
        }
        
        // Asignar permisos al moderador
        $moderatorPermissions = Permission::whereIn('slug', [
            'skills.view',
            'skill_categories.view'
        ])->get();
        
        if ($moderatorPermissions->count() > 0) {
            $moderatorRole->permissions()->syncWithoutDetaching($moderatorPermissions);
        }
    }
}
