<?php

namespace App\Http\Controllers;

use App\Models\Pilot;
use App\Models\PilotSkill;
use App\Models\Skill;
use App\Models\SkillCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PilotSkillController extends Controller
{
    /**
     * Get the skills of the current pilot.
     */
    public function getCurrentPilotSkills(Request $request): JsonResponse
    {
        $user = $request->user();
        $pilot = $user->pilot;

        if (!$pilot) {
            return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
        }

        $query = $pilot->skills()->with('category');

        // Filtrar por estado de activación si se proporciona
        if ($request->has('active')) {
            $active = $request->input('active');
            $query->wherePivot('active', $active);
        }

        $skills = $query->get();
        return response()->json($skills);
    }

    /**
     * Get the skills of a specific pilot.
     */
    public function getPilotSkills(string $pilotId): JsonResponse
    {
        $pilot = Pilot::findOrFail($pilotId);

        // Check if the user is authorized to view this pilot's skills
        $this->authorize('view', $pilot);

        $skills = $pilot->skills()->with('category')->get();
        return response()->json($skills);
    }

    /**
     * Get all available skills.
     */
    public function getAllSkills(): JsonResponse
    {
        $skills = Skill::with('category')->get();
        return response()->json($skills);
    }

    /**
     * Get all skill categories.
     */
    public function getSkillCategories(): JsonResponse
    {
        $categories = SkillCategory::all();
        return response()->json($categories);
    }

    /**
     * Get skills by category.
     */
    public function getSkillsByCategory(string $categoryId): JsonResponse
    {
        $skills = Skill::where('skill_category_id', $categoryId)->get();
        return response()->json($skills);
    }

    /**
     * Get skill details with prerequisites.
     */
    public function getSkillDetails(string $skillId): JsonResponse
    {
        $skill = Skill::with(['category', 'prerequisites', 'prerequisites.prerequisite'])->findOrFail($skillId);
        return response()->json($skill);
    }

    /**
     * Activate a skill for the current pilot.
     */
    public function activateSkill(Request $request, string $skillId): JsonResponse
    {
        $user = $request->user();
        $pilot = $user->pilot;

        if (!$pilot) {
            return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
        }

        // Check if the pilot has this skill
        $pilotSkill = $pilot->skills()->where('skill_id', $skillId)->first();
        if (!$pilotSkill) {
            return response()->json(['message' => 'El piloto no tiene esta habilidad'], 404);
        }

        // Update the skill to active
        $pilot->skills()->updateExistingPivot($skillId, ['active' => true]);

        return response()->json(['message' => 'Habilidad activada correctamente']);
    }

    /**
     * Deactivate a skill for the current pilot.
     */
    public function deactivateSkill(Request $request, string $skillId): JsonResponse
    {
        $user = $request->user();
        $pilot = $user->pilot;

        if (!$pilot) {
            return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
        }

        // Check if the pilot has this skill
        $pilotSkill = $pilot->skills()->where('skill_id', $skillId)->first();
        if (!$pilotSkill) {
            return response()->json(['message' => 'El piloto no tiene esta habilidad'], 404);
        }

        // Update the skill to inactive
        $pilot->skills()->updateExistingPivot($skillId, ['active' => false]);

        return response()->json(['message' => 'Habilidad desactivada correctamente']);
    }
}
