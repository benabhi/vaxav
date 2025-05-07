<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UniverseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ejecutar los seeders en orden
        $this->call(RegionSeeder::class);
        $this->call(ConstellationSeeder::class);
        $this->call(SolarSystemSeeder::class);
        $this->call(StarSeeder::class);
        $this->call(PlanetSeeder::class);
    }


}
