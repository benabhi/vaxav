<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->middleware('permission:settings.view')->only(['index', 'show']);
        $this->middleware('permission:settings.edit')->only(['update', 'store']);
    }

    /**
     * Display a listing of the settings.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all();
        return response()->json($settings);
    }

    /**
     * Store a newly created setting in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:settings',
            'value' => 'required|string',
            'type' => 'required|string|in:string,int,integer,float,double,bool,boolean,json,array,object',
            'description' => 'nullable|string',
        ]);

        try {
            $setting = Setting::create($validated);
            return response()->json($setting, 201);
        } catch (\Exception $e) {
            Log::error('Error creating setting: ' . $e->getMessage());
            return response()->json(['message' => 'Error creating setting'], 500);
        }
    }

    /**
     * Display the specified setting.
     */
    public function show(string $id): JsonResponse
    {
        $setting = Setting::findOrFail($id);
        return response()->json($setting);
    }

    /**
     * Update the specified setting in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $setting = Setting::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:settings,name,' . $id,
            'value' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:string,int,integer,float,double,bool,boolean,json,array,object',
            'description' => 'nullable|string',
        ]);

        try {
            $setting->update($validated);
            return response()->json($setting);
        } catch (\Exception $e) {
            Log::error('Error updating setting: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating setting'], 500);
        }
    }

    /**
     * Remove the specified setting from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $setting = Setting::findOrFail($id);
        $setting->delete();
        return response()->json(['message' => 'Setting deleted successfully']);
    }

    /**
     * Get a setting by name.
     */
    public function getByName(string $name): JsonResponse
    {
        $setting = Setting::where('name', $name)->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json($setting);
    }

    /**
     * Update a setting by name.
     */
    public function updateByName(Request $request, string $name): JsonResponse
    {
        $setting = Setting::where('name', $name)->first();

        if (!$setting) {
            // If setting doesn't exist, create it
            $validator = Validator::make($request->all(), [
                'value' => 'required|string',
                'type' => 'required|string|in:string,int,integer,float,double,bool,boolean,json,array,object',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $setting = Setting::create([
                'name' => $name,
                'value' => $request->value,
                'type' => $request->type,
                'description' => $request->description,
            ]);

            return response()->json($setting, 201);
        }

        // If setting exists, update it
        $validator = Validator::make($request->all(), [
            'value' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:string,int,integer,float,double,bool,boolean,json,array,object',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $setting->update($request->all());

        return response()->json($setting);
    }
}
