<?php

namespace App\Http\Controllers;

use App\Services\SkillService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillConfigController extends Controller
{
    protected $skillService;

    /**
     * Constructor
     */
    public function __construct(SkillService $skillService)
    {
        $this->skillService = $skillService;
    }

    /**
     * Get XP requirements for each skill level
     */
    public function getXpRequirements(): JsonResponse
    {
        $xpRequirements = $this->skillService->getXpRequirements();
        return response()->json($xpRequirements);
    }

    /**
     * Calculate progression index based on provided stats
     */
    public function calculateProgressionIndex(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'totalSkills' => 'required|integer',
            'learnedSkills' => 'required|integer',
            'activeSkills' => 'required|integer',
            'totalXP' => 'required|integer',
            'skillsByLevel' => 'required|array',
            'multiplierStats' => 'required|array',
        ]);

        $result = $this->skillService->calculateProgressionIndex($validated);
        return response()->json($result);
    }
}
