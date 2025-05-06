<?php

namespace App\Services;

use App\Models\Pilot;
use App\Models\PilotSkill;
use App\Models\Setting;
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
                    'skill' => $prerequisite,
                    'required_level' => $requiredLevel,
                    'current_level' => $pilotSkill ? $pilotSkill->current_level : 0,
                    'active' => $pilotSkill ? $pilotSkill->active : false
                ];
            }
        }

        return [
            'can_activate' => $canActivate,
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
            'can_deactivate' => $canDeactivate,
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
                        'skill' => Skill::find($prerequisite->skill_id),
                        'level' => $pilotSkill->current_level,
                        'required_level' => $prerequisite->prerequisite_level
                    ];
                }
            }
        }

        return [
            'can_reduce' => $canReduce,
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
                'skill' => $dependency->skill,
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
        // Intentar obtener de la configuración
        $xpSetting = Setting::where('name', 'x1xp')->first();

        if ($xpSetting && $xpSetting->type === 'json') {
            try {
                $xpRequirements = json_decode($xpSetting->value, true);

                // Validar la estructura
                if (is_array($xpRequirements) &&
                    isset($xpRequirements[0]) &&
                    isset($xpRequirements[1]) &&
                    isset($xpRequirements[2]) &&
                    isset($xpRequirements[3]) &&
                    isset($xpRequirements[4])) {
                    return $xpRequirements;
                }
            } catch (\Exception $e) {
                Log::error('Error parsing XP requirements: ' . $e->getMessage());
            }
        }

        // Valores por defecto si la configuración no existe o es inválida
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

        $xpRequirements = $this->getXpRequirements();
        $baseXp = 0;

        // Sumar todo el XP requerido para alcanzar el nivel objetivo
        for ($i = 0; $i < $level; $i++) {
            $baseXp += $xpRequirements[$i];
        }

        // Aplicar multiplicador y devolver como entero
        return (int) ceil($baseXp * $multiplier);
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
        $xpRequirements = $this->getXpRequirements();
        $accumulatedXp = 0;
        $level = 0;

        // Iterar a través de los niveles y verificar si tenemos suficiente XP
        for ($i = 0; $i < 5; $i++) {
            $requiredXp = (int) ceil($xpRequirements[$i] * $multiplier);

            if ($xp >= $accumulatedXp + $requiredXp) {
                $accumulatedXp += $requiredXp;
                $level++;
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
                'current' => 0,
                'required' => 0,
                'percentage' => 100,
            ];
        }

        $xpRequirements = $this->getXpRequirements();
        $requiredXp = (int) ceil($xpRequirements[$level] * $multiplier);
        $previousLevelXp = $this->getMinXpForLevel($level, $multiplier);
        $currentLevelXp = $xp - $previousLevelXp;

        $percentage = $requiredXp > 0 ? min(100, floor(($currentLevelXp / $requiredXp) * 100)) : 100;

        return [
            'current' => $currentLevelXp,
            'required' => $requiredXp,
            'percentage' => $percentage,
        ];
    }
}
