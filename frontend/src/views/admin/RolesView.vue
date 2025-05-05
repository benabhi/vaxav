<template>
  <AdminCrudView
    title="Gestión de Roles"
    tableTitle="Roles"
    :breadcrumbItems="[{ text: 'Roles' }]"
    :columns="columns"
    :items="roles"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    row-key="id"
    create-button-label="Nuevo Rol"
    search-placeholder="Buscar roles..."
    item-name="roles"
    @create="goToCreateRole"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @reset="handleReset"
  >
    <template #cell(name)="{ item }">
      <div class="text-sm font-medium text-white">{{ item.name }}</div>
    </template>

    <template #cell(slug)="{ item }">
      <div class="text-sm text-gray-300">{{ item.slug }}</div>
    </template>

    <template #cell(description)="{ item }">
      <div class="text-sm text-gray-300">{{ item.description || 'Sin descripción' }}</div>
    </template>

    <template #cell(permissions)="{ item }">
      <div class="flex flex-wrap gap-1">
        <VxvBadge
          v-for="permission in item.permissions.slice(0, 3)"
          :key="permission.id"
          variant="blue"
          size="sm"
        >
          {{ permission.name }}
        </VxvBadge>
        <VxvBadge
          v-if="item.permissions.length > 3"
          variant="gray"
          size="sm"
        >
          +{{ item.permissions.length - 3 }} más
        </VxvBadge>
      </div>
    </template>

    <template #actions="{ item }">
      <button @click="editRole(item)" class="text-blue-400 hover:text-blue-300 mr-4"
        :disabled="['superadmin', 'admin', 'moderator', 'user'].includes(item.slug) && !isSuperAdmin">
        Editar
      </button>
      <button
        @click="confirmDeleteRole(item)"
        class="text-red-400 hover:text-red-300"
        :class="{ 'opacity-50 cursor-not-allowed': ['superadmin', 'admin', 'moderator', 'user'].includes(item.slug) }"
        :disabled="['superadmin', 'admin', 'moderator', 'user'].includes(item.slug)">
        Eliminar
      </button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar rol" color="red" @close="closeDeleteModal">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p class="text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar el rol <span class="font-semibold">{{ roleToDelete?.name }}</span>?
            Esta
            acción no se puede deshacer.
          </p>
        </div>

        <div class="flex space-x-3">
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteRole">
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
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification.ts';
import { useRoles } from '@/composables/useRoles';
import api from '@/services/api';

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

// Usar el composable de roles
const {
  roles,
  loading,
  pagination,
  filters,
  fetchRoles,
  deleteRole: deleteRoleApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useRoles();

// Check if user is superadmin
const isSuperAdmin = computed(() => {
  return userStore.userData?.roles?.some(role => role.slug === 'superadmin') || false;
});

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'description', label: 'Descripción' },
  { key: 'permissions', label: 'Permisos' }
];

// Delete confirmation
const showDeleteModal = ref(false);
const roleToDelete = ref<any>(null);
const deleting = ref(false);

// Available permissions
const availablePermissions = ref<any[]>([]);

// Fetch available permissions
const fetchPermissions = async () => {
  try {
    const response = await api.get('/admin/permissions');
    console.log('Permissions fetched successfully:', response.data);

    if (response.data) {
      availablePermissions.value = response.data;
    } else {
      console.error('Unexpected API response format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
  }
};

// Navigate to create role page
const goToCreateRole = () => {
  router.push('/admin/roles/create');
};

// Navigate to edit role page
const editRole = (role: any) => {
  router.push(`/admin/roles/${role.id}/edit`);
};

// Handle reset event
const handleReset = () => {
  console.log('Evento reset recibido en RolesView');

  // Los filtros y la paginación ya han sido restablecidos por AdminCrudView
  // Solo necesitamos forzar una recarga de los datos
  fetchRoles();
};

// Confirm delete role
const confirmDeleteRole = (role: any) => {
  roleToDelete.value = role;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  roleToDelete.value = null;
};

// Delete role
const deleteRole = async () => {
  if (!roleToDelete.value) return;

  // Check if role is a default role
  if (['superadmin', 'admin', 'moderator', 'user'].includes(roleToDelete.value.slug)) {
    notificationStore.adminError(
      `No se puede eliminar el rol ${roleToDelete.value.name} porque es un rol predeterminado del sistema.`
    );
    return;
  }

  deleting.value = true;

  try {
    const success = await deleteRoleApi(roleToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(async () => {
  await fetchPermissions();
  await fetchRoles();
});
</script>