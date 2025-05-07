<?php

namespace Database\Factories;

use App\Models\CelestialType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CelestialType>
 */
class CelestialTypeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CelestialType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'description' => $this->faker->paragraph(),
        ];
    }

    /**
     * Indicate that this is a star.
     */
    public function star(): static
    {
        // En lugar de crear un nuevo registro, devolvemos el ID de uno existente o lo creamos si no existe
        $type = CelestialType::firstOrCreate(
            ['name' => 'star'],
            ['description' => 'A luminous ball of gas, primarily hydrogen and helium, held together by its own gravity.']
        );

        return $this->state(fn (array $attributes) => [
            'id' => $type->id,
            'name' => $type->name,
            'description' => $type->description,
        ]);
    }

    /**
     * Indicate that this is a planet.
     */
    public function planet(): static
    {
        // En lugar de crear un nuevo registro, devolvemos el ID de uno existente o lo creamos si no existe
        $type = CelestialType::firstOrCreate(
            ['name' => 'planet'],
            ['description' => 'A celestial body that orbits a star and is massive enough for its own gravity to make it round.']
        );

        return $this->state(fn (array $attributes) => [
            'id' => $type->id,
            'name' => $type->name,
            'description' => $type->description,
        ]);
    }

    /**
     * Indicate that this is a moon.
     */
    public function moon(): static
    {
        // En lugar de crear un nuevo registro, devolvemos el ID de uno existente o lo creamos si no existe
        $type = CelestialType::firstOrCreate(
            ['name' => 'moon'],
            ['description' => 'A natural satellite that orbits a planet or other celestial body.']
        );

        return $this->state(fn (array $attributes) => [
            'id' => $type->id,
            'name' => $type->name,
            'description' => $type->description,
        ]);
    }

    /**
     * Indicate that this is an asteroid belt.
     */
    public function asteroidBelt(): static
    {
        // En lugar de crear un nuevo registro, devolvemos el ID de uno existente o lo creamos si no existe
        $type = CelestialType::firstOrCreate(
            ['name' => 'asteroid_belt'],
            ['description' => 'A region of space between planets where numerous asteroids orbit a star.']
        );

        return $this->state(fn (array $attributes) => [
            'id' => $type->id,
            'name' => $type->name,
            'description' => $type->description,
        ]);
    }

    /**
     * Indicate that this is a station.
     */
    public function station(): static
    {
        // En lugar de crear un nuevo registro, devolvemos el ID de uno existente o lo creamos si no existe
        $type = CelestialType::firstOrCreate(
            ['name' => 'station'],
            ['description' => 'An artificial structure in space designed for habitation, commerce, or other purposes.']
        );

        return $this->state(fn (array $attributes) => [
            'id' => $type->id,
            'name' => $type->name,
            'description' => $type->description,
        ]);
    }
}
