<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class EmailVerificationWithCodeTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear un usuario no verificado
        $this->user = User::factory()->create([
            'email_verified_at' => null
        ]);

        // Generar token de acceso
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    /** @test */
    public function user_can_verify_email_with_valid_code()
    {
        // Crear un código de verificación válido
        $code = '123456';
        VerificationCode::create([
            'user_id' => $this->user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(30)
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => $code
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Correo electrónico verificado correctamente.',
                'verified' => true
            ]);

        // Verificar que el email del usuario ha sido verificado
        $this->assertNotNull($this->user->fresh()->email_verified_at);

        // Verificar que el código ha sido eliminado
        $this->assertDatabaseMissing('verification_codes', [
            'user_id' => $this->user->id,
            'code' => $code
        ]);
    }

    /** @test */
    public function user_cannot_verify_with_invalid_code()
    {
        // Crear un código de verificación válido
        $validCode = '123456';
        VerificationCode::create([
            'user_id' => $this->user->id,
            'code' => $validCode,
            'expires_at' => now()->addMinutes(30)
        ]);

        // Intentar verificar con un código inválido
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => '654321' // Código incorrecto
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'El código de verificación es inválido o ha expirado.',
                'verified' => false
            ]);

        // Verificar que el email del usuario sigue sin verificar
        $this->assertNull($this->user->fresh()->email_verified_at);
    }

    /** @test */
    public function user_cannot_verify_with_expired_code()
    {
        // Crear un código de verificación expirado
        $code = '123456';
        VerificationCode::create([
            'user_id' => $this->user->id,
            'code' => $code,
            'expires_at' => now()->subMinutes(5) // Expirado
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => $code
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'El código de verificación es inválido o ha expirado.',
                'verified' => false
            ]);

        // Verificar que el email del usuario sigue sin verificar
        $this->assertNull($this->user->fresh()->email_verified_at);
    }

    /** @test */
    public function user_is_locked_after_multiple_failed_attempts()
    {
        // Crear un código de verificación válido
        $validCode = '123456';
        VerificationCode::create([
            'user_id' => $this->user->id,
            'code' => $validCode,
            'expires_at' => now()->addMinutes(30)
        ]);

        // Simular 5 intentos fallidos
        $key = 'verification_attempts_' . $this->user->id;
        Cache::put($key, 5, now()->addMinutes(15));

        // Intentar verificar con un código válido
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => $validCode
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'message' => 'Demasiados intentos fallidos. Inténtalo de nuevo en 15 minutos.',
                'verified' => false,
                'locked' => true
            ]);

        // Verificar que el email del usuario sigue sin verificar
        $this->assertNull($this->user->fresh()->email_verified_at);
    }

    /** @test */
    public function user_can_generate_new_verification_code()
    {
        // Crear un código de verificación existente
        $oldCode = '123456';
        VerificationCode::create([
            'user_id' => $this->user->id,
            'code' => $oldCode,
            'expires_at' => now()->addMinutes(30)
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/generate-code');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Se ha enviado un código de verificación a tu dirección de correo electrónico.'
            ]);

        // Verificar que el código anterior ha sido eliminado
        $this->assertDatabaseMissing('verification_codes', [
            'user_id' => $this->user->id,
            'code' => $oldCode
        ]);

        // Verificar que se ha creado un nuevo código
        $this->assertDatabaseHas('verification_codes', [
            'user_id' => $this->user->id
        ]);
    }

    /** @test */
    public function already_verified_user_cannot_verify_again()
    {
        // Verificar el usuario
        $this->user->markEmailAsVerified();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => '123456'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'El correo electrónico ya ha sido verificado.',
                'verified' => true
            ]);
    }

    /** @test */
    public function already_verified_user_cannot_generate_new_code()
    {
        // Verificar el usuario
        $this->user->markEmailAsVerified();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/generate-code');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'El correo electrónico ya ha sido verificado.',
                'verified' => true
            ]);
    }

    /** @test */
    public function code_must_be_six_digits()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/auth/email/verify-code', [
            'code' => '12345' // Solo 5 dígitos
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'El código de verificación debe tener 6 dígitos.',
                'verified' => false
            ]);
    }
}
