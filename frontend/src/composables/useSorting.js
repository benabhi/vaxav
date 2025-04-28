import { ref, computed } from 'vue';

/**
 * Composable para gestionar la ordenación
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} [options.initialSortKey=null] - Clave de ordenación inicial
 * @param {string} [options.initialSortOrder='asc'] - Orden inicial (asc/desc)
 * @param {Function} [options.onSortChange=null] - Callback cuando cambia la ordenación
 * @returns {Object} Estado y métodos para gestionar la ordenación
 */
export function useSorting(options = {}) {
  const {
    initialSortKey = null,
    initialSortOrder = 'asc',
    onSortChange = null
  } = options;

  const sortKey = ref(initialSortKey);
  const sortOrder = ref(initialSortOrder);

  /**
   * Objeto con la información de ordenación actual
   */
  const sort = computed(() => ({
    key: sortKey.value,
    order: sortOrder.value
  }));

  /**
   * Maneja el cambio de ordenación
   * @param {string} key - Clave de ordenación
   */
  const handleSort = (key) => {
    if (sortKey.value === key) {
      // Toggle sort order if the same key is clicked
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort key and reset sort order to asc
      sortKey.value = key;
      sortOrder.value = 'asc';
    }

    if (onSortChange) {
      onSortChange({ key: sortKey.value, order: sortOrder.value });
    }
  };

  /**
   * Obtiene los parámetros de ordenación para una solicitud API
   * @returns {Object} Parámetros de ordenación
   */
  const getSortParams = () => ({
    sort_field: sortKey.value,
    sort_direction: sortOrder.value
  });

  /**
   * Actualiza la ordenación
   * @param {Object} sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData) => {
    if (sortData.key) {
      sortKey.value = sortData.key;
    }
    
    if (sortData.order) {
      sortOrder.value = sortData.order;
    }
    
    if (onSortChange) {
      onSortChange({ key: sortKey.value, order: sortOrder.value });
    }
  };

  return {
    sortKey,
    sortOrder,
    sort,
    handleSort,
    getSortParams,
    updateSort
  };
}
