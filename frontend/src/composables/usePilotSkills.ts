/**
 * @file Composable para gestionar las habilidades del piloto
 * @description Proporciona estado y métodos para obtener las habilidades del piloto
 * @module composables/usePilotSkills
 */

import { ref } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';

/**
 * Interfaz para una habilidad
 */
export interface Skill {
  id: number;
  name: string;
  slug: string;
  description?: string;
  multiplier: number;
  category_id: number;
  category?: SkillCategory;
  prerequisites?: SkillPrerequisite[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz para una categoría de habilidades
 */
export interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz para un prerrequisito de habilidad
 */
export interface SkillPrerequisite {
  id: number;
  skill_id: number;
  required_skill_id: number;
  required_level: number;
  created_at?: string;
  updated_at?: string;
  required_skill?: Skill;
}

/**
 * Interfaz para una habilidad de piloto
 */
export interface PilotSkill {
  id: number;
  pilot_id: number;
  skill_id: number;
  level: number;
  experience: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  skill?: Skill;
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
