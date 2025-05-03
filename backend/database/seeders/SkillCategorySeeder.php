<?php

namespace Database\Seeders;

use App\Models\SkillCategory;
use Illuminate\Database\Seeder;

class SkillCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Combate',
                'description' => 'Habilidades relacionadas con el combate y el uso de armas.',
            ],
            [
                'name' => 'Minería',
                'description' => 'Habilidades relacionadas con la extracción y procesamiento de recursos.',
            ],
            [
                'name' => 'Comercio',
                'description' => 'Habilidades relacionadas con el comercio y la economía.',
            ],
            [
                'name' => 'Exploración',
                'description' => 'Habilidades relacionadas con la exploración y el descubrimiento.',
            ],
            [
                'name' => 'Ingeniería',
                'description' => 'Habilidades relacionadas con la construcción y reparación de naves y estructuras.',
            ],
            [
                'name' => 'Liderazgo',
                'description' => 'Habilidades relacionadas con el liderazgo y la gestión de corporaciones.',
            ],
            [
                'name' => 'Navegación',
                'description' => 'Habilidades relacionadas con la navegación y el pilotaje de naves.',
            ],
            [
                'name' => 'Ciencia',
                'description' => 'Habilidades relacionadas con la investigación y el desarrollo tecnológico.',
            ],
        ];

        foreach ($categories as $category) {
            SkillCategory::create($category);
        }
    }
}
