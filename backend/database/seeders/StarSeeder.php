<?php

namespace Database\Seeders;

use App\Models\SolarSystem;
use App\Models\Star;
use Illuminate\Database\Seeder;

class StarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los sistemas solares
        $solarSystems = SolarSystem::all();
        
        // Asegurarse de que hay sistemas solares
        if ($solarSystems->isEmpty()) {
            $this->command->info('No hay sistemas solares. Ejecuta el seeder de sistemas solares primero.');
            return;
        }
        
        // Mapeo de nombres de sistemas solares a IDs
        $solarSystemMap = $solarSystems->pluck('id', 'name')->toArray();
        
        $stars = [
            // Nova Terra (Sector Alpha - Orión Prime)
            [
                'name' => 'Sol Prime',
                'description' => 'Estrella principal del sistema Nova Terra, similar al Sol pero un 20% más grande.',
                'solar_system_id' => $solarSystemMap['Nova Terra'],
                'type' => 'G',
            ],
            
            // Helios Prime (Sector Alpha - Orión Prime)
            [
                'name' => 'Helios Alpha',
                'description' => 'Estrella binaria con alta luminosidad, proporciona energía a las estaciones comerciales.',
                'solar_system_id' => $solarSystemMap['Helios Prime'],
                'type' => 'A',
            ],
            [
                'name' => 'Helios Beta',
                'description' => 'Compañera más pequeña de Helios Alpha, orbitan en un patrón estable.',
                'solar_system_id' => $solarSystemMap['Helios Prime'],
                'type' => 'K',
            ],
            
            // Nebula Cradle (Sector Alpha - Cygnus Major)
            [
                'name' => 'Cradle Star',
                'description' => 'Estrella joven y caliente, rodeada de una nebulosa de formación estelar.',
                'solar_system_id' => $solarSystemMap['Nebula Cradle'],
                'type' => 'O',
            ],
            
            // Ancient Harmony (Sector Alpha - Lyra Minor)
            [
                'name' => 'Ancient One',
                'description' => 'Una de las estrellas más antiguas de la galaxia, estable y de larga vida.',
                'solar_system_id' => $solarSystemMap['Ancient Harmony'],
                'type' => 'G',
            ],
            
            // Forge World (Sector Beta - Taurus Occidental)
            [
                'name' => 'Forge Star',
                'description' => 'Estrella caliente que proporciona abundante energía para las operaciones mineras.',
                'solar_system_id' => $solarSystemMap['Forge World'],
                'type' => 'B',
            ],
            
            // Mineral Haven (Sector Beta - Taurus Occidental)
            [
                'name' => 'Mineral Sun',
                'description' => 'Estrella con alta radiación que ha enriquecido los asteroides cercanos con minerales raros.',
                'solar_system_id' => $solarSystemMap['Mineral Haven'],
                'type' => 'F',
            ],
            
            // Factory Prime (Sector Beta - Draco Industrial)
            [
                'name' => 'Industrial Core',
                'description' => 'Estrella estable que proporciona energía constante para las fábricas orbitales.',
                'solar_system_id' => $solarSystemMap['Factory Prime'],
                'type' => 'G',
            ],
            
            // New Eden (Sector Gamma - Aquila Terraformada)
            [
                'name' => 'Eden Star',
                'description' => 'Estrella con espectro ideal para planetas habitables, similar al Sol.',
                'solar_system_id' => $solarSystemMap['New Eden'],
                'type' => 'G',
            ],
            
            // Green Haven (Sector Gamma - Aquila Terraformada)
            [
                'name' => 'Green Sun',
                'description' => 'Estrella con radiación perfecta para el crecimiento de cultivos.',
                'solar_system_id' => $solarSystemMap['Green Haven'],
                'type' => 'K',
            ],
            
            // Pioneer's Hope (Sector Gamma - Pegasus Coloniae)
            [
                'name' => 'Hope Star',
                'description' => 'Estrella joven con varios planetas en proceso de terraformación.',
                'solar_system_id' => $solarSystemMap['Pioneer\'s Hope'],
                'type' => 'F',
            ],
            
            // Outpost Omega (Sector Delta - Hydra Frontera)
            [
                'name' => 'Sentinel',
                'description' => 'Estrella brillante visible desde lejos, sirve como faro para navegantes.',
                'solar_system_id' => $solarSystemMap['Outpost Omega'],
                'type' => 'A',
            ],
            
            // Smuggler's Den (Sector Delta - Serpens Peligrosa)
            [
                'name' => 'Shadow Star',
                'description' => 'Estrella tenue con numerosos campos de asteroides que proporcionan escondites.',
                'solar_system_id' => $solarSystemMap['Smuggler\'s Den'],
                'type' => 'M',
            ],
            
            // Void Walker (Sector Epsilon - Eridanus Anomalía)
            [
                'name' => 'Anomaly Core',
                'description' => 'Estrella con comportamiento errático y fluctuaciones de energía inexplicables.',
                'solar_system_id' => $solarSystemMap['Void Walker'],
                'type' => 'WR',
            ],
            
            // Research Station Alpha (Sector Epsilon - Cetus Misterio)
            [
                'name' => 'Enigma',
                'description' => 'Estrella con propiedades únicas que desafían las leyes conocidas de la física.',
                'solar_system_id' => $solarSystemMap['Research Station Alpha'],
                'type' => 'NS',
            ],
        ];

        foreach ($stars as $starData) {
            Star::create($starData);
        }
    }
}
