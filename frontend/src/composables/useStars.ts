import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

export function useStars() {
  const notificationStore = useNotificationStore();

  // Estado
  const stars = ref([]);
  const totalStars = ref(0);
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
    solar_system_id: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  // Cargar estrellas
  const fetchStars = async () => {
    loading.value = true;

    try {
      const response = await api.get('/admin/stars', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search,
          solar_system_id: filters.solar_system_id,
          sort_field: filters.sort_field,
          sort_direction: filters.sort_direction
        }
      });

      stars.value = response.data.data;
      totalStars.value = response.data.meta.total;
      pagination.totalPages = response.data.meta.last_page;

      return response.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las estrellas');
      console.error('Error fetching stars:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener una estrella por ID
  const getStar = async (id) => {
    loading.value = true;

    try {
      const response = await api.get(`/admin/stars/${id}`);
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar la estrella');
      console.error('Error fetching star:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Cargar todos los sistemas solares para el selector
  const fetchAllSolarSystems = async () => {
    try {
      const response = await api.get('/admin/solar-systems/list-all');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar los sistemas solares');
      console.error('Error fetching solar systems:', error);
      return [];
    }
  };

  // Crear una nueva estrella
  const createStar = async (starData) => {
    loading.value = true;

    try {
      const response = await api.post('/admin/stars', starData);
      notificationStore.adminSuccess('Estrella creada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al crear la estrella');
      console.error('Error creating star:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar una estrella
  const updateStar = async (id, starData) => {
    loading.value = true;

    try {
      const response = await api.put(`/admin/stars/${id}`, starData);
      notificationStore.adminSuccess('Estrella actualizada con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al actualizar la estrella');
      console.error('Error updating star:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar una estrella
  const deleteStar = async (id) => {
    loading.value = true;

    try {
      await api.delete(`/admin/stars/${id}`);
      notificationStore.adminSuccess('Estrella eliminada con éxito');
      await fetchStars(); // Recargar la lista
      return true;
    } catch (error) {
      notificationStore.adminError('Error al eliminar la estrella');
      console.error('Error deleting star:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cambiar página
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchStars();
  };

  // Cambiar elementos por página
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Resetear a la primera página
    fetchStars();
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Resetear a la primera página
    fetchStars();
  };

  // Actualizar ordenación
  const updateSort = (sort) => {
    filters.sort_field = sort.key;
    filters.sort_direction = sort.order;
    fetchStars();
  };

  return {
    stars,
    totalStars,
    loading,
    pagination,
    filters,
    fetchStars,
    getStar,
    fetchAllSolarSystems,
    createStar,
    updateStar,
    deleteStar,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
