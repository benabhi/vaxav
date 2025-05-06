<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Configuración de XP para habilidades
        Setting::updateOrCreate(
            ['name' => 'x1xp'],
            [
                'value' => json_encode([
                    0 => 50,   // Nivel 0 -> 1
                    1 => 150,  // Nivel 1 -> 2
                    2 => 300,  // Nivel 2 -> 3
                    3 => 600,  // Nivel 3 -> 4
                    4 => 1000, // Nivel 4 -> 5
                ]),
                'type' => 'json',
                'description' => 'Requisitos de XP para cada nivel de habilidad (multiplicador x1)'
            ]
        );

        // Aquí puedes añadir más configuraciones según sea necesario
    }
}
