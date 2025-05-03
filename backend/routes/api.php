<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VerifyEmailController;
use App\Http\Controllers\VerifyEmailWithCodeController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\SkillCategoryController;
use App\Http\Controllers\PilotSkillController;

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

// Ruta directa para verificación manual (solo para desarrollo)
// Ruta de verificación manual eliminada

// Rutas de autenticación
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::delete('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

    // Rutas de restablecimiento de contraseña
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])
        ->middleware(['guest', 'throttle:6,1'])
        ->name('password.email');

    Route::post('/reset-password', [PasswordResetController::class, 'reset'])
        ->middleware(['guest'])
        ->name('password.update');

    // Rutas de verificación de email
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
            ->name('verification.verify');

        Route::post('/email/verification-notification', [VerifyEmailController::class, 'resend'])
            ->middleware(['throttle:6,1'])
            ->name('verification.send');

        Route::get('/email/verify', [VerifyEmailController::class, 'notice'])
            ->name('verification.notice');

        Route::post('/email/verify-code', [VerifyEmailWithCodeController::class, 'verify'])
            ->middleware(['throttle:6,1'])
            ->name('verification.code');

        Route::post('/email/generate-code', [VerifyEmailWithCodeController::class, 'generateCode'])
            ->middleware(['throttle:3,1'])
            ->name('verification.generate-code');


    });

    // Rutas de perfil
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
        Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    });
});

// Ruta temporal para verificar roles
Route::get('/debug/user-roles', function () {
    $user = \App\Models\User::where('email', 'test@example.com')->first();
    if (!$user) {
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    return response()->json([
        'user'          => $user->only(['id', 'name', 'email']),
        'roles'         => $user->roles,
        'is_superadmin' => $user->isSuperAdmin(),
        'is_admin'      => $user->isAdmin(),
        'is_moderator'  => $user->isModerator(),
    ]);
});

// Rutas de administración
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|superadmin'])->group(function () {
    // Rutas de roles
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);

    // Rutas de usuarios
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/roles', [UserController::class, 'syncRoles']);

    // Rutas de categorías de habilidades
    Route::apiResource('skill-categories', SkillCategoryController::class);

    // Rutas de habilidades
    Route::apiResource('skills', SkillController::class);
    Route::get('/skills-dropdown', [SkillController::class, 'getSkillsForDropdown']);
});

// Rutas de universo
Route::prefix('universe')->middleware(['auth:sanctum'])->group(function () {
    // Aquí irán las rutas relacionadas con el universo
});

// Rutas de mercado
Route::prefix('market')->middleware(['auth:sanctum'])->group(function () {
    // Aquí irán las rutas relacionadas con el mercado
});

// Rutas de pilotos
Route::prefix('pilots')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/current', [App\Http\Controllers\PilotController::class, 'current']);
    Route::post('/', [App\Http\Controllers\PilotController::class, 'store']);
    Route::get('/{id}', [App\Http\Controllers\PilotController::class, 'show']);
    Route::put('/{id}', [App\Http\Controllers\PilotController::class, 'update']);

    // Rutas de habilidades de pilotos
    Route::get('/current/skills', [PilotSkillController::class, 'getCurrentPilotSkills']);
    Route::get('/{pilotId}/skills', [PilotSkillController::class, 'getPilotSkills']);
});

// Rutas de habilidades
Route::prefix('skills')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [PilotSkillController::class, 'getAllSkills']);
    Route::get('/categories', [PilotSkillController::class, 'getSkillCategories']);
    Route::get('/categories/{categoryId}', [PilotSkillController::class, 'getSkillsByCategory']);
    Route::get('/{skillId}', [PilotSkillController::class, 'getSkillDetails']);
});

// Rutas de naves
Route::prefix('ships')->middleware(['auth:sanctum'])->group(function () {
    // Aquí irán las rutas relacionadas con las naves
});
