<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
