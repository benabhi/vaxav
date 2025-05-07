<template>
  <AdminCrudView
    title="Gestión de Sistemas Solares"
    tableTitle="Sistemas Solares"
    :breadcrumbItems="[{ text: 'Universo' }, { text: 'Sistemas Solares' }]"
    :columns="columns"
    :items="solarSystems"
    :loading="loading"
    :total="totalSolarSystems"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nuevo Sistema Solar"
    searchPlaceholder="Buscar por nombre"
    itemName="sistemas solares"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateSolarSystem"
    @reset="handleReset"
  >
    <!-- Custom filters -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <!-- Constellation label -->
        <label
          for="constellation-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Constelación
        </label>

        <!-- Constellation selector with clear button -->
        <div class="flex items-center space-x-2">
          <VxvSelect
            id="constellation-filter"
            v-model="filters.constellation_id"
            size="sm"
            :options="constellationOptions"
            class="block w-full"
            @update:modelValue="handleConstellationChange"
          />
          <button
            v-if="filters.constellation_id"
            @click="clearConstellationFilter"
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

    <template #cell(constellation)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.constellation ? item.constellation.name : 'Sin constelación' }}
      </div>
      <div v-if="item.constellation && item.constellation.region" class="text-xs text-gray-400">
        Región: {{ item.constellation.region.name }}
      </div>
    </template>

    <template #cell(description)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.description || 'Sin descripción' }}
      </div>
    </template>

    <template #cell(coordinates)="{ item }">
      <div class="text-sm text-gray-300">
        X: {{ item.x_coord }}, Y: {{ item.y_coord }}
      </div>
    </template>

    <template #cell(stars_count)="{ item }">
      <div class="text-sm text-center text-gray-300">
        {{ item.stars_count || 0 }}
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editSolarSystem(item)" class="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
      <button @click="confirmDeleteSolarSystem(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar sistema solar" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar este sistema solar? Esta acción no se puede deshacer.
          </p>
          
          <p v-if="solarSystemToDelete && solarSystemToDelete.stars_count > 0" class="text-red-400 mb-6">
            ¡Advertencia! Este sistema solar contiene {{ solarSystemToDelete.stars_count }} estrellas que también serán eliminadas.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteSolarSystem">
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
import { useSolarSystems } from '@/composables/useSolarSystems';

const router = useRouter();

// Usar el composable de sistemas solares
const {
  solarSystems,
  totalSolarSystems,
  loading,
  pagination,
  filters,
  fetchSolarSystems,
  fetchAllConstellations,
  deleteSolarSystem: deleteSolarSystemApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useSolarSystems();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true, width: '20%' },
  { key: 'constellation', label: 'Constelación', width: '20%' },
  { key: 'description', label: 'Descripción', width: '30%' },
  { key: 'coordinates', label: 'Coordenadas', width: '15%' },
  { key: 'stars_count', label: 'Estrellas', width: '15%' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const solarSystemToDelete = ref(null);
const deleting = ref(false);

// Constelaciones para el filtro
const constellations = ref([]);
const constellationOptions = computed(() => {
  const options = [{ value: '', label: 'Todas las constelaciones' }];
  
  constellations.value.forEach(constellation => {
    options.push({
      value: constellation.id.toString(),
      label: constellation.name
    });
  });
  
  return options;
});

// Cargar constelaciones
const loadConstellations = async () => {
  constellations.value = await fetchAllConstellations();
};

// Handle constellation change
const handleConstellationChange = (value) => {
  filters.constellation_id = value;
  updateFilters(filters);
};

// Clear constellation filter
const clearConstellationFilter = () => {
  filters.constellation_id = '';
  updateFilters(filters);
};

// Handle reset event
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchSolarSystems();
};

// Navigate to create solar system page
const goToCreateSolarSystem = () => {
  router.push('/admin/universe/solar-systems/create');
};

// Navigate to edit solar system page
const editSolarSystem = (solarSystem) => {
  router.push(`/admin/universe/solar-systems/${solarSystem.id}/edit`);
};

// Confirm delete solar system
const confirmDeleteSolarSystem = (solarSystem) => {
  solarSystemToDelete.value = solarSystem;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  solarSystemToDelete.value = null;
};

// Delete solar system
const deleteSolarSystem = async () => {
  if (!solarSystemToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteSolarSystemApi(solarSystemToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await loadConstellations();
  fetchSolarSystems();
});
</script>
