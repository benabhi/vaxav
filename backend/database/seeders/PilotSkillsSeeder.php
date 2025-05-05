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

        // Los valores de XP acumulados se definen directamente en el bucle foreach

        // Obtener un subconjunto de habilidades para asignar al piloto
        // Incluimos habilidades de diferentes niveles y categorías con multiplicadores variados
        $skillsToAssign = [
            // Habilidades x1 (básicas)
            ['name' => 'Armas Láser Básicas', 'level' => 5, 'multiplier' => 1, 'active' => true],
            ['name' => 'Defensa Básica', 'level' => 2, 'multiplier' => 1, 'active' => true],
            ['name' => 'Minería Básica', 'level' => 4, 'multiplier' => 1, 'active' => true],

            // Habilidades x2 (intermedias)
            ['name' => 'Armas de Proyectil Básicas', 'level' => 4, 'multiplier' => 2, 'active' => true],
            ['name' => 'Comercio Básico', 'level' => 3, 'multiplier' => 2, 'active' => true],
            ['name' => 'Navegación Básica', 'level' => 5, 'multiplier' => 2, 'active' => true],

            // Habilidades x3 (avanzadas)
            ['name' => 'Armas Láser Intermedias', 'level' => 3, 'multiplier' => 3, 'active' => true],
            ['name' => 'Navegación Avanzada', 'level' => 2, 'multiplier' => 3, 'active' => true],
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

        // Calcular XP específico para cada habilidad basado en los nuevos valores acumulados
        foreach ($skillsToAssign as $key => $skill) {
            // Valores acumulados de XP para cada nivel
            $cumulativeXp = [
                0 => 0,     // Nivel 0 (no aprendida)
                1 => 50,    // Para nivel 1
                2 => 200,   // Para nivel 2 (50 + 150)
                3 => 500,   // Para nivel 3 (50 + 150 + 300)
                4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
                5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
            ];

            // Aplicar el multiplicador a los umbrales de XP
            $scaledXpThresholds = [];
            foreach ($cumulativeXp as $level => $xp) {
                $scaledXpThresholds[$level] = $xp * $skill['multiplier'];
            }

            if ($skill['level'] == 0) {
                // Para nivel 0, no hay XP
                $skillsToAssign[$key]['xp'] = 0;
            } else if ($skill['level'] == 5) {
                // Para nivel 5, usar exactamente el XP necesario para nivel 5
                $skillsToAssign[$key]['xp'] = $scaledXpThresholds[5];
            } else {
                // Para niveles 1-4, calcular un valor entre el nivel actual y el siguiente
                $currentLevelXp = $scaledXpThresholds[$skill['level']];
                $nextLevelXp = $scaledXpThresholds[$skill['level'] + 1];

                // Añadir entre 10% y 80% del progreso hacia el siguiente nivel
                $xpRange = $nextLevelXp - $currentLevelXp;
                $additionalXp = rand(intval($xpRange * 0.1), intval($xpRange * 0.8));
                $skillsToAssign[$key]['xp'] = $currentLevelXp + $additionalXp;
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
