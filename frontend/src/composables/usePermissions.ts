/**
 * @file Composable para gestionar permisos
 * @description Proporciona estado y métodos para operaciones CRUD de permisos
 * @module composables/usePermissions
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';

/**
 * Interfaz para un permiso
 */
export interface Permission {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

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
 * Composable para gestionar permisos
 * Proporciona estado y métodos para operaciones CRUD de permisos
 *
 * @returns Estado y métodos para gestionar permisos
 */
export function usePermissions() {
  const permissions: Ref<Permission[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const pagination: Pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters: Filters = reactive({
    search: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de permisos con filtros y paginación
   */
  const fetchPermissions = async (): Promise<void> => {
    loading.value = true;
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };

      const response = await api.get('/admin/permissions', { params });

      if (response.data && response.data.data) {
        permissions.value = response.data.data;

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
        permissions.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      permissions.value = [];
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo permiso
   * @param permissionData - Datos del permiso a crear
   * @returns Permiso creado o null si hay error
   */
  const createPermission = async (permissionData: Partial<Permission>): Promise<Permission | null> => {
    try {
      const response = await api.post('/admin/permissions', permissionData);

      notificationStore.adminSuccess(
        `El permiso ${permissionData.name} ha sido creado correctamente.`
      );

      await fetchPermissions();
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al crear el permiso.'
      );

      return null;
    }
  };

  /**
   * Actualiza un permiso existente
   * @param permissionId - ID del permiso a actualizar
   * @param permissionData - Datos actualizados del permiso
   * @returns Permiso actualizado o null si hay error
   */
  const updatePermission = async (permissionId: number, permissionData: Partial<Permission>): Promise<Permission | null> => {
    try {
      const response = await api.put(`/admin/permissions/${permissionId}`, permissionData);

      notificationStore.adminSuccess(
        `El permiso ${permissionData.name} ha sido actualizado correctamente.`
      );

      await fetchPermissions();
      return response.data;
    } catch (error) {
      console.error('Error updating permission:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al actualizar el permiso.'
      );

      return null;
    }
  };

  /**
   * Elimina un permiso
   * @param permissionId - ID del permiso a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deletePermission = async (permissionId: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/permissions/${permissionId}`);

      notificationStore.adminSuccess(
        'El permiso ha sido eliminado correctamente.'
      );

      await fetchPermissions();
      return true;
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      let errorMessage = 'Ha ocurrido un error al eliminar el permiso.';

      if (error.response && error.response.status === 403) {
        errorMessage = 'No tienes permiso para eliminar este permiso o es un permiso predeterminado del sistema.';
      }

      notificationStore.adminError(errorMessage);
      return false;
    }
  };

  /**
   * Cambia la página actual
   * @param page - Número de página
   */
  const changePage = (page: number): void => {
    pagination.currentPage = page;
    fetchPermissions();
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchPermissions();
  };

  /**
   * Actualiza los filtros y recarga los datos
   * @param newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters: Partial<Filters>): void => {
    Object.keys(newFilters).forEach(key => {
      if (key in filters) {
        (filters as any)[key] = (newFilters as any)[key];
      }
    });
    pagination.currentPage = 1; // Reset to first page
    fetchPermissions();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: SortData): void => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchPermissions();
  };

  /**
   * Obtiene todos los permisos sin paginación
   * @returns Lista de todos los permisos
   */
  const getAllPermissions = async (): Promise<Permission[]> => {
    try {
      const response = await api.get('/admin/permissions');

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        console.error('Unexpected API response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  };

  return {
    // Estado
    permissions,
    loading,
    pagination,
    filters,

    // Métodos
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    changePage,
    changePerPage,
    updateFilters,
    updateSort,
    getAllPermissions
  };
}
