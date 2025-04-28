<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// Ruta temporal para verificar roles
Route::get('/debug/user-roles', function() {
    $user = \App\Models\User::where('email', 'test@example.com')->first();
    if (!$user) {
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    return response()->json([
        'user' => $user->name,
        'email' => $user->email,
        'roles' => $user->roles()->get(['id', 'name', 'slug']),
        'has_role_superadmin' => $user->hasRole('superadmin'),
        'has_role_admin' => $user->hasRole('admin'),
        'has_role_moderator' => $user->hasRole('moderator'),
        'is_superadmin_method' => $user->isSuperAdmin(),
        'is_admin_method' => $user->isAdmin(),
        'is_moderator_method' => $user->isModerator(),
    ]);
});

// Pilot routes
Route::prefix('pilots')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'Pilots API endpoint']);
    });
});

// Universe routes
Route::prefix('universe')->group(function () {
    // Regions
    Route::get('/regions', function () {
        return response()->json(['message' => 'Regions API endpoint']);
    });

    // Constellations
    Route::get('/constellations', function () {
        return response()->json(['message' => 'Constellations API endpoint']);
    });

    // Solar Systems
    Route::get('/systems', function () {
        return response()->json(['message' => 'Solar Systems API endpoint']);
    });
});

// Ships routes
Route::prefix('ships')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'Ships API endpoint']);
    });
});

// Market routes
Route::prefix('market')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'Market API endpoint']);
    });
});

// Corporations routes
Route::prefix('corporations')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'Corporations API endpoint']);
    });
});

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Users management
    Route::apiResource('users', UserController::class)->middleware([
        'permission:users.view',     // Para index y show
        'permission:users.create',   // Para store
        'permission:users.edit',     // Para update
        'permission:users.delete'    // Para destroy
    ]);

    // Roles management
    Route::apiResource('roles', RoleController::class)->middleware([
        'permission:roles.view',     // Para index y show
        'permission:roles.create',   // Para store
        'permission:roles.edit',     // Para update
        'permission:roles.delete'    // Para destroy
    ]);
    Route::get('permissions', [RoleController::class, 'permissions'])->middleware('permission:roles.view');
});
