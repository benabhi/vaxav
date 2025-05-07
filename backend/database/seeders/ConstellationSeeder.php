<?php

namespace Database\Seeders;

use App\Models\Constellation;
use App\Models\Region;
use Illuminate\Database\Seeder;

class ConstellationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las regiones
        $regions = Region::all();
        
        // Asegurarse de que hay regiones
        if ($regions->isEmpty()) {
            $this->command->info('No hay regiones. Ejecuta el seeder de regiones primero.');
            return;
        }
        
        // Mapeo de nombres de regiones a IDs
        $regionMap = $regions->pluck('id', 'name')->toArray();
        
        $constellations = [
            // Sector Alpha
            [
                'name' => 'Orión Prime',
                'description' => 'Constelación central del Sector Alpha, hogar de la capital galáctica.',
                'region_id' => $regionMap['Sector Alpha'],
                'x_coord' => 5,
                'y_coord' => 5,
            ],
            [
                'name' => 'Cygnus Major',
                'description' => 'Constelación rica en estrellas jóvenes y sistemas planetarios en formación.',
                'region_id' => $regionMap['Sector Alpha'],
                'x_coord' => -10,
                'y_coord' => 15,
            ],
            [
                'name' => 'Lyra Minor',
                'description' => 'Constelación conocida por sus estrellas antiguas y civilizaciones avanzadas.',
                'region_id' => $regionMap['Sector Alpha'],
                'x_coord' => 15,
                'y_coord' => -10,
            ],
            
            // Sector Beta
            [
                'name' => 'Taurus Occidental',
                'description' => 'Constelación minera principal del Sector Beta, rica en metales pesados.',
                'region_id' => $regionMap['Sector Beta'],
                'x_coord' => -60,
                'y_coord' => 25,
            ],
            [
                'name' => 'Draco Industrial',
                'description' => 'Centro de producción industrial y refinamiento de minerales.',
                'region_id' => $regionMap['Sector Beta'],
                'x_coord' => -45,
                'y_coord' => 10,
            ],
            
            // Sector Gamma
            [
                'name' => 'Aquila Terraformada',
                'description' => 'Constelación con la mayor concentración de planetas terraformados habitables.',
                'region_id' => $regionMap['Sector Gamma'],
                'x_coord' => 55,
                'y_coord' => -15,
            ],
            [
                'name' => 'Pegasus Coloniae',
                'description' => 'Zona de expansión colonial con numerosos asentamientos recientes.',
                'region_id' => $regionMap['Sector Gamma'],
                'x_coord' => 40,
                'y_coord' => -30,
            ],
            
            // Sector Delta
            [
                'name' => 'Hydra Frontera',
                'description' => 'Constelación fronteriza, parcialmente cartografiada y con presencia militar.',
                'region_id' => $regionMap['Sector Delta'],
                'x_coord' => 5,
                'y_coord' => 85,
            ],
            [
                'name' => 'Serpens Peligrosa',
                'description' => 'Zona conocida por actividades piratas y contrabando.',
                'region_id' => $regionMap['Sector Delta'],
                'x_coord' => -10,
                'y_coord' => 75,
            ],
            
            // Sector Epsilon
            [
                'name' => 'Eridanus Anomalía',
                'description' => 'Constelación con alta concentración de anomalías espaciales y fenómenos inexplicables.',
                'region_id' => $regionMap['Sector Epsilon'],
                'x_coord' => 5,
                'y_coord' => -85,
            ],
            [
                'name' => 'Cetus Misterio',
                'description' => 'Zona de investigación científica dedicada al estudio de fenómenos cósmicos raros.',
                'region_id' => $regionMap['Sector Epsilon'],
                'x_coord' => -10,
                'y_coord' => -75,
            ],
        ];

        foreach ($constellations as $constellationData) {
            Constellation::create($constellationData);
        }
    }
}
