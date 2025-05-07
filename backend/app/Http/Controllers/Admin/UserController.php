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
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->has('role') && !empty($request->role)) {
            $role = $request->role;
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('slug', $role);
            });
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'email', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('name', 'asc'); // Default sorting
        }

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        // Agregar información de baneo a cada usuario
        $users->getCollection()->transform(function ($user) {
            $user->is_banned = $user->isBanned();
            if ($user->is_banned) {
                $activeBan = $user->activeBan();
                $user->ban_info = [
                    'id' => $activeBan->id,
                    'reason' => $activeBan->reason,
                    'type' => $activeBan->type,
                    'is_permanent' => $activeBan->isPermanent(),
                    'expires_at' => $activeBan->expires_at ? $activeBan->expires_at->format('Y-m-d H:i:s') : null
                ];
            }
            return $user;
        });

        // Devolver los datos en el formato esperado por el frontend
        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles'    => 'nullable|array',
            'roles.*'  => 'exists:roles,id',
        ]);

        // Create user
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
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

        // Agregar información de baneo
        $user->is_banned = $user->isBanned();
        if ($user->is_banned) {
            $activeBan = $user->activeBan();
            $user->ban_info = [
                'id' => $activeBan->id,
                'reason' => $activeBan->reason,
                'type' => $activeBan->type,
                'is_permanent' => $activeBan->isPermanent(),
                'expires_at' => $activeBan->expires_at ? $activeBan->expires_at->format('Y-m-d H:i:s') : null
            ];
        }

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
            'name'     => 'required|string|max:255',
            'email'    => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles'    => 'nullable|array',
            'roles.*'  => 'exists:roles,id',
        ]);

        // Update user
        $user->update([
            'name'  => $validated['name'],
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
            if (
                $user->isSuperAdmin() &&
                !in_array(Role::where('slug', 'superadmin')->first()->id, $validated['roles']) &&
                User::whereHas('roles', function ($query) {
                    $query->where('slug', 'superadmin');
                })->count() <= 1
            ) {
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
        if (
            $user->isSuperAdmin() &&
            User::whereHas('roles', function ($query) {
                $query->where('slug', 'superadmin');
            })->count() <= 1
        ) {
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
