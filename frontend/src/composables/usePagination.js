import { reactive } from 'vue';

/**
 * Composable para gestionar la paginación
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.initialPage=1] - Página inicial
 * @param {number} [options.initialPerPage=10] - Elementos por página inicial
 * @param {Array<number>} [options.perPageOptions=[10, 20, 50, 100]] - Opciones de elementos por página
 * @param {Function} [options.onPageChange=null] - Callback cuando cambia la página
 * @param {Function} [options.onPerPageChange=null] - Callback cuando cambian los elementos por página
 * @returns {Object} Estado y métodos para gestionar la paginación
 */
export function usePagination(options = {}) {
  const {
    initialPage = 1,
    initialPerPage = 10,
    perPageOptions = [10, 20, 50, 100],
    onPageChange = null,
    onPerPageChange = null
  } = options;

  const pagination = reactive({
    currentPage: initialPage,
    totalPages: 1,
    perPage: initialPerPage,
    total: 0,
    perPageOptions
  });

  /**
   * Cambia la página actual
   * @param {number} page - Número de página
   */
  const changePage = (page) => {
    pagination.currentPage = page;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  /**
   * Cambia el número de elementos por página
   * @param {number} perPage - Elementos por página
   */
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Reset to first page
    if (onPerPageChange) {
      onPerPageChange(perPage);
    }
  };

  /**
   * Actualiza la información de paginación desde una respuesta de API
   * @param {Object} response - Respuesta de la API con datos de paginación
   */
  const updatePaginationFromResponse = (response) => {
    if (!response) return;
    
    pagination.total = response.total || 0;
    pagination.totalPages = response.last_page || Math.ceil(pagination.total / pagination.perPage);
    pagination.currentPage = response.current_page || pagination.currentPage;
  };

  /**
   * Formatea las opciones de elementos por página para usar en un select
   * @returns {Array<Object>} Opciones formateadas
   */
  const getPerPageOptions = () => {
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
