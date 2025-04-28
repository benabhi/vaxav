import { reactive } from 'vue';

/**
 * Composable para gestionar filtros
 * 
 * @param {Object} initialFilters - Filtros iniciales
 * @param {Function} [onFilterChange=null] - Callback cuando cambian los filtros
 * @returns {Object} Estado y métodos para gestionar filtros
 */
export function useFilters(initialFilters = {}, onFilterChange = null) {
  const defaultFilters = {
    search: '',
    sort_field: 'name',
    sort_direction: 'asc'
  };

  const filters = reactive({
    ...defaultFilters,
    ...initialFilters
  });

  /**
   * Actualiza los filtros
   * @param {Object} newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters) => {
    Object.keys(newFilters).forEach(key => {
      filters[key] = newFilters[key];
    });

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  /**
   * Restablece los filtros a sus valores por defecto
   * @param {Array<string>} [excludeKeys=[]] - Claves a excluir del restablecimiento
   */
  const resetFilters = (excludeKeys = ['sort_field', 'sort_direction']) => {
    Object.keys(filters).forEach(key => {
      if (!excludeKeys.includes(key)) {
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

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  /**
   * Obtiene los parámetros de filtro para una solicitud API
   * @returns {Object} Parámetros de filtro
   */
  const getFilterParams = () => {
    return { ...filters };
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    getFilterParams
  };
}
