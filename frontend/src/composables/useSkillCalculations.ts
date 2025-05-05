/**
 * @file Composable para cálculos relacionados con habilidades
 * @description Proporciona funciones para calcular niveles, progreso y experiencia de habilidades
 * @module composables/useSkillCalculations
 */

import { computed } from 'vue';

/**
 * Composable para cálculos relacionados con habilidades
 * Centraliza todos los cálculos de niveles, progreso y experiencia
 * 
 * @returns Funciones para calcular niveles, progreso y experiencia
 */
export function useSkillCalculations() {
  /**
   * Valores acumulados de XP para cada nivel
   */
  const cumulativeXp = {
    0: 0,     // Nivel 0 (no aprendida)
    1: 50,    // Para nivel 1
    2: 200,   // Para nivel 2 (50 + 150)
    3: 500,   // Para nivel 3 (50 + 150 + 300)
    4: 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
    5: 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
  };

  /**
   * Requisitos de XP para cada nivel individual (no acumulado)
   */
  const levelRequirements = {
    0: 50,    // Para nivel 1
    1: 150,   // Para nivel 2
    2: 300,   // Para nivel 3
    3: 600,   // Para nivel 4
    4: 1000,  // Para nivel 5
  };

  /**
   * Calcula el nivel basado en XP y multiplicador
   * 
   * @param xp - Experiencia acumulada
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Nivel calculado (0-5)
   */
  const calculateLevel = (xp: number, multiplier: number = 1): number => {
    if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
      return 0;
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }

    let level = 0;
    
    for (let i = 1; i <= 5; i++) {
      if (xp >= cumulativeXp[i] * multiplier) {
        level = i;
      } else {
        break;
      }
    }
    
    return level;
  };

  /**
   * Calcula el porcentaje de progreso hacia el siguiente nivel
   * 
   * @param xp - Experiencia acumulada
   * @param level - Nivel actual (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Porcentaje de progreso (0-100)
   */
  const calculateProgressPercentage = (xp: number, level: number, multiplier: number = 1): number => {
    if (level >= 5) return 100;
    
    if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
      return 0;
    }

    if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 5) {
      level = calculateLevel(xp, multiplier);
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }
    
    const currentLevelXP = cumulativeXp[level] * multiplier;
    const nextLevelXP = cumulativeXp[level + 1] * multiplier;
    
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpProgress = xp - currentLevelXP;
    
    return Math.min(100, Math.max(0, Math.round((xpProgress / xpForNextLevel) * 100)));
  };

  /**
   * Calcula la experiencia acumulada en el nivel actual
   * 
   * @param xp - Experiencia acumulada
   * @param level - Nivel actual (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Experiencia acumulada en el nivel actual
   */
  const calculateCurrentLevelXP = (xp: number, level: number, multiplier: number = 1): number => {
    if (level >= 5) return 0;
    
    if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
      return 0;
    }

    if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 5) {
      level = calculateLevel(xp, multiplier);
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }
    
    const currentLevelMinXP = cumulativeXp[level] * multiplier;
    return xp - currentLevelMinXP;
  };

  /**
   * Calcula la experiencia necesaria para el siguiente nivel
   * 
   * @param level - Nivel actual (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Experiencia necesaria para el siguiente nivel
   */
  const calculateXPNeededForNextLevel = (level: number, multiplier: number = 1): number => {
    if (level >= 5) return 0;
    
    if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 5) {
      return 0;
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }
    
    const currentLevelXP = cumulativeXp[level] * multiplier;
    const nextLevelXP = cumulativeXp[level + 1] * multiplier;
    
    return nextLevelXP - currentLevelXP;
  };

  /**
   * Obtiene la experiencia mínima para un nivel específico
   * 
   * @param level - Nivel objetivo (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Experiencia mínima para el nivel
   */
  const getMinXPForLevel = (level: number, multiplier: number = 1): number => {
    if (level < 0 || level > 5) return 0;
    
    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }
    
    return cumulativeXp[level] * multiplier;
  };

  /**
   * Genera el sufijo de experiencia para mostrar
   * 
   * @param level - Nivel actual (0-5)
   * @param multiplier - Multiplicador de la habilidad (1-5)
   * @returns Sufijo de experiencia (ej: "/150 XP" o "MAX")
   */
  const getXPSuffix = (level: number, multiplier: number = 1): string => {
    if (level >= 5) return ' MAX';
    
    if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 5) {
      return '/0 XP';
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier) || multiplier < 1) {
      multiplier = 1;
    }
    
    const xpNeeded = calculateXPNeededForNextLevel(level, multiplier);
    return `/${xpNeeded.toLocaleString()} XP`;
  };

  return {
    // Constantes
    cumulativeXp,
    levelRequirements,
    
    // Funciones de cálculo
    calculateLevel,
    calculateProgressPercentage,
    calculateCurrentLevelXP,
    calculateXPNeededForNextLevel,
    getMinXPForLevel,
    getXPSuffix
  };
}
