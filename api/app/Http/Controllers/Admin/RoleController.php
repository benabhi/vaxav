<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Los middlewares se deben aplicar en las rutas, no en el constructor del controlador
    }

    /**
     * Display a listing of the roles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Role::with('permissions');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $roles = $query->paginate($perPage);

        // Devolver los datos en el formato esperado por el frontend
        return response()->json($roles);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255|unique:roles',
            'description'   => 'nullable|string',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Create role
        $role = Role::create([
            'name'        => $validated['name'],
            'slug'        => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        // Attach permissions if provided
        if (isset($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Display the specified role.
     */
    public function show(string $id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json($role);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Prevent updating superadmin role unless user is superadmin
        if ($role->slug === 'superadmin' && !auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'You cannot modify the superadmin role'], 403);
        }

        $validated = $request->validate([
            'name'          => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
            'description'   => 'nullable|string',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Update role
        $role->update([
            'name'        => $validated['name'],
            'slug'        => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        // Sync permissions if provided
        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return response()->json($role->load('permissions'));
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Prevent deleting default roles
        if (in_array($role->slug, ['superadmin', 'admin', 'moderator', 'user'])) {
            return response()->json(['message' => 'Cannot delete default roles'], 403);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }

    /**
     * Get all available permissions.
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::all();

        return response()->json($permissions);
    }
}
