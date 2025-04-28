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
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-white">Roles</h1>
        <BaseButton @click="openCreateRoleModal">
          Nuevo Rol
          <template #icon-left>
            <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </template>
        </BaseButton>
      </div>

      <!-- Roles table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border border-gray-700 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Permisos
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                  <tr v-if="loading">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-300">
                      Cargando roles...
                    </td>
                  </tr>
                  <tr v-else-if="roles.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-300">
                      No se encontraron roles
                    </td>
                  </tr>
                  <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-white">{{ role.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-300">{{ role.slug }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-300">{{ role.description || 'Sin descripción' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="permission in role.permissions.slice(0, 3)" :key="permission.id"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {{ permission.name }}
                        </span>
                        <span v-if="role.permissions.length > 3"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{{ role.permissions.length - 3 }} más
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button @click="editRole(role)" class="text-blue-400 hover:text-blue-300 mr-4"
                        :disabled="['superadmin', 'admin', 'moderator', 'user'].includes(role.slug) && !isSuperAdmin">
                        Editar
                      </button>
                      <button @click="confirmDeleteRole(role)" class="text-red-400 hover:text-red-300"
                        :disabled="['superadmin', 'admin', 'moderator', 'user'].includes(role.slug)">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role form modal (create/edit) -->
    <RoleModal :show="showRoleModal" :role="editingRole" :permissions="availablePermissions" :loading="saving"
      :errors="formErrors" @close="closeRoleModal" @submit="saveRole" />

    <!-- Delete confirmation modal -->
    <DeleteRoleModal :show="showDeleteModal" :role="roleToDelete" :loading="deleting" @close="closeDeleteModal"
      @confirm="deleteRole" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import RoleModal from '@/components/admin/RoleModal.vue';
import DeleteRoleModal from '@/components/admin/DeleteRoleModal.vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();

// Check if user is superadmin
const isSuperAdmin = computed(() => {
  return authStore.user?.is_superadmin === true || authStore.user?.roles?.some(role => role.slug === 'superadmin') || false;
});

// Roles data
const roles = ref([]);
const loading = ref(true);

// Role form
const showRoleModal = ref(false);
const editingRole = ref(null);
const formErrors = reactive({
  name: '',
  slug: '',
  description: '',
  permissions: ''
});
const saving = ref(false);

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
    // Call the API to get roles
    const response = await api.get('/admin/roles');
    console.log('Roles fetched successfully:', response.data);

    if (response.data && response.data.data) {
      roles.value = response.data.data;
    } else {
      console.error('Unexpected API response format:', response.data);
      roles.value = [];
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    roles.value = [];
  } finally {
    loading.value = false;
  }
};

// Open create role modal
const openCreateRoleModal = () => {
  editingRole.value = null;
  clearFormErrors();
  showRoleModal.value = true;
};

// Edit role
const editRole = (role) => {
  editingRole.value = role;
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
const saveRole = async (formData) => {
  saving.value = true;
  clearFormErrors();

  // Validate form
  let isValid = true;

  if (!formData.name) {
    formErrors.name = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!formData.slug) {
    formErrors.slug = 'El slug es obligatorio';
    isValid = false;
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
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
      const response = await api.put(`/admin/roles/${editingRole.value.id}`, formData);
      console.log('Role updated successfully:', response.data);

      // Refresh the roles list
      await fetchRoles();
    } else {
      // Create new role
      const response = await api.post('/admin/roles', formData);
      console.log('Role created successfully:', response.data);

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

  deleting.value = true;

  try {
    // Call the API to delete the role
    await api.delete(`/admin/roles/${roleToDelete.value.id}`);
    console.log('Role deleted successfully');

    // Refresh the roles list
    await fetchRoles();

    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting role:', error);
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
