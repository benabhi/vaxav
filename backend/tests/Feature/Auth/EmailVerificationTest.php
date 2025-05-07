<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_verify_email_with_link()
    {
        // Crear un usuario no verificado
        $user = User::factory()->unverified()->create();

        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // En lugar de generar una URL firmada, usaremos directamente los valores
        $id = $user->id;
        $hash = sha1($user->email);

        // Simular la verificación de email
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get("/api/auth/email/verify/{$id}/{$hash}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Correo electrónico verificado correctamente. Por favor, inicia sesión para continuar.')
            ->assertJsonPath('verified', true);

        // Verificar que el email se marcó como verificado
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_verify_email_with_code()
    {
        // Crear un usuario no verificado
        $user = User::factory()->unverified()->create();

        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Crear un código de verificación
        $code = '123456';
        VerificationCode::create([
            'user_id'    => $user->id,
            'code'       => $code,
            'expires_at' => now()->addMinutes(60),
        ]);

        // Simular la verificación con código
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/email/verify-code', [
                    'code' => $code,
                ]);

        $response->assertStatus(200)
            ->assertJson([
                'message'  => 'Correo electrónico verificado correctamente.',
                'verified' => true,
            ]);

        // Verificar que el email se marcó como verificado
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_cannot_verify_with_invalid_code()
    {
        // Crear un usuario no verificado
        $user = User::factory()->unverified()->create();

        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Crear un código de verificación
        $code = '123456';
        VerificationCode::create([
            'user_id'    => $user->id,
            'code'       => $code,
            'expires_at' => now()->addMinutes(60),
        ]);

        // Simular la verificación con código incorrecto
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/email/verify-code', [
                    'code' => 'wrong-code',
                ]);

        $response->assertStatus(422);

        // Verificar que el email NO se marcó como verificado
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_resend_verification_email()
    {
        // Crear un usuario no verificado
        $user = User::factory()->unverified()->create();

        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // Solicitar reenvío del email de verificación
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/email/verification-notification');

        // Solo verificamos que la respuesta sea exitosa
        // No podemos verificar el envío del email en este contexto
        $response->assertStatus(200);
    }

    public function test_verified_user_cannot_verify_again()
    {
        // Crear un usuario ya verificado
        $user = User::factory()->create();

        // Crear un token para el usuario
        $token = $user->createToken('test-token')->plainTextToken;

        // En lugar de generar una URL firmada, usaremos directamente los valores
        $id = $user->id;
        $hash = sha1($user->email);

        // Simular la verificación de email
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get("/api/auth/email/verify/{$id}/{$hash}");

        $response->assertStatus(200)
            ->assertJson([
                'message'  => 'El correo electrónico ya ha sido verificado.',
                'verified' => true,
            ]);
    }
}
