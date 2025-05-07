<template>
  <AdminCrudView
    title="Gestión de Planetas"
    tableTitle="Planetas"
    :breadcrumbItems="[{ text: 'Universo' }, { text: 'Planetas' }]"
    :columns="columns"
    :items="planets"
    :loading="loading"
    :total="totalPlanets"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nuevo Planeta"
    searchPlaceholder="Buscar por nombre"
    itemName="planetas"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreatePlanet"
    @reset="handleReset"
  >
    <!-- Custom filters -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <!-- Star label -->
        <label
          for="star-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Estrella
        </label>

        <!-- Star selector with clear button -->
        <div class="flex items-center space-x-2">
          <VxvSelect
            id="star-filter"
            v-model="filters.star_id"
            size="sm"
            :options="starOptions"
            class="block w-full"
            @update:modelValue="handleStarChange"
          />
          <button
            v-if="filters.star_id"
            @click="clearStarFilter"
            class="text-gray-400 hover:text-white flex-shrink-0"
            title="Quitar filtro"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- Custom cell templates -->
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">
        {{ item.name }}
      </div>
      <div class="text-xs text-gray-300">
        ID: {{ item.id }}
      </div>
    </template>

    <template #cell(star)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.star ? item.star.name : 'Sin estrella' }}
      </div>
      <div v-if="item.star && item.star.solar_system" class="text-xs text-gray-400">
        Sistema: {{ item.star.solar_system.name }}
      </div>
    </template>

    <template #cell(description)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.description || 'Sin descripción' }}
      </div>
    </template>

    <template #cell(type)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.type || 'No especificado' }}
      </div>
    </template>

    <template #cell(orbit)="{ item }">
      <div class="text-sm text-center text-gray-300">
        {{ item.orbit_position || 'No especificada' }}
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editPlanet(item)" class="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
      <button @click="confirmDeletePlanet(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar planeta" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar este planeta? Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deletePlanet">
            Eliminar
          </VxvButton>
          <VxvButton type="button" variant="secondary" :full-width="true" @click="closeDeleteModal">
            Cancelar
          </VxvButton>
        </div>
      </VxvModal>
    </template>
  </AdminCrudView>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import { usePlanets } from '@/composables/usePlanets';

const router = useRouter();

// Usar el composable de planetas
const {
  planets,
  totalPlanets,
  loading,
  pagination,
  filters,
  fetchPlanets,
  fetchAllStars,
  deletePlanet: deletePlanetApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = usePlanets();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true, width: '20%' },
  { key: 'star', label: 'Estrella', width: '20%' },
  { key: 'description', label: 'Descripción', width: '25%' },
  { key: 'type', label: 'Tipo', width: '15%' },
  { key: 'orbit', label: 'Órbita', width: '20%' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const planetToDelete = ref(null);
const deleting = ref(false);

// Estrellas para el filtro
const stars = ref([]);
const starOptions = computed(() => {
  const options = [{ value: '', label: 'Todas las estrellas' }];
  
  stars.value.forEach(star => {
    options.push({
      value: star.id.toString(),
      label: star.name
    });
  });
  
  return options;
});

// Cargar estrellas
const loadStars = async () => {
  stars.value = await fetchAllStars();
};

// Handle star change
const handleStarChange = (value) => {
  filters.star_id = value;
  updateFilters(filters);
};

// Clear star filter
const clearStarFilter = () => {
  filters.star_id = '';
  updateFilters(filters);
};

// Handle reset event
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchPlanets();
};

// Navigate to create planet page
const goToCreatePlanet = () => {
  router.push('/admin/universe/planets/create');
};

// Navigate to edit planet page
const editPlanet = (planet) => {
  router.push(`/admin/universe/planets/${planet.id}/edit`);
};

// Confirm delete planet
const confirmDeletePlanet = (planet) => {
  planetToDelete.value = planet;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  planetToDelete.value = null;
};

// Delete planet
const deletePlanet = async () => {
  if (!planetToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deletePlanetApi(planetToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await loadStars();
  fetchPlanets();
});
</script>
