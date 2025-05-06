<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pilot;
use App\Models\PilotSkill;
use App\Models\Skill;
use App\Models\User;
use App\Services\SkillService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PilotController extends Controller
{
    protected $skillService;

    /**
     * Constructor
     */
    public function __construct(SkillService $skillService)
    {
        $this->skillService = $skillService;
        $this->middleware('permission:pilots.view')->only(['index', 'show', 'getSkills']);
        $this->middleware('permission:pilots.edit')->only(['update', 'updateSkill']);
        $this->middleware('permission:pilots.delete')->only(['destroy']);
    }

    /**
     * Display a listing of the pilots.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pilot::with('user');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('race', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Apply race filter
        if ($request->has('race') && !empty($request->race)) {
            $query->where('race', $request->race);
        }

        // Apply user filter
        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'race', 'credits', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('name', 'asc'); // Default sorting
        }

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $pilots = $query->paginate($perPage);

        return response()->json($pilots);
    }

    /**
     * Display the specified pilot.
     */
    public function show(string $id): JsonResponse
    {
        $pilot = Pilot::with(['user', 'location', 'corporation'])->findOrFail($id);
        return response()->json($pilot);
    }

    /**
     * Update the specified pilot in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'race' => ['required', 'string', Rule::in(['Humano', 'Cyborg', 'Alienígena', 'Sintético'])],
            'credits' => 'required|numeric|min:0',
            'location_id' => 'nullable|exists:solar_systems,id',
            'corporation_id' => 'nullable|exists:corporations,id',
        ]);

        $pilot->update($validated);

        return response()->json($pilot->fresh(['user', 'location', 'corporation']));
    }

    /**
     * Remove the specified pilot from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);

        // Check if pilot has ships
        if ($pilot->ships()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el piloto porque tiene naves asociadas.'
            ], 400);
        }

        // Delete pilot skills
        $pilot->pilotSkills()->delete();

        // Delete pilot
        $pilot->delete();

        return response()->json(['message' => 'Piloto eliminado correctamente']);
    }

    /**
     * Get the skills of a specific pilot.
     */
    public function getSkills(string $id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);

        // Get all skills with their categories and prerequisites
        $skills = Skill::with(['category', 'prerequisites'])->get();

        // Get pilot skills
        $pilotSkills = PilotSkill::where('pilot_id', $pilot->id)->get();

        // Map skills with pilot data
        $skillsWithPilotData = $skills->map(function ($skill) use ($pilotSkills, $pilot) {
            $pilotSkill = $pilotSkills->firstWhere('skill_id', $skill->id);

            return [
                'id' => $skill->id,
                'name' => $skill->name,
                'description' => $skill->description,
                'multiplier' => $skill->multiplier,
                'skill_category_id' => $skill->skill_category_id,
                'category' => $skill->category,
                'prerequisites' => $skill->prerequisites,
                'pilot_skill_id' => $pilotSkill ? $pilotSkill->id : null,
                'current_level' => $pilotSkill ? $pilotSkill->current_level : 0,
                'xp' => $pilotSkill ? $pilotSkill->xp : 0,
                'active' => $pilotSkill ? $pilotSkill->active : false,
                'can_activate' => $this->skillService->canActivateSkill($pilot, $skill)['can_activate'],
                'can_deactivate' => $this->skillService->canDeactivateSkill($pilot, $skill)['can_deactivate'],
            ];
        });

        return response()->json($skillsWithPilotData);
    }

    /**
     * Update a pilot's skill.
     */
    public function updateSkill(Request $request, string $id, string $skillId): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);
        $skill = Skill::with('prerequisites')->findOrFail($skillId);

        $validated = $request->validate([
            'current_level' => 'required|integer|min:0|max:5',
            'active' => 'required|boolean',
        ]);

        // Get current pilot skill
        $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
                                ->where('skill_id', $skill->id)
                                ->first();

        // If skill doesn't exist for pilot, create it
        if (!$pilotSkill) {
            $pilotSkill = new PilotSkill([
                'pilot_id' => $pilot->id,
                'skill_id' => $skill->id,
                'xp' => 0,
                'current_level' => 0,
                'active' => false,
            ]);
        }

        // Check if we're trying to activate the skill
        if ($validated['active'] && !$pilotSkill->active) {
            $activationCheck = $this->skillService->canActivateSkill($pilot, $skill);
            if (!$activationCheck['can_activate']) {
                return response()->json([
                    'message' => 'No se puede activar la habilidad porque no cumple con los prerrequisitos',
                    'missing_prerequisites' => $activationCheck['missing_prerequisites']
                ], 400);
            }
        }

        // Check if we're trying to deactivate the skill
        if (!$validated['active'] && $pilotSkill->active) {
            $deactivationCheck = $this->skillService->canDeactivateSkill($pilot, $skill);
            if (!$deactivationCheck['can_deactivate']) {
                return response()->json([
                    'message' => 'No se puede desactivar la habilidad porque otras habilidades dependen de ella',
                    'dependent_skills' => $deactivationCheck['dependent_skills']
                ], 400);
            }
        }

        // Check if we're trying to reduce the level of a skill that is a prerequisite
        if ($validated['current_level'] < $pilotSkill->current_level) {
            $levelCheck = $this->skillService->canReduceSkillLevel($pilot, $skill, $validated['current_level']);
            if (!$levelCheck['can_reduce']) {
                return response()->json([
                    'message' => 'No se puede reducir el nivel de la habilidad porque otras habilidades dependen de ella',
                    'dependent_skills' => $levelCheck['dependent_skills']
                ], 400);
            }
        }

        // Update the skill
        $pilotSkill->current_level = $validated['current_level'];
        $pilotSkill->active = $validated['active'];

        // Calculate and set the minimum XP required for this level
        if ($validated['current_level'] > 0) {
            $minXp = $this->skillService->getMinXpForLevel($validated['current_level'], $skill->multiplier);

            // Only update XP if it's less than the minimum required
            if ($pilotSkill->xp < $minXp) {
                $pilotSkill->xp = $minXp;
            }
        }

        $pilotSkill->save();

        return response()->json([
            'message' => 'Habilidad actualizada correctamente',
            'skill' => $pilotSkill->fresh(['skill', 'skill.category', 'skill.prerequisites'])
        ]);
    }
}
