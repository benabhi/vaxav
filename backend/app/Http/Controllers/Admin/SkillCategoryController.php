<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SkillCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SkillCategoryController extends Controller
{
    /**
     * Display a listing of the skill categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SkillCategory::query();

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $categories = $query->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Store a newly created skill category in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills_categories,name',
            'description' => 'required|string',
        ]);

        $category = SkillCategory::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Display the specified skill category.
     */
    public function show(string $id): JsonResponse
    {
        $category = SkillCategory::with('skills')->findOrFail($id);
        return response()->json($category);
    }

    /**
     * Update the specified skill category in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = SkillCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills_categories,name,' . $id,
            'description' => 'required|string',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    /**
     * Remove the specified skill category from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = SkillCategory::findOrFail($id);

        // Check if the category has skills
        if ($category->skills()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque tiene habilidades asociadas.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Categoría eliminada correctamente.'
        ]);
    }
}
