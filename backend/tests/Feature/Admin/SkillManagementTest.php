<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SkillPrerequisite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillManagementTest extends TestCase
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

        // Crear permisos para habilidades
        Permission::create(['name' => 'Ver Habilidades', 'slug' => 'skills.view']);
        Permission::create(['name' => 'Crear Habilidades', 'slug' => 'skills.create']);
        Permission::create(['name' => 'Editar Habilidades', 'slug' => 'skills.edit']);
        Permission::create(['name' => 'Eliminar Habilidades', 'slug' => 'skills.delete']);

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
            4,
            5,
            6,
            7,
            8 // Todos los permisos
        ]);

        // Asignar permisos al rol de moderador
        $moderatorRole->permissions()->attach([
            1,
            5 // Ver habilidades y categorías
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
     * Test que un administrador puede ver la lista de habilidades.
     */
    public function test_admin_can_view_skills()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear algunas habilidades
        Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        Skill::create([
            'name'              => 'Armas Láser Avanzadas',
            'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 3,
        ]);

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->getJson('/api/admin/skills');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'skill_category_id',
                        'multiplier',
                        'created_at',
                        'updated_at',
                        'category',
                        'prerequisites',
                    ],
                ],
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);
    }

    /**
     * Test que un moderador no puede ver la lista de habilidades en el panel de administración.
     */
    public function test_moderator_cannot_view_skills_in_admin()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad
        Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Hacer la solicitud como moderador
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->moderatorToken,
        ])->getJson('/api/admin/skills');

        // Verificar que se deniega el acceso
        $response->assertStatus(403);
    }

    /**
     * Test que un usuario regular no puede ver la lista de habilidades.
     */
    public function test_regular_user_cannot_view_skills()
    {
        // Hacer la solicitud como usuario regular
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->regularToken,
        ])->getJson('/api/admin/skills');

        // Verificar que se deniega el acceso
        $response->assertStatus(403);
    }

    /**
     * Test que un administrador puede crear una habilidad.
     */
    public function test_admin_can_create_skill()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Datos de la habilidad
        $skillData = [
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
            'prerequisites'     => [],
        ];

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/skills', $skillData);

        // Verificar la respuesta
        $response->assertStatus(201)
            ->assertJson([
                'name'              => 'Armas Láser Básicas',
                'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
                'skill_category_id' => $category->id,
                'multiplier'        => 1,
            ]);

        // Verificar que la habilidad se creó en la base de datos
        $this->assertDatabaseHas('skills', [
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);
    }

    /**
     * Test que un administrador puede crear una habilidad con prerrequisitos.
     */
    public function test_admin_can_create_skill_with_prerequisites()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad prerrequisito
        $prerequisiteSkill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Datos de la habilidad
        $skillData = [
            'name'              => 'Armas Láser Avanzadas',
            'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 3,
            'prerequisites'     => [
                [
                    'skill_id' => $prerequisiteSkill->id,
                    'level'    => 3,
                ],
            ],
        ];

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->postJson('/api/admin/skills', $skillData);

        // Verificar la respuesta
        $response->assertStatus(201)
            ->assertJson([
                'name'              => 'Armas Láser Avanzadas',
                'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
                'skill_category_id' => $category->id,
                'multiplier'        => 3,
            ]);

        // Verificar que la habilidad se creó en la base de datos
        $this->assertDatabaseHas('skills', [
            'name'              => 'Armas Láser Avanzadas',
            'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 3,
        ]);

        // Verificar que se creó el prerrequisito
        $skill = Skill::where('name', 'Armas Láser Avanzadas')->first();
        $this->assertDatabaseHas('skills_prerequisites', [
            'skill_id'           => $skill->id,
            'prerequisite_id'    => $prerequisiteSkill->id,
            'prerequisite_level' => 3,
        ]);
    }

    /**
     * Test que un moderador no puede crear una habilidad.
     */
    public function test_moderator_cannot_create_skill()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Datos de la habilidad
        $skillData = [
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
            'prerequisites'     => [],
        ];

        // Hacer la solicitud como moderador
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->moderatorToken,
        ])->postJson('/api/admin/skills', $skillData);

        // Verificar que se deniega el acceso
        $response->assertStatus(403);

        // Verificar que la habilidad no se creó en la base de datos
        $this->assertDatabaseMissing('skills', [
            'name' => 'Armas Láser Básicas',
        ]);
    }

    /**
     * Test que un administrador puede actualizar una habilidad.
     */
    public function test_admin_can_update_skill()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad
        $skill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Datos actualizados de la habilidad
        $updatedData = [
            'name'              => 'Armas Láser Básicas Actualizadas',
            'description'       => 'Conocimientos básicos actualizados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 2,
            'prerequisites'     => [],
        ];

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->putJson('/api/admin/skills/' . $skill->id, $updatedData);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'name'              => 'Armas Láser Básicas Actualizadas',
                'description'       => 'Conocimientos básicos actualizados sobre el uso de armas láser.',
                'skill_category_id' => $category->id,
                'multiplier'        => 2,
            ]);

        // Verificar que la habilidad se actualizó en la base de datos
        $this->assertDatabaseHas('skills', [
            'id'                => $skill->id,
            'name'              => 'Armas Láser Básicas Actualizadas',
            'description'       => 'Conocimientos básicos actualizados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 2,
        ]);
    }

    /**
     * Test que un administrador puede eliminar una habilidad.
     */
    public function test_admin_can_delete_skill()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad
        $skill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Hacer la solicitud como admin
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/skills/' . $skill->id);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Habilidad eliminada correctamente.',
            ]);

        // Verificar que la habilidad se eliminó de la base de datos
        $this->assertDatabaseMissing('skills', [
            'id' => $skill->id,
        ]);
    }

    /**
     * Test que un administrador no puede eliminar una habilidad que es prerrequisito de otra.
     */
    public function test_admin_cannot_delete_skill_that_is_prerequisite()
    {
        // Crear una categoría de habilidad
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear una habilidad prerrequisito
        $prerequisiteSkill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        // Crear una habilidad que depende del prerrequisito
        $skill = Skill::create([
            'name'              => 'Armas Láser Avanzadas',
            'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 3,
        ]);

        // Crear el prerrequisito
        SkillPrerequisite::create([
            'skill_id'           => $skill->id,
            'prerequisite_id'    => $prerequisiteSkill->id,
            'prerequisite_level' => 3,
        ]);

        // Hacer la solicitud como admin para eliminar el prerrequisito
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken,
        ])->deleteJson('/api/admin/skills/' . $prerequisiteSkill->id);

        // Verificar la respuesta
        $response->assertStatus(400)
            ->assertJson([
                'message' => 'No se puede eliminar la habilidad porque es un prerrequisito para otras habilidades.',
            ]);

        // Verificar que la habilidad no se eliminó de la base de datos
        $this->assertDatabaseHas('skills', [
            'id' => $prerequisiteSkill->id,
        ]);
    }
}
