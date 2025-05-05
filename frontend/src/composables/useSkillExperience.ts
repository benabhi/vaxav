/**
 * @file Composable para gestionar la experiencia de habilidades
 * @description Proporciona métodos para obtener requisitos de XP y calcular el índice de progresión
 * @module composables/useSkillExperience
 */

import { ref } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';

/**
 * Tipo para los requisitos de experiencia base
 */
export type XPRequirements = {
  [level: number]: number;
};

/**
 * Tipo para las estadísticas de progresión
 */
export interface ProgressionStats {
  totalSkills: number;
  learnedSkills: number;
  activeSkills: number;
  totalXP: number;
  skillsByLevel: number[];
  multiplierStats: {
    [multiplier: number]: number;
  };
}

/**
 * Tipo para el resultado del índice de progresión
 */
export interface ProgressionResult {
  progressionIndex: number;
  progressionComponents: {
    HS: number;
    AL: number;
    XP: number;
    AS: number;
    MP: number;
  };
}

/**
 * Valores por defecto para los requisitos de XP
 * Estos valores se utilizarán si no se pueden obtener de la API
 */
const DEFAULT_XP_REQUIREMENTS: XPRequirements = {
  0: 50,    // Para nivel 1
  1: 150,   // Para nivel 2
  2: 300,   // Para nivel 3
  3: 600,   // Para nivel 4
  4: 1000,  // Para nivel 5
};

/**
 * Composable para gestionar la experiencia de habilidades
 * Proporciona métodos para obtener requisitos de XP y calcular el índice de progresión
 *
 * @returns Métodos para gestionar la experiencia de habilidades
 */
export function useSkillExperience() {
  const xpRequirements: Ref<XPRequirements> = ref({ ...DEFAULT_XP_REQUIREMENTS });
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  /**
   * Obtiene los requisitos de XP desde la API
   */
  const fetchXPRequirements = async (): Promise<XPRequirements> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/skill-config/xp-requirements');
      if (response.data && typeof response.data === 'object') {
        // Verificar que la respuesta tenga la estructura esperada
        if (
          response.data[0] !== undefined &&
          response.data[1] !== undefined &&
          response.data[2] !== undefined &&
          response.data[3] !== undefined &&
          response.data[4] !== undefined
        ) {
          xpRequirements.value = response.data;
          return response.data;
        }
      }
      throw new Error('Formato de respuesta inválido');
    } catch (err) {
      console.error('Error fetching XP requirements:', err);
      error.value = 'Error al cargar los requisitos de XP';
      return DEFAULT_XP_REQUIREMENTS;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Calcula la experiencia acumulada para cada nivel
   * @param baseRequirements - Requisitos de XP base
   * @returns Experiencia acumulada para cada nivel
   */
  const calculateCumulativeXP = (baseRequirements: XPRequirements = xpRequirements.value): XPRequirements => {
    const cumulative: XPRequirements = { 0: 0 };
    let accumulated = 0;

    for (let i = 0; i < 5; i++) {
      accumulated += baseRequirements[i];
      cumulative[i + 1] = accumulated;
    }

    return cumulative;
  };

  /**
   * Calcula la experiencia necesaria para subir del nivel actual al siguiente
   * @param currentLevel - Nivel actual de la habilidad (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Experiencia necesaria para el siguiente nivel
   */
  const getNextLevelXP = (
    currentLevel: number,
    multiplier: number = 1
  ): number => {
    // Si ya está en nivel máximo, devolver 0
    if (currentLevel >= 5) {
      return 0;
    }

    // Validar parámetros
    if (currentLevel < 0 || currentLevel > 4 || !xpRequirements.value.hasOwnProperty(currentLevel)) {
      return 0;
    }

    if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
      multiplier = 1;
    }

    // Calcular XP necesaria
    return xpRequirements.value[currentLevel] * multiplier;
  };

  /**
   * Calcula el Índice de Progresión (I.P.) para un piloto
   * @param stats - Estadísticas del piloto
   * @returns Índice de progresión y sus componentes
   */
  const calculateProgressionIndex = async (stats: ProgressionStats): Promise<ProgressionResult> => {
    try {
      // Llamar a la API para calcular el índice de progresión
      const response = await api.post('/skill-config/progression-index', stats);
      
      if (response.data && response.data.progressionIndex !== undefined) {
        return response.data;
      }
      
      throw new Error('Respuesta de API inválida');
    } catch (err) {
      console.error('Error calculating progression index:', err);
      error.value = 'Error al calcular el índice de progresión';
      
      // Fallback: cálculo local si la API falla
      return calculateLocalProgressionIndex(stats);
    }
  };

  /**
   * Calcula el Índice de Progresión localmente (fallback)
   * @param stats - Estadísticas del piloto
   * @returns Índice de progresión y sus componentes
   */
  const calculateLocalProgressionIndex = (stats: ProgressionStats): ProgressionResult => {
    try {
      // HS = Porcentaje de Habilidades Aprendidas (0-100%)
      const HS = stats.totalSkills > 0 ? (stats.learnedSkills / stats.totalSkills) * 100 : 0;

      // AL = Nivel Promedio (0-5)
      let AL = 0;
      if (stats.learnedSkills > 0) {
        const totalLevels = stats.skillsByLevel.reduce((sum, count, level) => sum + (count * level), 0);
        AL = totalLevels / stats.learnedSkills;
      }

      // XP = Experiencia Total Acumulada
      const XP = stats.totalXP;

      // AS = Porcentaje de Habilidades Activas (0-100%)
      const AS = stats.learnedSkills > 0 ? (stats.activeSkills / stats.learnedSkills) * 100 : 0;

      // MP = Multiplicador Promedio (1-5)
      let MP = 0;
      if (stats.learnedSkills > 0) {
        const totalMultipliers = Object.entries(stats.multiplierStats).reduce(
          (sum, [mult, count]) => sum + (Number(mult) * count), 0
        );
        MP = totalMultipliers / stats.learnedSkills;
      }

      // Calcular el Índice de Progresión
      const progressionIndex = Math.round((HS * 10) + (AL * 25) + (XP / 100) + (AS * 15) + (MP * 5));

      return {
        progressionIndex,
        progressionComponents: {
          HS,
          AL,
          XP,
          AS,
          MP
        }
      };
    } catch (error) {
      console.error('Error en cálculo local del Índice de Progresión:', error);
      return {
        progressionIndex: 0,
        progressionComponents: {
          HS: 0,
          AL: 0,
          XP: 0,
          AS: 0,
          MP: 0
        }
      };
    }
  };

  return {
    // Estado
    xpRequirements,
    loading,
    error,

    // Métodos
    fetchXPRequirements,
    calculateCumulativeXP,
    getNextLevelXP,
    calculateProgressionIndex
  };
}
