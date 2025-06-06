<?php

namespace App\Services;

use App\Models\Pilot;
use App\Models\PilotSkill;
use App\Models\Skill;
use App\Models\SkillPrerequisite;
use Illuminate\Support\Facades\Log;

class SkillService
{
    /**
     * Verifica si un piloto puede activar una habilidad
     *
     * @param Pilot $pilot El piloto
     * @param Skill $skill La habilidad a activar
     * @return array Resultado de la verificación
     */
    public function canActivateSkill(Pilot $pilot, Skill $skill): array
    {
        $canActivate = true;
        $missingPrerequisites = [];

        foreach ($skill->prerequisites as $prerequisite) {
            $requiredLevel = $prerequisite->pivot->prerequisite_level;
            $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
                ->where('skill_id', $prerequisite->id)
                ->first();

            if (!$pilotSkill || $pilotSkill->current_level < $requiredLevel || !$pilotSkill->active) {
                $canActivate = false;
                $missingPrerequisites[] = [
                    'skill'          => $prerequisite,
                    'required_level' => $requiredLevel,
                    'current_level'  => $pilotSkill ? $pilotSkill->current_level : 0,
                    'active'         => $pilotSkill ? $pilotSkill->active : false
                ];
            }
        }

        return [
            'can_activate'          => $canActivate,
            'missing_prerequisites' => $missingPrerequisites
        ];
    }

    /**
     * Verifica si un piloto puede desactivar una habilidad
     *
     * @param Pilot $pilot El piloto
     * @param Skill $skill La habilidad a desactivar
     * @return array Resultado de la verificación
     */
    public function canDeactivateSkill(Pilot $pilot, Skill $skill): array
    {
        $canDeactivate = true;
        $dependentSkills = [];

        // Buscar habilidades que dependen de esta
        $dependentSkillIds = SkillPrerequisite::where('prerequisite_id', $skill->id)->pluck('skill_id');

        // Verificar si alguna de esas habilidades está activa para el piloto
        foreach ($dependentSkillIds as $dependentSkillId) {
            $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
                ->where('skill_id', $dependentSkillId)
                ->where('active', true)
                ->first();

            if ($pilotSkill) {
                $canDeactivate = false;
                $dependentSkills[] = [
                    'skill' => Skill::find($dependentSkillId),
                    'level' => $pilotSkill->current_level
                ];
            }
        }

        return [
            'can_deactivate'   => $canDeactivate,
            'dependent_skills' => $dependentSkills
        ];
    }

    /**
     * Verifica si un piloto puede reducir el nivel de una habilidad
     *
     * @param Pilot $pilot El piloto
     * @param Skill $skill La habilidad a reducir
     * @param int $newLevel El nuevo nivel de la habilidad
     * @return array Resultado de la verificación
     */
    public function canReduceSkillLevel(Pilot $pilot, Skill $skill, int $newLevel): array
    {
        $canReduce = true;
        $dependentSkills = [];

        // Buscar habilidades que dependen de esta
        $prerequisites = SkillPrerequisite::where('prerequisite_id', $skill->id)->get();

        // Verificar si alguna de esas habilidades está activa y requiere un nivel mayor
        foreach ($prerequisites as $prerequisite) {
            if ($prerequisite->prerequisite_level > $newLevel) {
                $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
                    ->where('skill_id', $prerequisite->skill_id)
                    ->where('active', true)
                    ->first();

                if ($pilotSkill) {
                    $canReduce = false;
                    $dependentSkills[] = [
                        'skill'          => Skill::find($prerequisite->skill_id),
                        'level'          => $pilotSkill->current_level,
                        'required_level' => $prerequisite->prerequisite_level
                    ];
                }
            }
        }

        return [
            'can_reduce'       => $canReduce,
            'dependent_skills' => $dependentSkills
        ];
    }

    /**
     * Calcula el nivel máximo posible para una habilidad basado en prerrequisitos
     *
     * @param Pilot $pilot El piloto
     * @param Skill $skill La habilidad a evaluar
     * @return int El nivel máximo posible
     */
    public function getMaxPossibleLevel(Pilot $pilot, Skill $skill): int
    {
        // Si no hay prerrequisitos, el nivel máximo es 5
        if ($skill->prerequisites->isEmpty()) {
            return 5;
        }

        $maxLevel = 5;

        // Verificar cada prerrequisito
        foreach ($skill->prerequisites as $prerequisite) {
            $requiredLevel = $prerequisite->pivot->prerequisite_level;
            $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
                ->where('skill_id', $prerequisite->id)
                ->first();

            // Si el piloto no tiene la habilidad prerrequisito, el nivel máximo es 0
            if (!$pilotSkill || !$pilotSkill->active) {
                return 0;
            }

            // Si el nivel del piloto es menor que el requerido, el nivel máximo es 0
            if ($pilotSkill->current_level < $requiredLevel) {
                return 0;
            }
        }

        return $maxLevel;
    }

    /**
     * Obtiene todas las habilidades que dependen de una habilidad específica
     *
     * @param Skill $skill La habilidad
     * @return array Las habilidades dependientes
     */
    public function getDependentSkills(Skill $skill): array
    {
        $dependentSkills = [];

        // Buscar habilidades que dependen directamente de esta
        $directDependencies = SkillPrerequisite::where('prerequisite_id', $skill->id)
            ->with('skill')
            ->get();

        foreach ($directDependencies as $dependency) {
            $dependentSkills[] = [
                'skill'          => $dependency->skill,
                'required_level' => $dependency->prerequisite_level
            ];
        }

        return $dependentSkills;
    }

    /**
     * Obtiene los requisitos de XP para cada nivel
     *
     * @return array Los requisitos de XP
     */
    public function getXpRequirements(): array
    {
        // Valores actualizados para los requisitos de XP
        return [
            0 => 50,   // Nivel 0 -> 1
            1 => 150,  // Nivel 1 -> 2
            2 => 300,  // Nivel 2 -> 3
            3 => 600,  // Nivel 3 -> 4
            4 => 1000, // Nivel 4 -> 5
        ];
    }

    /**
     * Obtiene el XP mínimo requerido para un nivel específico
     *
     * @param int $level El nivel objetivo (1-5)
     * @param float $multiplier El multiplicador de la habilidad (por defecto: 1.0)
     * @return int El XP mínimo requerido
     */
    public function getMinXpForLevel(int $level, float $multiplier = 1.0): int
    {
        if ($level < 1 || $level > 5) {
            return 0;
        }

        // Valores acumulados de XP para cada nivel
        $cumulativeXp = [
            0 => 0,     // Nivel 0 (no aprendida)
            1 => 50,    // Para nivel 1
            2 => 200,   // Para nivel 2 (50 + 150)
            3 => 500,   // Para nivel 3 (50 + 150 + 300)
            4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
            5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
        ];

        // Aplicar multiplicador y devolver como entero
        return (int) ceil($cumulativeXp[$level] * $multiplier);
    }

    /**
     * Calcula el nivel actual basado en XP
     *
     * @param int $xp El XP actual
     * @param float $multiplier El multiplicador de la habilidad (por defecto: 1.0)
     * @return int El nivel actual (0-5)
     */
    public function calculateLevelFromXp(int $xp, float $multiplier = 1.0): int
    {
        // Valores acumulados de XP para cada nivel
        $cumulativeXp = [
            0 => 0,     // Nivel 0 (no aprendida)
            1 => 50,    // Para nivel 1
            2 => 200,   // Para nivel 2 (50 + 150)
            3 => 500,   // Para nivel 3 (50 + 150 + 300)
            4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
            5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
        ];

        $level = 0;

        // Iterar a través de los niveles y verificar si tenemos suficiente XP
        for ($i = 1; $i <= 5; $i++) {
            if ($xp >= $cumulativeXp[$i] * $multiplier) {
                $level = $i;
            } else {
                break;
            }
        }

        return $level;
    }

    /**
     * Obtiene el progreso de XP para el nivel actual
     *
     * @param int $xp El XP actual
     * @param int $level El nivel actual (0-4)
     * @param float $multiplier El multiplicador de la habilidad (por defecto: 1.0)
     * @return array La información de progreso
     */
    public function getXpProgress(int $xp, int $level, float $multiplier = 1.0): array
    {
        if ($level < 0 || $level > 4) {
            return [
                'current'    => 0,
                'required'   => 0,
                'percentage' => 100,
            ];
        }

        // Valores acumulados de XP para cada nivel
        $cumulativeXp = [
            0 => 0,     // Nivel 0 (no aprendida)
            1 => 50,    // Para nivel 1
            2 => 200,   // Para nivel 2 (50 + 150)
            3 => 500,   // Para nivel 3 (50 + 150 + 300)
            4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
            5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
        ];

        // Requisitos de XP para cada nivel individual
        $xpRequirements = [
            0 => 50,    // Para nivel 1
            1 => 150,   // Para nivel 2
            2 => 300,   // Para nivel 3
            3 => 600,   // Para nivel 4
            4 => 1000,  // Para nivel 5
        ];

        $requiredXp = (int) ceil($xpRequirements[$level] * $multiplier);
        $previousLevelXp = $cumulativeXp[$level] * $multiplier;
        $currentLevelXp = $xp - $previousLevelXp;

        $percentage = $requiredXp > 0 ? min(100, floor(($currentLevelXp / $requiredXp) * 100)) : 100;

        return [
            'current'    => $currentLevelXp,
            'required'   => $requiredXp,
            'percentage' => $percentage,
        ];
    }

    /**
     * Calcula el Índice de Progresión (I.P.) para un piloto
     *
     * Fórmula: PI = (HS × 10) + (AL × 25) + (XP ÷ 100) + (AS × 15) + (MP × 5)
     *
     * Donde:
     * - HS = Porcentaje de Habilidades Aprendidas (0-100%)
     * - AL = Nivel Promedio (0-5)
     * - XP = Experiencia Total Acumulada
     * - AS = Porcentaje de Habilidades Activas (0-100%)
     * - MP = Multiplicador Promedio (1-5)
     *
     * @param array $stats Estadísticas del piloto
     * @return array Índice de progresión y sus componentes
     */
    public function calculateProgressionIndex(array $stats): array
    {
        try {
            // HS = Porcentaje de Habilidades Aprendidas (0-100%)
            $HS = $stats['totalSkills'] > 0 ? ($stats['learnedSkills'] / $stats['totalSkills']) * 100 : 0;

            // AL = Nivel Promedio (0-5)
            $AL = 0;
            if ($stats['learnedSkills'] > 0) {
                $totalLevels = 0;
                foreach ($stats['skillsByLevel'] as $level => $count) {
                    $totalLevels += $level * $count;
                }
                $AL = $totalLevels / $stats['learnedSkills'];
            }

            // XP = Experiencia Total Acumulada
            $XP = $stats['totalXP'];

            // AS = Porcentaje de Habilidades Activas (0-100%)
            $AS = $stats['learnedSkills'] > 0 ? ($stats['activeSkills'] / $stats['learnedSkills']) * 100 : 0;

            // MP = Multiplicador Promedio (1-5)
            $MP = 0;
            if ($stats['learnedSkills'] > 0) {
                $totalMultipliers = 0;
                foreach ($stats['multiplierStats'] as $mult => $count) {
                    $totalMultipliers += (int) $mult * $count;
                }
                $MP = $totalMultipliers / $stats['learnedSkills'];
            }

            // Calcular el Índice de Progresión
            $progressionIndex = round(($HS * 10) + ($AL * 25) + ($XP / 100) + ($AS * 15) + ($MP * 5));

            return [
                'progressionIndex'      => $progressionIndex,
                'progressionComponents' => [
                    'HS' => $HS,
                    'AL' => $AL,
                    'XP' => $XP,
                    'AS' => $AS,
                    'MP' => $MP
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Error al calcular el Índice de Progresión: ' . $e->getMessage());
            return [
                'progressionIndex'      => 0,
                'progressionComponents' => [
                    'HS' => 0,
                    'AL' => 0,
                    'XP' => 0,
                    'AS' => 0,
                    'MP' => 0
                ]
            ];
        }
    }
}
