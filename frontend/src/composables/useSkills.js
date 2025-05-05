import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification.ts';

/**
 * Composable para gestionar habilidades
 * Proporciona estado y métodos para operaciones CRUD de habilidades
 *
 * @returns {Object} Estado y métodos para gestionar habilidades
 */
export function useSkills() {
  // Estado
  const skills = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });
  const filters = reactive({
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
  const fetchSkills = async () => {
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
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.multiplier) params.multiplier = filters.multiplier;

      // Enviando parámetros

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

        // Verificar que los prerrequisitos estén correctamente formateados
        skills.value.forEach(skill => {
          if (skill.prerequisites && skill.prerequisites.length > 0) {
            skill.prerequisites.forEach(prereq => {
              if (!prereq.prerequisite) {
                // Prerrequisito incompleto
              }
            });
          }
        });
      } else {
        skills.value = [];
        pagination.totalPages = 1;
      }
    } catch (error) {
      // Error al cargar habilidades
      skills.value = [];
      pagination.totalPages = 1;
      notificationStore.adminError('Error al cargar las habilidades');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea una nueva habilidad
   * @param {Object} skillData - Datos de la habilidad a crear
   * @returns {Promise<Object|null>} Habilidad creada o null si hay error
   */
  const createSkill = async (skillData) => {
    try {
      const response = await api.post('/admin/skills', skillData);

      notificationStore.adminSuccess(
        `La habilidad "${skillData.name}" ha sido creada correctamente.`
      );

      await fetchSkills();
      return response.data;
    } catch (error) {
      // Error al crear habilidad

      notificationStore.adminError(
        'Ha ocurrido un error al crear la habilidad.'
      );

      return null;
    }
  };

  /**
   * Actualiza una habilidad existente
   * @param {number} skillId - ID de la habilidad a actualizar
   * @param {Object} skillData - Datos actualizados de la habilidad
   * @returns {Promise<Object|null>} Habilidad actualizada o null si hay error
   */
  const updateSkill = async (skillId, skillData) => {
    try {
      const response = await api.put(`/admin/skills/${skillId}`, skillData);

      notificationStore.adminSuccess(
        `La habilidad "${skillData.name}" ha sido actualizada correctamente.`
      );

      await fetchSkills();
      return response.data;
    } catch (error) {
      // Error al actualizar habilidad

      notificationStore.adminError(
        'Ha ocurrido un error al actualizar la habilidad.'
      );

      return null;
    }
  };

  /**
   * Elimina una habilidad
   * @param {number} skillId - ID de la habilidad a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
   */
  const deleteSkill = async (skillId) => {
    try {
      await api.delete(`/admin/skills/${skillId}`);

      notificationStore.adminSuccess(
        'La habilidad ha sido eliminada correctamente.'
      );

      await fetchSkills();
      return true;
    } catch (error) {
      // Error al eliminar habilidad

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
   * @param {number} skillId - ID de la habilidad a obtener
   * @returns {Promise<Object|null>} Habilidad o null si hay error
   */
  const getSkill = async (skillId) => {
    try {
      const response = await api.get(`/admin/skills/${skillId}`);

      if (response.data && response.data.id) {
        // Asegurar que los prerrequisitos sean un array
        if (!response.data.prerequisites) {
          response.data.prerequisites = [];
        }

        // Habilidad obtenida con sus prerrequisitos

        return response.data;
      }

      return null;
    } catch (error) {
      // Error al obtener habilidad

      if (error.response?.status === 404) {
        notificationStore.adminError(`La habilidad con ID ${skillId} no existe o fue eliminada.`);
      }

      return null;
    }
  };

  /**
   * Obtiene todas las habilidades para dropdown
   * @returns {Promise<Array|null>} Lista de habilidades o null si hay error
   */
  const getSkillsForDropdown = async () => {
    try {
      const response = await api.get('/admin/skills-dropdown');
      return response.data;
    } catch (error) {
      // Error al obtener habilidades para dropdown
      return null;
    }
  };

  /**
   * Cambia la página actual
   * @param {number} page - Número de página
   */
  const changePage = (page) => {
    pagination.currentPage = Number(page);
    fetchSkills();
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = Number(perPage);
    pagination.currentPage = 1;
    fetchSkills();
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
    fetchSkills();
  };

  /**
   * Actualiza la ordenación y recarga los datos
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
    filters.sort_field = sortData.key;
    filters.sort_direction = sortData.order;
    fetchSkills();
  };

  /**
   * Restablece todos los filtros a sus valores por defecto
   */
  const resetFilters = () => {
    // Restableciendo filtros

    // Mantener la ordenación actual
    const currentSortField = filters.sort_field;
    const currentSortDirection = filters.sort_direction;

    // Restablecer todos los filtros
    Object.keys(filters).forEach(key => {
      if (key !== 'sort_field' && key !== 'sort_direction') {
        // Asegurarnos de que los filtros se limpien correctamente
        // Para los filtros de tipo string, establecer a cadena vacía
        // para que se muestre el placeholder "Todos"
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

    // Filtros restablecidos

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
