<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class GameController extends Controller
{
    /**
     * Muestra la página principal del juego con paneles dinámicos
     */
    public function index()
    {
        return Inertia::render('Game');
    }
}
