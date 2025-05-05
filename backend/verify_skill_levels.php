<?php

require __DIR__ . '/vendor/autoload.php';

// Cargar el entorno de Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Pilot;
use App\Models\User;
use App\Services\SkillService;

// Obtener el usuario de prueba
$user = User::where('email', 'test@example.com')->first();

if (!$user) {
    echo "Usuario de prueba no encontrado.\n";
    exit(1);
}

// Obtener el piloto del usuario de prueba
$pilot = Pilot::where('user_id', $user->id)->first();

if (!$pilot) {
    echo "Piloto de prueba no encontrado.\n";
    exit(1);
}

// Obtener el servicio de habilidades
$skillService = new SkillService();

// Obtener todas las habilidades del piloto
$pilotSkills = $pilot->skills()->get();

// Valores acumulados de XP para cada nivel
$cumulativeXp = [
    0 => 0,     // Nivel 0 (no aprendida)
    1 => 50,    // Para nivel 1
    2 => 200,   // Para nivel 2 (50 + 150)
    3 => 500,   // Para nivel 3 (50 + 150 + 300)
    4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
    5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
];

echo "Verificando niveles de habilidades para el piloto: {$pilot->name}\n";
echo "=================================================================\n";
echo sprintf("%-30s | %-10s | %-10s | %-15s | %-15s | %-10s\n", 
    "Habilidad", "Nivel", "Mult.", "XP", "XP Requerido", "Correcto");
echo "=================================================================\n";

$allCorrect = true;

foreach ($pilotSkills as $skill) {
    $xp = $skill->pivot->xp;
    $currentLevel = $skill->pivot->current_level;
    $multiplier = $skill->multiplier;
    
    // Calcular el nivel correcto basado en XP
    $calculatedLevel = $skillService->calculateLevelFromXp($xp, $multiplier);
    
    // Determinar si el nivel actual es correcto
    $isCorrect = ($currentLevel == $calculatedLevel);
    
    if (!$isCorrect) {
        $allCorrect = false;
    }
    
    // Calcular el XP requerido para el nivel actual
    $requiredXp = $currentLevel > 0 ? $cumulativeXp[$currentLevel] * $multiplier : 0;
    
    echo sprintf("%-30s | %-10s | %-10s | %-15s | %-15s | %-10s\n", 
        $skill->name, 
        $currentLevel, 
        $multiplier, 
        $xp, 
        $requiredXp, 
        $isCorrect ? "Sí" : "No - Debería ser $calculatedLevel");
}

echo "=================================================================\n";
echo $allCorrect ? "Todos los niveles son correctos.\n" : "Hay niveles incorrectos.\n";
