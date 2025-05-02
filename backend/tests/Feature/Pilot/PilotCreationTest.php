<?php

namespace Tests\Feature\Pilot;

use App\Models\User;
use App\Models\Pilot;
use App\Models\SolarSystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilotCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_pilot()
    {
        // Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name' => 'Sol',
            'description' => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate' => 0,
            'y_coordinate' => 0,
        ]);

        // Crear un usuario verificado
        $user = User::factory()->create();
        
        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Datos del piloto
        $pilotData = [
            'name' => 'Test Pilot',
            'race' => 'Humano',
        ];

        // Solicitar la creación del piloto
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/pilots', $pilotData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id', 'name', 'race', 'user_id', 'credits', 'location_id', 'created_at', 'updated_at'
                 ]);

        // Verificar que el piloto se creó correctamente
        $this->assertDatabaseHas('pilots', [
            'name' => 'Test Pilot',
            'race' => 'Humano',
            'user_id' => $user->id,
            'credits' => 10000, // Créditos iniciales
            'location_id' => $solarSystem->id,
        ]);

        // Verificar que el usuario tiene un piloto
        $this->assertTrue($user->fresh()->pilot()->exists());
    }

    public function test_user_cannot_create_multiple_pilots()
    {
        // Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name' => 'Sol',
            'description' => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate' => 0,
            'y_coordinate' => 0,
        ]);

        // Crear un usuario verificado
        $user = User::factory()->create();
        
        // Crear un piloto para el usuario
        Pilot::create([
            'name' => 'Existing Pilot',
            'race' => 'Cyborg',
            'user_id' => $user->id,
            'credits' => 10000,
            'location_id' => $solarSystem->id,
        ]);
        
        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Datos del nuevo piloto
        $pilotData = [
            'name' => 'Second Pilot',
            'race' => 'Humano',
        ];

        // Intentar crear otro piloto
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/pilots', $pilotData);

        $response->assertStatus(400)
                 ->assertJson([
                     'message' => 'El usuario ya tiene un piloto',
                 ]);

        // Verificar que no se creó un segundo piloto
        $this->assertDatabaseMissing('pilots', [
            'name' => 'Second Pilot',
            'user_id' => $user->id,
        ]);

        // Verificar que el usuario sigue teniendo solo un piloto
        $this->assertEquals(1, $user->fresh()->pilot()->count());
    }

    public function test_pilot_creation_requires_valid_data()
    {
        // Crear un usuario verificado
        $user = User::factory()->create();
        
        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Datos inválidos del piloto
        $invalidData = [
            'name' => '', // Nombre vacío
            'race' => 'InvalidRace', // Raza inválida
        ];

        // Intentar crear un piloto con datos inválidos
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/pilots', $invalidData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'race']);

        // Verificar que no se creó el piloto
        $this->assertDatabaseMissing('pilots', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_get_current_pilot()
    {
        // Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name' => 'Sol',
            'description' => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate' => 0,
            'y_coordinate' => 0,
        ]);

        // Crear un usuario verificado
        $user = User::factory()->create();
        
        // Crear un piloto para el usuario
        $pilot = Pilot::create([
            'name' => 'Test Pilot',
            'race' => 'Humano',
            'user_id' => $user->id,
            'credits' => 10000,
            'location_id' => $solarSystem->id,
        ]);
        
        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Solicitar el piloto actual
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/pilots/current');

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $pilot->id,
                     'name' => 'Test Pilot',
                     'race' => 'Humano',
                     'user_id' => $user->id,
                     'credits' => 10000,
                 ]);
    }

    public function test_user_without_pilot_gets_404_when_requesting_current_pilot()
    {
        // Crear un usuario verificado sin piloto
        $user = User::factory()->create();
        
        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Solicitar el piloto actual
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/pilots/current');

        $response->assertStatus(404)
                 ->assertJson([
                     'message' => 'El usuario no tiene un piloto',
                 ]);
    }
}
