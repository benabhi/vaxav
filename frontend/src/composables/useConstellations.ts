import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

export function useConstellations() {
  const notificationStore = useNotificationStore();

  // Estado
  const constellations = ref([]);
  const totalConstellations = ref(0);
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
    region_id: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  // Cargar constelaciones
  const fetchConstellations = async () => {
    loading.value = true;

    try {
      const response = await api.get('/admin/constellations', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search,
          region_id: filters.region_id,
          sort_field: filters.sort_field,
          sort_direction: filters.sort_direction
        }
      });

      constellations.value = response.data.data;
      totalConstellations.value = response.data.meta.total;
      pagination.totalPages = response.data.meta.last_page;

      return response.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las constelaciones');
      console.error('Error fetching constellations:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener una constelación por ID
  const getConstellation = async (id) => {
    loading.value = true;

    try {
      const response = await api.get(`/admin/constellations/${id}`);
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar la constelación');
      console.error('Error fetching constellation:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Cargar todas las regiones para el selector
  const fetchAllRegions = async () => {
    try {
      const response = await api.get('/admin/regions/list-all');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las regiones');
      console.error('Error fetching regions:', error);
      return [];
    }
  };

  // Crear una nueva constelación
  const createConstellation = async (constellationData) => {
    loading.value = true;

    try {
      const response = await api.post('/admin/constellations', constellationData);
      notificationStore.adminSuccess('Constelación creada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al crear la constelación');
      console.error('Error creating constellation:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar una constelación
  const updateConstellation = async (id, constellationData) => {
    loading.value = true;

    try {
      const response = await api.put(`/admin/constellations/${id}`, constellationData);
      notificationStore.adminSuccess('Constelación actualizada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al actualizar la constelación');
      console.error('Error updating constellation:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar una constelación
  const deleteConstellation = async (id) => {
    loading.value = true;

    try {
      await api.delete(`/admin/constellations/${id}`);
      notificationStore.adminSuccess('Constelación eliminada con éxito');
      await fetchConstellations(); // Recargar la lista
      return true;
    } catch (error) {
      notificationStore.adminError('Error al eliminar la constelación');
      console.error('Error deleting constellation:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cambiar página
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchConstellations();
  };

  // Cambiar elementos por página
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Resetear a la primera página
    fetchConstellations();
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Resetear a la primera página
    fetchConstellations();
  };

  // Actualizar ordenación
  const updateSort = (sort) => {
    filters.sort_field = sort.key;
    filters.sort_direction = sort.order;
    fetchConstellations();
  };

  return {
    constellations,
    totalConstellations,
    loading,
    pagination,
    filters,
    fetchConstellations,
    getConstellation,
    fetchAllRegions,
    createConstellation,
    updateConstellation,
    deleteConstellation,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
