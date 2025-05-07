<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegionController extends Controller
{
    /**
     * Display a listing of the regions.
     */
    public function index(Request $request)
    {
        $query = Region::query();

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $regions = $query->withCount('constellations')->paginate($perPage);

        // Ensure the response has the expected structure
        return response()->json([
            'data' => $regions->items(),
            'meta' => [
                'total' => $regions->total(),
                'per_page' => $regions->perPage(),
                'current_page' => $regions->currentPage(),
                'last_page' => $regions->lastPage(),
                'from' => $regions->firstItem(),
                'to' => $regions->lastItem(),
            ],
            'links' => [
                'first' => $regions->url(1),
                'last' => $regions->url($regions->lastPage()),
                'prev' => $regions->previousPageUrl(),
                'next' => $regions->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created region in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:regions',
            'description' => 'nullable|string',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $region = Region::create($validator->validated());

        return response()->json([
            'message' => 'Region created successfully',
            'data' => $region
        ], 201);
    }

    /**
     * Display the specified region.
     */
    public function show(Region $region)
    {
        $region->load('constellations');
        $region->constellations_count = $region->constellations->count();

        return response()->json([
            'data' => $region
        ]);
    }

    /**
     * Update the specified region in storage.
     */
    public function update(Request $request, Region $region)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:regions,name,' . $region->id,
            'description' => 'nullable|string',
            'x_coord' => 'required|numeric',
            'y_coord' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $region->update($validator->validated());

        return response()->json([
            'message' => 'Region updated successfully',
            'data' => $region
        ]);
    }

    /**
     * Remove the specified region from storage.
     */
    public function destroy(Region $region)
    {
        $region->delete();

        return response()->json([
            'message' => 'Region deleted successfully'
        ]);
    }

    /**
     * Get all regions (without pagination) for dropdowns.
     */
    public function all()
    {
        $regions = Region::orderBy('name')->get();

        return response()->json([
            'data' => $regions
        ]);
    }
}
