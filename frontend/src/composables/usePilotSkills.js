import { ref } from 'vue';
import api from '@/services/api';

/**
 * Composable para gestionar las habilidades del piloto
 * Proporciona estado y métodos para obtener las habilidades del piloto
 *
 * @returns {Object} Estado y métodos para gestionar las habilidades del piloto
 */
export function usePilotSkills() {
  const pilotSkills = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Obtiene las habilidades del piloto actual
   */
  const fetchCurrentPilotSkills = async () => {
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
   * @param {number} pilotId - ID del piloto
   */
  const fetchPilotSkills = async (pilotId) => {
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
   * @returns {Promise<Array>} Lista de categorías de habilidades
   */
  const fetchSkillCategories = async () => {
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
   * @returns {Promise<Array>} Lista de habilidades
   */
  const fetchAllSkills = async () => {
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
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Array>} Lista de habilidades de la categoría
   */
  const fetchSkillsByCategory = async (categoryId) => {
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
   * @param {number} skillId - ID de la habilidad
   * @returns {Promise<Object|null>} Detalles de la habilidad o null si hay error
   */
  const fetchSkillDetails = async (skillId) => {
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
