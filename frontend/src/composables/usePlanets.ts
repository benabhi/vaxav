import { ref, reactive } from 'vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

export function usePlanets() {
  const notificationStore = useNotificationStore();

  // Estado
  const planets = ref([]);
  const totalPlanets = ref(0);
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
    star_id: '',
    sort_field: 'name',
    sort_direction: 'asc'
  });

  // Cargar planetas
  const fetchPlanets = async () => {
    loading.value = true;

    try {
      const response = await api.get('/admin/planets', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search,
          star_id: filters.star_id,
          sort_field: filters.sort_field,
          sort_direction: filters.sort_direction
        }
      });

      planets.value = response.data.data;
      totalPlanets.value = response.data.meta.total;
      pagination.totalPages = response.data.meta.last_page;

      return response.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar los planetas');
      console.error('Error fetching planets:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener un planeta por ID
  const getPlanet = async (id) => {
    loading.value = true;

    try {
      const response = await api.get(`/admin/planets/${id}`);
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al cargar el planeta');
      console.error('Error fetching planet:', error);
      return null;
    } finally {
      loading.value = false;
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

  // Crear un nuevo planeta
  const createPlanet = async (planetData) => {
    loading.value = true;

    try {
      const response = await api.post('/admin/planets', planetData);
      notificationStore.adminSuccess('Planeta creado con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al crear el planeta');
      console.error('Error creating planet:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar un planeta
  const updatePlanet = async (id, planetData) => {
    loading.value = true;

    try {
      const response = await api.put(`/admin/planets/${id}`, planetData);
      notificationStore.adminSuccess('Planeta actualizado con éxito');
      return response.data.data;
    } catch (error) {
      notificationStore.adminError('Error al actualizar el planeta');
      console.error('Error updating planet:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar un planeta
  const deletePlanet = async (id) => {
    loading.value = true;

    try {
      await api.delete(`/admin/planets/${id}`);
      notificationStore.adminSuccess('Planeta eliminado con éxito');
      await fetchPlanets(); // Recargar la lista
      return true;
    } catch (error) {
      notificationStore.adminError('Error al eliminar el planeta');
      console.error('Error deleting planet:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Cambiar página
  const changePage = (page) => {
    pagination.currentPage = page;
    fetchPlanets();
  };

  // Cambiar elementos por página
  const changePerPage = (perPage) => {
    pagination.perPage = perPage;
    pagination.currentPage = 1; // Resetear a la primera página
    fetchPlanets();
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.currentPage = 1; // Resetear a la primera página
    fetchPlanets();
  };

  // Actualizar ordenación
  const updateSort = (sort) => {
    filters.sort_field = sort.key;
    filters.sort_direction = sort.order;
    fetchPlanets();
  };

  return {
    planets,
    totalPlanets,
    loading,
    pagination,
    filters,
    fetchPlanets,
    getPlanet,
    fetchAllStars,
    createPlanet,
    updatePlanet,
    deletePlanet,
    changePage,
    changePerPage,
    updateFilters,
    updateSort
  };
}
