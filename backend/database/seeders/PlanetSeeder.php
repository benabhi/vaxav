<?php

namespace Database\Seeders;

use App\Models\Star;
use App\Models\Planet;
use Illuminate\Database\Seeder;

class PlanetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las estrellas
        $stars = Star::all();
        
        // Asegurarse de que hay estrellas
        if ($stars->isEmpty()) {
            $this->command->info('No hay estrellas. Ejecuta el seeder de estrellas primero.');
            return;
        }
        
        // Mapeo de nombres de estrellas a IDs
        $starMap = $stars->pluck('id', 'name')->toArray();
        
        $planets = [
            // Sol Prime (Nova Terra)
            [
                'name' => 'Terra Nova',
                'description' => 'Capital de la federación galáctica, planeta terraformado similar a la Tierra.',
                'star_id' => $starMap['Sol Prime'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            [
                'name' => 'Mercurius',
                'description' => 'Planeta rocoso cercano a la estrella, rico en metales raros.',
                'star_id' => $starMap['Sol Prime'],
                'type' => 'terrestrial',
                'orbit_position' => 1,
            ],
            [
                'name' => 'Venusia',
                'description' => 'Planeta con atmósfera densa y altas temperaturas, estaciones mineras en órbita.',
                'star_id' => $starMap['Sol Prime'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Martis',
                'description' => 'Planeta parcialmente terraformado con colonias subterráneas.',
                'star_id' => $starMap['Sol Prime'],
                'type' => 'terrestrial',
                'orbit_position' => 4,
            ],
            [
                'name' => 'Jovian',
                'description' => 'Gigante gaseoso con numerosas lunas habitadas y estaciones de recolección de gases.',
                'star_id' => $starMap['Sol Prime'],
                'type' => 'gas_giant',
                'orbit_position' => 5,
            ],
            
            // Helios Alpha (Helios Prime)
            [
                'name' => 'Commerce Hub',
                'description' => 'Planeta artificial construido como centro comercial interestelar.',
                'star_id' => $starMap['Helios Alpha'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Banking World',
                'description' => 'Planeta fortificado que alberga las principales instituciones financieras de la galaxia.',
                'star_id' => $starMap['Helios Alpha'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Helios Beta (Helios Prime)
            [
                'name' => 'Luxury Resort',
                'description' => 'Planeta turístico con resorts de lujo y paisajes espectaculares.',
                'star_id' => $starMap['Helios Beta'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            
            // Cradle Star (Nebula Cradle)
            [
                'name' => 'Protoplanet Alpha',
                'description' => 'Planeta en formación, objeto de estudio científico.',
                'star_id' => $starMap['Cradle Star'],
                'type' => 'terrestrial',
                'orbit_position' => 1,
            ],
            [
                'name' => 'Research Outpost',
                'description' => 'Planeta artificial con estaciones de investigación astronómica.',
                'star_id' => $starMap['Cradle Star'],
                'type' => 'terrestrial',
                'orbit_position' => 4,
            ],
            
            // Ancient One (Ancient Harmony)
            [
                'name' => 'Ancestral',
                'description' => 'Planeta con ruinas de una civilización antigua y avanzada.',
                'star_id' => $starMap['Ancient One'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            [
                'name' => 'Wisdom',
                'description' => 'Planeta sede de la universidad galáctica y bibliotecas de conocimiento.',
                'star_id' => $starMap['Ancient One'],
                'type' => 'terrestrial',
                'orbit_position' => 4,
            ],
            
            // Forge Star (Forge World)
            [
                'name' => 'Metalica',
                'description' => 'Planeta minero con enormes excavaciones y refinadoras.',
                'star_id' => $starMap['Forge Star'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Heavy World',
                'description' => 'Planeta con alta gravedad y denso en metales pesados.',
                'star_id' => $starMap['Forge Star'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Mineral Sun (Mineral Haven)
            [
                'name' => 'Asteroid Belt Alpha',
                'description' => 'Cinturón de asteroides mineros con numerosas estaciones.',
                'star_id' => $starMap['Mineral Sun'],
                'type' => 'dwarf',
                'orbit_position' => 3,
            ],
            
            // Industrial Core (Factory Prime)
            [
                'name' => 'Manufactoria',
                'description' => 'Planeta industrial cubierto de fábricas y plantas de procesamiento.',
                'star_id' => $starMap['Industrial Core'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Worker\'s Haven',
                'description' => 'Planeta residencial para los trabajadores de las fábricas.',
                'star_id' => $starMap['Industrial Core'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Eden Star (New Eden)
            [
                'name' => 'Paradise',
                'description' => 'Planeta terraformado con clima perfecto y ecosistemas equilibrados.',
                'star_id' => $starMap['Eden Star'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            [
                'name' => 'Harmony',
                'description' => 'Planeta con vastos océanos y archipiélagos habitados.',
                'star_id' => $starMap['Eden Star'],
                'type' => 'ocean',
                'orbit_position' => 4,
            ],
            [
                'name' => 'Serenity',
                'description' => 'Planeta con extensas praderas y reservas naturales.',
                'star_id' => $starMap['Eden Star'],
                'type' => 'terrestrial',
                'orbit_position' => 5,
            ],
            
            // Green Sun (Green Haven)
            [
                'name' => 'Harvest',
                'description' => 'Planeta agrícola con vastos campos de cultivo que alimentan a múltiples sistemas.',
                'star_id' => $starMap['Green Sun'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Greenhouse',
                'description' => 'Planeta cubierto de invernaderos para cultivos especializados.',
                'star_id' => $starMap['Green Sun'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Hope Star (Pioneer's Hope)
            [
                'name' => 'New Beginning',
                'description' => 'Primera colonia establecida en el sistema, en rápido crecimiento.',
                'star_id' => $starMap['Hope Star'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            [
                'name' => 'Frontier',
                'description' => 'Planeta en proceso de terraformación, parcialmente habitable.',
                'star_id' => $starMap['Hope Star'],
                'type' => 'terrestrial',
                'orbit_position' => 4,
            ],
            
            // Sentinel (Outpost Omega)
            [
                'name' => 'Military Base Alpha',
                'description' => 'Planeta fortificado con la principal base militar de la frontera norte.',
                'star_id' => $starMap['Sentinel'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Watchtower',
                'description' => 'Planeta con estaciones de monitoreo y sistemas de defensa avanzados.',
                'star_id' => $starMap['Sentinel'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Shadow Star (Smuggler's Den)
            [
                'name' => 'Hidden Port',
                'description' => 'Planeta con numerosos puertos clandestinos y mercados negros.',
                'star_id' => $starMap['Shadow Star'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Asteroid Haven',
                'description' => 'Cinturón de asteroides con bases piratas ocultas.',
                'star_id' => $starMap['Shadow Star'],
                'type' => 'dwarf',
                'orbit_position' => 4,
            ],
            
            // Anomaly Core (Void Walker)
            [
                'name' => 'Distortion',
                'description' => 'Planeta con campos gravitacionales inestables y anomalías temporales.',
                'star_id' => $starMap['Anomaly Core'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Paradox',
                'description' => 'Planeta que parece existir en múltiples estados cuánticos simultáneamente.',
                'star_id' => $starMap['Anomaly Core'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
            
            // Enigma (Research Station Alpha)
            [
                'name' => 'Science Hub',
                'description' => 'Planeta convertido en un enorme complejo de investigación científica.',
                'star_id' => $starMap['Enigma'],
                'type' => 'terrestrial',
                'orbit_position' => 2,
            ],
            [
                'name' => 'Mystery',
                'description' => 'Planeta con fenómenos inexplicables y propiedades físicas únicas.',
                'star_id' => $starMap['Enigma'],
                'type' => 'terrestrial',
                'orbit_position' => 3,
            ],
        ];

        foreach ($planets as $planetData) {
            Planet::create($planetData);
        }
    }
}
