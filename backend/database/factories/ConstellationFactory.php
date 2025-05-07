<?php

namespace Database\Factories;

use App\Models\Constellation;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Constellation>
 */
class ConstellationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Constellation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' ' . $this->faker->word() . ' Constellation',
            'description' => $this->faker->paragraph(),
            'region_id' => Region::factory(),
            'coordinates_x' => $this->faker->randomFloat(2, -1000, 1000),
            'coordinates_y' => $this->faker->randomFloat(2, -1000, 1000),
        ];
    }
}
