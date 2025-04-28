<template>
  <AdminLayout title="Gestión de Roles">
    <template #breadcrumbs>
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <div>
              <router-link to="/admin" class="text-gray-400 hover:text-white">
                <svg class="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                  fill="currentColor" aria-hidden="true">
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span class="sr-only">Inicio</span>
              </router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-300">Roles</span>
            </div>
          </li>
        </ol>
      </nav>
    </template>

    <div class="py-6">
      <!-- Roles DataTable -->
      <BaseDataTable
        title="Roles"
        :columns="columns"
        :items="roles"
        :loading="loading"
        :total-pages="pagination.totalPages"
        :current-page="pagination.currentPage"
        :per-page="pagination.perPage"
        :filters="filters"
        row-key="id"
        create-button-label="Nuevo Rol"
        search-placeholder="Buscar roles..."
        item-name="roles"
        @create="openCreateRoleModal"
        @page-change="changePage"
        @per-page-change="handlePerPageChange"
        @filter-change="handleFilterChange"
        @update:filters="handleFilterChange"
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
            <span v-for="permission in item.permissions.slice(0, 3)" :key="permission.id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {{ permission.name }}
            </span>
            <span v-if="item.permissions.length > 3"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{{ item.permissions.length - 3 }} más
            </span>
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
      </BaseDataTable>
    </div>

    <!-- Role form modal (create/edit) -->
    <BaseModal :show="showRoleModal" :title="editingRole ? 'Editar Rol' : 'Crear Rol'" color="blue"
      @close="closeRoleModal">
      <form @submit.prevent="saveRole">
        <!-- Name -->
        <div class="mb-4">
          <BaseInput
            id="name"
            v-model="roleForm.name"
            label="Nombre"
            type="text"
            required
            :error="formErrors.name"
            labelClass="text-lg font-bold text-white"
          />
        </div>

        <!-- Slug -->
        <div class="mb-4">
          <BaseInput
            id="slug"
            v-model="roleForm.slug"
            label="Slug"
            type="text"
            required
            :error="formErrors.slug"
            labelClass="text-lg font-bold text-white"
            :disabled="editingRole && ['superadmin', 'admin', 'moderator', 'user'].includes(editingRole.slug)"
          />
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label for="description" class="block text-lg font-bold text-white mb-2">Descripción</label>
          <textarea id="description" v-model="roleForm.description" rows="3"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"></textarea>
          <p v-if="formErrors.description" class="mt-1 text-sm text-red-500">{{ formErrors.description }}</p>
        </div>

        <!-- Permissions -->
        <div class="mb-6">
          <label class="block text-lg font-bold text-white mb-2">Permisos</label>
          <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-60 overflow-y-auto">
            <div class="space-y-2">
              <div v-for="permission in availablePermissions" :key="permission.id" class="mb-1">
                <BaseCheckbox
                  :id="`permission-${permission.id}`"
                  :value="permission.id"
                  v-model="roleForm.permissions"
                  :label="permission.name"
                  labelClass="text-sm text-gray-200"
                />
              </div>
            </div>
          </div>
          <p v-if="formErrors.permissions" class="mt-1 text-sm text-red-500">{{ formErrors.permissions }}</p>
        </div>

        <div class="flex space-x-3">
          <BaseButton type="submit" variant="primary" :full-width="true" :loading="saving">
            {{ editingRole ? 'Guardar cambios' : 'Crear rol' }}
          </BaseButton>
          <BaseButton type="button" variant="secondary" :full-width="true" @click="closeRoleModal">
            Cancelar
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal :show="showDeleteModal" title="Eliminar rol" color="red" @close="closeDeleteModal">
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
        <BaseButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteRole">
          Eliminar
        </BaseButton>
        <BaseButton type="button" variant="secondary" :full-width="true" @click="closeDeleteModal">
          Cancelar
        </BaseButton>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseCheckbox from '@/components/ui/forms/BaseCheckbox.vue';
import BaseModal from '@/components/ui/modals/BaseModal.vue';
import BaseDataTable from '@/components/ui/tables/BaseDataTable.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import api from '@/services/api';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Check if user is superadmin
const isSuperAdmin = computed(() => {
  return authStore.user?.is_superadmin === true || authStore.user?.roles?.some(role => role.slug === 'superadmin') || false;
});

// Roles data
const roles = ref([]);
const loading = ref(true);

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'description', label: 'Descripción' },
  { key: 'permissions', label: 'Permisos' }
];

// Pagination
const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  perPage: 10
});

// Filters
const filters = reactive({
  search: ''
});

// Role form
const showRoleModal = ref(false);
const editingRole = ref(null);
const roleForm = reactive({
  name: '',
  slug: '',
  description: '',
  permissions: []
});
const formErrors = reactive({
  name: '',
  slug: '',
  description: '',
  permissions: ''
});
const saving = ref(false);

// Generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Watch for name changes to auto-generate slug
watch(() => roleForm.name, (newName) => {
  if (!editingRole.value) {
    roleForm.slug = generateSlug(newName);
  }
});

// Delete confirmation
const showDeleteModal = ref(false);
const roleToDelete = ref(null);
const deleting = ref(false);

// Available permissions
const availablePermissions = ref([]);

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

// Fetch roles
const fetchRoles = async () => {
  loading.value = true;
  try {
    // Call the API with filters and pagination
    const params = {
      ...filters,
      page: pagination.currentPage,
      per_page: pagination.perPage
    };

    const response = await api.get('/admin/roles', { params });
    console.log('Roles fetched successfully:', response.data);

    if (response.data && response.data.data) {
      roles.value = response.data.data;

      // Update pagination
      if (response.data.total) {
        pagination.totalPages = Math.ceil(response.data.total / pagination.perPage);
      } else if (response.data.last_page) {
        pagination.totalPages = response.data.last_page;
      }

      if (response.data.current_page) {
        pagination.currentPage = response.data.current_page;
      }
    } else {
      console.error('Unexpected API response format:', response.data);
      roles.value = [];
      pagination.totalPages = 1;
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    roles.value = [];
    pagination.totalPages = 1;
  } finally {
    loading.value = false;
  }
};

// Change page
const changePage = (page) => {
  pagination.currentPage = page;
  fetchRoles();
};

// Handle filter change
const handleFilterChange = (newFilters) => {
  // Update local filters with new values
  Object.keys(newFilters).forEach(key => {
    filters[key] = newFilters[key];
  });

  // Reset to first page when filters change
  pagination.currentPage = 1;
  fetchRoles();
};

// Handle per page change
const handlePerPageChange = (newPerPage) => {
  pagination.perPage = newPerPage;
  pagination.currentPage = 1; // Reset to first page
  fetchRoles();
};

// Open create role modal
const openCreateRoleModal = () => {
  editingRole.value = null;
  roleForm.name = '';
  roleForm.slug = '';
  roleForm.description = '';
  roleForm.permissions = [];
  clearFormErrors();
  showRoleModal.value = true;
};

// Edit role
const editRole = (role) => {
  editingRole.value = role;
  roleForm.name = role.name;
  roleForm.slug = role.slug;
  roleForm.description = role.description || '';
  roleForm.permissions = role.permissions ? role.permissions.map(p => p.id) : [];
  clearFormErrors();
  showRoleModal.value = true;
};

// Close role modal
const closeRoleModal = () => {
  showRoleModal.value = false;
};

// Clear form errors
const clearFormErrors = () => {
  formErrors.name = '';
  formErrors.slug = '';
  formErrors.description = '';
  formErrors.permissions = '';
};

// Save role
const saveRole = async () => {
  saving.value = true;
  clearFormErrors();

  // Validate form
  let isValid = true;

  if (!roleForm.name) {
    formErrors.name = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!roleForm.slug) {
    formErrors.slug = 'El slug es obligatorio';
    isValid = false;
  } else if (!/^[a-z0-9-]+$/.test(roleForm.slug)) {
    formErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    isValid = false;
  }

  if (!isValid) {
    saving.value = false;
    return;
  }

  try {
    if (editingRole.value) {
      // Update existing role
      const response = await api.put(`/admin/roles/${editingRole.value.id}`, roleForm);
      console.log('Role updated successfully:', response.data);

      // Show success notification
      notificationStore.success(
        `El rol ${roleForm.name} ha sido actualizado correctamente.`,
        'Rol actualizado'
      );

      // Refresh the roles list
      await fetchRoles();
    } else {
      // Create new role
      const response = await api.post('/admin/roles', roleForm);
      console.log('Role created successfully:', response.data);

      // Show success notification
      notificationStore.success(
        `El rol ${roleForm.name} ha sido creado correctamente.`,
        'Rol creado'
      );

      // Refresh the roles list
      await fetchRoles();
    }

    closeRoleModal();
  } catch (error) {
    console.error('Error saving role:', error);

    // Handle validation errors
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      if (errors.name) formErrors.name = errors.name[0];
      if (errors.slug) formErrors.slug = errors.slug[0];
      if (errors.description) formErrors.description = errors.description[0];
      if (errors.permissions) formErrors.permissions = errors.permissions[0];
    }
  } finally {
    saving.value = false;
  }
};

// Confirm delete role
const confirmDeleteRole = (role) => {
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
    notificationStore.error(
      `No se puede eliminar el rol ${roleToDelete.value.name} porque es un rol predeterminado del sistema.`,
      'Error al eliminar'
    );
    return;
  }

  deleting.value = true;

  try {
    // Call the API to delete the role
    await api.delete(`/admin/roles/${roleToDelete.value.id}`);
    console.log('Role deleted successfully');

    // Show success notification
    notificationStore.success(
      `El rol ${roleToDelete.value.name} ha sido eliminado correctamente.`,
      'Rol eliminado'
    );

    // Refresh the roles list
    await fetchRoles();

    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting role:', error);

    // Show error notification
    let errorMessage = 'Ha ocurrido un error al eliminar el rol. Por favor, inténtelo de nuevo.';

    if (error.response && error.response.status === 403) {
      errorMessage = 'No tienes permiso para eliminar este rol o es un rol predeterminado del sistema.';
    }

    notificationStore.error(
      errorMessage,
      'Error al eliminar'
    );
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