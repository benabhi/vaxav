/**
 * @file Composable para gestionar pilotos desde el panel de administración
 * @description Proporciona estado y métodos para operaciones CRUD de pilotos
 * @module composables/useAdminPilots
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';

/**
 * Interfaz para un piloto
 */
export interface Pilot {
  id: number;
  name: string;
  race: string;
  credits: number;
  user_id: number;
  corporation_id: number | null;
  location_id: number | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  location?: {
    id: number;
    name: string;
  };
  corporation?: {
    id: number;
    name: string;
  };
}

import type { Skill, SkillCategory, Prerequisite, PilotSkill } from '@/composables/usePilotSkills';

/**
 * Interfaz para la paginación
 */
interface Pagination {
  currentPage: number;
  totalPages: number;
  perPage: number;
}

/**
 * Interfaz para los filtros
 */
interface Filters {
  search: string;
  race: string;
  user_id: string;
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

/**
 * Interfaz para los datos de ordenación
 */
interface SortData {
  key: string;
  order: 'asc' | 'desc';
}

/**
 * Composable para gestionar pilotos desde el panel de administración
 * Proporciona estado y métodos para operaciones CRUD de pilotos
 *
 * @returns Estado y métodos para gestionar pilotos
 */
export function useAdminPilots() {
  const pilots: Ref<Pilot[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const pagination: Pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters: Filters = reactive({
    search: '',
    race: '',
    user_id: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de pilotos con filtros y paginación
   */
  const fetchPilots = async (): Promise<void> => {
    loading.value = true;
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };

      const response = await api.get('/admin/pilots', { params });

      if (response.data && response.data.data) {
        pilots.value = response.data.data;

        // Update pagination
        if (response.data.total) {
          pagination.totalPages = Math.ceil(response.data.total / pagination.perPage);
        } else if (response.data.last_page) {
          pagination.totalPages = response.data.last_page;
        }

        if (response.data.current_page) {
          pagination.currentPage = response.data.current_page;
        }
      } else {
        pilots.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error fetching pilots:', error);
      pilots.value = [];
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene un piloto específico
   * @param id - ID del piloto
   * @returns Piloto o null si hay error
   */
  const getPilot = async (id: string | number): Promise<Pilot | null> => {
    try {
      const response = await api.get(`/admin/pilots/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pilot ${id}:`, error);
      notificationStore.adminError(
        'Ha ocurrido un error al cargar los datos del piloto.'
      );
      return null;
    }
  };

  /**
   * Actualiza un piloto existente
   * @param id - ID del piloto a actualizar
   * @param pilotData - Datos actualizados del piloto
   * @returns Piloto actualizado o null si hay error
   */
  const updatePilot = async (id: string | number, pilotData: Partial<Pilot>): Promise<Pilot | null> => {
    try {
      const response = await api.put(`/admin/pilots/${id}`, pilotData);

      notificationStore.adminSuccess(
        `El piloto ${pilotData.name} ha sido actualizado correctamente.`
      );

      await fetchPilots();
      return response.data;
    } catch (error) {
      console.error('Error updating pilot:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al actualizar el piloto.'
      );
      return null;
    }
  };

  /**
   * Elimina un piloto
   * @param id - ID del piloto a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deletePilot = async (id: string | number): Promise<boolean> => {
    try {
      await api.delete(`/admin/pilots/${id}`);

      notificationStore.adminSuccess(
        'El piloto ha sido eliminado correctamente.'
      );

      await fetchPilots();
      return true;
    } catch (error: any) {
      console.error('Error deleting pilot:', error);
      let errorMessage = 'Ha ocurrido un error al eliminar el piloto.';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      notificationStore.adminError(errorMessage);
      return false;
    }
  };

  /**
   * Obtiene las habilidades de un piloto
   * @param id - ID del piloto
   * @returns Habilidades del piloto o array vacío si hay error
   */
  const getPilotSkills = async (id: string | number): Promise<PilotSkill[]> => {
    try {
      const response = await api.get(`/admin/pilots/${id}/skills`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills for pilot ${id}:`, error);
      notificationStore.adminError(
        'Ha ocurrido un error al cargar las habilidades del piloto.'
      );
      return [];
    }
  };

  /**
   * Actualiza una habilidad de un piloto
   * @param pilotId - ID del piloto
   * @param skillId - ID de la habilidad
   * @param skillData - Datos actualizados de la habilidad
   * @returns Resultado de la operación o null si hay error
   */
  const updatePilotSkill = async (
    pilotId: string | number,
    skillId: string | number,
    skillData: { current_level: number; active: boolean; xp?: number }
  ): Promise<any | null> => {
    try {
      const response = await api.put(`/admin/pilots/${pilotId}/skills/${skillId}`, skillData);

      notificationStore.adminSuccess(
        'La habilidad ha sido actualizada correctamente.'
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating pilot skill:', error);
      let errorMessage = 'Ha ocurrido un error al actualizar la habilidad.';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      notificationStore.adminError(errorMessage);
      return null;
    }
  };

  /**
   * Cambia la página actual
   * @param page - Número de página
   */
  const changePage = (page: number): void => {
    pagination.currentPage = page;
    fetchPilots();
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Número de elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchPilots();
  };

  /**
   * Actualiza los filtros y recarga los datos
   * @param newFilters - Nuevos filtros
   */
  const updateFilters = (newFilters: Partial<Filters>): void => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Reset to first page
    fetchPilots();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: SortData): void => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchPilots();
  };

  return {
    // Estado
    pilots,
    loading,
    pagination,
    filters,

    // Métodos
    fetchPilots,
    getPilot,
    updatePilot,
    deletePilot,
    getPilotSkills,
    updatePilotSkill,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
