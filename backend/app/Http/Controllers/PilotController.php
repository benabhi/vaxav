<?php

namespace App\Http\Controllers;

use App\Models\Pilot;
use App\Models\SolarSystem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class PilotController extends Controller
{
    /**
     * Get the current user's pilot.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $pilot = $user->pilot;

        if (!$pilot) {
            return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
        }

        return response()->json($pilot);
    }

    /**
     * Store a newly created pilot in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user already has a pilot
        if ($user->pilot) {
            return response()->json(['message' => 'El usuario ya tiene un piloto'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'race' => 'required|string|in:Humano,Cyborg,Alienígena,Sintético',
        ]);

        // Get a default starting location (first solar system)
        $locationId = SolarSystem::first()?->id;

        // Create the pilot
        $pilot = Pilot::create([
            'name'        => $validated['name'],
            'race'        => $validated['race'],
            'user_id'     => $user->id,
            'credits'     => 10000, // Starting credits
            'location_id' => $locationId,
        ]);

        // Initialize pilot skills (all skills at level 0)
        $skills = \App\Models\Skill::all();
        foreach ($skills as $skill) {
            \App\Models\PilotSkill::create([
                'pilot_id'      => $pilot->id,
                'skill_id'      => $skill->id,
                'xp'            => 0,
                'current_level' => 0,
                'active'        => false,
            ]);
        }

        return response()->json($pilot, 201);
    }

    /**
     * Display the specified pilot.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);

        // Check if the user is authorized to view this pilot
        $this->authorize('view', $pilot);

        return response()->json($pilot);
    }

    /**
     * Update the specified pilot in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $pilot = Pilot::findOrFail($id);

        // Check if the user is authorized to update this pilot
        $this->authorize('update', $pilot);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'race' => 'sometimes|required|string|in:Humano,Cyborg,Alienígena,Sintético',
        ]);

        $pilot->update($validated);

        return response()->json($pilot);
    }
}
