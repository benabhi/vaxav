/**
 * @file Configuración de niveles de habilidades para Vaxav
 * @description Este archivo contiene las constantes y configuraciones relacionadas con
 * los niveles de habilidades, experiencia requerida y multiplicadores.
 * @module config/skillLevels
 *
 * @deprecated Las funciones relacionadas con la experiencia y el índice de progresión
 * están siendo migradas al composable useSkillExperience. Se recomienda usar ese composable
 * para nuevas implementaciones.
 */

import api from '@/services/api';
import { useSkillExperience } from '@/composables/useSkillExperience';

/**
 * Tipo para los requisitos de experiencia base
 */
export type XPRequirements = {
  [level: number]: number;
};

/**
 * Tipo para los multiplicadores
 */
export type Multiplier = {
  name: string;
  color: string;
};

/**
 * Tipo para los multiplicadores por nivel
 */
export type Multipliers = {
  [multiplier: number]: Multiplier;
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
 * Obtiene los requisitos de XP desde la API
 * @returns Promesa que resuelve a los requisitos de XP
 *
 * @deprecated Use useSkillExperience().fetchXPRequirements en su lugar
 */
export async function fetchXPRequirements(): Promise<XPRequirements> {
  // Usar el composable para obtener los requisitos de XP
  const { fetchXPRequirements: fetchXP } = useSkillExperience();
  return fetchXP();
}

/**
 * Obtiene los requisitos de XP, utilizando la caché si está disponible
 * @returns Requisitos de XP
 *
 * @deprecated Use useSkillExperience().fetchXPRequirements en su lugar
 */
export async function getXPRequirements(): Promise<XPRequirements> {
  // Usar el composable para obtener los requisitos de XP
  const { fetchXPRequirements: fetchXP } = useSkillExperience();
  return fetchXP();
}

/**
 * Calcula la experiencia acumulada para cada nivel
 * @param baseRequirements - Requisitos de XP base
 * @returns Experiencia acumulada para cada nivel
 */
export function calculateCumulativeXP(baseRequirements: XPRequirements): XPRequirements {
  const cumulative: XPRequirements = { 0: 0 };
  let accumulated = 0;

  for (let i = 0; i < 5; i++) {
    accumulated += baseRequirements[i];
    cumulative[i + 1] = accumulated;
  }

  return cumulative;
}

/**
 * Multiplicadores de experiencia
 * Cada habilidad tiene un multiplicador que afecta la cantidad de XP necesaria
 */
export const MULTIPLIERS: Multipliers = {
  1: { name: 'Básico', color: 'gray' },
  2: { name: 'Intermedio', color: 'green' },
  3: { name: 'Avanzado', color: 'blue' },
  4: { name: 'Experto', color: 'purple' },
  5: { name: 'Maestro', color: 'red' },
};

/**
 * Nivel máximo que puede alcanzar una habilidad
 */
export const MAX_SKILL_LEVEL: number = 5;

/**
 * Calcula la experiencia necesaria para subir del nivel actual al siguiente
 * @param currentLevel - Nivel actual de la habilidad (0-5)
 * @param multiplier - Multiplicador de la habilidad (1-5)
 * @param baseRequirements - Requisitos de XP base
 * @returns Experiencia necesaria para el siguiente nivel
 */
export function getNextLevelXP(
  currentLevel: number,
  multiplier: number = 1,
  baseRequirements: XPRequirements = DEFAULT_XP_REQUIREMENTS
): number {
  // Si ya está en nivel máximo, devolver la experiencia actual
  if (currentLevel >= MAX_SKILL_LEVEL) {
    return 0; // No se necesita más experiencia para subir de nivel
  }

  // Validar parámetros
  if (currentLevel < 0 || currentLevel > 4 || !baseRequirements.hasOwnProperty(currentLevel)) {
    return 0;
  }

  if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
    multiplier = 1;
  }

  // Calcular XP necesaria
  return baseRequirements[currentLevel] * multiplier;
}

/**
 * Calcula el porcentaje de progreso hacia el siguiente nivel
 * @param currentXP - Experiencia actual
 * @param currentLevel - Nivel actual de la habilidad (0-5)
 * @param multiplier - Multiplicador de la habilidad (1-5)
 * @param baseRequirements - Requisitos de XP base
 * @returns Porcentaje de progreso (0-100)
 */
export function getProgressPercentage(
  currentXP: number,
  currentLevel: number,
  multiplier: number = 1,
  baseRequirements: XPRequirements = DEFAULT_XP_REQUIREMENTS
): number {
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

  // Calcular experiencia acumulada
  const cumulativeXP = calculateCumulativeXP(baseRequirements);

  // Calcular XP mínima para el nivel actual
  const minXPForCurrentLevel = cumulativeXP[currentLevel] * multiplier;

  // Calcular XP necesaria para el siguiente nivel
  const xpForNextLevel = cumulativeXP[currentLevel + 1] * multiplier;

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
 * @param multiplier - Multiplicador (1-5)
 * @returns Nombre del color
 */
export function getMultiplierColor(multiplier: number): string {
  return MULTIPLIERS[multiplier]?.color || 'gray';
}

/**
 * Obtiene el nombre asociado a un multiplicador
 * @param multiplier - Multiplicador (1-5)
 * @returns Nombre del multiplicador
 */
export function getMultiplierName(multiplier: number): string {
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
 * @param stats - Objeto con estadísticas del piloto
 * @returns Índice de progresión y sus componentes
 *
 * @deprecated Use useSkillExperience().calculateProgressionIndex en su lugar
 */
export async function calculateProgressionIndex(stats: ProgressionStats): Promise<ProgressionResult> {
  // Usar el composable para calcular el índice de progresión
  const { calculateProgressionIndex: calcPI } = useSkillExperience();
  return calcPI(stats);
}

// Exportar un objeto con todas las funciones y constantes
export default {
  DEFAULT_XP_REQUIREMENTS,
  MULTIPLIERS,
  MAX_SKILL_LEVEL,
  fetchXPRequirements,
  getXPRequirements,
  calculateCumulativeXP,
  getNextLevelXP,
  getProgressPercentage,
  getMultiplierColor,
  getMultiplierName,
  calculateProgressionIndex
};
