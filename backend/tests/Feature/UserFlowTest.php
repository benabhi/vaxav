<?php

namespace Tests\Feature;

use App\Models\SolarSystem;
use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_user_flow_registration_verification_pilot_creation()
    {
        // 1. Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name'           => 'Sol',
            'description'    => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate'   => 0,
            'y_coordinate'   => 0,
        ]);

        // 2. Registrar un nuevo usuario
        $registrationResponse = $this->postJson('/api/auth/register', [
            'name'                  => 'TestUser123',
            'email'                 => 'test@example.com',
            'email_confirmation'    => 'test@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $registrationResponse->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'created_at', 'updated_at'],
                'token',
            ]);

        // Obtener el token y el usuario
        $token = $registrationResponse->json('token');
        $userId = $registrationResponse->json('user.id');

        // Verificar que el usuario se creó correctamente
        $this->assertDatabaseHas('users', [
            'id'    => $userId,
            'name'  => 'TestUser123',
            'email' => 'test@example.com',
        ]);

        // 3. Verificar que el email no está verificado
        $user = User::find($userId);
        $this->assertNull($user->email_verified_at);

        // 4. Crear un código de verificación
        $code = '123456';
        VerificationCode::create([
            'user_id'    => $userId,
            'code'       => $code,
            'expires_at' => now()->addMinutes(60),
        ]);

        // 5. Verificar el email con el código
        $verificationResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/email/verify-code', [
                    'code' => $code,
                ]);

        $verificationResponse->assertStatus(200)
            ->assertJson([
                'message'  => 'Correo electrónico verificado correctamente.',
                'verified' => true,
            ]);

        // Verificar que el email se marcó como verificado
        $this->assertNotNull($user->fresh()->email_verified_at);

        // 6. Crear un piloto
        $pilotData = [
            'name' => 'Test Pilot',
            'race' => 'Humano',
        ];

        $pilotResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/pilots', $pilotData);

        $pilotResponse->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
                'race',
                'user_id',
                'credits',
                'location_id',
                'created_at',
                'updated_at'
            ]);

        // Verificar que el piloto se creó correctamente
        $this->assertDatabaseHas('pilots', [
            'name'        => 'Test Pilot',
            'race'        => 'Humano',
            'user_id'     => $userId,
            'credits'     => 10000, // Créditos iniciales
            'location_id' => $solarSystem->id,
        ]);

        // 7. Verificar que el piloto se creó correctamente
        $this->assertDatabaseHas('pilots', [
            'name'    => 'Test Pilot',
            'race'    => 'Humano',
            'user_id' => $userId,
            'credits' => 10000,
        ]);
    }
}
