/**
 * @file Composable para gestionar roles
 * @description Proporciona estado y métodos para operaciones CRUD de roles
 * @module composables/useRoles
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';
import type { Permission } from './usePermissions';

/**
 * Interfaz para un rol
 */
export interface Role {
  id: number;
  name: string;
  slug: string;
  permissions?: Permission[];
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
 * Composable para gestionar roles
 * Proporciona estado y métodos para operaciones CRUD de roles
 *
 * @returns Estado y métodos para gestionar roles
 */
export function useRoles() {
  const roles: Ref<Role[]> = ref([]);
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
   * Obtiene la lista de roles con filtros y paginación
   */
  const fetchRoles = async (): Promise<void> => {
    loading.value = true;
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };

      const response = await api.get('/admin/roles', { params });

      if (response.data && response.data.data) {
        roles.value = response.data.data;

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
        roles.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      roles.value = [];
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo rol
   * @param roleData - Datos del rol a crear
   * @returns Rol creado o null si hay error
   */
  const createRole = async (roleData: Partial<Role>): Promise<Role | null> => {
    try {
      const response = await api.post('/admin/roles', roleData);

      notificationStore.adminSuccess(
        `El rol ${roleData.name} ha sido creado correctamente.`
      );

      await fetchRoles();
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al crear el rol.'
      );
      return null;
    }
  };

  /**
   * Actualiza un rol existente
   * @param roleId - ID del rol a actualizar
   * @param roleData - Datos actualizados del rol
   * @returns Rol actualizado o null si hay error
   */
  const updateRole = async (roleId: number, roleData: Partial<Role>): Promise<Role | null> => {
    try {
      const response = await api.put(`/admin/roles/${roleId}`, roleData);

      notificationStore.adminSuccess(
        `El rol ${roleData.name} ha sido actualizado correctamente.`
      );

      await fetchRoles();
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al actualizar el rol.'
      );
      return null;
    }
  };

  /**
   * Elimina un rol
   * @param roleId - ID del rol a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deleteRole = async (roleId: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/roles/${roleId}`);

      notificationStore.adminSuccess(
        'El rol ha sido eliminado correctamente.'
      );

      await fetchRoles();
      return true;
    } catch (error: any) {
      console.error('Error deleting role:', error);
      let errorMessage = 'Ha ocurrido un error al eliminar el rol.';

      if (error.response && error.response.status === 403) {
        errorMessage = 'No tienes permiso para eliminar este rol o es un rol predeterminado del sistema.';
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
    fetchRoles();
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchRoles();
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
    fetchRoles();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: SortData): void => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchRoles();
  };

  return {
    // Estado
    roles,
    loading,
    pagination,
    filters,

    // Métodos
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
