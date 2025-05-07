<template>
  <AdminCrudView
    title="Gestión de Constelaciones"
    tableTitle="Constelaciones"
    :breadcrumbItems="[{ text: 'Universo' }, { text: 'Constelaciones' }]"
    :columns="columns"
    :items="constellations"
    :loading="loading"
    :total="totalConstellations"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nueva Constelación"
    searchPlaceholder="Buscar por nombre"
    itemName="constelaciones"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateConstellation"
    @reset="handleReset"
  >
    <!-- Custom filters -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <!-- Region label -->
        <label
          for="region-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Región
        </label>

        <!-- Region selector with clear button -->
        <div class="flex items-center space-x-2">
          <VxvSelect
            id="region-filter"
            v-model="filters.region_id"
            size="sm"
            :options="regionOptions"
            class="block w-full"
            @update:modelValue="handleRegionChange"
          />
          <button
            v-if="filters.region_id"
            @click="clearRegionFilter"
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

    <template #cell(region)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.region ? item.region.name : 'Sin región' }}
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

    <template #cell(solar_systems_count)="{ item }">
      <div class="text-sm text-center text-gray-300">
        {{ item.solar_systems_count || 0 }}
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editConstellation(item)" class="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
      <button @click="confirmDeleteConstellation(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar constelación" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar esta constelación? Esta acción no se puede deshacer.
          </p>
          
          <p v-if="constellationToDelete && constellationToDelete.solar_systems_count > 0" class="text-red-400 mb-6">
            ¡Advertencia! Esta constelación contiene {{ constellationToDelete.solar_systems_count }} sistemas solares que también serán eliminados.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteConstellation">
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
import { useConstellations } from '@/composables/useConstellations';

const router = useRouter();

// Usar el composable de constelaciones
const {
  constellations,
  totalConstellations,
  loading,
  pagination,
  filters,
  fetchConstellations,
  fetchAllRegions,
  deleteConstellation: deleteConstellationApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useConstellations();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true, width: '20%' },
  { key: 'region', label: 'Región', width: '15%' },
  { key: 'description', label: 'Descripción', width: '30%' },
  { key: 'coordinates', label: 'Coordenadas', width: '15%' },
  { key: 'solar_systems_count', label: 'Sistemas Solares', width: '20%' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const constellationToDelete = ref(null);
const deleting = ref(false);

// Regiones para el filtro
const regions = ref([]);
const regionOptions = computed(() => {
  const options = [{ value: '', label: 'Todas las regiones' }];
  
  regions.value.forEach(region => {
    options.push({
      value: region.id.toString(),
      label: region.name
    });
  });
  
  return options;
});

// Cargar regiones
const loadRegions = async () => {
  regions.value = await fetchAllRegions();
};

// Handle region change
const handleRegionChange = (value) => {
  filters.region_id = value;
  updateFilters(filters);
};

// Clear region filter
const clearRegionFilter = () => {
  filters.region_id = '';
  updateFilters(filters);
};

// Handle reset event
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchConstellations();
};

// Navigate to create constellation page
const goToCreateConstellation = () => {
  router.push('/admin/universe/constellations/create');
};

// Navigate to edit constellation page
const editConstellation = (constellation) => {
  router.push(`/admin/universe/constellations/${constellation.id}/edit`);
};

// Confirm delete constellation
const confirmDeleteConstellation = (constellation) => {
  constellationToDelete.value = constellation;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  constellationToDelete.value = null;
};

// Delete constellation
const deleteConstellation = async () => {
  if (!constellationToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteConstellationApi(constellationToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await loadRegions();
  fetchConstellations();
});
</script>
