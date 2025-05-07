<?php

namespace Database\Factories;

use App\Models\CelestialBody;
use App\Models\CelestialType;
use App\Models\SolarSystem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CelestialBody>
 */
class CelestialBodyFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CelestialBody::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' ' . $this->faker->word() . '-' . rand(100, 999),
            'description' => $this->faker->paragraph(),
            'solar_system_id' => SolarSystem::factory(),
            'celestial_type_id' => CelestialType::factory(),
            'parent_id' => null,
            'orbit_index' => null,
            'coordinates_x' => $this->faker->randomFloat(2, -50, 50),
            'coordinates_y' => $this->faker->randomFloat(2, -50, 50),
        ];
    }

    /**
     * Indicate that this is a star.
     */
    public function star(): static
    {
        return $this->state(function (array $attributes) {
            // Obtener el tipo de cuerpo celeste 'star' existente o crearlo si no existe
            $starType = CelestialType::firstOrCreate(
                ['name' => 'star'],
                ['description' => 'A luminous ball of gas, primarily hydrogen and helium, held together by its own gravity.']
            );

            return [
                'celestial_type_id' => $starType->id,
                'parent_id' => null,
                'orbit_index' => null,
                'coordinates_x' => 0,
                'coordinates_y' => 0,
            ];
        });
    }

    /**
     * Indicate that this is a planet orbiting a star.
     */
    public function planet(CelestialBody $star = null, int $orbitIndex = null): static
    {
        return $this->state(function (array $attributes) use ($star, $orbitIndex) {
            // Obtener el tipo de cuerpo celeste 'planet' existente o crearlo si no existe
            $planetType = CelestialType::firstOrCreate(
                ['name' => 'planet'],
                ['description' => 'A celestial body that orbits a star and is massive enough for its own gravity to make it round.']
            );

            // If no star is provided, create a new one in the same solar system
            if (!$star) {
                $solarSystemId = $attributes['solar_system_id'] ?? SolarSystem::factory()->create()->id;
                $star = CelestialBody::factory()->star()->create(['solar_system_id' => $solarSystemId]);
            }

            // If no orbit index is provided, generate a random one
            if ($orbitIndex === null) {
                // Get the highest orbit index for this star
                $maxOrbitIndex = CelestialBody::where('parent_id', $star->id)->max('orbit_index') ?? 0;
                $orbitIndex = $maxOrbitIndex + 1;
            }

            // Calculate coordinates based on orbit index (simple circular orbit)
            $radius = 5 * $orbitIndex; // Increase radius with orbit index
            $angle = $this->faker->randomFloat(2, 0, 2 * M_PI); // Random angle
            $x = $star->coordinates_x + $radius * cos($angle);
            $y = $star->coordinates_y + $radius * sin($angle);

            return [
                'celestial_type_id' => $planetType->id,
                'solar_system_id' => $star->solar_system_id,
                'parent_id' => $star->id,
                'orbit_index' => $orbitIndex,
                'coordinates_x' => $x,
                'coordinates_y' => $y,
            ];
        });
    }

    /**
     * Indicate that this is a moon orbiting a planet.
     */
    public function moon(CelestialBody $planet = null, int $orbitIndex = null): static
    {
        return $this->state(function (array $attributes) use ($planet, $orbitIndex) {
            // Obtener el tipo de cuerpo celeste 'moon' existente o crearlo si no existe
            $moonType = CelestialType::firstOrCreate(
                ['name' => 'moon'],
                ['description' => 'A natural satellite that orbits a planet or other celestial body.']
            );

            // If no planet is provided, create a new one
            if (!$planet) {
                $solarSystemId = $attributes['solar_system_id'] ?? SolarSystem::factory()->create()->id;
                $star = CelestialBody::factory()->star()->create(['solar_system_id' => $solarSystemId]);
                $planet = CelestialBody::factory()->planet($star)->create();
            }

            // If no orbit index is provided, generate a random one
            if ($orbitIndex === null) {
                // Get the highest orbit index for this planet
                $maxOrbitIndex = CelestialBody::where('parent_id', $planet->id)->max('orbit_index') ?? 0;
                $orbitIndex = $maxOrbitIndex + 1;
            }

            // Calculate coordinates based on orbit index (simple circular orbit)
            $radius = 2 * $orbitIndex; // Smaller radius for moons
            $angle = $this->faker->randomFloat(2, 0, 2 * M_PI); // Random angle
            $x = $planet->coordinates_x + $radius * cos($angle);
            $y = $planet->coordinates_y + $radius * sin($angle);

            return [
                'celestial_type_id' => $moonType->id,
                'solar_system_id' => $planet->solar_system_id,
                'parent_id' => $planet->id,
                'orbit_index' => $orbitIndex,
                'coordinates_x' => $x,
                'coordinates_y' => $y,
            ];
        });
    }
}
