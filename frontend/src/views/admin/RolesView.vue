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
    <BaseModal :show="showRoleModal" :title="editingRole ? 'Editar Rol' : 'Crear Rol'" color="blue"
      @close="closeRoleModal">
      <form @submit.prevent="saveRole">
        <!-- Name -->
        <div class="mb-4">
          <label for="name" class="block text-lg font-bold text-white mb-2">Nombre</label>
          <input id="name" v-model="roleForm.name" type="text"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" required />
          <p v-if="formErrors.name" class="mt-1 text-sm text-red-500">{{ formErrors.name }}</p>
        </div>

        <!-- Slug -->
        <div class="mb-4">
          <label for="slug" class="block text-lg font-bold text-white mb-2">Slug</label>
          <input id="slug" v-model="roleForm.slug" type="text"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" required
            :disabled="editingRole && ['superadmin', 'admin', 'moderator', 'user'].includes(editingRole.slug)" />
          <p v-if="formErrors.slug" class="mt-1 text-sm text-red-500">{{ formErrors.slug }}</p>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label for="description" class="block text-lg font-bold text-white mb-2">Descripción</label>
          <textarea id="description" v-model="roleForm.description" rows="3"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"></textarea>
          <p v-if="formErrors.description" class="mt-1 text-sm text-red-500">{{ formErrors.description }}</p>
        </div>

        <!-- Permissions -->
        <div class="mb-6">
          <label class="block text-lg font-bold text-white mb-2">Permisos</label>
          <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-60 overflow-y-auto">
            <div class="space-y-2">
              <div v-for="permission in availablePermissions" :key="permission.id" class="flex items-center">
                <input :id="`permission-${permission.id}`" type="checkbox" :value="permission.id"
                  v-model="roleForm.permissions"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded" />
                <label :for="`permission-${permission.id}`" class="ml-2 block text-sm text-gray-200">
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>
          <p v-if="formErrors.permissions" class="mt-1 text-sm text-red-500">{{ formErrors.permissions }}</p>
        </div>

        <div class="flex space-x-3">
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            :disabled="saving">
            <span v-if="saving">Procesando...</span>
            <span v-else>{{ editingRole ? 'Guardar cambios' : 'Crear rol' }}</span>
          </button>
          <button type="button" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
            @click="closeRoleModal">
            Cancelar
          </button>
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
        <button type="button" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
          :disabled="deleting" @click="deleteRole">
          <span v-if="deleting">Procesando...</span>
          <span v-else>Eliminar</span>
        </button>
        <button type="button" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
          @click="closeDeleteModal">
          Cancelar
        </button>
      </div>
    </BaseModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseModal from '@/components/ui/modals/BaseModal.vue';
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