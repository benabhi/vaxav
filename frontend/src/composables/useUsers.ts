/**
 * @file Composable para gestionar usuarios
 * @description Proporciona estado y métodos para operaciones CRUD de usuarios
 * @module composables/useUsers
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';
import { User, Role } from '@/types';

interface Pagination {
  currentPage: number;
  totalPages: number;
  perPage: number;
}

interface Filters {
  search: string;
  role: string;
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

interface SortData {
  key: string;
  order: 'asc' | 'desc';
}

/**
 * Composable para gestionar usuarios
 * Proporciona estado y métodos para operaciones CRUD de usuarios
 *
 * @returns Estado y métodos para gestionar usuarios
 */
export function useUsers() {
  const users: Ref<User[]> = ref([]);
  const totalUsers: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(false);
  const pagination: Pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters: Filters = reactive({
    search: '',
    role: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de usuarios con filtros y paginación
   */
  const fetchUsers = async (): Promise<void> => {
    loading.value = true;
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };

      const response = await api.get('/admin/users', { params });

      if (response.data && response.data.data) {
        users.value = response.data.data;
        totalUsers.value = response.data.total || response.data.data.length;
        pagination.totalPages = response.data.last_page || Math.ceil(totalUsers.value / pagination.perPage);
        pagination.currentPage = response.data.current_page || pagination.currentPage;
      } else {
        users.value = [];
        totalUsers.value = 0;
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      users.value = [];
      totalUsers.value = 0;
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado o null si hay error
   */
  const createUser = async (userData: Partial<User>): Promise<User | null> => {
    try {
      const response = await api.post('/admin/users', userData);

      notificationStore.adminSuccess(
        `El usuario ${userData.name} ha sido creado correctamente.`
      );

      await fetchUsers();
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al crear el usuario.'
      );

      return null;
    }
  };

  /**
   * Actualiza un usuario existente
   * @param userId - ID del usuario a actualizar
   * @param userData - Datos actualizados del usuario
   * @returns Usuario actualizado o null si hay error
   */
  const updateUser = async (userId: number, userData: Partial<User>): Promise<User | null> => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);

      notificationStore.adminSuccess(
        `El usuario ${userData.name} ha sido actualizado correctamente.`
      );

      await fetchUsers();
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al actualizar el usuario.'
      );
      return null;
    }
  };

  /**
   * Elimina un usuario
   * @param userId - ID del usuario a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  const deleteUser = async (userId: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/users/${userId}`);

      notificationStore.adminSuccess(
        'El usuario ha sido eliminado correctamente.'
      );

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      notificationStore.adminError(
        'Ha ocurrido un error al eliminar el usuario.'
      );

      return false;
    }
  };

  /**
   * Cambia la página actual
   * @param page - Número de página
   */
  const changePage = (page: number): void => {
    pagination.currentPage = page;
    fetchUsers();
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchUsers();
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
    fetchUsers();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: SortData): void => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchUsers();
  };

  return {
    // Estado
    users,
    totalUsers,
    loading,
    pagination,
    filters,

    // Métodos
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
