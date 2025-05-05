/**
 * @file Composable para gestionar tablas de datos
 * @description Combina paginación, filtros y ordenación para tablas de datos
 * @module composables/useDataTable
 */

import { usePagination, PaginationOptions, ApiPaginationResponse } from './usePagination';
import { useFilters, DefaultFilters } from './useFilters';
import { useSorting, SortOptions } from './useSorting';

export interface DataTableOptions<T extends Record<string, any> = DefaultFilters> {
  pagination?: PaginationOptions;
  filters?: Partial<T>;
  sorting?: SortOptions;
  onDataChange?: (params: Record<string, any>) => void;
}

export interface RequestParams extends Record<string, any> {
  page: number;
  per_page: number;
  sort_field: string | null;
  sort_direction: 'asc' | 'desc';
}

/**
 * Composable para gestionar tablas de datos
 * Combina paginación, filtros y ordenación
 * 
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar tablas de datos
 */
export function useDataTable<T extends Record<string, any> = DefaultFilters>(options: DataTableOptions<T> = {}) {
  const {
    pagination: paginationOptions = {},
    filters: initialFilters = {} as Partial<T>,
    sorting: sortingOptions = {},
    onDataChange = null
  } = options;

  // Función que se ejecuta cuando cambia cualquier parámetro
  const handleDataChange = (): void => {
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
  const filters = useFilters<T>(initialFilters, () => {
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
      } as unknown as Partial<T>);
      
      handleDataChange();
    }
  });

  /**
   * Actualiza la tabla con nuevos datos de la API
   * @param response - Respuesta de la API
   */
  const updateFromResponse = (response: ApiPaginationResponse | null): void => {
    if (!response) return;
    
    pagination.updatePaginationFromResponse(response);
  };

  /**
   * Obtiene todos los parámetros para una solicitud API
   * @returns Parámetros combinados
   */
  const getRequestParams = (): RequestParams => {
    return {
      ...filters.getFilterParams(),
      ...sorting.getSortParams(),
      page: pagination.pagination.currentPage,
      per_page: pagination.pagination.perPage
    } as RequestParams;
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
