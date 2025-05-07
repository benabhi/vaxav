<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ], [
                'email.required'    => 'Por favor, ingresa tu dirección de correo electrónico.',
                'email.email'       => 'Por favor, ingresa una dirección de correo electrónico válida.',
                'password.required' => 'Por favor, ingresa tu contraseña.',
            ]);

            // Verificar si el usuario existe
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['El usuario con este correo electrónico no existe.'],
                ]);
            }

            // Intentar autenticar
            if (Auth::attempt($request->only('email', 'password'))) {
                // Obtenemos el usuario con sus roles
                $user = Auth::user();

                // Verificar si el usuario está baneado
                if ($user->isBanned()) {
                    $activeBan = $user->activeBan();

                    // Cerrar la sesión
                    Auth::logout();

                    // Preparar la respuesta con información del baneo
                    $banInfo = [
                        'reason' => $activeBan->reason,
                        'type' => $activeBan->type,
                        'is_permanent' => $activeBan->isPermanent(),
                    ];

                    // Agregar fecha de expiración si es un baneo temporal
                    if ($activeBan->isTemporary() && $activeBan->expires_at) {
                        $banInfo['expires_at'] = $activeBan->expires_at->format('Y-m-d H:i:s');
                    }

                    return response()->json([
                        'message' => 'Tu cuenta ha sido suspendida.',
                        'banned' => true,
                        'ban_info' => $banInfo
                    ], 403);
                }

                // Generamos un token para el usuario
                $token = $user->createToken('auth-token')->plainTextToken;

                $user->load('roles');

                // Agregamos información de roles para el frontend
                $userData = $user->toArray();
                $userData['is_superadmin'] = $user->isSuperAdmin();
                $userData['is_admin'] = $user->isAdmin();
                $userData['is_moderator'] = $user->isModerator();

                return response()->json([
                    'user'  => $userData,
                    'token' => $token
                ]);
            }

            // Si llegamos aquí, el usuario existe pero la contraseña es incorrecta
            throw ValidationException::withMessages([
                'password' => ['La contraseña ingresada es incorrecta.'],
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            // Capturar cualquier otra excepción y proporcionar un mensaje amigable
            return response()->json([
                'message' => 'Ha ocurrido un error al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'               => 'required|string|min:3|max:12|regex:/^[a-zA-Z0-9]+$/',
            'email'              => 'required|string|email|max:255|unique:users',
            'email_confirmation' => 'required|string|same:email',
            'password'           => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ],
        ], [
            'name.required'               => 'El nombre es obligatorio',
            'name.min'                    => 'El nombre debe tener al menos 3 caracteres',
            'name.max'                    => 'El nombre no puede tener más de 12 caracteres',
            'name.regex'                  => 'El nombre solo puede contener letras y números',
            'email.required'              => 'El email es obligatorio',
            'email.email'                 => 'El email debe tener un formato válido',
            'email.unique'                => 'Este email ya está en uso',
            'email_confirmation.required' => 'La confirmación de email es obligatoria',
            'email_confirmation.same'     => 'Los emails no coinciden',
            'password.required'           => 'La contraseña es obligatoria',
            'password.min'                => 'La contraseña debe tener al menos 8 caracteres',
            'password.regex'              => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
            'password.confirmed'          => 'Las contraseñas no coinciden',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Asignar rol de usuario por defecto
        $userRole = Role::where('slug', 'user')->first();
        if ($userRole) {
            $user->roles()->attach($userRole);
        }

        // Disparar evento Registered para enviar email de verificación
        event(new Registered($user));

        Auth::login($user);

        // Generamos un token para el usuario
        $token = $user->createToken('auth-token')->plainTextToken;

        // Cargamos los roles
        $user->load('roles');

        // Agregamos información de roles para el frontend
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json([
            'user'  => $userData,
            'token' => $token
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        // Revocamos todos los tokens del usuario
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    /**
     * Obtener el usuario autenticado
     */
    public function user(Request $request)
    {
        // Devolvemos el usuario autenticado con sus roles
        $user = $request->user();

        // Verificar si el usuario está baneado
        if ($user->isBanned()) {
            $activeBan = $user->activeBan();

            // Preparar la respuesta con información del baneo
            $banInfo = [
                'reason' => $activeBan->reason,
                'type' => $activeBan->type,
                'is_permanent' => $activeBan->isPermanent(),
            ];

            // Agregar fecha de expiración si es un baneo temporal
            if ($activeBan->isTemporary() && $activeBan->expires_at) {
                $banInfo['expires_at'] = $activeBan->expires_at->format('Y-m-d H:i:s');
            }

            return response()->json([
                'message' => 'Tu cuenta ha sido suspendida.',
                'banned' => true,
                'ban_info' => $banInfo
            ], 403);
        }

        $user->load('roles');

        // Agregamos información de roles para el frontend
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json($userData);
    }
}
