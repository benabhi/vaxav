<template>
  <AdminCrudView
    title="Gestión de Pilotos"
    tableTitle="Pilotos"
    :breadcrumbItems="[{ text: 'Pilotos' }]"
    :columns="columns"
    :items="pilots"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    row-key="id"
    create-button-label=""
    search-placeholder="Buscar pilotos..."
    item-name="pilotos"
    :show-create-button="false"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @reset="handleReset"
  >
    <!-- Filtros personalizados -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <label
          for="race-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Raza
        </label>
        <VxvSelect
          id="race-filter"
          v-model="filters.race"
          size="sm"
          :options="[
            { value: '', label: 'Todas las razas' },
            { value: 'Humano', label: 'Humano' },
            { value: 'Cyborg', label: 'Cyborg' },
            { value: 'Alienígena', label: 'Alienígena' },
            { value: 'Sintético', label: 'Sintético' }
          ]"
          class="block w-full"
          @update:modelValue="handleRaceChange"
        />
      </div>
    </template>

    <!-- Columna de nombre -->
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">{{ item.name }}</div>
    </template>

    <!-- Columna de raza -->
    <template #cell(race)="{ item }">
      <VxvBadge
        :variant="getRaceBadgeVariant(item.race)"
        size="sm"
      >
        {{ item.race }}
      </VxvBadge>
    </template>

    <!-- Columna de usuario -->
    <template #cell(user)="{ item }">
      <div v-if="item.user" class="text-sm text-gray-300">
        {{ item.user.name }} ({{ item.user.email }})
      </div>
      <div v-else class="text-sm text-gray-500 italic">Sin usuario</div>
    </template>

    <!-- Columna de créditos -->
    <template #cell(credits)="{ item }">
      <div class="text-sm text-gray-300">{{ formatCredits(item.credits) }}</div>
    </template>

    <!-- Columna de acciones -->
    <template #actions="{ item }">
      <button @click="editPilot(item)" class="text-blue-400 hover:text-blue-300 mr-3">
        Editar
      </button>
      <button @click="editPilotSkills(item)" class="text-green-400 hover:text-green-300 mr-3">
        Habilidades
      </button>
      <button @click="confirmDeletePilot(item)" class="text-red-400 hover:text-red-300">
        Eliminar
      </button>
    </template>
  </AdminCrudView>

  <!-- Modal de confirmación de eliminación -->
  <VxvModal
    :show="showDeleteModal"
    title="Confirmar eliminación"
    :loading="deleting"
    @close="showDeleteModal = false"
  >
    <p class="text-gray-300 mb-4">
      ¿Estás seguro de que deseas eliminar el piloto <span class="font-bold text-white">{{ pilotToDelete?.name }}</span>?
      Esta acción no se puede deshacer.
    </p>
    <template #footer>
      <div class="flex justify-end space-x-3">
        <VxvButton
          variant="secondary"
          @click="showDeleteModal = false"
          :disabled="deleting"
        >
          Cancelar
        </VxvButton>
        <VxvButton
          variant="danger"
          @click="deletePilotConfirmed"
          :loading="deleting"
        >
          Eliminar
        </VxvButton>
      </div>
    </template>
  </VxvModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import { useAdminPilots } from '@/composables/useAdminPilots';

const router = useRouter();

// Usar el composable de pilotos
const {
  pilots,
  loading,
  pagination,
  filters,
  fetchPilots,
  deletePilot,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useAdminPilots();

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'race', label: 'Raza', sortable: true },
  { key: 'user', label: 'Usuario' },
  { key: 'credits', label: 'Créditos', sortable: true }
];

// Delete confirmation
const showDeleteModal = ref(false);
const pilotToDelete = ref(null);
const deleting = ref(false);

// Race badge variants
const getRaceBadgeVariant = (race) => {
  const variants = {
    'Humano': 'blue',
    'Cyborg': 'purple',
    'Alienígena': 'green',
    'Sintético': 'orange'
  };
  return variants[race] || 'gray';
};

// Format credits
const formatCredits = (credits) => {
  return new Intl.NumberFormat('es-ES').format(credits);
};

// Handle race change
const handleRaceChange = (value) => {
  filters.race = value;
  updateFilters(filters);
};

// Reset filters
const handleReset = () => {
  filters.search = '';
  filters.race = '';
  filters.sort_field = 'name';
  filters.sort_direction = 'asc';
  fetchPilots();
};

// Edit pilot
const editPilot = (pilot) => {
  router.push(`/admin/pilots/${pilot.id}/edit`);
};

// Edit pilot skills
const editPilotSkills = (pilot) => {
  router.push(`/admin/pilots/${pilot.id}/skills`);
};

// Confirm delete pilot
const confirmDeletePilot = (pilot) => {
  pilotToDelete.value = pilot;
  showDeleteModal.value = true;
};

// Delete pilot confirmed
const deletePilotConfirmed = async () => {
  if (!pilotToDelete.value) return;

  deleting.value = true;
  try {
    await deletePilot(pilotToDelete.value.id);
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
};

// Fetch pilots on mount
onMounted(() => {
  fetchPilots();
});
</script>
