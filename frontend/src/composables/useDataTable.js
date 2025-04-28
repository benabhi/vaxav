import { usePagination } from './usePagination';
import { useFilters } from './useFilters';
import { useSorting } from './useSorting';

/**
 * Composable para gestionar tablas de datos
 * Combina paginación, filtros y ordenación
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Object} [options.pagination] - Opciones de paginación
 * @param {Object} [options.filters] - Filtros iniciales
 * @param {Object} [options.sorting] - Opciones de ordenación
 * @param {Function} [options.onDataChange] - Callback cuando cambian los datos
 * @returns {Object} Estado y métodos para gestionar tablas de datos
 */
export function useDataTable(options = {}) {
  const {
    pagination: paginationOptions = {},
    filters: initialFilters = {},
    sorting: sortingOptions = {},
    onDataChange = null
  } = options;

  // Función que se ejecuta cuando cambia cualquier parámetro
  const handleDataChange = () => {
    if (onDataChange) {
      const params = {
        ...filters.getFilterParams(),
        ...sorting.getSortParams(),
        page: pagination.pagination.currentPage,
        per_page: pagination.pagination.perPage
      };
      
      onDataChange(params);
    }
  };

  // Inicializar paginación
  const pagination = usePagination({
    ...paginationOptions,
    onPageChange: () => handleDataChange(),
    onPerPageChange: () => handleDataChange()
  });

  // Inicializar filtros
  const filters = useFilters(initialFilters, () => {
    pagination.pagination.currentPage = 1; // Reset to first page
    handleDataChange();
  });

  // Inicializar ordenación
  const sorting = useSorting({
    ...sortingOptions,
    onSortChange: (sortData) => {
      // Actualizar filtros con información de ordenación
      filters.updateFilters({
        sort_field: sortData.key,
        sort_direction: sortData.order
      });
      
      handleDataChange();
    }
  });

  /**
   * Actualiza la tabla con nuevos datos de la API
   * @param {Object} response - Respuesta de la API
   */
  const updateFromResponse = (response) => {
    if (!response) return;
    
    pagination.updatePaginationFromResponse(response);
  };

  /**
   * Obtiene todos los parámetros para una solicitud API
   * @returns {Object} Parámetros combinados
   */
  const getRequestParams = () => {
    return {
      ...filters.getFilterParams(),
      ...sorting.getSortParams(),
      page: pagination.pagination.currentPage,
      per_page: pagination.pagination.perPage
    };
  };

  return {
    // Objetos de estado
    pagination: pagination.pagination,
    filters: filters.filters,
    sortKey: sorting.sortKey,
    sortOrder: sorting.sortOrder,
    
    // Métodos de paginación
    changePage: pagination.changePage,
    changePerPage: pagination.changePerPage,
    getPerPageOptions: pagination.getPerPageOptions,
    
    // Métodos de filtros
    updateFilters: filters.updateFilters,
    resetFilters: filters.resetFilters,
    
    // Métodos de ordenación
    handleSort: sorting.handleSort,
    updateSort: sorting.updateSort,
    
    // Métodos combinados
    updateFromResponse,
    getRequestParams
  };
}
