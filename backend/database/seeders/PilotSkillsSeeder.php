<?php

namespace Database\Seeders;

use App\Models\Pilot;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;

class PilotSkillsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener el usuario de prueba
        $user = User::where('email', 'test@example.com')->first();

        if (!$user) {
            // Si no existe el usuario de prueba, no hacer nada
            return;
        }

        // Obtener o crear el piloto del usuario de prueba
        $pilot = Pilot::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name'        => 'Test Pilot',
                'race'        => 'Humano',
                'credits'     => 10000,
                'location_id' => 1, // Nexus Prime
            ]
        );

        // Función para calcular la experiencia necesaria para un nivel y multiplicador
        function calculateXpForLevel($level, $multiplier)
        {
            $baseXp = [
                0 => 0,      // Nivel 0
                1 => 50,     // Para nivel 1
                2 => 150,    // Para nivel 2
                3 => 300,    // Para nivel 3
                4 => 600,    // Para nivel 4
                5 => 1000,   // Para nivel 5
            ];

            return $baseXp[$level] * $multiplier;
        }

        // Función para generar XP aleatorio entre el nivel actual y el siguiente
        function generateRandomXp($currentLevel, $nextLevel, $multiplier)
        {
            $baseXp = [
                0 => 0,      // Nivel 0
                1 => 50,     // Para nivel 1
                2 => 150,    // Para nivel 2
                3 => 300,    // Para nivel 3
                4 => 600,    // Para nivel 4
                5 => 1000,   // Para nivel 5
            ];

            // Para cada nivel, necesitamos al menos la experiencia mínima para ese nivel
            $minRequiredXp = $baseXp[$currentLevel] * $multiplier;

            // Si es nivel 5, solo devolver el XP exacto del nivel 5
            if ($currentLevel >= 5) {
                return $minRequiredXp;
            }

            // El máximo es justo antes del siguiente nivel
            $maxPossibleXp = ($baseXp[$nextLevel] * $multiplier) - 1;

            // Asegurarnos de que el mínimo sea al menos un poco más que el requerido para el nivel actual
            $minXp = $minRequiredXp + 1;

            // Si por alguna razón el mínimo es mayor que el máximo, usar el mínimo
            if ($minXp >= $maxPossibleXp) {
                return $minXp;
            }

            return rand($minXp, $maxPossibleXp);
        }

        // Obtener un subconjunto de habilidades para asignar al piloto
        // Incluimos habilidades de diferentes niveles y categorías con multiplicadores variados
        $skillsToAssign = [
            // Habilidades x1 (básicas)
            ['name' => 'Armas Láser Básicas', 'level' => 5, 'multiplier' => 1, 'active' => true],
            ['name' => 'Defensa Básica', 'level' => 2, 'multiplier' => 1, 'active' => true],
            ['name' => 'Minería Básica', 'level' => 4, 'multiplier' => 1, 'active' => true],

            // Habilidades x2 (intermedias)
            ['name' => 'Armas de Proyectil Básicas', 'level' => 3, 'multiplier' => 2, 'active' => true],
            ['name' => 'Comercio Básico', 'level' => 3, 'multiplier' => 2, 'active' => true],
            ['name' => 'Navegación Básica', 'level' => 5, 'multiplier' => 2, 'active' => true],

            // Habilidades x3 (avanzadas)
            ['name' => 'Armas Láser Intermedias', 'level' => 2, 'multiplier' => 3, 'active' => true],
            ['name' => 'Navegación Avanzada', 'level' => 1, 'multiplier' => 3, 'active' => true],
            ['name' => 'Electrónica Básica', 'level' => 2, 'multiplier' => 3, 'active' => true],

            // Habilidades x4 (especializadas)
            ['name' => 'Negociación', 'level' => 1, 'multiplier' => 4, 'active' => true],
            ['name' => 'Tácticas de Combate Básicas', 'level' => 2, 'multiplier' => 4, 'active' => true],

            // Habilidades x5 (maestría)
            ['name' => 'Ingeniería Básica', 'level' => 1, 'multiplier' => 5, 'active' => true],

            // Habilidades parcialmente aprendidas (con nivel pero no activas)
            ['name' => 'Exploración Espacial', 'level' => 2, 'multiplier' => 3, 'active' => false],
            ['name' => 'Reparación de Naves', 'level' => 1, 'multiplier' => 2, 'active' => false],

            // Habilidades no aprendidas (nivel 0, no activas)
            ['name' => 'Maestría en Armas Láser', 'level' => 0, 'multiplier' => 5, 'active' => false],
            ['name' => 'Minería Avanzada', 'level' => 0, 'multiplier' => 3, 'active' => false],
            ['name' => 'Tácticas de Combate Avanzadas', 'level' => 0, 'multiplier' => 4, 'active' => false],
            ['name' => 'Maestría en Combate', 'level' => 0, 'multiplier' => 5, 'active' => false],
        ];

        // Calcular XP aleatorio para cada habilidad
        foreach ($skillsToAssign as $key => $skill) {
            if ($skill['level'] > 0) {
                $nextLevel = min(5, $skill['level'] + 1);
                $skillsToAssign[$key]['xp'] = generateRandomXp($skill['level'], $nextLevel, $skill['multiplier']);
            } else {
                $skillsToAssign[$key]['xp'] = 0;
            }
        }

        // Eliminar todas las habilidades existentes del piloto para evitar duplicados
        $pilot->skills()->detach();

        // Asignar las habilidades al piloto
        foreach ($skillsToAssign as $skillData) {
            $skill = Skill::where('name', $skillData['name'])->first();

            if ($skill) {
                // Actualizar el multiplicador de la habilidad si es necesario
                if (isset($skillData['multiplier']) && $skill->multiplier != $skillData['multiplier']) {
                    $skill->multiplier = $skillData['multiplier'];
                    $skill->save();
                }

                // Asignar la habilidad al piloto con los datos especificados
                $pilot->skills()->attach($skill->id, [
                    'current_level' => $skillData['level'],
                    'xp'            => $skillData['xp'],
                    'active'        => $skillData['active'],
                ]);
            }
        }

        // Mensaje de confirmación
        $this->command->info('Habilidades asignadas al piloto de prueba: ' . count($skillsToAssign));
    }
}
