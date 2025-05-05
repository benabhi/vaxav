/**
 * @file Composable para gestionar filtros
 * @description Proporciona estado y métodos para gestionar filtros de datos
 * @module composables/useFilters
 */

import { reactive } from 'vue';
import { Filters } from '@/types';

export interface DefaultFilters extends Filters {
  search: string;
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

/**
 * Composable para gestionar filtros
 *
 * @param initialFilters - Filtros iniciales
 * @param onFilterChange - Callback cuando cambian los filtros
 * @returns Estado y métodos para gestionar filtros
 */
export function useFilters<T extends Record<string, any> = DefaultFilters>(
  initialFilters: Partial<T> = {},
  onFilterChange: ((filters: T) => void) | null = null
) {
  const defaultFilters: DefaultFilters = {
    search: '',
    sort_field: 'name',
    sort_direction: 'asc'
  };

  const filters = reactive({
    ...defaultFilters,
    ...initialFilters
  }) as T;

  /**
   * Actualiza los filtros
   * @param newFilters - Nuevos filtros a aplicar
   */
  const updateFilters = (newFilters: Partial<T>): void => {
    Object.keys(newFilters).forEach(key => {
      if (key in filters) {
        (filters as any)[key] = (newFilters as any)[key];
      }
    });

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  /**
   * Restablece los filtros a sus valores por defecto
   * @param excludeKeys - Claves a excluir del restablecimiento
   */
  const resetFilters = (excludeKeys: string[] = ['sort_field', 'sort_direction']): void => {
    Object.keys(filters).forEach(key => {
      if (!excludeKeys.includes(key)) {
        if (typeof (filters as any)[key] === 'string') {
          (filters as any)[key] = '';
        } else if (Array.isArray((filters as any)[key])) {
          (filters as any)[key] = [];
        } else if (typeof (filters as any)[key] === 'object' && (filters as any)[key] !== null) {
          (filters as any)[key] = {};
        } else if (typeof (filters as any)[key] === 'number') {
          (filters as any)[key] = 0;
        } else if (typeof (filters as any)[key] === 'boolean') {
          (filters as any)[key] = false;
        }
      }
    });

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  /**
   * Obtiene los parámetros de filtro para una solicitud API
   * @returns Parámetros de filtro
   */
  const getFilterParams = (): T => {
    return { ...filters };
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    getFilterParams
  };
}
