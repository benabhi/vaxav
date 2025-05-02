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
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
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
