<template>
  <AdminLayout title="Gestión de Usuarios">
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
              <span class="ml-4 text-sm font-medium text-gray-300">Usuarios</span>
            </div>
          </li>
        </ol>
      </nav>
    </template>

    <div class="py-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-white">Usuarios</h1>
        <BaseButton @click="openCreateUserModal">
          Nuevo Usuario
        </BaseButton>
      </div>

      <!-- Filters -->
      <div class="mt-6 bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-700">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <BaseInput v-model="filters.search" placeholder="Buscar por nombre o email" prefixIcon>
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </BaseInput>
          </div>

          <div>
            <BaseSelect
              id="role-filter"
              v-model="filters.role"
              label="Rol"
              labelClass="text-sm font-medium text-white"
              :options="[
                { value: '', label: 'Todos los roles' },
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'admin', label: 'Administrador' },
                { value: 'moderator', label: 'Moderador' },
                { value: 'user', label: 'Usuario' }
              ]"
            />
          </div>

          <div class="flex items-end space-x-2">
            <BaseButton variant="secondary" @click="applyFilters">Filtrar</BaseButton>
            <BaseButton variant="ghost" @click="resetFilters">Limpiar</BaseButton>
          </div>
        </div>
      </div>

      <!-- Users table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border border-gray-700 sm:rounded-lg">
              <BaseTable
                :columns="columns"
                :items="users"
                :loading="loading"
                row-key="id"
              >
                <template #loading>
                  Cargando usuarios...
                </template>
                <template #empty>
                  No se encontraron usuarios
                </template>

                <template #cell(user)="{ item }">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full"
                        :src="item.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'"
                        alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">
                        {{ item.name }}
                      </div>
                      <div class="text-sm text-gray-300">
                        {{ item.email }}
                      </div>
                    </div>
                  </div>
                </template>

                <template #cell(roles)="{ item }">
                  <div v-for="role in item.roles" :key="role.id"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                    :class="roleClasses[role.slug] || roleClasses.default">
                    {{ role.name }}
                  </div>
                </template>

                <template #cell(status)="{ item }">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </template>

                <template #cell(created_at)="{ item }">
                  {{ formatDate(item.created_at) }}
                </template>

                <template #actions="{ item }">
                  <button @click="editUser(item)" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                  <button @click="confirmDeleteUser(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
                </template>
              </BaseTable>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            class="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
            Anterior
          </button>
          <button
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-300">
              Mostrando <span class="font-medium">1</span> a <span class="font-medium">10</span> de <span
                class="font-medium">{{ totalUsers }}</span> usuarios
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>
              <button
                class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                1
              </button>
              <button
                class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                2
              </button>
              <button
                class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                3
              </button>
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User form modal (create/edit) -->
    <BaseModal :show="showUserModal" :title="editingUser ? 'Editar Usuario' : 'Crear Usuario'" color="blue"
      @close="closeUserModal">
      <form @submit.prevent="saveUser">
        <!-- Name -->
        <div class="mb-4">
          <BaseInput
            id="name"
            v-model="userForm.name"
            label="Nombre"
            type="text"
            required
            :error="formErrors.name"
            labelClass="text-lg font-bold text-white"
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <BaseInput
            id="email"
            v-model="userForm.email"
            label="Correo electrónico"
            type="email"
            required
            :error="formErrors.email"
            labelClass="text-lg font-bold text-white"
          />
        </div>

        <!-- Password (only for new users) -->
        <div v-if="!editingUser" class="mb-4">
          <BaseInput
            id="password"
            v-model="userForm.password"
            label="Contraseña"
            type="password"
            required
            :error="formErrors.password"
            labelClass="text-lg font-bold text-white"
          />
        </div>

        <!-- Password Confirmation (only for new users) -->
        <div v-if="!editingUser" class="mb-4">
          <BaseInput
            id="password_confirmation"
            v-model="userForm.password_confirmation"
            label="Confirmar contraseña"
            type="password"
            required
            labelClass="text-lg font-bold text-white"
          />
        </div>

        <!-- Roles -->
        <div class="mb-6">
          <label class="block text-lg font-bold text-white mb-2">Roles</label>
          <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-40 overflow-y-auto">
            <div v-for="role in availableRoles" :key="role.id" class="mb-2 last:mb-0">
              <BaseCheckbox
                :id="`role-${role.id}`"
                :value="role.id"
                v-model="userForm.roles"
                :label="role.name"
              />
            </div>
          </div>
          <p v-if="formErrors.roles" class="mt-1 text-sm text-red-500">{{ formErrors.roles }}</p>
        </div>

        <div class="flex space-x-3">
          <BaseButton type="submit" variant="primary" :full-width="true" :loading="saving">
            {{ editingUser ? 'Guardar cambios' : 'Crear usuario' }}
          </BaseButton>
          <BaseButton type="button" variant="secondary" :full-width="true" @click="closeUserModal">
            Cancelar
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal :show="showDeleteModal" title="Eliminar usuario" color="red" @close="closeDeleteModal">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <p class="text-gray-300 mb-6">
          ¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.
        </p>
      </div>

      <div class="flex space-x-3">
        <BaseButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteUser">
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
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseSelect from '@/components/ui/forms/BaseSelect.vue';
import BaseCheckbox from '@/components/ui/forms/BaseCheckbox.vue';
import BaseModal from '@/components/ui/modals/BaseModal.vue';
import BaseTable from '@/components/ui/tables/BaseTable.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import api from '@/services/api';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Users data
const users = ref([]);
const totalUsers = ref(0);
const loading = ref(true);

// Table columns
const columns = [
  { key: 'user', label: 'Usuario' },
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha de registro' }
];

// Filters
const filters = reactive({
  search: '',
  role: ''
});

// User form
const showUserModal = ref(false);
const editingUser = ref(null);
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: []
});
const formErrors = reactive({
  name: '',
  email: '',
  password: '',
  roles: ''
});
const saving = ref(false);

// Delete confirmation
const showDeleteModal = ref(false);
const userToDelete = ref(null);
const deleting = ref(false);

// Available roles
const availableRoles = ref([
  { id: 1, name: 'Super Admin', slug: 'superadmin' },
  { id: 2, name: 'Administrador', slug: 'admin' },
  { id: 3, name: 'Moderador', slug: 'moderator' },
  { id: 4, name: 'Usuario', slug: 'user' }
]);

// Role badge classes
const roleClasses = {
  superadmin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  moderator: 'bg-green-100 text-green-800',
  user: 'bg-gray-100 text-gray-800',
  default: 'bg-gray-100 text-gray-800'
};

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  try {
    // Call the API with filters
    const response = await api.get('/admin/users', { params: filters });
    console.log('Users fetched successfully:', response.data);

    if (response.data && response.data.data) {
      users.value = response.data.data;
      totalUsers.value = response.data.total || response.data.data.length;
    } else {
      console.error('Unexpected API response format:', response.data);
      users.value = [];
      totalUsers.value = 0;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
    totalUsers.value = 0;
  } finally {
    loading.value = false;
  }
};

// Apply filters
const applyFilters = () => {
  fetchUsers();
};

// Reset filters
const resetFilters = () => {
  filters.search = '';
  filters.role = '';
  fetchUsers();
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Open create user modal
const openCreateUserModal = () => {
  editingUser.value = null;
  userForm.name = '';
  userForm.email = '';
  userForm.password = '';
  userForm.password_confirmation = '';
  userForm.roles = [4]; // Default to 'user' role
  clearFormErrors();
  showUserModal.value = true;
};

// Open edit user modal
const editUser = (user) => {
  editingUser.value = user;
  userForm.name = user.name;
  userForm.email = user.email;
  userForm.password = '';
  userForm.password_confirmation = '';
  userForm.roles = user.roles.map(role => role.id);
  clearFormErrors();
  showUserModal.value = true;
};

// Close user modal
const closeUserModal = () => {
  showUserModal.value = false;
};

// Clear form errors
const clearFormErrors = () => {
  formErrors.name = '';
  formErrors.email = '';
  formErrors.password = '';
  formErrors.roles = '';
};

// Save user
const saveUser = async () => {
  saving.value = true;
  clearFormErrors();

  try {
    if (editingUser.value) {
      // Update existing user
      try {
        const response = await api.put(`/admin/users/${editingUser.value.id}`, userForm);
        console.log('User updated successfully:', response.data);

        // Show success notification
        notificationStore.success(
          `El usuario ${userForm.name} ha sido actualizado correctamente.`,
          'Usuario actualizado'
        );

        // Refresh the user list
        await fetchUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        throw error; // Re-throw to be caught by the outer try/catch
      }
    } else {
      // Create new user
      try {
        const response = await api.post('/admin/users', userForm);
        console.log('User created successfully:', response.data);

        // Show success notification
        notificationStore.success(
          `El usuario ${userForm.name} ha sido creado correctamente.`,
          'Usuario creado'
        );

        // Refresh the user list
        await fetchUsers();
      } catch (error) {
        console.error('Error creating user:', error);
        throw error; // Re-throw to be caught by the outer try/catch
      }
    }

    closeUserModal();
  } catch (error) {
    console.error('Error saving user:', error);

    // Handle validation errors
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      if (errors.name) formErrors.name = errors.name[0];
      if (errors.email) formErrors.email = errors.email[0];
      if (errors.password) formErrors.password = errors.password[0];
      if (errors.roles) formErrors.roles = errors.roles[0];
    }
  } finally {
    saving.value = false;
  }
};

// Confirm delete user
const confirmDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  userToDelete.value = null;
};

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return;

  deleting.value = true;

  try {
    // Call the API to delete the user
    await api.delete(`/admin/users/${userToDelete.value.id}`);
    console.log('User deleted successfully');

    // Show success notification
    notificationStore.success(
      `El usuario ${userToDelete.value.name} ha sido eliminado correctamente.`,
      'Usuario eliminado'
    );

    // Refresh the user list
    await fetchUsers();

    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting user:', error);

    // Show error notification
    notificationStore.error(
      'Ha ocurrido un error al eliminar el usuario. Por favor, inténtelo de nuevo.',
      'Error al eliminar'
    );
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(() => {
  fetchUsers();
});
</script>