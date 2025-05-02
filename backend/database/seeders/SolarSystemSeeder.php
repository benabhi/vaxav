<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\SolarSystem;
use Illuminate\Database\Seeder;

class SolarSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear una región inicial si no existe
        $region = Region::firstOrCreate(
            ['name' => 'Imperio Central'],
            [
                'description' => 'La región central del imperio, altamente segura y patrullada.',
                'security_level' => 1.0,
            ]
        );

        // Crear un sistema solar inicial
        SolarSystem::firstOrCreate(
            ['name' => 'Nexus Prime'],
            [
                'description' => 'El sistema solar principal del Imperio Central, hogar de la capital.',
                'security_level' => 1.0,
                'x_coordinate' => 0,
                'y_coordinate' => 0,
                'region_id' => $region->id,
            ]
        );
    }
}
