/**
 * @file Composable para gestionar la paginación
 * @description Proporciona estado y métodos para gestionar la paginación de datos
 * @module composables/usePagination
 */

import { reactive } from 'vue';
import { Pagination as PaginationType } from '@/types';

export interface PaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
  perPageOptions?: number[];
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export interface Pagination extends PaginationType {
  perPageOptions: number[];
}

export interface ApiPaginationResponse {
  total?: number;
  last_page?: number;
  current_page?: number;
  [key: string]: any;
}

/**
 * Composable para gestionar la paginación
 *
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar la paginación
 */
export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPerPage = 10,
    perPageOptions = [10, 20, 50, 100],
    onPageChange = null,
    onPerPageChange = null
  } = options;

  const pagination = reactive<Pagination>({
    currentPage: initialPage,
    totalPages: 1,
    perPage: initialPerPage,
    total: 0,
    perPageOptions
  });

  /**
   * Cambia la página actual
   * @param page - Número de página
   */
  const changePage = (page: number): void => {
    pagination.currentPage = page;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  /**
   * Cambia el número de elementos por página
   * @param perPage - Elementos por página
   */
  const changePerPage = (perPage: number): void => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    if (onPerPageChange) {
      onPerPageChange(perPage);
    }
  };

  /**
   * Actualiza la información de paginación desde una respuesta de API
   * @param response - Respuesta de la API con datos de paginación
   */
  const updatePaginationFromResponse = (response: ApiPaginationResponse | null): void => {
    if (!response) return;

    pagination.total = response.total || 0;
    pagination.totalPages = response.last_page || Math.ceil(pagination.total / pagination.perPage);
    pagination.currentPage = response.current_page || pagination.currentPage;
  };

  /**
   * Formatea las opciones de elementos por página para usar en un select
   * @returns Opciones formateadas
   */
  const getPerPageOptions = (): Array<{ value: number, label: string }> => {
    return pagination.perPageOptions.map(option => ({
      value: option,
      label: option.toString()
    }));
  };

  return {
    pagination,
    changePage,
    changePerPage,
    updatePaginationFromResponse,
    getPerPageOptions
  };
}
