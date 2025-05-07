<?php

namespace Database\Seeders;

use App\Models\CelestialBody;
use App\Models\CelestialType;
use App\Models\Constellation;
use App\Models\Region;
use App\Models\SolarSystem;
use Illuminate\Database\Seeder;

class UniverseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear tipos de cuerpos celestes
        $this->createCelestialTypes();

        // Crear regiones
        $regions = $this->createRegions();

        // Para cada región, crear constelaciones
        foreach ($regions as $region) {
            $constellations = $this->createConstellationsForRegion($region);

            // Para cada constelación, crear sistemas solares
            foreach ($constellations as $constellation) {
                $solarSystems = $this->createSolarSystemsForConstellation($constellation);

                // Para cada sistema solar, crear cuerpos celestes
                foreach ($solarSystems as $solarSystem) {
                    $this->createCelestialBodiesForSolarSystem($solarSystem);
                }
            }
        }
    }

    /**
     * Crear tipos de cuerpos celestes.
     */
    private function createCelestialTypes(): void
    {
        // Crear tipos básicos usando firstOrCreate para evitar duplicados
        $types = [
            [
                'name' => 'star',
                'description' => 'A luminous ball of gas, primarily hydrogen and helium, held together by its own gravity.'
            ],
            [
                'name' => 'planet',
                'description' => 'A celestial body that orbits a star and is massive enough for its own gravity to make it round.'
            ],
            [
                'name' => 'moon',
                'description' => 'A natural satellite that orbits a planet or other celestial body.'
            ],
            [
                'name' => 'asteroid_belt',
                'description' => 'A region of space between planets where numerous asteroids orbit a star.'
            ],
            [
                'name' => 'station',
                'description' => 'An artificial structure in space designed for habitation, commerce, or other purposes.'
            ]
        ];

        foreach ($types as $type) {
            CelestialType::firstOrCreate(
                ['name' => $type['name']],
                ['description' => $type['description']]
            );
        }
    }

    /**
     * Crear regiones.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function createRegions()
    {
        // Crear regiones predefinidas
        $regionData = [
            [
                'name' => 'Imperio Central',
                'description' => 'La región central del imperio, altamente segura y patrullada.',
            ],
            [
                'name' => 'Frontera Exterior',
                'description' => 'La región fronteriza del imperio, menos segura pero rica en recursos.',
            ],
            [
                'name' => 'Territorios Salvajes',
                'description' => 'Región inexplorada y peligrosa más allá de las fronteras del imperio.',
            ],
        ];

        foreach ($regionData as $data) {
            Region::firstOrCreate(
                ['name' => $data['name']],
                ['description' => $data['description']]
            );
        }

        return Region::all();
    }

    /**
     * Crear constelaciones para una región.
     *
     * @param Region $region
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function createConstellationsForRegion(Region $region)
    {
        // Número de constelaciones por región
        $count = match ($region->name) {
            'Imperio Central' => 3,
            'Frontera Exterior' => 4,
            'Territorios Salvajes' => 5,
            default => 2,
        };

        // Crear constelaciones
        for ($i = 0; $i < $count; $i++) {
            Constellation::factory()->create([
                'region_id' => $region->id,
                'name' => $this->generateConstellationName($region->name, $i),
            ]);
        }

        return $region->constellations()->get();
    }

    /**
     * Generar nombre para una constelación.
     *
     * @param string $regionName
     * @param int $index
     * @return string
     */
    private function generateConstellationName(string $regionName, int $index): string
    {
        $prefixes = [
            'Imperio Central' => ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'],
            'Frontera Exterior' => ['Nova', 'Orion', 'Cygnus', 'Lyra', 'Perseus'],
            'Territorios Salvajes' => ['Omega', 'Draco', 'Hydra', 'Serpens', 'Scorpius'],
        ];

        $suffixes = ['Prime', 'Major', 'Minor', 'Cluster', 'Nebula'];

        $prefix = $prefixes[$regionName][$index % count($prefixes[$regionName])];
        $suffix = $suffixes[$index % count($suffixes)];

        return "{$prefix} {$suffix}";
    }

    /**
     * Crear sistemas solares para una constelación.
     *
     * @param Constellation $constellation
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function createSolarSystemsForConstellation(Constellation $constellation)
    {
        // Número de sistemas solares por constelación (2-5)
        $count = rand(2, 5);

        // Crear sistemas solares
        for ($i = 0; $i < $count; $i++) {
            // Determinar nivel de seguridad basado en la región
            $securityLevel = match ($constellation->region->name) {
                'Imperio Central' => rand(70, 100) / 100,
                'Frontera Exterior' => rand(30, 60) / 100,
                'Territorios Salvajes' => rand(0, 20) / 100,
                default => rand(0, 100) / 100,
            };

            SolarSystem::factory()->create([
                'constellation_id' => $constellation->id,
                'name' => $this->generateSolarSystemName($constellation->name, $i),
                'security_level' => $securityLevel,
            ]);
        }

        return $constellation->solarSystems()->get();
    }

    /**
     * Generar nombre para un sistema solar.
     *
     * @param string $constellationName
     * @param int $index
     * @return string
     */
    private function generateSolarSystemName(string $constellationName, int $index): string
    {
        $parts = explode(' ', $constellationName);
        $prefix = $parts[0];

        $suffixes = ['-A', '-B', '-C', '-D', '-E', '-F', '-G', '-H'];
        $suffix = $suffixes[$index % count($suffixes)];

        return "{$prefix}{$suffix}";
    }

    /**
     * Crear cuerpos celestes para un sistema solar.
     *
     * @param SolarSystem $solarSystem
     */
    private function createCelestialBodiesForSolarSystem(SolarSystem $solarSystem): void
    {
        // Crear una estrella central
        $star = CelestialBody::factory()->star()->create([
            'solar_system_id' => $solarSystem->id,
            'name' => $solarSystem->name . ' Prime',
        ]);

        // Número de planetas (1-8)
        $planetCount = rand(1, 8);

        // Crear planetas
        for ($i = 1; $i <= $planetCount; $i++) {
            $planet = CelestialBody::factory()->planet($star, $i)->create([
                'name' => $this->generatePlanetName($solarSystem->name, $i),
            ]);

            // Probabilidad de tener lunas (más probable para planetas exteriores)
            $moonProbability = min(0.2 + ($i / 10), 0.8);

            if (rand(0, 100) / 100 < $moonProbability) {
                // Número de lunas (0-3)
                $moonCount = rand(1, 3);

                for ($j = 1; $j <= $moonCount; $j++) {
                    CelestialBody::factory()->moon($planet, $j)->create([
                        'name' => $this->generateMoonName($planet->name, $j),
                    ]);
                }
            }
        }
    }

    /**
     * Generar nombre para un planeta.
     *
     * @param string $systemName
     * @param int $orbitIndex
     * @return string
     */
    private function generatePlanetName(string $systemName, int $orbitIndex): string
    {
        $prefixes = ['Terra', 'Aqua', 'Pyro', 'Aero', 'Cryo', 'Ferro', 'Silica', 'Carbo'];
        $suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

        $prefix = $prefixes[($orbitIndex - 1) % count($prefixes)];
        $suffix = $suffixes[($orbitIndex - 1) % count($suffixes)];

        return "{$prefix} {$suffix}";
    }

    /**
     * Generar nombre para una luna.
     *
     * @param string $planetName
     * @param int $orbitIndex
     * @return string
     */
    private function generateMoonName(string $planetName, int $orbitIndex): string
    {
        $parts = explode(' ', $planetName);
        $prefix = $parts[0];

        return "{$prefix} Moon {$orbitIndex}";
    }
}
