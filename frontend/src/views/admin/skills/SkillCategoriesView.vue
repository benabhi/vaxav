<template>
  <AdminCrudView
    title="Gestión de Habilidades"
    tableTitle="Categorías de Habilidades"
    :breadcrumbItems="[{ text: 'Categorías' }]"
    :columns="columns"
    :items="categories"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    row-key="id"
    create-button-label="Nueva Categoría"
    search-placeholder="Buscar categorías..."
    item-name="categorías"
    @create="goToCreateCategory"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @reset="handleReset"
  >
    <!-- Celdas personalizadas -->
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">{{ item.name }}</div>
    </template>

    <template #cell(description)="{ item }">
      <div class="text-sm text-gray-300">{{ truncateText(item.description, 100) }}</div>
    </template>

    <template #actions="{ item }">
      <button @click="editCategory(item)" class="text-blue-400 hover:text-blue-300 mr-4">
        Editar
      </button>
      <button
        @click="confirmDeleteCategory(item)"
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
        title="Eliminar Categoría"
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
            ¿Estás seguro de que deseas eliminar la categoría <span class="font-semibold">{{ categoryToDelete?.name }}</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteCategory">
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
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import { useNotificationStore } from '@/stores/notification.ts';
import { useSkillCategories } from '@/composables/useSkillCategories';

const router = useRouter();
const notificationStore = useNotificationStore();

// Usar el composable de categorías
const {
  categories,
  loading,
  pagination,
  filters,
  fetchCategories,
  deleteCategory: deleteCategoryApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useSkillCategories();

// Columnas de la tabla
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'description', label: 'Descripción' }
];

// Modal de eliminación
const showDeleteModal = ref(false);
const categoryToDelete = ref(null);
const deleting = ref(false);

// Truncar texto
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Manejar el evento de reset de filtros
const handleReset = () => {
  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchCategories();
};

// Navegar a la página de creación
const goToCreateCategory = () => {
  router.push('/admin/skill-categories/create');
};

// Navegar a la página de edición
const editCategory = (category) => {
  router.push(`/admin/skill-categories/${category.id}/edit`);
};

// Confirmar eliminación
const confirmDeleteCategory = (category) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
};

// Cerrar modal de eliminación
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
};

// Eliminar categoría
const deleteCategory = async () => {
  if (!categoryToDelete.value) return;

  deleting.value = true;

  try {
    const success = await deleteCategoryApi(categoryToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchCategories();
});
</script>
