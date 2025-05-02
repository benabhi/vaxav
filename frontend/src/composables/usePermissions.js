import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

/**
 * Composable para gestionar permisos
 * Proporciona estado y métodos para operaciones CRUD de permisos
 *
 * @returns {Object} Estado y métodos para gestionar permisos
 */
export function usePermissions() {
  const permissions = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters = reactive({
    search: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de permisos con filtros y paginación
   */
  const fetchPermissions = async () => {
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

      permissions.value = [];
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo permiso
   * @param {Object} permissionData - Datos del permiso a crear
   * @returns {Promise<Object|null>} Permiso creado o null si hay error
   */
  const createPermission = async (permissionData) => {
    try {
      const response = await api.post('/admin/permissions', permissionData);

      notificationStore.adminSuccess(
        `El permiso ${permissionData.name} ha sido creado correctamente.`
      );

      await fetchPermissions();
      return response.data;
    } catch (error) {


      notificationStore.adminError(
        'Ha ocurrido un error al crear el permiso.'
      );

      return null;
    }
  };

  /**
   * Actualiza un permiso existente
   * @param {number} permissionId - ID del permiso a actualizar
   * @param {Object} permissionData - Datos actualizados del permiso
   * @returns {Promise<Object|null>} Permiso actualizado o null si hay error
   */
  const updatePermission = async (permissionId, permissionData) => {
    try {
      const response = await api.put(`/admin/permissions/${permissionId}`, permissionData);

      notificationStore.adminSuccess(
        `El permiso ${permissionData.name} ha sido actualizado correctamente.`
      );

      await fetchPermissions();
      return response.data;
    } catch (error) {


      notificationStore.adminError(
        'Ha ocurrido un error al actualizar el permiso.'
      );

      return null;
    }
  };

  /**
   * Elimina un permiso
   * @param {number} permissionId - ID del permiso a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  const deletePermission = async (permissionId) => {
    try {
      await api.delete(`/admin/permissions/${permissionId}`);

      notificationStore.adminSuccess(
        'El permiso ha sido eliminado correctamente.'
      );

      await fetchPermissions();
      return true;
    } catch (error) {


      let errorMessage = 'Ha ocurrido un error al eliminar el permiso.';

      if (error.response && error.response.status === 403) {
        errorMessage = 'No tienes permiso para eliminar este permiso o es un permiso predeterminado del sistema.';
      }

      notificationStore.adminError(
        errorMessage
      );

      return false;
    }
  };

  /**
   * Cambia la página actual
   * @param {number} page - Número de página
   */
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchPermissions();
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchPermissions();
  };

  /**
   * Actualiza los filtros y recarga los datos
   * @param {Object} newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters) => {
    Object.keys(newFilters).forEach(key => {
      filters[key] = newFilters[key];
    });
    pagination.currentPage = 1; // Reset to first page
    fetchPermissions();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchPermissions();
  };

  /**
   * Obtiene todos los permisos sin paginación
   * @returns {Promise<Array>} Lista de todos los permisos
   */
  const getAllPermissions = async () => {
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
