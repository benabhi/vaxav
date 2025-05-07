<?php

namespace Database\Factories;

use App\Models\Constellation;
use App\Models\SolarSystem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SolarSystem>
 */
class SolarSystemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SolarSystem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' ' . $this->faker->word() . ' System',
            'description' => $this->faker->paragraph(),
            'constellation_id' => Constellation::factory(),
            'security_level' => $this->faker->randomFloat(2, 0, 1),
            'coordinates_x' => $this->faker->randomFloat(2, -100, 100),
            'coordinates_y' => $this->faker->randomFloat(2, -100, 100),
        ];
    }

    /**
     * Indicate that the system is high security.
     */
    public function highSecurity(): static
    {
        return $this->state(fn (array $attributes) => [
            'security_level' => $this->faker->randomFloat(2, 0.5, 1.0),
        ]);
    }

    /**
     * Indicate that the system is low security.
     */
    public function lowSecurity(): static
    {
        return $this->state(fn (array $attributes) => [
            'security_level' => $this->faker->randomFloat(2, 0.1, 0.4),
        ]);
    }

    /**
     * Indicate that the system is null security.
     */
    public function nullSecurity(): static
    {
        return $this->state(fn (array $attributes) => [
            'security_level' => 0.0,
        ]);
    }
}
