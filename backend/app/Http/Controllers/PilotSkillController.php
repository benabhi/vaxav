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

        $skills = $pilot->skills()->with('category')->get();
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
}
