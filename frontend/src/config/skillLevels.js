/**
 * Configuración de niveles de habilidades para Vaxav
 *
 * Este archivo contiene las constantes y configuraciones relacionadas con
 * los niveles de habilidades, experiencia requerida y multiplicadores.
 */

/**
 * Experiencia base requerida para cada nivel
 * El índice representa el nivel actual, y el valor es la XP necesaria para alcanzar el siguiente nivel
 * Nivel 0 -> 1: 50 XP
 * Nivel 1 -> 2: 150 XP
 * Nivel 2 -> 3: 300 XP
 * Nivel 3 -> 4: 600 XP
 * Nivel 4 -> 5: 1000 XP
 */
export const BASE_XP_REQUIREMENTS = {
  0: 50,    // Para nivel 1
  1: 150,   // Para nivel 2
  2: 300,   // Para nivel 3
  3: 600,   // Para nivel 4
  4: 1000,  // Para nivel 5
};

/**
 * Experiencia acumulada para cada nivel
 * El índice representa el nivel, y el valor es la XP acumulada para ese nivel
 */
export const CUMULATIVE_XP = {
  0: 0,      // Nivel 0
  1: 50,     // Nivel 1
  2: 200,    // Nivel 2 (50 + 150)
  3: 500,    // Nivel 3 (50 + 150 + 300)
  4: 1100,   // Nivel 4 (50 + 150 + 300 + 600)
  5: 2100,   // Nivel 5 (50 + 150 + 300 + 600 + 1000)
};

/**
 * Multiplicadores de experiencia
 * Cada habilidad tiene un multiplicador que afecta la cantidad de XP necesaria
 */
export const MULTIPLIERS = {
  1: { name: 'Básico', color: 'gray' },
  2: { name: 'Intermedio', color: 'green' },
  3: { name: 'Avanzado', color: 'blue' },
  4: { name: 'Experto', color: 'purple' },
  5: { name: 'Maestro', color: 'red' },
};

/**
 * Nivel máximo que puede alcanzar una habilidad
 */
export const MAX_SKILL_LEVEL = 5;

/**
 * Calcula la experiencia necesaria para subir del nivel actual al siguiente
 * @param {number} currentLevel - Nivel actual de la habilidad (0-5)
 * @param {number} multiplier - Multiplicador de la habilidad (1-5)
 * @returns {number} Experiencia necesaria para el siguiente nivel
 */
export function getNextLevelXP(currentLevel, multiplier = 1) {
  // Si ya está en nivel máximo, devolver la experiencia actual
  if (currentLevel >= MAX_SKILL_LEVEL) {
    return 0; // No se necesita más experiencia para subir de nivel
  }

  // Validar parámetros
  if (currentLevel < 0 || currentLevel > 4 || !BASE_XP_REQUIREMENTS.hasOwnProperty(currentLevel)) {
    return 0;
  }

  if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
    multiplier = 1;
  }

  // Calcular XP necesaria
  return BASE_XP_REQUIREMENTS[currentLevel] * multiplier;
}

/**
 * Calcula el porcentaje de progreso hacia el siguiente nivel
 * @param {number} currentXP - Experiencia actual
 * @param {number} currentLevel - Nivel actual de la habilidad (0-5)
 * @param {number} multiplier - Multiplicador de la habilidad (1-5)
 * @returns {number} Porcentaje de progreso (0-100)
 */
export function getProgressPercentage(currentXP, currentLevel, multiplier = 1) {
  // Si ya está en nivel máximo, retornar 100%
  if (currentLevel >= MAX_SKILL_LEVEL) {
    return 100;
  }

  // Validar parámetros
  if (currentLevel < 0 || currentLevel > 4) {
    return 0;
  }

  if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
    multiplier = 1;
  }

  // Calcular XP mínima para el nivel actual
  const minXPForCurrentLevel = CUMULATIVE_XP[currentLevel] * multiplier;

  // Calcular XP necesaria para el siguiente nivel
  const xpForNextLevel = CUMULATIVE_XP[currentLevel + 1] * multiplier;

  // Calcular cuánta experiencia ha ganado desde el nivel actual
  const xpGainedSinceCurrentLevel = currentXP - minXPForCurrentLevel;

  // Calcular cuánta experiencia necesita para el siguiente nivel desde el nivel actual
  const xpNeededForNextLevel = xpForNextLevel - minXPForCurrentLevel;

  // Evitar división por cero
  if (xpNeededForNextLevel <= 0) {
    return 0;
  }

  // Calcular el porcentaje
  const percentage = Math.min(100, Math.round((xpGainedSinceCurrentLevel / xpNeededForNextLevel) * 100));

  // Asegurarse de que el porcentaje sea un número válido
  return isNaN(percentage) ? 0 : percentage;
}

/**
 * Obtiene el color asociado a un multiplicador
 * @param {number} multiplier - Multiplicador (1-5)
 * @returns {string} Nombre del color
 */
export function getMultiplierColor(multiplier) {
  return MULTIPLIERS[multiplier]?.color || 'gray';
}

/**
 * Obtiene el nombre asociado a un multiplicador
 * @param {number} multiplier - Multiplicador (1-5)
 * @returns {string} Nombre del multiplicador
 */
export function getMultiplierName(multiplier) {
  return MULTIPLIERS[multiplier]?.name || 'Básico';
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
 * @param {Object} stats - Objeto con estadísticas del piloto
 * @param {number} stats.totalSkills - Total de habilidades disponibles
 * @param {number} stats.learnedSkills - Habilidades aprendidas por el piloto
 * @param {number} stats.activeSkills - Habilidades activas del piloto
 * @param {number} stats.totalXP - Experiencia total acumulada
 * @param {Array} stats.skillsByLevel - Array con cantidad de habilidades por nivel
 * @param {Object} stats.multiplierStats - Objeto con cantidad de habilidades por multiplicador
 * @returns {Object} Índice de progresión y sus componentes
 */
export function calculateProgressionIndex(stats) {
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
    console.error('Error al calcular el Índice de Progresión:', error);
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
}

export default {
  BASE_XP_REQUIREMENTS,
  CUMULATIVE_XP,
  MULTIPLIERS,
  MAX_SKILL_LEVEL,
  getNextLevelXP,
  getProgressPercentage,
  getMultiplierColor,
  getMultiplierName,
  calculateProgressionIndex
};
