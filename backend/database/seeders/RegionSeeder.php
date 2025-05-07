<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            [
                'name' => 'Sector Alpha',
                'description' => 'Región central de la galaxia, densamente poblada y con alta actividad comercial.',
                'x_coord' => 0,
                'y_coord' => 0,
            ],
            [
                'name' => 'Sector Beta',
                'description' => 'Región del brazo espiral occidental, conocida por sus recursos minerales.',
                'x_coord' => -50,
                'y_coord' => 20,
            ],
            [
                'name' => 'Sector Gamma',
                'description' => 'Región del brazo espiral oriental, con numerosos sistemas habitables.',
                'x_coord' => 50,
                'y_coord' => -20,
            ],
            [
                'name' => 'Sector Delta',
                'description' => 'Región del borde exterior norte, parcialmente explorada y con presencia de piratas.',
                'x_coord' => 0,
                'y_coord' => 80,
            ],
            [
                'name' => 'Sector Epsilon',
                'description' => 'Región del borde exterior sur, rica en anomalías espaciales y fenómenos extraños.',
                'x_coord' => 0,
                'y_coord' => -80,
            ],
        ];

        foreach ($regions as $regionData) {
            Region::create($regionData);
        }
    }
}
