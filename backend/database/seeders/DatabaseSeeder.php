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

        // Seed solar systems
        $this->call(SolarSystemSeeder::class);
    }
}
