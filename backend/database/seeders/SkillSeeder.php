<?php

namespace Database\Seeders;

use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SkillPrerequisite;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las categorías
        $combateId = SkillCategory::where('name', 'Combate')->first()->id;
        $mineriaId = SkillCategory::where('name', 'Minería')->first()->id;
        $comercioId = SkillCategory::where('name', 'Comercio')->first()->id;
        $exploracionId = SkillCategory::where('name', 'Exploración')->first()->id;
        $ingenieriaId = SkillCategory::where('name', 'Ingeniería')->first()->id;
        $liderazgoId = SkillCategory::where('name', 'Liderazgo')->first()->id;
        $navegacionId = SkillCategory::where('name', 'Navegación')->first()->id;
        $cienciaId = SkillCategory::where('name', 'Ciencia')->first()->id;

        // Crear habilidades básicas (multiplicador x1)
        $basicSkills = [
            // Combate
            [
                'skill_category_id' => $combateId,
                'name' => 'Armas Láser Básicas',
                'description' => 'Conocimientos básicos sobre el uso de armas láser.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $combateId,
                'name' => 'Armas de Proyectil Básicas',
                'description' => 'Conocimientos básicos sobre el uso de armas de proyectil.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $combateId,
                'name' => 'Defensa Básica',
                'description' => 'Conocimientos básicos sobre técnicas defensivas en combate.',
                'multiplier' => 1,
            ],
            
            // Minería
            [
                'skill_category_id' => $mineriaId,
                'name' => 'Minería Básica',
                'description' => 'Conocimientos básicos sobre técnicas de minería.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $mineriaId,
                'name' => 'Procesamiento de Minerales Básico',
                'description' => 'Conocimientos básicos sobre el procesamiento de minerales.',
                'multiplier' => 1,
            ],
            
            // Comercio
            [
                'skill_category_id' => $comercioId,
                'name' => 'Comercio Básico',
                'description' => 'Conocimientos básicos sobre técnicas de comercio.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $comercioId,
                'name' => 'Contabilidad Básica',
                'description' => 'Conocimientos básicos sobre contabilidad y finanzas.',
                'multiplier' => 1,
            ],
            
            // Exploración
            [
                'skill_category_id' => $exploracionId,
                'name' => 'Exploración Básica',
                'description' => 'Conocimientos básicos sobre técnicas de exploración.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $exploracionId,
                'name' => 'Escaneo Básico',
                'description' => 'Conocimientos básicos sobre el uso de escáneres.',
                'multiplier' => 1,
            ],
            
            // Ingeniería
            [
                'skill_category_id' => $ingenieriaId,
                'name' => 'Ingeniería Básica',
                'description' => 'Conocimientos básicos sobre ingeniería y reparaciones.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $ingenieriaId,
                'name' => 'Electrónica Básica',
                'description' => 'Conocimientos básicos sobre sistemas electrónicos.',
                'multiplier' => 1,
            ],
            
            // Liderazgo
            [
                'skill_category_id' => $liderazgoId,
                'name' => 'Liderazgo Básico',
                'description' => 'Conocimientos básicos sobre liderazgo y gestión de equipos.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $liderazgoId,
                'name' => 'Gestión Corporativa Básica',
                'description' => 'Conocimientos básicos sobre la gestión de corporaciones.',
                'multiplier' => 1,
            ],
            
            // Navegación
            [
                'skill_category_id' => $navegacionId,
                'name' => 'Navegación Básica',
                'description' => 'Conocimientos básicos sobre navegación espacial.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $navegacionId,
                'name' => 'Evasión Básica',
                'description' => 'Conocimientos básicos sobre maniobras evasivas.',
                'multiplier' => 1,
            ],
            
            // Ciencia
            [
                'skill_category_id' => $cienciaId,
                'name' => 'Investigación Básica',
                'description' => 'Conocimientos básicos sobre métodos de investigación.',
                'multiplier' => 1,
            ],
            [
                'skill_category_id' => $cienciaId,
                'name' => 'Análisis de Datos Básico',
                'description' => 'Conocimientos básicos sobre análisis de datos científicos.',
                'multiplier' => 1,
            ],
        ];

        // Crear las habilidades básicas
        foreach ($basicSkills as $skillData) {
            Skill::create($skillData);
        }

        // Crear habilidades intermedias (multiplicador x2)
        $intermediateSkills = [
            // Combate
            [
                'skill_category_id' => $combateId,
                'name' => 'Armas Láser Intermedias',
                'description' => 'Conocimientos intermedios sobre el uso de armas láser.',
                'multiplier' => 2,
                'prerequisites' => [
                    ['name' => 'Armas Láser Básicas', 'level' => 3]
                ]
            ],
            [
                'skill_category_id' => $combateId,
                'name' => 'Armas de Proyectil Intermedias',
                'description' => 'Conocimientos intermedios sobre el uso de armas de proyectil.',
                'multiplier' => 2,
                'prerequisites' => [
                    ['name' => 'Armas de Proyectil Básicas', 'level' => 3]
                ]
            ],
            
            // Minería
            [
                'skill_category_id' => $mineriaId,
                'name' => 'Minería Avanzada',
                'description' => 'Técnicas avanzadas de minería para mayor eficiencia.',
                'multiplier' => 2,
                'prerequisites' => [
                    ['name' => 'Minería Básica', 'level' => 3]
                ]
            ],
            
            // Comercio
            [
                'skill_category_id' => $comercioId,
                'name' => 'Negociación',
                'description' => 'Técnicas avanzadas de negociación para obtener mejores precios.',
                'multiplier' => 2,
                'prerequisites' => [
                    ['name' => 'Comercio Básico', 'level' => 3]
                ]
            ],
            
            // Navegación
            [
                'skill_category_id' => $navegacionId,
                'name' => 'Navegación Avanzada',
                'description' => 'Técnicas avanzadas de navegación para mayor velocidad y eficiencia.',
                'multiplier' => 2,
                'prerequisites' => [
                    ['name' => 'Navegación Básica', 'level' => 3]
                ]
            ],
        ];

        // Crear las habilidades intermedias y sus prerrequisitos
        foreach ($intermediateSkills as $skillData) {
            $prerequisites = $skillData['prerequisites'] ?? [];
            unset($skillData['prerequisites']);
            
            $skill = Skill::create($skillData);
            
            // Añadir prerrequisitos
            foreach ($prerequisites as $prereq) {
                $prerequisiteSkill = Skill::where('name', $prereq['name'])->first();
                if ($prerequisiteSkill) {
                    SkillPrerequisite::create([
                        'skill_id' => $skill->id,
                        'prerequisite_id' => $prerequisiteSkill->id,
                        'prerequisite_level' => $prereq['level']
                    ]);
                }
            }
        }

        // Crear habilidades avanzadas (multiplicador x3)
        $advancedSkills = [
            // Combate
            [
                'skill_category_id' => $combateId,
                'name' => 'Maestría en Armas Láser',
                'description' => 'Dominio completo de las armas láser para máxima eficacia.',
                'multiplier' => 3,
                'prerequisites' => [
                    ['name' => 'Armas Láser Intermedias', 'level' => 4],
                    ['name' => 'Electrónica Básica', 'level' => 2]
                ]
            ],
            
            // Minería
            [
                'skill_category_id' => $mineriaId,
                'name' => 'Minería Especializada',
                'description' => 'Técnicas especializadas para la extracción de minerales raros.',
                'multiplier' => 3,
                'prerequisites' => [
                    ['name' => 'Minería Avanzada', 'level' => 4],
                    ['name' => 'Análisis de Datos Básico', 'level' => 2]
                ]
            ],
        ];

        // Crear las habilidades avanzadas y sus prerrequisitos
        foreach ($advancedSkills as $skillData) {
            $prerequisites = $skillData['prerequisites'] ?? [];
            unset($skillData['prerequisites']);
            
            $skill = Skill::create($skillData);
            
            // Añadir prerrequisitos
            foreach ($prerequisites as $prereq) {
                $prerequisiteSkill = Skill::where('name', $prereq['name'])->first();
                if ($prerequisiteSkill) {
                    SkillPrerequisite::create([
                        'skill_id' => $skill->id,
                        'prerequisite_id' => $prerequisiteSkill->id,
                        'prerequisite_level' => $prereq['level']
                    ]);
                }
            }
        }

        // Crear habilidades expertas (multiplicador x4)
        $expertSkills = [
            // Combate
            [
                'skill_category_id' => $combateId,
                'name' => 'Tácticas de Combate Avanzadas',
                'description' => 'Conocimientos expertos sobre tácticas de combate para maximizar la eficacia en batalla.',
                'multiplier' => 4,
                'prerequisites' => [
                    ['name' => 'Maestría en Armas Láser', 'level' => 3],
                    ['name' => 'Defensa Básica', 'level' => 4],
                    ['name' => 'Navegación Avanzada', 'level' => 2]
                ]
            ],
        ];

        // Crear las habilidades expertas y sus prerrequisitos
        foreach ($expertSkills as $skillData) {
            $prerequisites = $skillData['prerequisites'] ?? [];
            unset($skillData['prerequisites']);
            
            $skill = Skill::create($skillData);
            
            // Añadir prerrequisitos
            foreach ($prerequisites as $prereq) {
                $prerequisiteSkill = Skill::where('name', $prereq['name'])->first();
                if ($prerequisiteSkill) {
                    SkillPrerequisite::create([
                        'skill_id' => $skill->id,
                        'prerequisite_id' => $prerequisiteSkill->id,
                        'prerequisite_level' => $prereq['level']
                    ]);
                }
            }
        }

        // Crear habilidades maestras (multiplicador x5)
        $masterSkills = [
            // Combate
            [
                'skill_category_id' => $combateId,
                'name' => 'Maestría en Combate',
                'description' => 'Dominio absoluto de todas las técnicas de combate, convirtiendo al piloto en una fuerza imparable.',
                'multiplier' => 5,
                'prerequisites' => [
                    ['name' => 'Tácticas de Combate Avanzadas', 'level' => 4],
                    ['name' => 'Armas de Proyectil Intermedias', 'level' => 5],
                    ['name' => 'Liderazgo Básico', 'level' => 3]
                ]
            ],
        ];

        // Crear las habilidades maestras y sus prerrequisitos
        foreach ($masterSkills as $skillData) {
            $prerequisites = $skillData['prerequisites'] ?? [];
            unset($skillData['prerequisites']);
            
            $skill = Skill::create($skillData);
            
            // Añadir prerrequisitos
            foreach ($prerequisites as $prereq) {
                $prerequisiteSkill = Skill::where('name', $prereq['name'])->first();
                if ($prerequisiteSkill) {
                    SkillPrerequisite::create([
                        'skill_id' => $skill->id,
                        'prerequisite_id' => $prerequisiteSkill->id,
                        'prerequisite_level' => $prereq['level']
                    ]);
                }
            }
        }
    }
}
