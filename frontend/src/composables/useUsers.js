import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

/**
 * Composable para gestionar usuarios
 * Proporciona estado y métodos para operaciones CRUD de usuarios
 *
 * @returns {Object} Estado y métodos para gestionar usuarios
 */
export function useUsers() {
  const users = ref([]);
  const totalUsers = ref(0);
  const loading = ref(false);
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters = reactive({
    search: '',
    role: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  const notificationStore = useNotificationStore();

  /**
   * Obtiene la lista de usuarios con filtros y paginación
   */
  const fetchUsers = async () => {
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

      users.value = [];
      totalUsers.value = 0;
      pagination.totalPages = 1;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object|null>} Usuario creado o null si hay error
   */
  const createUser = async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);

      notificationStore.adminSuccess(
        `El usuario ${userData.name} ha sido creado correctamente.`
      );

      await fetchUsers();
      return response.data;
    } catch (error) {


      notificationStore.adminError(
        'Ha ocurrido un error al crear el usuario.'
      );

      return null;
    }
  };

  /**
   * Actualiza un usuario existente
   * @param {number} userId - ID del usuario a actualizar
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object|null>} Usuario actualizado o null si hay error
   */
  const updateUser = async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);

      notificationStore.adminSuccess(
        `El usuario ${userData.name} ha sido actualizado correctamente.`
      );

      await fetchUsers();
      return response.data;
    } catch (error) {

      return null;
    }
  };

  /**
   * Elimina un usuario
   * @param {number} userId - ID del usuario a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);

      notificationStore.adminSuccess(
        'El usuario ha sido eliminado correctamente.'
      );

      await fetchUsers();
      return true;
    } catch (error) {


      notificationStore.adminError(
        'Ha ocurrido un error al eliminar el usuario.'
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
    fetchUsers();
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    fetchUsers();
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
    fetchUsers();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
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
