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

        // Obtener un subconjunto de habilidades para asignar al piloto
        // Seleccionamos algunas habilidades básicas de diferentes categorías
        $skillNames = [
            'Armas Láser Básicas',
            'Defensa Básica',
            'Minería Básica',
            'Comercio Básico',
            'Navegación Básica',
        ];

        $skills = Skill::whereIn('name', $skillNames)->get();

        // Asignar las habilidades al piloto con diferentes niveles
        foreach ($skills as $index => $skill) {
            // Calcular un nivel entre 1 y 3 basado en el índice
            $level = min(3, ($index % 3) + 1);

            // Calcular XP basado en el nivel (fórmula simple para el ejemplo)
            $xp = $level * 1000;

            // Asignar la habilidad al piloto
            $pilot->skills()->attach($skill->id, [
                'current_level' => $level,
                'xp'            => $xp,
                'active'        => $level > 0, // Activar solo las habilidades con nivel > 0
            ]);
        }

        // Mensaje de confirmación
        $this->command->info('Habilidades asignadas al piloto de prueba: ' . $skills->count());
    }
}
