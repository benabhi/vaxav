<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GameController;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/game', [GameController::class, 'index']);
