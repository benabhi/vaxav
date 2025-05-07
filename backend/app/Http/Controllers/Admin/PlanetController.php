<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Planet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanetController extends Controller
{
    /**
     * Display a listing of the planets.
     */
    public function index(Request $request)
    {
        $query = Planet::with(['star', 'star.solarSystem']);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Apply star filter
        if ($request->has('star_id') && !empty($request->star_id)) {
            $query->where('star_id', $request->star_id);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        if ($sortField === 'star') {
            $query->join('stars', 'planets.star_id', '=', 'stars.id')
                ->orderBy('stars.name', $sortDirection)
                ->select('planets.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $planets = $query->paginate($perPage);

        // Ensure the response has the expected structure
        return response()->json([
            'data' => $planets->items(),
            'meta' => [
                'total' => $planets->total(),
                'per_page' => $planets->perPage(),
                'current_page' => $planets->currentPage(),
                'last_page' => $planets->lastPage(),
                'from' => $planets->firstItem(),
                'to' => $planets->lastItem(),
            ],
            'links' => [
                'first' => $planets->url(1),
                'last' => $planets->url($planets->lastPage()),
                'prev' => $planets->previousPageUrl(),
                'next' => $planets->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created planet in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:planets',
            'description' => 'nullable|string',
            'star_id' => 'required|exists:stars,id',
            'type' => 'nullable|string|max:20',
            'orbit_position' => 'required|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $planet = Planet::create($validator->validated());

        return response()->json([
            'message' => 'Planet created successfully',
            'data' => $planet
        ], 201);
    }

    /**
     * Display the specified planet.
     */
    public function show(Planet $planet)
    {
        $planet->load('star', 'star.solarSystem', 'star.solarSystem.constellation');

        return response()->json([
            'data' => $planet
        ]);
    }

    /**
     * Update the specified planet in storage.
     */
    public function update(Request $request, Planet $planet)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:planets,name,' . $planet->id,
            'description' => 'nullable|string',
            'star_id' => 'required|exists:stars,id',
            'type' => 'nullable|string|max:20',
            'orbit_position' => 'required|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $planet->update($validator->validated());

        return response()->json([
            'message' => 'Planet updated successfully',
            'data' => $planet
        ]);
    }

    /**
     * Remove the specified planet from storage.
     */
    public function destroy(Planet $planet)
    {
        $planet->delete();

        return response()->json([
            'message' => 'Planet deleted successfully'
        ]);
    }
}
