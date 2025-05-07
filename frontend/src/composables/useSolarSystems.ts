import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

export function useSolarSystems() {
  const notificationStore = useNotificationStore();

  // Estado
  const solarSystems = ref([]);
  const totalSolarSystems = ref(0);
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
    constellation_id: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  // Cargar sistemas solares
  const fetchSolarSystems = async () => {
    loading.value = true;

    try {
      const response = await api.get('/admin/solar-systems', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search,
          constellation_id: filters.constellation_id,
          sort_field: filters.sort_field,
          sort_direction: filters.sort_direction
        }
      });

      solarSystems.value = response.data.data;
      totalSolarSystems.value = response.data.meta.total;
      pagination.totalPages = response.data.meta.last_page;

      return response.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar los sistemas solares');
      console.error('Error fetching solar systems:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener un sistema solar por ID
  const getSolarSystem = async (id) => {
    loading.value = true;

    try {
      const response = await api.get(`/admin/solar-systems/${id}`);
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar el sistema solar');
      console.error('Error fetching solar system:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Cargar todas las constelaciones para el selector
  const fetchAllConstellations = async () => {
    try {
      const response = await api.get('/admin/constellations/list-all');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las constelaciones');
      console.error('Error fetching constellations:', error);
      return [];
    }
  };

  // Cargar todas las estrellas para el selector
  const fetchAllStars = async () => {
    try {
      const response = await api.get('/admin/stars/list-all');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar las estrellas');
      console.error('Error fetching stars:', error);
      return [];
    }
  };

  // Crear un nuevo sistema solar
  const createSolarSystem = async (solarSystemData) => {
    loading.value = true;

    try {
      const response = await api.post('/admin/solar-systems', solarSystemData);
      notificationStore.adminSuccess('Sistema solar creado con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al crear el sistema solar');
      console.error('Error creating solar system:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar un sistema solar
  const updateSolarSystem = async (id, solarSystemData) => {
    loading.value = true;

    try {
      const response = await api.put(`/admin/solar-systems/${id}`, solarSystemData);
      notificationStore.adminSuccess('Sistema solar actualizado con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al actualizar el sistema solar');
      console.error('Error updating solar system:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un sistema solar
  const deleteSolarSystem = async (id) => {
    loading.value = true;

    try {
      await api.delete(`/admin/solar-systems/${id}`);
      notificationStore.adminSuccess('Sistema solar eliminado con éxito');
      await fetchSolarSystems(); // Recargar la lista
      return true;
    } catch (error) {
      notificationStore.adminError('Error al eliminar el sistema solar');
      console.error('Error deleting solar system:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cambiar página
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchSolarSystems();
  };

  // Cambiar elementos por página
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Resetear a la primera página
    fetchSolarSystems();
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Resetear a la primera página
    fetchSolarSystems();
  };

  // Actualizar ordenación
  const updateSort = (sort) => {
    filters.sort_field = sort.key;
    filters.sort_direction = sort.order;
    fetchSolarSystems();
  };

  return {
    solarSystems,
    totalSolarSystems,
    loading,
    pagination,
    filters,
    fetchSolarSystems,
    getSolarSystem,
    fetchAllConstellations,
    fetchAllStars,
    createSolarSystem,
    updateSolarSystem,
    deleteSolarSystem,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
