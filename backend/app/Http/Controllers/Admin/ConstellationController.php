<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Constellation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConstellationController extends Controller
{
    /**
     * Display a listing of the constellations.
     */
    public function index(Request $request)
    {
        $query = Constellation::with('region');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Apply region filter
        if ($request->has('region_id') && !empty($request->region_id)) {
            $query->where('region_id', $request->region_id);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        if ($sortField === 'region') {
            $query->join('regions', 'constellations.region_id', '=', 'regions.id')
                ->orderBy('regions.name', $sortDirection)
                ->select('constellations.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $constellations = $query->withCount('solarSystems')->paginate($perPage);

        // Ensure the response has the expected structure
        return response()->json([
            'data' => $constellations->items(),
            'meta' => [
                'total' => $constellations->total(),
                'per_page' => $constellations->perPage(),
                'current_page' => $constellations->currentPage(),
                'last_page' => $constellations->lastPage(),
                'from' => $constellations->firstItem(),
                'to' => $constellations->lastItem(),
            ],
            'links' => [
                'first' => $constellations->url(1),
                'last' => $constellations->url($constellations->lastPage()),
                'prev' => $constellations->previousPageUrl(),
                'next' => $constellations->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created constellation in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:constellations',
            'description' => 'nullable|string',
            'region_id' => 'required|exists:regions,id',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $constellation = Constellation::create($validator->validated());

        return response()->json([
            'message' => 'Constellation created successfully',
            'data' => $constellation
        ], 201);
    }

    /**
     * Display the specified constellation.
     */
    public function show(Constellation $constellation)
    {
        $constellation->load('region', 'solarSystems');
        $constellation->solar_systems_count = $constellation->solarSystems->count();

        return response()->json([
            'data' => $constellation
        ]);
    }

    /**
     * Update the specified constellation in storage.
     */
    public function update(Request $request, Constellation $constellation)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:constellations,name,' . $constellation->id,
            'description' => 'nullable|string',
            'region_id' => 'required|exists:regions,id',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $constellation->update($validator->validated());

        return response()->json([
            'message' => 'Constellation updated successfully',
            'data' => $constellation
        ]);
    }

    /**
     * Remove the specified constellation from storage.
     */
    public function destroy(Constellation $constellation)
    {
        $constellation->delete();

        return response()->json([
            'message' => 'Constellation deleted successfully'
        ]);
    }

    /**
     * Get all constellations (without pagination) for dropdowns.
     */
    public function all()
    {
        $constellations = Constellation::with('region')->orderBy('name')->get();

        return response()->json([
            'data' => $constellations
        ]);
    }
}
