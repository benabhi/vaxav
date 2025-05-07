<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Role::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->word();
        
        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
        ];
    }

    /**
     * Indicate that the role is admin.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function admin()
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrator role with full access',
            ];
        });
    }

    /**
     * Indicate that the role is superadmin.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function superAdmin()
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Super Admin',
                'slug' => 'superadmin',
                'description' => 'Super Administrator role with unrestricted access',
            ];
        });
    }

    /**
     * Indicate that the role is user.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function user()
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular user role',
            ];
        });
    }

    /**
     * Indicate that the role is moderator.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function moderator()
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Moderator',
                'slug' => 'moderator',
                'description' => 'Moderator role with limited administrative access',
            ];
        });
    }
}
