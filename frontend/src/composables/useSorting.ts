/**
 * @file Composable para gestionar la ordenación
 * @description Proporciona estado y métodos para gestionar la ordenación de datos
 * @module composables/useSorting
 */

import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { SortData as SortDataType } from '@/types';

export interface SortOptions {
  initialSortKey?: string | null;
  initialSortOrder?: 'asc' | 'desc';
  onSortChange?: (sortData: SortData) => void;
}

export interface SortData extends SortDataType { }

export interface SortParams {
  sort_field: string | null;
  sort_direction: 'asc' | 'desc';
}

/**
 * Composable para gestionar la ordenación
 *
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar la ordenación
 */
export function useSorting(options: SortOptions = {}) {
  const {
    initialSortKey = null,
    initialSortOrder = 'asc',
    onSortChange = null
  } = options;

  const sortKey: Ref<string | null> = ref(initialSortKey);
  const sortOrder: Ref<'asc' | 'desc'> = ref(initialSortOrder);

  /**
   * Objeto con la información de ordenación actual
   */
  const sort: ComputedRef<SortData> = computed(() => ({
    key: sortKey.value,
    order: sortOrder.value
  }));

  /**
   * Maneja el cambio de ordenación
   * @param key - Clave de ordenación
   */
  const handleSort = (key: string): void => {
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
   * @returns Parámetros de ordenación
   */
  const getSortParams = (): SortParams => ({
    sort_field: sortKey.value,
    sort_direction: sortOrder.value
  });

  /**
   * Actualiza la ordenación
   * @param sortData - Datos de ordenación {key, order}
   */
  const updateSort = (sortData: Partial<SortData>): void => {
    if (sortData.key !== undefined) {
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
