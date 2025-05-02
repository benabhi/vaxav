<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class VerifyEmailController extends Controller
{
    /**
     * Muestra la página de aviso de verificación de email.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function notice(): JsonResponse
    {
        return response()->json([
            'message'  => 'Por favor, verifica tu dirección de correo electrónico.',
            'verified' => auth()->user()->hasVerifiedEmail(),
        ]);
    }

    /**
     * Marca el email del usuario autenticado como verificado.
     *
     * @param  \Illuminate\Foundation\Auth\EmailVerificationRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request, $id, $hash): JsonResponse
    {
        // Buscar el usuario por ID
        $user = \App\Models\User::find($id);

        if (!$user) {
            return response()->json([
                'message'  => 'Usuario no encontrado.',
                'verified' => false,
            ], 404);
        }

        // Verificar si el email ya está verificado
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message'  => 'El correo electrónico ya ha sido verificado.',
                'verified' => true,
            ]);
        }

        try {
            // Verificar el hash
            $verifyUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                [
                    'id'   => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );

            $actualHash = sha1($user->getEmailForVerification());

            if ($hash !== $actualHash) {
                Log::error('Hash de verificación inválido', [
                    'user_id'       => $user->id,
                    'email'         => $user->email,
                    'expected_hash' => $actualHash,
                    'received_hash' => $hash,
                ]);

                return response()->json([
                    'message'  => 'El enlace de verificación es inválido.',
                    'verified' => false,
                ], 403);
            }

            // Verificar directamente el email
            $user->email_verified_at = now();
            $user->save();

            // Disparar el evento de verificación
            event(new Verified($user));

            // Verificar que se haya guardado correctamente
            $user->refresh();

            Log::info('Email verificado correctamente', [
                'user_id'           => $user->id,
                'email'             => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'is_verified'       => $user->hasVerifiedEmail(),
            ]);

            return response()->json([
                'message'  => 'Correo electrónico verificado correctamente.',
                'verified' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al verificar email', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message'  => 'Error al verificar el correo electrónico.',
                'verified' => false,
            ], 500);
        }
    }

    /**
     * Reenvía el email de verificación.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message'  => 'El correo electrónico ya ha sido verificado.',
                'verified' => true,
            ]);
        }

        // Enviar el email de verificación
        $request->user()->sendEmailVerificationNotification();

        // Generar un nuevo código de verificación (esto ocurre automáticamente en el AppServiceProvider)
        // No necesitamos hacer nada más aquí, ya que el código se genera al enviar el email

        return response()->json([
            'message' => 'Se ha enviado un nuevo correo de verificación a tu dirección de email. Contiene tanto un enlace como un código de verificación.',
        ]);
    }



}