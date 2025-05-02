<?php

namespace App\Http\Controllers;

use App\Models\VerificationCode;
use App\Notifications\VerificationCodeNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VerifyEmailWithCodeController extends Controller
{
    /**
     * Verifica el email del usuario usando un código.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message'  => 'El correo electrónico ya ha sido verificado.',
                'verified' => true,
            ]);
        }



        // Verificar si el usuario está bloqueado por demasiados intentos
        $key = 'verification_attempts_' . $user->id;
        $attempts = Cache::get($key, 0);

        if ($attempts >= 5) {
            return response()->json([
                'message'  => 'Demasiados intentos fallidos. Inténtalo de nuevo en 15 minutos.',
                'verified' => false,
                'locked'   => true,
            ], 429);
        }

        // Validar que el código tenga 6 caracteres para la verificación normal
        if (strlen($request->code) !== 6) {
            // Incrementar el contador de intentos fallidos
            Cache::put($key, $attempts + 1, now()->addMinutes(15));

            return response()->json([
                'message'  => 'El código de verificación debe tener 6 dígitos.',
                'verified' => false,
            ], 422);
        }

        // Buscar el código de verificación válido
        $verificationCode = VerificationCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($verificationCode) {
            if ($user->markEmailAsVerified()) {
                event(new Verified($user));

                // Eliminar el código usado
                $verificationCode->delete();

                // Limpiar el contador de intentos
                Cache::forget($key);
            }

            return response()->json([
                'message'  => 'Correo electrónico verificado correctamente.',
                'verified' => true,
            ]);
        }

        // Incrementar el contador de intentos fallidos
        Cache::put($key, $attempts + 1, now()->addMinutes(15));

        return response()->json([
            'message'  => 'El código de verificación es inválido o ha expirado.',
            'verified' => false,
        ], 422);
    }

    /**
     * Genera y envía un nuevo código de verificación al usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message'  => 'El correo electrónico ya ha sido verificado.',
                'verified' => true,
            ]);
        }

        // Generar código aleatorio de 6 dígitos
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Eliminar códigos anteriores
        VerificationCode::where('user_id', $user->id)->delete();

        // Guardar el nuevo código
        VerificationCode::create([
            'user_id'    => $user->id,
            'code'       => $code,
            'expires_at' => now()->addMinutes(30), // Expira en 30 minutos
        ]);

        // Enviar el código por email
        $user->notify(new VerificationCodeNotification($code));

        return response()->json([
            'message' => 'Se ha enviado un código de verificación a tu dirección de correo electrónico.',
        ]);
    }
}