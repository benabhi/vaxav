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

// Obtener la habilidad de Armas Láser Intermedias
$skill = $pilot->skills()->where('name', 'Armas Láser Intermedias')->first();

if (!$skill) {
    echo "Habilidad 'Armas Láser Intermedias' no encontrada.\n";
    exit(1);
}

// Obtener el servicio de habilidades
$skillService = new SkillService();

// Valores acumulados de XP para cada nivel
$cumulativeXp = [
    0 => 0,     // Nivel 0 (no aprendida)
    1 => 50,    // Para nivel 1
    2 => 200,   // Para nivel 2 (50 + 150)
    3 => 500,   // Para nivel 3 (50 + 150 + 300)
    4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
    5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
];

// Calcular el nivel correcto basado en XP
$calculatedLevel = $skillService->calculateLevelFromXp($skill->pivot->xp, $skill->multiplier);

// Calcular el XP requerido para el siguiente nivel
$nextLevel = min(5, $calculatedLevel + 1);
$nextLevelXp = $cumulativeXp[$nextLevel] * $skill->multiplier;

// Calcular el XP requerido para el nivel actual
$currentLevelXp = $cumulativeXp[$calculatedLevel] * $skill->multiplier;

// Calcular el progreso hacia el siguiente nivel
$progress = $skill->pivot->xp - $currentLevelXp;
$totalNeeded = $nextLevelXp - $currentLevelXp;
$percentage = $totalNeeded > 0 ? round(($progress / $totalNeeded) * 100) : 100;

echo "Información de la habilidad 'Armas Láser Intermedias':\n";
echo "=================================================================\n";
echo "Nombre: " . $skill->name . "\n";
echo "Multiplicador: " . $skill->multiplier . "\n";
echo "Nivel actual en BD: " . $skill->pivot->current_level . "\n";
echo "XP actual: " . $skill->pivot->xp . "\n";
echo "Nivel calculado: " . $calculatedLevel . "\n";
echo "XP requerido para nivel actual (" . $calculatedLevel . "): " . $currentLevelXp . "\n";
echo "XP requerido para siguiente nivel (" . $nextLevel . "): " . $nextLevelXp . "\n";
echo "Progreso hacia el siguiente nivel: " . $progress . "/" . $totalNeeded . " (" . $percentage . "%)\n";
echo "=================================================================\n";

// Verificar si hay discrepancia entre el nivel en la BD y el calculado
if ($skill->pivot->current_level != $calculatedLevel) {
    echo "¡DISCREPANCIA DETECTADA! El nivel en la BD (" . $skill->pivot->current_level . ") no coincide con el calculado (" . $calculatedLevel . ").\n";
}

// Verificar los cálculos del frontend
echo "\nSimulación de cálculos del frontend:\n";
echo "=================================================================\n";

// Valores que podrían estar hardcodeados en el frontend
$frontendXpRequirements = [
    0 => 50,    // Para nivel 1
    1 => 150,   // Para nivel 2
    2 => 300,   // Para nivel 3
    3 => 600,   // Para nivel 4
    4 => 1000,  // Para nivel 5
];

// Calcular nivel según el frontend (suponiendo que usa valores no acumulativos)
$frontendLevel = 0;
$accumulatedXp = 0;

for ($i = 0; $i < 5; $i++) {
    $requiredXp = $frontendXpRequirements[$i] * $skill->multiplier;
    
    if ($skill->pivot->xp >= $accumulatedXp + $requiredXp) {
        $accumulatedXp += $requiredXp;
        $frontendLevel++;
    } else {
        break;
    }
}

// Calcular XP para el siguiente nivel según el frontend
$frontendNextLevelXp = $frontendLevel < 5 ? $frontendXpRequirements[$frontendLevel] * $skill->multiplier : 0;

echo "Nivel calculado por el frontend (estimado): " . $frontendLevel . "\n";
echo "XP requerido para el siguiente nivel según el frontend: " . $frontendNextLevelXp . "\n";

if ($frontendLevel != $calculatedLevel) {
    echo "¡DISCREPANCIA DETECTADA! El nivel calculado por el backend (" . $calculatedLevel . ") no coincide con el estimado del frontend (" . $frontendLevel . ").\n";
}

echo "=================================================================\n";
