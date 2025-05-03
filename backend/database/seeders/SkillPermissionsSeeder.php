<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class SkillPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear permisos para habilidades
        $this->createPermission('Ver Habilidades', 'skills.view', 'Permite ver las habilidades');
        $this->createPermission('Crear Habilidades', 'skills.create', 'Permite crear nuevas habilidades');
        $this->createPermission('Editar Habilidades', 'skills.edit', 'Permite editar habilidades existentes');
        $this->createPermission('Eliminar Habilidades', 'skills.delete', 'Permite eliminar habilidades');
        
        // Crear permisos para categorías de habilidades
        $this->createPermission('Ver Categorías de Habilidades', 'skill_categories.view', 'Permite ver las categorías de habilidades');
        $this->createPermission('Crear Categorías de Habilidades', 'skill_categories.create', 'Permite crear nuevas categorías de habilidades');
        $this->createPermission('Editar Categorías de Habilidades', 'skill_categories.edit', 'Permite editar categorías de habilidades existentes');
        $this->createPermission('Eliminar Categorías de Habilidades', 'skill_categories.delete', 'Permite eliminar categorías de habilidades');
        
        // Asignar permisos a roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Crea un permiso si no existe
     */
    private function createPermission(string $name, string $slug, string $description = null): void
    {
        Permission::firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'description' => $description,
            ]
        );
    }

    /**
     * Asigna permisos a roles
     */
    private function assignPermissionsToRoles(): void
    {
        // Obtener roles
        $superAdminRole = Role::where('slug', 'superadmin')->first();
        $adminRole = Role::where('slug', 'admin')->first();
        $moderatorRole = Role::where('slug', 'moderator')->first();
        
        if (!$superAdminRole || !$adminRole || !$moderatorRole) {
            return;
        }
        
        // Obtener permisos
        $skillPermissions = Permission::whereIn('slug', [
            'skills.view', 'skills.create', 'skills.edit', 'skills.delete',
            'skill_categories.view', 'skill_categories.create', 'skill_categories.edit', 'skill_categories.delete'
        ])->get();
        
        // El superadmin ya tiene todos los permisos
        
        // Asignar permisos al admin
        $adminPermissions = Permission::whereIn('slug', [
            'skills.view', 'skills.create', 'skills.edit',
            'skill_categories.view', 'skill_categories.create', 'skill_categories.edit'
        ])->get();
        
        $adminRole->permissions()->syncWithoutDetaching($adminPermissions);
        
        // Asignar permisos al moderador
        $moderatorPermissions = Permission::whereIn('slug', [
            'skills.view',
            'skill_categories.view'
        ])->get();
        
        $moderatorRole->permissions()->syncWithoutDetaching($moderatorPermissions);
    }
}
