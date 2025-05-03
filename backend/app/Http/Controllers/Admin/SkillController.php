<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\SkillPrerequisite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SkillController extends Controller
{
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->middleware('permission:skills.view')->only(['index', 'show', 'getSkillsForDropdown']);
        $this->middleware('permission:skills.create')->only(['store']);
        $this->middleware('permission:skills.edit')->only(['update']);
        $this->middleware('permission:skills.delete')->only(['destroy']);
    }
    /**
     * Display a listing of the skills.
     */
    public function index(Request $request): JsonResponse
    {
        // Primero, obtener todas las habilidades para tener disponibles los prerrequisitos
        $allSkills = Skill::select('id', 'name', 'multiplier')->get()->keyBy('id');

        // Construir la consulta principal
        $query = Skill::with(['category']);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply category filter
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('skill_category_id', $request->category_id);
        }

        // Apply multiplier filter
        if ($request->has('multiplier') && !empty($request->multiplier)) {
            // Asegurarse de que el multiplicador sea un entero
            $multiplier = (int) $request->multiplier;
            Log::info('Aplicando filtro de multiplicador:', ['multiplier' => $multiplier, 'original' => $request->multiplier]);
            $query->where('multiplier', $multiplier);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Apply pagination
        $perPage = $request->input('per_page', 10);
        $skills = $query->paginate($perPage);

        // Cargar manualmente los prerrequisitos para cada habilidad
        foreach ($skills as $skill) {
            // Obtener los prerrequisitos de la base de datos
            $prerequisites = DB::table('skills_prerequisites')
                ->where('skill_id', $skill->id)
                ->get();

            // Formatear los prerrequisitos con la información completa
            $formattedPrerequisites = [];
            foreach ($prerequisites as $prereq) {
                if (isset($allSkills[$prereq->prerequisite_id])) {
                    $prerequisiteSkill = $allSkills[$prereq->prerequisite_id];
                    $formattedPrerequisites[] = [
                        'prerequisite_id'    => $prereq->prerequisite_id,
                        'prerequisite_level' => $prereq->prerequisite_level,
                        'prerequisite'       => [
                            'id'         => $prerequisiteSkill->id,
                            'name'       => $prerequisiteSkill->name,
                            'multiplier' => $prerequisiteSkill->multiplier
                        ]
                    ];
                }
            }

            // Asignar los prerrequisitos formateados a la habilidad
            $skill->prerequisites = $formattedPrerequisites;
        }

        return response()->json($skills);
    }

    /**
     * Store a newly created skill in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'skill_category_id'        => 'required|exists:skills_categories,id',
            'name'                     => 'required|string|max:255|unique:skills,name',
            'description'              => 'required|string',
            'multiplier'               => 'required|integer|min:1|max:5',
            'prerequisites'            => 'nullable|array',
            'prerequisites.*.skill_id' => 'required|exists:skills,id',
            'prerequisites.*.level'    => 'required|integer|min:1|max:5',
        ]);

        try {
            DB::beginTransaction();

            // Create the skill
            $skill = Skill::create([
                'skill_category_id' => $validated['skill_category_id'],
                'name'              => $validated['name'],
                'description'       => $validated['description'],
                'multiplier'        => $validated['multiplier'],
            ]);

            // Add prerequisites if any
            if (isset($validated['prerequisites']) && count($validated['prerequisites']) > 0) {
                foreach ($validated['prerequisites'] as $prerequisite) {
                    SkillPrerequisite::create([
                        'skill_id'           => $skill->id,
                        'prerequisite_id'    => $prerequisite['skill_id'],
                        'prerequisite_level' => $prerequisite['level'],
                    ]);
                }
            }

            DB::commit();

            // Load the skill with its relationships
            $skill = Skill::with(['category', 'prerequisites'])->find($skill->id);

            return response()->json($skill, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating skill: ' . $e->getMessage());
            return response()->json(['message' => 'Error al crear la habilidad.'], 500);
        }
    }

    /**
     * Display the specified skill.
     */
    public function show(string $id): JsonResponse
    {
        // Obtener todas las habilidades para tener disponibles los prerrequisitos
        $allSkills = Skill::select('id', 'name', 'multiplier')->get()->keyBy('id');

        // Obtener la habilidad con su categoría
        $skill = Skill::with(['category'])->findOrFail($id);

        // Obtener los prerrequisitos de la base de datos
        $prerequisites = DB::table('skills_prerequisites')
            ->where('skill_id', $skill->id)
            ->get();

        // Formatear los prerrequisitos con la información completa
        $formattedPrerequisites = [];
        foreach ($prerequisites as $prereq) {
            if (isset($allSkills[$prereq->prerequisite_id])) {
                $prerequisiteSkill = $allSkills[$prereq->prerequisite_id];
                $formattedPrerequisites[] = [
                    'prerequisite_id'    => $prereq->prerequisite_id,
                    'prerequisite_level' => $prereq->prerequisite_level,
                    'prerequisite'       => [
                        'id'         => $prerequisiteSkill->id,
                        'name'       => $prerequisiteSkill->name,
                        'multiplier' => $prerequisiteSkill->multiplier
                    ]
                ];
            }
        }

        // Asignar los prerrequisitos formateados a la habilidad
        $skill->prerequisites = $formattedPrerequisites;

        return response()->json($skill);
    }

    /**
     * Update the specified skill in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $skill = Skill::findOrFail($id);

        $validated = $request->validate([
            'skill_category_id'        => 'required|exists:skills_categories,id',
            'name'                     => 'required|string|max:255|unique:skills,name,' . $id,
            'description'              => 'required|string',
            'multiplier'               => 'required|integer|min:1|max:5',
            'prerequisites'            => 'nullable|array',
            'prerequisites.*.skill_id' => 'required|exists:skills,id',
            'prerequisites.*.level'    => 'required|integer|min:1|max:5',
        ]);

        try {
            DB::beginTransaction();

            // Update the skill
            $skill->update([
                'skill_category_id' => $validated['skill_category_id'],
                'name'              => $validated['name'],
                'description'       => $validated['description'],
                'multiplier'        => $validated['multiplier'],
            ]);

            // Remove existing prerequisites
            SkillPrerequisite::where('skill_id', $skill->id)->delete();

            // Add new prerequisites if any
            if (isset($validated['prerequisites']) && count($validated['prerequisites']) > 0) {
                foreach ($validated['prerequisites'] as $prerequisite) {
                    // Avoid self-reference
                    if ($prerequisite['skill_id'] != $skill->id) {
                        SkillPrerequisite::create([
                            'skill_id'           => $skill->id,
                            'prerequisite_id'    => $prerequisite['skill_id'],
                            'prerequisite_level' => $prerequisite['level'],
                        ]);
                    }
                }
            }

            DB::commit();

            // Load the skill with its relationships
            $skill = Skill::with(['category', 'prerequisites'])->find($skill->id);

            return response()->json($skill);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating skill: ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar la habilidad.'], 500);
        }
    }

    /**
     * Remove the specified skill from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $skill = Skill::findOrFail($id);

        // Check if the skill is a prerequisite for other skills
        $isPrerequisite = SkillPrerequisite::where('prerequisite_id', $skill->id)->exists();
        if ($isPrerequisite) {
            return response()->json([
                'message' => 'No se puede eliminar la habilidad porque es un prerrequisito para otras habilidades.'
            ], 400);
        }

        // Check if the skill is assigned to any pilots
        if ($skill->pilots()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la habilidad porque está asignada a pilotos.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Remove prerequisites
            SkillPrerequisite::where('skill_id', $skill->id)->delete();

            // Delete the skill
            $skill->delete();

            DB::commit();

            return response()->json([
                'message' => 'Habilidad eliminada correctamente.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting skill: ' . $e->getMessage());
            return response()->json(['message' => 'Error al eliminar la habilidad.'], 500);
        }
    }

    /**
     * Get all skills for dropdown lists.
     */
    public function getSkillsForDropdown(): JsonResponse
    {
        $skills = Skill::select('id', 'name', 'multiplier')->orderBy('name')->get();
        return response()->json($skills);
    }
}
