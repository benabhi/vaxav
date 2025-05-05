/**
 * @file Composable para gestionar habilidades
 * @description Proporciona estado y métodos para operaciones CRUD de habilidades
 * @module composables/useSkills
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';
import { Skill, Prerequisite, SkillCategory } from '@/types';

interface Pagination {
  currentPage: number;
  totalPages: number;
  perPage: number;
}

interface Filters {
  search: string;
  category_id: string;
  multiplier: string;
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

interface SortData {
  key: string;
  order: 'asc' | 'desc';
}

/**
 * Composable para gestionar habilidades
 * Proporciona estado y métodos para operaciones CRUD de habilidades
 *
 * @returns Estado y métodos para gestionar habilidades
 */
export function useSkills() {
  // Estado
  const skills: Ref<Skill[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const pagination: Pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters: Filters = reactive({
    search: '',
    category_id: '',
    multiplier: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de habilidades con filtros y paginación
   */
  const fetchSkills = async (): Promise<void> => {
    loading.value = true;

    try {
      // Construir parámetros de consulta
      const params: Record<string, any> = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        sort_field: filters.sort_field,
        sort_direction: filters.sort_direction
      };

      // Añadir filtros no vacíos
      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.multiplier) params.multiplier = filters.multiplier;

      // Realizar la petición
      const response = await api.get('/admin/skills', { params });

      if (response.data && response.data.data) {
        // Las habilidades ya vienen con los prerrequisitos formateados desde el backend
        skills.value = response.data.data;

        // Actualizar la paginación
        if (response.data.meta) {
          pagination.totalPages = response.data.meta.last_page;
          pagination.currentPage = response.data.meta.current_page;
        } else {
          pagination.totalPages = response.data.last_page || 1;
          pagination.currentPage = response.data.current_page || 1;
        }
      } else {
        skills.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error al cargar habilidades:', error);
      skills.value = [];
      pagination.totalPages = 1;
      notificationStore.adminError('Error al cargar las habilidades');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea una nueva habilidad
   * @param skillData - Datos de la habilidad a crear
   * @returns Habilidad creada o null si hay error
   */
  const createSkill = async (skillData: Partial<Skill>): Promise<Skill | null> => {
    try {
      const response = await api.post('/admin/skills', skillData);

      notificationStore.adminSuccess(
        `La habilidad "${skillData.name}" ha sido creada correctamente.`
      );

      await fetchSkills();
      return response.data;
    } catch (error) {
      console.error('Error al crear habilidad:', error);

      notificationStore.adminError(
        'Ha ocurrido un error al crear la habilidad.'
      );

      return null;
    }
  };

  /**
   * Actualiza una habilidad existente
   * @param skillId - ID de la habilidad a actualizar
   * @param skillData - Datos actualizados de la habilidad
   * @returns Habilidad actualizada o null si hay error
   */
  const updateSkill = async (skillId: number, skillData: Partial<Skill>): Promise<Skill | null> => {
    try {
      const response = await api.put(`/admin/skills/${skillId}`, skillData);

      notificationStore.adminSuccess(
        `La habilidad "${skillData.name}" ha sido actualizada correctamente.`
      );

      await fetchSkills();
      return response.data;
    } catch (error) {
      console.error('Error al actualizar habilidad:', error);

      notificationStore.adminError(
        'Ha ocurrido un error al actualizar la habilidad.'
      );

      return null;
    }
  };

  /**
   * Elimina una habilidad
   * @param skillId - ID de la habilidad a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deleteSkill = async (skillId: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/skills/${skillId}`);

      notificationStore.adminSuccess(
        'La habilidad ha sido eliminada correctamente.'
      );

      await fetchSkills();
      return true;
    } catch (error: any) {
      console.error('Error al eliminar habilidad:', error);

      let errorMessage = 'Ha ocurrido un error al eliminar la habilidad.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      notificationStore.adminError(errorMessage);

      return false;
    }
  };

  /**
   * Obtiene una habilidad por su ID
   * @param skillId - ID de la habilidad a obtener
   * @returns Habilidad o null si hay error
   */
  const getSkill = async (skillId: number): Promise<Skill | null> => {
    try {
      const response = await api.get(`/admin/skills/${skillId}`);

      if (response.data && response.data.id) {
        // Asegurar que los prerrequisitos sean un array
        if (!response.data.prerequisites) {
          response.data.prerequisites = [];
        }

        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error(`Error al obtener habilidad ${skillId}:`, error);

      if (error.response?.status === 404) {
        notificationStore.adminError(`La habilidad con ID ${skillId} no existe o fue eliminada.`);
      }

      return null;
    }
  };

  /**
   * Obtiene todas las habilidades para dropdown
   * @returns Lista de habilidades o null si hay error
   */
  const getSkillsForDropdown = async (): Promise<Skill[] | null> => {
    try {
      const response = await api.get('/admin/skills-dropdown');
      return response.data;
    } catch (error) {
      console.error('Error al obtener habilidades para dropdown:', error);
      return null;
    }
  };

  /**
   * Cambia la página actual
   * @param page - Número de página
   */
  const changePage = (page: number): void => {
    pagination.currentPage = Number(page);
    fetchSkills();
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = Number(perPage);
    pagination.currentPage = 1;
    fetchSkills();
  };

  /**
   * Actualiza los filtros y recarga los datos
   * @param newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters: Partial<Filters>): void => {
    // Actualizar los filtros
    Object.keys(newFilters).forEach(key => {
      if (key in filters) {
        (filters as any)[key] = (newFilters as any)[key];
      }
    });

    // Resetear a la primera página
    pagination.currentPage = 1;

    // Recargar datos
    fetchSkills();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: SortData): void => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchSkills();
  };

  /**
   * Restablece todos los filtros a sus valores por defecto
   */
  const resetFilters = (): void => {
    // Mantener la ordenación actual
    const currentSortField = filters.sort_field;
    const currentSortDirection = filters.sort_direction;

    // Restablecer todos los filtros
    Object.keys(filters).forEach(key => {
      if (key !== 'sort_field' && key !== 'sort_direction') {
        if (typeof (filters as any)[key] === 'string') {
          (filters as any)[key] = '';
        } else if (Array.isArray((filters as any)[key])) {
          (filters as any)[key] = [];
        } else if (typeof (filters as any)[key] === 'object' && (filters as any)[key] !== null) {
          (filters as any)[key] = {};
        } else if (typeof (filters as any)[key] === 'number') {
          (filters as any)[key] = 0;
        } else if (typeof (filters as any)[key] === 'boolean') {
          (filters as any)[key] = false;
        }
      }
    });

    // Restaurar la ordenación
    filters.sort_field = currentSortField;
    filters.sort_direction = currentSortDirection;

    // Restablecer la paginación
    pagination.currentPage = 1;
    pagination.perPage = 10;

    // Recargar datos
    fetchSkills();
  };

  return {
    // Estado
    skills,
    loading,
    pagination,
    filters,

    // Métodos
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    getSkill,
    getSkillsForDropdown,
    changePage,
    changePerPage,
    updateFilters,
    updateSort,
    resetFilters
  };
}
