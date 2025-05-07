<?php

namespace Database\Factories;

use App\Models\BannedUser;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BannedUser>
 */
class BannedUserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BannedUser::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $admin = User::factory()->create();
        $user = User::factory()->create();
        
        return [
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'reason' => $this->faker->sentence(),
            'notes' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(['temporary', 'permanent']),
            'expires_at' => function (array $attributes) {
                return $attributes['type'] === 'temporary' 
                    ? now()->addDays(rand(1, 30)) 
                    : null;
            },
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the ban is temporary.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function temporary()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'temporary',
                'expires_at' => now()->addDays(rand(1, 30)),
            ];
        });
    }

    /**
     * Indicate that the ban is permanent.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function permanent()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'permanent',
                'expires_at' => null,
            ];
        });
    }

    /**
     * Indicate that the ban is active.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    /**
     * Indicate that the ban is inactive.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate that the ban has expired.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function expired()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'temporary',
                'expires_at' => now()->subDays(rand(1, 30)),
            ];
        });
    }
}
