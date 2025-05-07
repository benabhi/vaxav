<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BannedUser;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BannedUserController extends Controller
{
    /**
     * Display a listing of banned users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BannedUser::with(['user', 'bannedBy'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->has('status') && !empty($request->status)) {
            if ($request->status === 'active') {
                $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->where('type', 'permanent')
                            ->orWhere(function ($q2) {
                                $q2->where('type', 'temporary')
                                    ->where(function ($q3) {
                                        $q3->whereNull('expires_at')
                                            ->orWhere('expires_at', '>', now());
                                    });
                            });
                    });
            } elseif ($request->status === 'expired') {
                $query->where('type', 'temporary')
                    ->where('expires_at', '<=', now());
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Apply type filter
        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $bannedUsers = $query->paginate($perPage);

        return response()->json($bannedUsers);
    }

    /**
     * Store a newly created banned user record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'type' => ['required', Rule::in(['permanent', 'temporary'])],
            'expires_at' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ]);

        // Check if the user exists
        $user = User::findOrFail($validated['user_id']);

        // Prevent banning superadmins
        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'No se puede banear a un superadministrador'], 403);
        }

        // Prevent banning yourself
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'No puedes banearte a ti mismo'], 403);
        }

        // Set expires_at to null for permanent bans
        if ($validated['type'] === 'permanent') {
            $validated['expires_at'] = null;
        } elseif (!isset($validated['expires_at'])) {
            return response()->json(['message' => 'La fecha de expiración es requerida para baneos temporales'], 422);
        }

        // Set the admin who banned the user
        $validated['banned_by'] = Auth::id();

        // Set is_active to true by default if not provided
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        // Create the ban
        $bannedUser = BannedUser::create($validated);

        return response()->json($bannedUser->load(['user', 'bannedBy']), 201);
    }

    /**
     * Display the specified banned user.
     */
    public function show(string $id): JsonResponse
    {
        $bannedUser = BannedUser::with(['user', 'bannedBy'])->findOrFail($id);

        return response()->json($bannedUser);
    }

    /**
     * Update the specified banned user record.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $bannedUser = BannedUser::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'string|max:255',
            'notes' => 'nullable|string',
            'type' => [Rule::in(['permanent', 'temporary'])],
            'expires_at' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ]);

        // Set expires_at to null for permanent bans
        if (isset($validated['type']) && $validated['type'] === 'permanent') {
            $validated['expires_at'] = null;
        } elseif (isset($validated['type']) && $validated['type'] === 'temporary' && !isset($validated['expires_at']) && !$bannedUser->expires_at) {
            return response()->json(['message' => 'La fecha de expiración es requerida para baneos temporales'], 422);
        }

        // Update the ban
        $bannedUser->update($validated);

        return response()->json($bannedUser->load(['user', 'bannedBy']));
    }

    /**
     * Remove the specified banned user record.
     */
    public function destroy(string $id): JsonResponse
    {
        $bannedUser = BannedUser::findOrFail($id);
        $bannedUser->delete();

        return response()->json(['message' => 'Registro de baneo eliminado correctamente']);
    }

    /**
     * Lift a ban (set is_active to false).
     */
    public function lift(string $id): JsonResponse
    {
        $bannedUser = BannedUser::findOrFail($id);
        $bannedUser->update(['is_active' => false]);

        return response()->json(['message' => 'Baneo levantado correctamente']);
    }

    /**
     * Get all bans for a specific user.
     */
    public function userBans(string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $bans = $user->bans()->with('bannedBy')->orderBy('created_at', 'desc')->get();

        return response()->json($bans);
    }

    /**
     * Check if a user is currently banned.
     */
    public function checkBan(string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $activeBan = $user->activeBan();

        if ($activeBan) {
            return response()->json([
                'banned' => true,
                'ban' => $activeBan->load('bannedBy')
            ]);
        }

        return response()->json([
            'banned' => false
        ]);
    }
}
