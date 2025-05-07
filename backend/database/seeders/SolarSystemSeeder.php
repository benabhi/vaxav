<?php

namespace Database\Seeders;

use App\Models\Constellation;
use App\Models\SolarSystem;
use Illuminate\Database\Seeder;

class SolarSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las constelaciones
        $constellations = Constellation::all();

        // Asegurarse de que hay constelaciones
        if ($constellations->isEmpty()) {
            $this->command->info('No hay constelaciones. Ejecuta el seeder de constelaciones primero.');
            return;
        }

        // Mapeo de nombres de constelaciones a IDs
        $constellationMap = $constellations->pluck('id', 'name')->toArray();

        $solarSystems = [
            // Orión Prime (Sector Alpha)
            [
                'name' => 'Nova Terra',
                'description' => 'Sistema capital de la federación galáctica, hogar del gobierno central.',
                'constellation_id' => $constellationMap['Orión Prime'],
                'x_coord' => 7,
                'y_coord' => 7,
            ],
            [
                'name' => 'Helios Prime',
                'description' => 'Centro financiero y comercial de la galaxia.',
                'constellation_id' => $constellationMap['Orión Prime'],
                'x_coord' => 3,
                'y_coord' => 4,
            ],

            // Cygnus Major (Sector Alpha)
            [
                'name' => 'Nebula Cradle',
                'description' => 'Sistema joven con planetas en formación, importante para estudios astronómicos.',
                'constellation_id' => $constellationMap['Cygnus Major'],
                'x_coord' => -12,
                'y_coord' => 17,
            ],

            // Lyra Minor (Sector Alpha)
            [
                'name' => 'Ancient Harmony',
                'description' => 'Sistema con civilizaciones milenarias y tecnología avanzada.',
                'constellation_id' => $constellationMap['Lyra Minor'],
                'x_coord' => 16,
                'y_coord' => -12,
            ],

            // Taurus Occidental (Sector Beta)
            [
                'name' => 'Forge World',
                'description' => 'Principal centro de extracción minera de la galaxia.',
                'constellation_id' => $constellationMap['Taurus Occidental'],
                'x_coord' => -62,
                'y_coord' => 27,
            ],
            [
                'name' => 'Mineral Haven',
                'description' => 'Sistema rico en asteroides mineros y estaciones de procesamiento.',
                'constellation_id' => $constellationMap['Taurus Occidental'],
                'x_coord' => -58,
                'y_coord' => 23,
            ],

            // Draco Industrial (Sector Beta)
            [
                'name' => 'Factory Prime',
                'description' => 'Centro industrial con múltiples estaciones orbitales de manufactura.',
                'constellation_id' => $constellationMap['Draco Industrial'],
                'x_coord' => -47,
                'y_coord' => 12,
            ],

            // Aquila Terraformada (Sector Gamma)
            [
                'name' => 'New Eden',
                'description' => 'Sistema con cinco planetas terraformados habitables.',
                'constellation_id' => $constellationMap['Aquila Terraformada'],
                'x_coord' => 57,
                'y_coord' => -17,
            ],
            [
                'name' => 'Green Haven',
                'description' => 'Principal productor agrícola de la galaxia.',
                'constellation_id' => $constellationMap['Aquila Terraformada'],
                'x_coord' => 53,
                'y_coord' => -13,
            ],

            // Pegasus Coloniae (Sector Gamma)
            [
                'name' => 'Pioneer\'s Hope',
                'description' => 'Colonia reciente en rápido crecimiento.',
                'constellation_id' => $constellationMap['Pegasus Coloniae'],
                'x_coord' => 42,
                'y_coord' => -32,
            ],

            // Hydra Frontera (Sector Delta)
            [
                'name' => 'Outpost Omega',
                'description' => 'Estación militar avanzada que protege la frontera norte.',
                'constellation_id' => $constellationMap['Hydra Frontera'],
                'x_coord' => 7,
                'y_coord' => 87,
            ],

            // Serpens Peligrosa (Sector Delta)
            [
                'name' => 'Smuggler\'s Den',
                'description' => 'Sistema conocido por sus bases piratas ocultas y mercado negro.',
                'constellation_id' => $constellationMap['Serpens Peligrosa'],
                'x_coord' => -12,
                'y_coord' => 77,
            ],

            // Eridanus Anomalía (Sector Epsilon)
            [
                'name' => 'Void Walker',
                'description' => 'Sistema con múltiples anomalías espaciotemporales.',
                'constellation_id' => $constellationMap['Eridanus Anomalía'],
                'x_coord' => 7,
                'y_coord' => -87,
            ],

            // Cetus Misterio (Sector Epsilon)
            [
                'name' => 'Research Station Alpha',
                'description' => 'Principal centro de investigación científica de fenómenos cósmicos.',
                'constellation_id' => $constellationMap['Cetus Misterio'],
                'x_coord' => -12,
                'y_coord' => -77,
            ],
        ];

        foreach ($solarSystems as $solarSystemData) {
            SolarSystem::create($solarSystemData);
        }
    }
}
