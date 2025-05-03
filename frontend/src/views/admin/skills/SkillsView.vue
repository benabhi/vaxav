<template>
  <AdminCrudView
    title="Gestión de Habilidades"
    tableTitle="Habilidades"
    :breadcrumbItems="[{ text: 'Habilidades' }]"
    :columns="columns"
    :items="skills"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    row-key="id"
    create-button-label="Nueva Habilidad"
    search-placeholder="Buscar habilidades..."
    item-name="habilidades"
    @create="goToCreateSkill"
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
          for="category-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Categoría
        </label>
        <VxvSelect
          id="category-filter"
          v-model="filters.category_id"
          :options="categoryOptions"
          placeholder="Todas"
          size="sm"
          @change="handleCategoryChange"
        />
      </div>

      <div class="w-full md:w-[180px]">
        <label
          for="multiplier-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Multiplicador
        </label>
        <VxvSelect
          id="multiplier-filter"
          v-model="filters.multiplier"
          :options="multiplierOptions"
          placeholder="Todos"
          size="sm"
          @change="handleMultiplierChange"
        />
      </div>
    </template>

    <!-- Celdas personalizadas -->
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">{{ item.name }}</div>
    </template>

    <template #cell(category)="{ item }">
      <div class="text-sm text-gray-300">{{ item.category?.name || 'Sin categoría' }}</div>
    </template>

    <template #cell(multiplier)="{ item }">
      <VxvBadge
        :variant="getMultiplierVariant(item.multiplier)"
      >
        x{{ item.multiplier }}
      </VxvBadge>
    </template>

    <template #cell(description)="{ item }">
      <div class="text-sm text-gray-300">{{ truncateText(item.description, 80) }}</div>
    </template>

    <template #cell(prerequisites)="{ item }">
      <div class="flex flex-wrap gap-1">
        <template v-if="item.prerequisites && Array.isArray(item.prerequisites) && item.prerequisites.length > 0">
          <!-- Filtrar prerrequisitos válidos primero -->
          <template v-for="(prereq, index) in item.prerequisites.filter(isValidPrerequisite).slice(0, 3)" :key="index">
            <VxvBadge
              variant="blue"
              size="sm"
              class="whitespace-nowrap"
            >
              <span class="font-medium">{{ getPrerequisiteName(prereq) }}</span>
            </VxvBadge>
          </template>

          <!-- Mostrar badge de "más" solo si hay más de 3 prerrequisitos válidos -->
          <VxvBadge
            v-if="item.prerequisites.filter(isValidPrerequisite).length > 3"
            variant="gray"
            size="sm"
            class="whitespace-nowrap"
          >
            +{{ item.prerequisites.filter(isValidPrerequisite).length - 3 }} más
          </VxvBadge>

          <!-- Si no hay prerrequisitos válidos pero hay prerrequisitos en el array -->
          <span
            v-if="item.prerequisites.filter(isValidPrerequisite).length === 0"
            class="text-sm text-yellow-400 italic"
          >
            Prerrequisitos con datos incompletos
          </span>
        </template>
        <span v-else class="text-sm text-gray-400 italic">Sin prerrequisitos</span>
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editSkill(item)" class="text-blue-400 hover:text-blue-300 mr-4">
        Editar
      </button>
      <button
        @click="confirmDeleteSkill(item)"
        class="text-red-400 hover:text-red-300"
      >
        Eliminar
      </button>
    </template>

    <!-- Modales -->
    <template #modals>
      <!-- Modal de confirmación de eliminación -->
      <VxvModal
        :show="showDeleteModal"
        title="Eliminar Habilidad"
        color="red"
        @close="closeDeleteModal"
      >
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar la habilidad <span class="font-semibold">{{ skillToDelete?.name }}</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteSkill">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
// No necesitamos importar useNotificationStore porque ya se maneja en el composable
import { useSkills } from '@/composables/useSkills';
import { useSkillCategories } from '@/composables/useSkillCategories';

const router = useRouter();

// Usar el composable de habilidades
const {
  skills,
  loading,
  pagination,
  filters,
  fetchSkills,
  deleteSkill: deleteSkillApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  resetFilters
} = useSkills();

// Usar el composable de categorías
const { categories, fetchCategories } = useSkillCategories();

// Opciones para los filtros
const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    value: category.id,
    label: category.name
  }));
});

const multiplierOptions = computed(() => {
  return [
    { value: 1, label: 'x1 (Básico)' },
    { value: 2, label: 'x2 (Intermedio)' },
    { value: 3, label: 'x3 (Avanzado)' },
    { value: 4, label: 'x4 (Experto)' },
    { value: 5, label: 'x5 (Maestro)' }
  ];
});

// Columnas de la tabla
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'category', label: 'Categoría', sortable: true },
  { key: 'multiplier', label: 'Multiplicador', sortable: true },
  { key: 'description', label: 'Descripción' },
  { key: 'prerequisites', label: 'Prerrequisitos' }
];

// Modal de eliminación
const showDeleteModal = ref(false);
const skillToDelete = ref(null);
const deleting = ref(false);

// Obtener la variante de color para el multiplicador
const getMultiplierVariant = (multiplier) => {
  switch (multiplier) {
    case 1: return 'gray';
    case 2: return 'green';
    case 3: return 'blue';
    case 4: return 'purple';
    case 5: return 'red';
    default: return 'gray';
  }
};

// Verificar si un prerrequisito es válido para mostrar
const isValidPrerequisite = (prerequisite) => {
  if (!prerequisite) return false;

  // Con la nueva estructura, un prerrequisito válido debe tener un objeto prerequisite
  // con al menos un id y un name
  const isValid = prerequisite.prerequisite &&
                  prerequisite.prerequisite.id &&
                  prerequisite.prerequisite.name;

  if (!isValid) {
    console.warn('Prerrequisito inválido:', prerequisite);
  }

  return isValid;
};

// Obtener el nombre del prerrequisito con su nivel
const getPrerequisiteName = (prerequisite) => {
  // Con la nueva estructura, siempre debería tener un objeto prerequisite
  // con un name y un prerequisite_level
  if (prerequisite && prerequisite.prerequisite && prerequisite.prerequisite.name) {
    return `${prerequisite.prerequisite.name} (Nv.${prerequisite.prerequisite_level || '?'})`;
  }

  return 'Prerrequisito no disponible';
};

// Truncar texto
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Manejar cambio de categoría
const handleCategoryChange = () => {
  updateFilters({ category_id: filters.category_id });
};

// Manejar cambio de multiplicador
const handleMultiplierChange = () => {
  console.log('Cambio de multiplicador a:', filters.multiplier, 'tipo:', typeof filters.multiplier);

  // Asegurarnos de que el multiplicador sea un número antes de enviarlo
  // Si el valor es vacío, enviamos una cadena vacía para limpiar el filtro
  const multiplier = filters.multiplier === '' ? '' : Number(filters.multiplier);

  updateFilters({ multiplier });
};

// Manejar el evento de reset de filtros
const handleReset = () => {
  console.log('Evento reset recibido en SkillsView');

  // Asegurarnos de que el valor del multiplicador se limpie correctamente
  // Establecer a cadena vacía para que el placeholder "Todos" se muestre
  filters.multiplier = '';

  // También limpiar el filtro de categoría
  filters.category_id = '';

  // Usar el nuevo método resetFilters del composable
  resetFilters();

  // Forzar una actualización de la vista
  setTimeout(() => {
    console.log('Filtros después de restablecer:', filters);
  }, 0);
};

// Navegar a la página de creación
const goToCreateSkill = () => {
  router.push('/admin/skills/create');
};

// Navegar a la página de edición
const editSkill = (skill) => {
  router.push(`/admin/skills/${skill.id}/edit`);
};

// Confirmar eliminación
const confirmDeleteSkill = (skill) => {
  skillToDelete.value = skill;
  showDeleteModal.value = true;
};

// Cerrar modal de eliminación
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  skillToDelete.value = null;
};

// Eliminar habilidad
const deleteSkill = async () => {
  if (!skillToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteSkillApi(skillToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchCategories();
  await fetchSkills();
});
</script>
