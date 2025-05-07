<template>
  <AdminCrudView
    title="Gestión de Estrellas"
    tableTitle="Estrellas"
    :breadcrumbItems="[{ text: 'Universo' }, { text: 'Estrellas' }]"
    :columns="columns"
    :items="stars"
    :loading="loading"
    :total="totalStars"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nueva Estrella"
    searchPlaceholder="Buscar por nombre"
    itemName="estrellas"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateStar"
    @reset="handleReset"
  >
    <!-- Custom filters -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <!-- Solar System label -->
        <label
          for="solar-system-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Sistema Solar
        </label>

        <!-- Solar System selector with clear button -->
        <div class="flex items-center space-x-2">
          <VxvSelect
            id="solar-system-filter"
            v-model="filters.solar_system_id"
            size="sm"
            :options="solarSystemOptions"
            class="block w-full"
            @update:modelValue="handleSolarSystemChange"
          />
          <button
            v-if="filters.solar_system_id"
            @click="clearSolarSystemFilter"
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

    <template #cell(solar_system)="{ item }">
      <div class="text-sm text-gray-300">
        {{ item.solar_system ? item.solar_system.name : 'Sin sistema solar' }}
      </div>
      <div v-if="item.solar_system && item.solar_system.constellation" class="text-xs text-gray-400">
        Constelación: {{ item.solar_system.constellation.name }}
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

    <template #cell(planets_count)="{ item }">
      <div class="text-sm text-center text-gray-300">
        {{ item.planets_count || 0 }}
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editStar(item)" class="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
      <button @click="confirmDeleteStar(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar estrella" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar esta estrella? Esta acción no se puede deshacer.
          </p>
          
          <p v-if="starToDelete && starToDelete.planets_count > 0" class="text-red-400 mb-6">
            ¡Advertencia! Esta estrella tiene {{ starToDelete.planets_count }} planetas orbitando que también serán eliminados.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteStar">
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
import { useStars } from '@/composables/useStars';

const router = useRouter();

// Usar el composable de estrellas
const {
  stars,
  totalStars,
  loading,
  pagination,
  filters,
  fetchStars,
  fetchAllSolarSystems,
  deleteStar: deleteStarApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useStars();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true, width: '20%' },
  { key: 'solar_system', label: 'Sistema Solar', width: '20%' },
  { key: 'description', label: 'Descripción', width: '25%' },
  { key: 'type', label: 'Tipo', width: '15%' },
  { key: 'planets_count', label: 'Planetas', width: '20%' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const starToDelete = ref(null);
const deleting = ref(false);

// Sistemas solares para el filtro
const solarSystems = ref([]);
const solarSystemOptions = computed(() => {
  const options = [{ value: '', label: 'Todos los sistemas solares' }];
  
  solarSystems.value.forEach(solarSystem => {
    options.push({
      value: solarSystem.id.toString(),
      label: solarSystem.name
    });
  });
  
  return options;
});

// Cargar sistemas solares
const loadSolarSystems = async () => {
  solarSystems.value = await fetchAllSolarSystems();
};

// Handle solar system change
const handleSolarSystemChange = (value) => {
  filters.solar_system_id = value;
  updateFilters(filters);
};

// Clear solar system filter
const clearSolarSystemFilter = () => {
  filters.solar_system_id = '';
  updateFilters(filters);
};

// Handle reset event
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchStars();
};

// Navigate to create star page
const goToCreateStar = () => {
  router.push('/admin/universe/stars/create');
};

// Navigate to edit star page
const editStar = (star) => {
  router.push(`/admin/universe/stars/${star.id}/edit`);
};

// Confirm delete star
const confirmDeleteStar = (star) => {
  starToDelete.value = star;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  starToDelete.value = null;
};

// Delete star
const deleteStar = async () => {
  if (!starToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteStarApi(starToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await loadSolarSystems();
  fetchStars();
});
</script>
