import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

export function useRegions() {
  const notificationStore = useNotificationStore();

  // Estado
  const regions = ref([]);
  const totalRegions = ref(0);
  const loading = ref(false);

  // Paginación
  const pagination = reactive({
    currentPage: 1,
    perPage: 10,
    totalPages: 0
  });

  // Filtros
  const filters = reactive({
    search: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  // Cargar regiones
  const fetchRegions = async () => {
    loading.value = true;

    try {
      const response = await api.get('/admin/regions', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search,
          sort_field: filters.sort_field,
          sort_direction: filters.sort_direction
        }
      });

      regions.value = response.data.data;
      totalRegions.value = response.data.meta.total;
      pagination.totalPages = response.data.meta.last_page;

      return response.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las regiones');
      console.error('Error fetching regions:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener una región por ID
  const getRegion = async (id) => {
    loading.value = true;

    try {
      const response = await api.get(`/admin/regions/${id}`);
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar la región');
      console.error('Error fetching region:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Crear una nueva región
  const createRegion = async (regionData) => {
    loading.value = true;

    try {
      const response = await api.post('/admin/regions', regionData);
      notificationStore.adminSuccess('Región creada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al crear la región');
      console.error('Error creating region:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar una región
  const updateRegion = async (id, regionData) => {
    loading.value = true;

    try {
      const response = await api.put(`/admin/regions/${id}`, regionData);
      notificationStore.adminSuccess('Región actualizada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al actualizar la región');
      console.error('Error updating region:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar una región
  const deleteRegion = async (id) => {
    loading.value = true;

    try {
      await api.delete(`/admin/regions/${id}`);
      notificationStore.adminSuccess('Región eliminada con éxito');
      await fetchRegions(); // Recargar la lista
      return true;
    } catch (error) {
      notificationStore.adminError('Error al eliminar la región');
      console.error('Error deleting region:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cambiar página
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchRegions();
  };

  // Cambiar elementos por página
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Resetear a la primera página
    fetchRegions();
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Resetear a la primera página
    fetchRegions();
  };

  // Actualizar ordenación
  const updateSort = (sort) => {
    filters.sort_field = sort.key;
    filters.sort_direction = sort.order;
    fetchRegions();
  };

  // Obtener todas las regiones para selectores
  const fetchAllRegions = async () => {
    try {
      const response = await api.get('/admin/regions/list-all');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las regiones');
      console.error('Error fetching all regions:', error);
      return [];
    }
  };

  return {
    regions,
    totalRegions,
    loading,
    pagination,
    filters,
    fetchRegions,
    getRegion,
    fetchAllRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
