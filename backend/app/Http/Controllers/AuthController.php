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
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            // Generamos un token para el usuario
            $token = $request->user()->createToken('auth-token')->plainTextToken;

            // Obtenemos el usuario con sus roles
            $user = Auth::user();
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

        throw ValidationException::withMessages([
            'email' => ['Las credenciales proporcionadas son incorrectas.'],
        ]);
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
        $user->load('roles');

        // Agregamos información de roles para el frontend
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json($userData);
    }
}
