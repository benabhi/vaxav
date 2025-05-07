<template>
  <AdminCrudView
    title="Gestión de Regiones"
    tableTitle="Regiones"
    :breadcrumbItems="[{ text: 'Universo' }, { text: 'Regiones' }]"
    :columns="columns"
    :items="regions"
    :loading="loading"
    :total="totalRegions"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nueva Región"
    searchPlaceholder="Buscar por nombre"
    itemName="regiones"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateRegion"
    @reset="handleReset"
  >
    <!-- Custom cell templates -->
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">
        {{ item.name }}
      </div>
      <div class="text-xs text-gray-300">
        ID: {{ item.id }}
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

    <template #cell(constellations_count)="{ item }">
      <div class="text-sm text-center text-gray-300">
        {{ item.constellations_count || 0 }}
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editRegion(item)" class="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
      <button @click="confirmDeleteRegion(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar región" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar esta región? Esta acción no se puede deshacer.
          </p>
          
          <p v-if="regionToDelete && regionToDelete.constellations_count > 0" class="text-red-400 mb-6">
            ¡Advertencia! Esta región contiene {{ regionToDelete.constellations_count }} constelaciones que también serán eliminadas.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteRegion">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import { useRegions } from '@/composables/useRegions';

const router = useRouter();

// Usar el composable de regiones
const {
  regions,
  totalRegions,
  loading,
  pagination,
  filters,
  fetchRegions,
  deleteRegion: deleteRegionApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useRegions();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true, width: '30%' },
  { key: 'description', label: 'Descripción', width: '40%' },
  { key: 'coordinates', label: 'Coordenadas', width: '15%' },
  { key: 'constellations_count', label: 'Constelaciones', width: '15%' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const regionToDelete = ref(null);
const deleting = ref(false);

// Handle reset event
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchRegions();
};

// Navigate to create region page
const goToCreateRegion = () => {
  router.push('/admin/universe/regions/create');
};

// Navigate to edit region page
const editRegion = (region) => {
  router.push(`/admin/universe/regions/${region.id}/edit`);
};

// Confirm delete region
const confirmDeleteRegion = (region) => {
  regionToDelete.value = region;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  regionToDelete.value = null;
};

// Delete region
const deleteRegion = async () => {
  if (!regionToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteRegionApi(regionToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(() => {
  fetchRegions();
});
</script>
