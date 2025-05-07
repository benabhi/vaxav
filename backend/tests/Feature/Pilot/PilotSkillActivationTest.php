<?php

namespace Tests\Feature\Pilot;

use App\Models\Pilot;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SolarSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilotSkillActivationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $pilot;
    protected $skill;

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

        // Crear categoría de habilidades
        $combatCategory = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear habilidad
        $this->skill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $combatCategory->id,
            'multiplier'        => 1,
        ]);

        // Asignar la habilidad al piloto (inicialmente inactiva)
        $this->pilot->skills()->attach($this->skill->id, [
            'current_level' => 2,
            'xp'            => 2000,
            'active'        => false,
        ]);
    }

    /**
     * Test que un piloto puede activar una habilidad.
     */
    public function test_pilot_can_activate_skill()
    {
        // Verificar que la habilidad está inicialmente inactiva
        $pilotSkill = $this->pilot->skills()->where('skill_id', $this->skill->id)->first()->pivot;
        $this->assertFalse((bool) $pilotSkill->active);

        // Hacer la solicitud para activar la habilidad
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/pilots/current/skills/' . $this->skill->id . '/activate');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Habilidad activada correctamente',
            ]);

        // Verificar que la habilidad ahora está activa en la base de datos
        $this->assertTrue((bool) $this->pilot->skills()->where('skill_id', $this->skill->id)->first()->pivot->active);
    }

    /**
     * Test que un piloto puede desactivar una habilidad.
     */
    public function test_pilot_can_deactivate_skill()
    {
        // Primero activar la habilidad
        $this->pilot->skills()->updateExistingPivot($this->skill->id, ['active' => true]);

        // Verificar que la habilidad está activa
        $pilotSkill = $this->pilot->skills()->where('skill_id', $this->skill->id)->first()->pivot;
        $this->assertTrue((bool) $pilotSkill->active);

        // Hacer la solicitud para desactivar la habilidad
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/pilots/current/skills/' . $this->skill->id . '/deactivate');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Habilidad desactivada correctamente',
            ]);

        // Verificar que la habilidad ahora está inactiva en la base de datos
        $this->assertFalse((bool) $this->pilot->skills()->where('skill_id', $this->skill->id)->first()->pivot->active);
    }

    /**
     * Test que un piloto no puede activar una habilidad que no posee.
     */
    public function test_pilot_cannot_activate_skill_they_do_not_have()
    {
        // Crear otra habilidad que el piloto no tiene
        $newSkill = Skill::create([
            'name'              => 'Escudos Avanzados',
            'description'       => 'Conocimientos avanzados sobre escudos.',
            'skill_category_id' => SkillCategory::first()->id,
            'multiplier'        => 2,
        ]);

        // Hacer la solicitud para activar la habilidad que no tiene
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/pilots/current/skills/' . $newSkill->id . '/activate');

        // Verificar la respuesta
        $response->assertStatus(404);
    }

    /**
     * Test que un piloto puede ver el estado de activación de sus habilidades.
     */
    public function test_pilot_can_see_activation_status_of_skills()
    {
        // Hacer la solicitud para obtener las habilidades del piloto
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/current/skills');

        // Verificar la respuesta
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'description',
                    'skill_category_id',
                    'multiplier',
                    'pivot' => [
                        'pilot_id',
                        'skill_id',
                        'xp',
                        'current_level',
                        'active',
                    ],
                ],
            ])
            ->assertJsonPath('0.pivot.active', 0);

        // Activar la habilidad
        $this->pilot->skills()->updateExistingPivot($this->skill->id, ['active' => true]);

        // Hacer la solicitud nuevamente
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/current/skills');

        // Verificar que ahora la habilidad aparece como activa
        $response->assertStatus(200)
            ->assertJsonPath('0.pivot.active', 1);
    }

    /**
     * Test que un piloto puede filtrar sus habilidades por estado de activación.
     */
    public function test_pilot_can_filter_skills_by_activation_status()
    {
        // Crear otra habilidad y asignarla al piloto como activa
        $newSkill = Skill::create([
            'name'              => 'Escudos Básicos',
            'description'       => 'Conocimientos básicos sobre escudos.',
            'skill_category_id' => SkillCategory::first()->id,
            'multiplier'        => 1,
        ]);

        $this->pilot->skills()->attach($newSkill->id, [
            'current_level' => 1,
            'xp'            => 1000,
            'active'        => true,
        ]);

        // Hacer la solicitud para obtener solo las habilidades activas
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/current/skills?active=1');

        // Verificar que solo se devuelve la habilidad activa
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $newSkill->id);

        // Hacer la solicitud para obtener solo las habilidades inactivas
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/pilots/current/skills?active=0');

        // Verificar que solo se devuelve la habilidad inactiva
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $this->skill->id);
    }
}
