<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillCategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $adminToken;
    protected $moderatorUser;
    protected $moderatorToken;
    protected $regularUser;
    protected $regularToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear permisos para categorías de habilidades
        Permission::create(['name' => 'Ver Categorías de Habilidades', 'slug' => 'skill_categories.view']);
        Permission::create(['name' => 'Crear Categorías de Habilidades', 'slug' => 'skill_categories.create']);
        Permission::create(['name' => 'Editar Categorías de Habilidades', 'slug' => 'skill_categories.edit']);
        Permission::create(['name' => 'Eliminar Categorías de Habilidades', 'slug' => 'skill_categories.delete']);

        // Crear roles
        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $moderatorRole = Role::create(['name' => 'Moderator', 'slug' => 'moderator']);
        $userRole = Role::create(['name' => 'User', 'slug' => 'user']);

        // Asignar permisos al rol de admin
        $adminRole->permissions()->attach([
            1,
            2,
            3,
            4 // Todos los permisos de categorías
        ]);

        // Asignar permisos al rol de moderador
        $moderatorRole->permissions()->attach([
            1 // Ver categorías de habilidades
        ]);

        // Crear un usuario admin
        $this->adminUser = User::factory()->create([
            'name'  => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $this->adminUser->roles()->attach($adminRole);
        $this->adminToken = $this->adminUser->createToken('admin-token')->plainTextToken;

        // Crear un usuario moderador
        $this->moderatorUser = User::factory()->create([
            'name'  => 'Moderator User',
            'email' => 'moderator@example.com',
        ]);
        $this->moderatorUser->roles()->attach($moderatorRole);
        $this->moderatorToken = $this->moderatorUser->createToken('moderator-token')->plainTextToken;

        // Crear un usuario regular
        $this->regularUser = User::factory()->create([
            'name'  => 'Regular User',
            'email' => 'user@example.com',
        ]);
        $this->regularUser->roles()->attach($userRole);
        $this->regularToken = $this->regularUser->createToken('user-token')->plainTextToken;
    }

    /**
     * Test que un administrador puede ver la lista de categorías de habilidades.
     */
    public function test_admin_can_view_skill_categories()
    {
        // Crear algunas categorías de habilidades
        SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        SkillCategory::create([
            'name'        => 'Navegación',
            'description' => 'Habilidades de navegación',
        ]);

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->getJson('/api/admin/skill-categories');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);
    }

    /**
     * Test que un moderador no puede ver la lista de categorías de habilidades en el panel de administración.
     */
    public function test_moderator_cannot_view_skill_categories_in_admin()
    {
        // Crear una categoría de habilidad
        SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Hacer la solicitud como moderador
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->moderatorToken,
        ])->getJson('/api/admin/skill-categories');

        // Verificar que se deniega el acceso
        $response->assertStatus(403);
    }

    /**
     * Test que un usuario regular no puede ver la lista de categorías de habilidades.
     */
    public function test_regular_user_cannot_view_skill_categories()
    {
        // Hacer la solicitud como usuario regular
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->regularToken,
        ])->getJson('/api/admin/skill-categories');

        // Verificar que se deniega el acceso
        $response->assertStatus(403);
    }

    /**
     * Test que un administrador puede crear una categoría de habilidad.
     */
    public function test_admin_can_create_skill_category()
    {
        // Datos de la categoría
        $categoryData = [
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ];

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/skill-categories', $categoryData);

        // Verificar la respuesta
        $response->assertStatus(201)
            ->assertJson([
                'name'        => 'Combate',
                'description' => 'Habilidades de combate',
            ]);

        // Verificar que la categoría se creó en la base de datos
        $this->assertDatabaseHas('skills_categories', [
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);
    }

    /**
     * Test que un moderador no puede crear una categoría de habilidad.
     */
    public function test_moderator_cannot_create_skill_category()
    {
        // Datos de la categoría
        $categoryData = [
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ];

        // Hacer la solicitud como moderador
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->moderatorToken,
        ])->postJson('/api/admin/skill-categories', $categoryData);

        // Verificar que se deniega el acceso
        $response->assertStatus(403);

        // Verificar que la categoría no se creó en la base de datos
        $this->assertDatabaseMissing('skills_categories', [
            'name' => 'Combate',
        ]);
    }

    /**
     * Test que un administrador puede actualizar una categoría de habilidad.
     */
    public function test_admin_can_update_skill_category()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Datos actualizados de la categoría
        $updatedData = [
            'name'        => 'Combate Actualizado',
            'description' => 'Habilidades de combate actualizadas',
        ];

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->putJson('/api/admin/skill-categories/' . $category->id, $updatedData);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'name'        => 'Combate Actualizado',
                'description' => 'Habilidades de combate actualizadas',
            ]);

        // Verificar que la categoría se actualizó en la base de datos
        $this->assertDatabaseHas('skills_categories', [
            'id'          => $category->id,
            'name'        => 'Combate Actualizado',
            'description' => 'Habilidades de combate actualizadas',
        ]);
    }

    /**
     * Test que un administrador puede eliminar una categoría de habilidad.
     */
    public function test_admin_can_delete_skill_category()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/skill-categories/' . $category->id);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Categoría eliminada correctamente.',
            ]);

        // Verificar que la categoría se eliminó de la base de datos
        $this->assertDatabaseMissing('skills_categories', [
            'id' => $category->id,
        ]);
    }

    /**
     * Test que un administrador no puede eliminar una categoría que tiene habilidades asociadas.
     */
    public function test_admin_cannot_delete_category_with_skills()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad asociada a la categoría
        Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/skill-categories/' . $category->id);

        // Verificar la respuesta
        $response->assertStatus(400)
            ->assertJson([
                'message' => 'No se puede eliminar la categoría porque tiene habilidades asociadas.',
            ]);

        // Verificar que la categoría no se eliminó de la base de datos
        $this->assertDatabaseHas('skills_categories', [
            'id' => $category->id,
        ]);
    }
}
