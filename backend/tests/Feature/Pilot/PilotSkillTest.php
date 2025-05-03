<?php

namespace Tests\Feature\Pilot;

use App\Models\Pilot;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SolarSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilotSkillTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $pilot;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name'           => 'Sol',
            'description'    => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate'   => 0,
            'y_coordinate'   => 0,
        ]);

        // Crear un usuario
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;

        // Crear un piloto para el usuario
        $this->pilot = Pilot::create([
            'name'        => 'Test Pilot',
            'race'        => 'Humano',
            'user_id'     => $this->user->id,
            'credits'     => 10000,
            'location_id' => $solarSystem->id,
        ]);

        // Crear categorías de habilidades
        $combatCategory = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        $navigationCategory = SkillCategory::create([
            'name'        => 'Navegación',
            'description' => 'Habilidades de navegación',
        ]);

        // Crear habilidades
        Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $combatCategory->id,
            'multiplier'        => 1,
        ]);

        Skill::create([
            'name'              => 'Navegación Espacial',
            'description'       => 'Conocimientos básicos sobre navegación espacial.',
            'skill_category_id' => $navigationCategory->id,
            'multiplier'        => 1,
        ]);
    }

    /**
     * Test que un usuario puede obtener todas las habilidades.
     */
    public function test_user_can_get_all_skills()
    {
        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/skills');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'description',
                    'skill_category_id',
                    'multiplier',
                    'category',
                ],
            ]);
    }

    /**
     * Test que un usuario puede obtener todas las categorías de habilidades.
     */
    public function test_user_can_get_all_skill_categories()
    {
        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/skills/categories');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'description',
                ],
            ]);
    }

    /**
     * Test que un usuario puede obtener habilidades por categoría.
     */
    public function test_user_can_get_skills_by_category()
    {
        // Obtener la categoría de combate
        $combatCategory = SkillCategory::where('name', 'Combate')->first();

        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/skills/categories/' . $combatCategory->id);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'description',
                    'skill_category_id',
                    'multiplier',
                ],
            ]);
    }

    /**
     * Test que un usuario puede obtener los detalles de una habilidad.
     */
    public function test_user_can_get_skill_details()
    {
        // Obtener la habilidad de armas láser
        $skill = Skill::where('name', 'Armas Láser Básicas')->first();

        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/skills/' . $skill->id);

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'id'                => $skill->id,
                'name'              => 'Armas Láser Básicas',
                'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
                'skill_category_id' => $skill->skill_category_id,
                'multiplier'        => 1,
            ]);
    }

    /**
     * Test que un usuario puede obtener las habilidades de su piloto actual.
     */
    public function test_user_can_get_current_pilot_skills()
    {
        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/current/skills');

        // Verificar la respuesta
        $response->assertStatus(200);
    }

    /**
     * Test que un usuario puede obtener las habilidades de un piloto específico.
     */
    public function test_user_can_get_pilot_skills()
    {
        // Hacer la solicitud
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/' . $this->pilot->id . '/skills');

        // Verificar la respuesta
        $response->assertStatus(200);
    }
}
