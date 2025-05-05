/**
 * @file Composable para gestionar las habilidades del piloto
 * @description Proporciona estado y métodos para obtener las habilidades del piloto
 * @module composables/usePilotSkills
 */

import { ref } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';

/**
 * Interfaz para una categoría de habilidad
 */
export interface SkillCategory {
  /** ID único de la categoría */
  id: number;
  /** Nombre de la categoría */
  name: string;
  /** Descripción de la categoría */
  description?: string;
  /** Icono de la categoría */
  icon?: string;
  /** Orden de la categoría */
  order?: number;
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para la información pivot de la relación entre piloto y habilidad
 */
export interface PilotSkillPivot {
  /** ID del piloto */
  pilot_id: number;
  /** ID de la habilidad */
  skill_id: number;
  /** Nivel actual de la habilidad */
  current_level: number;
  /** Experiencia acumulada */
  xp: number;
  /** Si la habilidad está activa */
  active: boolean;
}

/**
 * Interfaz para una habilidad
 */
export interface Skill {
  /** ID único de la habilidad */
  id: number;
  /** Nombre de la habilidad */
  name: string;
  /** Descripción de la habilidad */
  description?: string;
  /** ID de la categoría a la que pertenece la habilidad */
  category_id?: number;
  /** ID de la categoría a la que pertenece la habilidad (alias para compatibilidad) */
  skill_category_id?: number;
  /** Categoría a la que pertenece la habilidad */
  category?: SkillCategory;
  /** Multiplicador de la habilidad (1-5) */
  multiplier: number;
  /** Icono de la habilidad */
  icon?: string;
  /** Prerrequisitos de la habilidad */
  prerequisites?: Prerequisite[];
  /** Información de la relación pivot cuando la habilidad pertenece a un piloto */
  pivot?: PilotSkillPivot;
  /** Nivel actual de la habilidad (para compatibilidad con vistas existentes) */
  current_level?: number;
  /** Experiencia acumulada (para compatibilidad con vistas existentes) */
  xp?: number;
  /** Si la habilidad está activa (para compatibilidad con vistas existentes) */
  active?: boolean;
  /** Si la habilidad puede ser activada (para compatibilidad con vistas existentes) */
  can_activate?: boolean;
  /** Si la habilidad puede ser desactivada (para compatibilidad con vistas existentes) */
  can_deactivate?: boolean;
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para un prerrequisito de habilidad
 */
export interface Prerequisite {
  /** ID único del prerrequisito */
  id?: number;
  /** ID de la habilidad que tiene el prerrequisito */
  skill_id?: number;
  /** ID de la habilidad prerrequisito */
  prerequisite_id: number;
  /** Nivel requerido de la habilidad prerrequisito */
  prerequisite_level: number;
  /** Información de la relación pivot */
  pivot?: {
    /** Nivel requerido de la habilidad prerrequisito */
    prerequisite_level: number;
  };
  /** Nombre de la habilidad prerrequisito (para compatibilidad con vistas existentes) */
  name?: string;
  /** Si el prerrequisito está cumplido (para compatibilidad con vistas existentes) */
  fulfilled?: boolean;
  /** Habilidad prerrequisito */
  prerequisite?: Skill;
}

/**
 * Interfaz para una habilidad de piloto
 * Esta interfaz extiende la interfaz Skill
 * y añade propiedades específicas para la relación entre piloto y habilidad
 */
export interface PilotSkill extends Skill {
  /** ID del piloto */
  pilot_id?: number;
  /** ID de la habilidad */
  skill_id?: number;
  /** Nivel de la habilidad (alias para current_level) */
  level?: number;
  /** Experiencia acumulada (alias para xp) */
  experience?: number;
  /** ID de la relación entre piloto y habilidad */
  pilot_skill_id?: number | null;
}

/**
 * Composable para gestionar las habilidades del piloto
 * Proporciona estado y métodos para obtener las habilidades del piloto
 *
 * @returns Estado y métodos para gestionar las habilidades del piloto
 */
export function usePilotSkills() {
  const pilotSkills: Ref<PilotSkill[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  /**
   * Obtiene las habilidades del piloto actual
   */
  const fetchCurrentPilotSkills = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/pilots/current/skills');
      pilotSkills.value = response.data;
    } catch (err) {
      console.error('Error fetching pilot skills:', err);
      error.value = 'Error al cargar las habilidades del piloto';
      pilotSkills.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene las habilidades de un piloto específico
   * @param pilotId - ID del piloto
   */
  const fetchPilotSkills = async (pilotId: number): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/pilots/${pilotId}/skills`);
      pilotSkills.value = response.data;
    } catch (err) {
      console.error(`Error fetching skills for pilot ${pilotId}:`, err);
      error.value = 'Error al cargar las habilidades del piloto';
      pilotSkills.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene todas las categorías de habilidades
   * @returns Lista de categorías de habilidades
   */
  const fetchSkillCategories = async (): Promise<SkillCategory[]> => {
    try {
      const response = await api.get('/skills/categories');
      return response.data;
    } catch (err) {
      console.error('Error fetching skill categories:', err);
      return [];
    }
  };

  /**
   * Obtiene todas las habilidades
   * @returns Lista de habilidades
   */
  const fetchAllSkills = async (): Promise<Skill[]> => {
    try {
      const response = await api.get('/skills');
      return response.data;
    } catch (err) {
      console.error('Error fetching all skills:', err);
      return [];
    }
  };

  /**
   * Obtiene las habilidades de una categoría específica
   * @param categoryId - ID de la categoría
   * @returns Lista de habilidades de la categoría
   */
  const fetchSkillsByCategory = async (categoryId: number): Promise<Skill[]> => {
    try {
      const response = await api.get(`/skills/categories/${categoryId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching skills for category ${categoryId}:`, err);
      return [];
    }
  };

  /**
   * Obtiene los detalles de una habilidad específica
   * @param skillId - ID de la habilidad
   * @returns Detalles de la habilidad o null si hay error
   */
  const fetchSkillDetails = async (skillId: number): Promise<Skill | null> => {
    try {
      const response = await api.get(`/skills/${skillId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching details for skill ${skillId}:`, err);
      return null;
    }
  };

  return {
    // Estado
    pilotSkills,
    loading,
    error,

    // Métodos
    fetchCurrentPilotSkills,
    fetchPilotSkills,
    fetchSkillCategories,
    fetchAllSkills,
    fetchSkillsByCategory,
    fetchSkillDetails
  };
}
