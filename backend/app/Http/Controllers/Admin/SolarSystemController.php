<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SolarSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SolarSystemController extends Controller
{
    /**
     * Display a listing of the solar systems.
     */
    public function index(Request $request)
    {
        $query = SolarSystem::with(['constellation', 'constellation.region']);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Apply constellation filter
        if ($request->has('constellation_id') && !empty($request->constellation_id)) {
            $query->where('constellation_id', $request->constellation_id);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        if ($sortField === 'constellation') {
            $query->join('constellations', 'solar_systems.constellation_id', '=', 'constellations.id')
                ->orderBy('constellations.name', $sortDirection)
                ->select('solar_systems.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $solarSystems = $query->withCount('stars')->paginate($perPage);

        // Ensure the response has the expected structure
        return response()->json([
            'data' => $solarSystems->items(),
            'meta' => [
                'total' => $solarSystems->total(),
                'per_page' => $solarSystems->perPage(),
                'current_page' => $solarSystems->currentPage(),
                'last_page' => $solarSystems->lastPage(),
                'from' => $solarSystems->firstItem(),
                'to' => $solarSystems->lastItem(),
            ],
            'links' => [
                'first' => $solarSystems->url(1),
                'last' => $solarSystems->url($solarSystems->lastPage()),
                'prev' => $solarSystems->previousPageUrl(),
                'next' => $solarSystems->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created solar system in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:solar_systems',
            'description' => 'nullable|string',
            'constellation_id' => 'required|exists:constellations,id',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $solarSystem = SolarSystem::create($validator->validated());

        return response()->json([
            'message' => 'Solar system created successfully',
            'data' => $solarSystem
        ], 201);
    }

    /**
     * Display the specified solar system.
     */
    public function show(SolarSystem $solarSystem)
    {
        $solarSystem->load('constellation', 'constellation.region', 'stars');
        $solarSystem->stars_count = $solarSystem->stars->count();

        return response()->json([
            'data' => $solarSystem
        ]);
    }

    /**
     * Update the specified solar system in storage.
     */
    public function update(Request $request, SolarSystem $solarSystem)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:solar_systems,name,' . $solarSystem->id,
            'description' => 'nullable|string',
            'constellation_id' => 'required|exists:constellations,id',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $solarSystem->update($validator->validated());

        return response()->json([
            'message' => 'Solar system updated successfully',
            'data' => $solarSystem
        ]);
    }

    /**
     * Remove the specified solar system from storage.
     */
    public function destroy(SolarSystem $solarSystem)
    {
        $solarSystem->delete();

        return response()->json([
            'message' => 'Solar system deleted successfully'
        ]);
    }

    /**
     * Get all solar systems (without pagination) for dropdowns.
     */
    public function all()
    {
        $solarSystems = SolarSystem::with('constellation')->orderBy('name')->get();

        return response()->json([
            'data' => $solarSystems
        ]);
    }
}
