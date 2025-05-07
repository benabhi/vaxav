<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name'  => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seed roles and permissions
        $this->call(RolesAndPermissionsSeeder::class);

        // Seed additional permissions
        $this->call(PermissionsSeeder::class);

        // Seed universe (regions, constellations, solar systems, celestial bodies)
        $this->call(UniverseSeeder::class);

        // Seed skill categories
        $this->call(SkillCategorySeeder::class);

        // Seed skills
        $this->call(SkillSeeder::class);

        // Assign skill permissions to roles
        $this->call(AssignSkillPermissionsSeeder::class);

        // Assign skills to test pilot
        $this->call(PilotSkillsSeeder::class);

        // Seed settings
        $this->call(SettingsSeeder::class);
    }
}
