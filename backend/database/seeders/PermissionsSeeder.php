<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permisos de usuarios
        $this->createPermission('Ver Usuarios', 'users.view', 'Permite ver la lista de usuarios y detalles de usuarios individuales');
        $this->createPermission('Crear Usuarios', 'users.create', 'Permite crear nuevos usuarios');
        $this->createPermission('Editar Usuarios', 'users.edit', 'Permite editar usuarios existentes');
        $this->createPermission('Eliminar Usuarios', 'users.delete', 'Permite eliminar usuarios');

        // Permisos de roles
        $this->createPermission('Ver Roles', 'roles.view', 'Permite ver la lista de roles y detalles de roles individuales');
        $this->createPermission('Crear Roles', 'roles.create', 'Permite crear nuevos roles');
        $this->createPermission('Editar Roles', 'roles.edit', 'Permite editar roles existentes');
        $this->createPermission('Eliminar Roles', 'roles.delete', 'Permite eliminar roles');

        // Permisos de pilotos
        $this->createPermission('Ver Pilotos', 'pilots.view', 'Permite ver la lista de pilotos y detalles de pilotos individuales');
        $this->createPermission('Crear Pilotos', 'pilots.create', 'Permite crear nuevos pilotos');
        $this->createPermission('Editar Pilotos', 'pilots.edit', 'Permite editar pilotos existentes');
        $this->createPermission('Eliminar Pilotos', 'pilots.delete', 'Permite eliminar pilotos');

        // Permisos de naves
        $this->createPermission('Ver Naves', 'ships.view', 'Permite ver la lista de naves y detalles de naves individuales');
        $this->createPermission('Crear Naves', 'ships.create', 'Permite crear nuevas naves');
        $this->createPermission('Editar Naves', 'ships.edit', 'Permite editar naves existentes');
        $this->createPermission('Eliminar Naves', 'ships.delete', 'Permite eliminar naves');

        // Permisos de universo
        $this->createPermission('Ver Universo', 'universe.view', 'Permite ver el mapa del universo y detalles de sistemas solares');
        $this->createPermission('Editar Universo', 'universe.edit', 'Permite editar el universo (solo para administradores)');

        // Permisos de mercado
        $this->createPermission('Ver Mercado', 'market.view', 'Permite ver el mercado');
        $this->createPermission('Crear Órdenes', 'market.create', 'Permite crear órdenes de compra y venta');
        $this->createPermission('Cancelar Órdenes', 'market.cancel', 'Permite cancelar órdenes propias');
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
}
