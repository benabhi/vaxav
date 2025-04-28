<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Los middlewares se deben aplicar en las rutas, no en el constructor del controlador
    }

    /**
     * Display a listing of the users.
     */
    public function index(): JsonResponse
    {
        $users = User::with('roles')->get();

        // Devolver los datos en el formato esperado por el frontend
        return response()->json([
            'data' => $users,
            'total' => $users->count()
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Attach roles if provided
        if (isset($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        } else {
            // Attach default user role
            $userRole = Role::where('slug', 'user')->first();
            if ($userRole) {
                $user->roles()->attach($userRole);
            }
        }

        return response()->json($user->load('roles'), 201);
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent non-superadmins from modifying superadmins
        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'You cannot modify a superadmin user'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        // Update user
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Update password if provided
        if (isset($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        // Sync roles if provided
        if (isset($validated['roles'])) {
            // Prevent removing superadmin role from the only superadmin
            if ($user->isSuperAdmin() &&
                !in_array(Role::where('slug', 'superadmin')->first()->id, $validated['roles']) &&
                User::whereHas('roles', function($query) {
                    $query->where('slug', 'superadmin');
                })->count() <= 1) {
                return response()->json(['message' => 'Cannot remove the only superadmin role'], 403);
            }

            $user->roles()->sync($validated['roles']);
        }

        return response()->json($user->load('roles'));
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting superadmin if it's the only one
        if ($user->isSuperAdmin() &&
            User::whereHas('roles', function($query) {
                $query->where('slug', 'superadmin');
            })->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the only superadmin user'], 403);
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
