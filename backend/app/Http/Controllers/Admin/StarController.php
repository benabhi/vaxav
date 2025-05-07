<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Star;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StarController extends Controller
{
    /**
     * Display a listing of the stars.
     */
    public function index(Request $request)
    {
        $query = Star::with(['solarSystem', 'solarSystem.constellation']);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Apply solar system filter
        if ($request->has('solar_system_id') && !empty($request->solar_system_id)) {
            $query->where('solar_system_id', $request->solar_system_id);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        if ($sortField === 'solar_system') {
            $query->join('solar_systems', 'stars.solar_system_id', '=', 'solar_systems.id')
                ->orderBy('solar_systems.name', $sortDirection)
                ->select('stars.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $stars = $query->withCount('planets')->paginate($perPage);

        // Ensure the response has the expected structure
        return response()->json([
            'data' => $stars->items(),
            'meta' => [
                'total' => $stars->total(),
                'per_page' => $stars->perPage(),
                'current_page' => $stars->currentPage(),
                'last_page' => $stars->lastPage(),
                'from' => $stars->firstItem(),
                'to' => $stars->lastItem(),
            ],
            'links' => [
                'first' => $stars->url(1),
                'last' => $stars->url($stars->lastPage()),
                'prev' => $stars->previousPageUrl(),
                'next' => $stars->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created star in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:stars',
            'description' => 'nullable|string',
            'solar_system_id' => 'required|exists:solar_systems,id',
            'type' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $star = Star::create($validator->validated());

        return response()->json([
            'message' => 'Star created successfully',
            'data' => $star
        ], 201);
    }

    /**
     * Display the specified star.
     */
    public function show(Star $star)
    {
        $star->load('solarSystem', 'solarSystem.constellation', 'planets');
        $star->planets_count = $star->planets->count();

        return response()->json([
            'data' => $star
        ]);
    }

    /**
     * Update the specified star in storage.
     */
    public function update(Request $request, Star $star)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:stars,name,' . $star->id,
            'description' => 'nullable|string',
            'solar_system_id' => 'required|exists:solar_systems,id',
            'type' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $star->update($validator->validated());

        return response()->json([
            'message' => 'Star updated successfully',
            'data' => $star
        ]);
    }

    /**
     * Remove the specified star from storage.
     */
    public function destroy(Star $star)
    {
        $star->delete();

        return response()->json([
            'message' => 'Star deleted successfully'
        ]);
    }

    /**
     * Get all stars (without pagination) for dropdowns.
     */
    public function all()
    {
        $stars = Star::with('solarSystem')->orderBy('name')->get();

        return response()->json([
            'data' => $stars
        ]);
    }
}
