import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

/**
 * Composable para gestionar roles
 * Proporciona estado y métodos para operaciones CRUD de roles
 * 
 * @returns {Object} Estado y métodos para gestionar roles
 */
export function useRoles() {
  const roles = ref([]);
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
   * Obtiene la lista de roles con filtros y paginación
   */
  const fetchRoles = async () => {
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
        console.error('Unexpected API response format:', response.data);
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
   * @param {Object} roleData - Datos del rol a crear
   * @returns {Promise<Object|null>} Rol creado o null si hay error
   */
  const createRole = async (roleData) => {
    try {
      const response = await api.post('/admin/roles', roleData);
      
      notificationStore.success(
        `El rol ${roleData.name} ha sido creado correctamente.`,
        'Rol creado'
      );
      
      await fetchRoles();
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  };

  /**
   * Actualiza un rol existente
   * @param {number} roleId - ID del rol a actualizar
   * @param {Object} roleData - Datos actualizados del rol
   * @returns {Promise<Object|null>} Rol actualizado o null si hay error
   */
  const updateRole = async (roleId, roleData) => {
    try {
      const response = await api.put(`/admin/roles/${roleId}`, roleData);
      
      notificationStore.success(
        `El rol ${roleData.name} ha sido actualizado correctamente.`,
        'Rol actualizado'
      );
      
      await fetchRoles();
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  };

  /**
   * Elimina un rol
   * @param {number} roleId - ID del rol a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  const deleteRole = async (roleId) => {
    try {
      await api.delete(`/admin/roles/${roleId}`);
      
      notificationStore.success(
        'El rol ha sido eliminado correctamente.',
        'Rol eliminado'
      );
      
      await fetchRoles();
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      
      let errorMessage = 'Ha ocurrido un error al eliminar el rol.';
      
      if (error.response && error.response.status === 403) {
        errorMessage = 'No tienes permiso para eliminar este rol o es un rol predeterminado del sistema.';
      }
      
      notificationStore.error(
        errorMessage,
        'Error'
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
    fetchRoles();
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchRoles();
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
    fetchRoles();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
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
