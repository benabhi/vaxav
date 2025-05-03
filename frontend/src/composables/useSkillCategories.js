import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

/**
 * Composable para gestionar categorías de habilidades
 * Proporciona estado y métodos para operaciones CRUD de categorías de habilidades
 *
 * @returns {Object} Estado y métodos para gestionar categorías de habilidades
 */
export function useSkillCategories() {
  // Estado
  const categories = ref([]);
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
   * Obtiene la lista de categorías de habilidades con filtros y paginación
   */
  const fetchCategories = async () => {
    loading.value = true;

    try {
      // Construir parámetros de consulta
      const params = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        sort_field: filters.sort_field,
        sort_direction: filters.sort_direction
      };

      // Añadir filtros no vacíos
      if (filters.search) params.search = filters.search;

      // Realizar la petición
      const response = await api.get('/admin/skill-categories', { params });

      if (response.data && response.data.data) {
        // Actualizar el estado
        categories.value = response.data.data;

        // Actualizar la paginación
        if (response.data.meta) {
          pagination.totalPages = response.data.meta.last_page;
          pagination.currentPage = response.data.meta.current_page;
        } else {
          pagination.totalPages = response.data.last_page || 1;
          pagination.currentPage = response.data.current_page || 1;
        }
      } else {
        categories.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      console.error('Error al cargar categorías de habilidades:', error);
      categories.value = [];
      pagination.totalPages = 1;
      notificationStore.adminError('Error al cargar las categorías de habilidades');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea una nueva categoría de habilidad
   * @param {Object} categoryData - Datos de la categoría a crear
   * @returns {Promise<Object|null>} Categoría creada o null si hay error
   */
  const createCategory = async (categoryData) => {
    try {
      const response = await api.post('/admin/skill-categories', categoryData);

      notificationStore.adminSuccess(
        `La categoría "${categoryData.name}" ha sido creada correctamente.`
      );

      await fetchCategories();
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría de habilidad:', error);

      notificationStore.adminError(
        'Ha ocurrido un error al crear la categoría de habilidad.'
      );

      return null;
    }
  };

  /**
   * Actualiza una categoría de habilidad existente
   * @param {number} categoryId - ID de la categoría a actualizar
   * @param {Object} categoryData - Datos actualizados de la categoría
   * @returns {Promise<Object|null>} Categoría actualizada o null si hay error
   */
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/admin/skill-categories/${categoryId}`, categoryData);

      notificationStore.adminSuccess(
        `La categoría "${categoryData.name}" ha sido actualizada correctamente.`
      );

      await fetchCategories();
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría de habilidad:', error);

      notificationStore.adminError(
        'Ha ocurrido un error al actualizar la categoría de habilidad.'
      );

      return null;
    }
  };

  /**
   * Elimina una categoría de habilidad
   * @param {number} categoryId - ID de la categoría a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  const deleteCategory = async (categoryId) => {
    try {
      await api.delete(`/admin/skill-categories/${categoryId}`);

      notificationStore.adminSuccess(
        'La categoría ha sido eliminada correctamente.'
      );

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría de habilidad:', error);

      let errorMessage = 'Ha ocurrido un error al eliminar la categoría de habilidad.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      notificationStore.adminError(errorMessage);

      return false;
    }
  };

  /**
   * Obtiene una categoría de habilidad por su ID
   * @param {number} categoryId - ID de la categoría a obtener
   * @returns {Promise<Object|null>} Categoría o null si hay error
   */
  const getCategory = async (categoryId) => {
    try {
      const response = await api.get(`/admin/skill-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener categoría de habilidad ${categoryId}:`, error);

      if (error.response?.status === 404) {
        notificationStore.adminError(`La categoría con ID ${categoryId} no existe o fue eliminada.`);
      }

      return null;
    }
  };

  /**
   * Cambia la página actual
   * @param {number} page - Número de página
   */
  const changePage = (page) => {
    pagination.currentPage = Number(page);
    fetchCategories();
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = Number(perPage);
    pagination.currentPage = 1;
    fetchCategories();
  };

  /**
   * Actualiza los filtros y recarga los datos
   * @param {Object} newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters) => {
    // Actualizar los filtros
    Object.keys(newFilters).forEach(key => {
      filters[key] = newFilters[key];
    });

    // Resetear a la primera página
    pagination.currentPage = 1;

    // Recargar datos
    fetchCategories();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchCategories();
  };

  /**
   * Restablece todos los filtros a sus valores por defecto
   */
  const resetFilters = () => {
    // Mantener la ordenación actual
    const currentSortField = filters.sort_field;
    const currentSortDirection = filters.sort_direction;

    // Restablecer todos los filtros
    Object.keys(filters).forEach(key => {
      if (key !== 'sort_field' && key !== 'sort_direction') {
        if (typeof filters[key] === 'string') {
          filters[key] = '';
        } else if (Array.isArray(filters[key])) {
          filters[key] = [];
        } else if (typeof filters[key] === 'object' && filters[key] !== null) {
          filters[key] = {};
        } else if (typeof filters[key] === 'number') {
          filters[key] = 0;
        } else if (typeof filters[key] === 'boolean') {
          filters[key] = false;
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
    fetchCategories();
  };

  return {
    // Estado
    categories,
    loading,
    pagination,
    filters,

    // Métodos
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    changePage,
    changePerPage,
    updateFilters,
    updateSort,
    resetFilters
  };
}
