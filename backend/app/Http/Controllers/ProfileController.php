<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $user->load('roles');

        // Add role helper properties
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json($userData);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ],
        ], [
            'name.required'      => 'El nombre es obligatorio',
            'name.max'           => 'El nombre no puede tener más de 255 caracteres',
            'email.required'     => 'El email es obligatorio',
            'email.email'        => 'El email debe tener un formato válido',
            'email.unique'       => 'Este email ya está en uso',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres',
            'password.regex'     => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
            'password.confirmed' => 'Las contraseñas no coinciden',
        ]);

        // Update user data
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Update password if provided
        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Reload user with roles
        $user->load('roles');

        // Add role helper properties
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user'    => $userData
        ]);
    }
}
