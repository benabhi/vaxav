<template>
  <AdminLayout title="Gestión de Usuarios">
    <template #breadcrumbs>
      <BaseBreadcrumb
        :items="[
          { text: 'Usuarios' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div class="py-6">
      <!-- Users DataTable -->
      <BaseDataTable
        title="Usuarios"
        :columns="columns"
        :items="users"
        :loading="loading"
        :total="totalUsers"
        :total-pages="pagination.totalPages"
        :current-page="pagination.currentPage"
        :per-page="pagination.perPage"
        :filters="filters"
        create-button-label="Nuevo Usuario"
        search-placeholder="Buscar por nombre o email"
        item-name="usuarios"
        @page-change="changePage"
        @per-page-change="handlePerPageChange"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
        @create="openCreateUserModal"
      >
        <!-- Custom filters -->
        <template #filters>
          <div class="w-full md:w-auto">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-300">Rol:</span>
              <BaseSelect
                id="role-filter"
                v-model="filters.role"
                size="sm"
                :options="[
                  { value: '', label: 'Todos los roles' },
                  { value: 'superadmin', label: 'Super Admin' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'moderator', label: 'Moderador' },
                  { value: 'user', label: 'Usuario' }
                ]"
                class="block w-full"
                @update:modelValue="handleRoleChange"
              />
            </div>
          </div>
        </template>

        <!-- Custom cell templates -->
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
      </BaseDataTable>
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
import BaseDataTable from '@/components/ui/tables/BaseDataTable.vue';
import BaseBreadcrumb from '@/components/ui/navigation/BaseBreadcrumb.vue';
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
  { key: 'name', label: 'Usuario', sortable: true },
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha de registro', sortable: true }
];

// Pagination
const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  perPage: 10
});

// Filters
const filters = reactive({
  search: '',
  role: '',
  sort_field: 'name',
  sort_direction: 'asc'
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
    // Call the API with filters and pagination
    const params = {
      ...filters,
      page: pagination.currentPage,
      per_page: pagination.perPage
    };

    const response = await api.get('/admin/users', { params });
    console.log('Users fetched successfully:', response.data);

    if (response.data && response.data.data) {
      users.value = response.data.data;
      totalUsers.value = response.data.total || response.data.data.length;

      // Update pagination
      pagination.totalPages = response.data.last_page || Math.ceil(totalUsers.value / pagination.perPage);
      pagination.currentPage = response.data.current_page || pagination.currentPage;
    } else {
      console.error('Unexpected API response format:', response.data);
      users.value = [];
      totalUsers.value = 0;
      pagination.totalPages = 1;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
    totalUsers.value = 0;
    pagination.totalPages = 1;
  } finally {
    loading.value = false;
  }
};

// Change page
const changePage = (page) => {
  pagination.currentPage = page;
  fetchUsers();
};

// Handle filter change
const handleFilterChange = (newFilters) => {
  // Update local filters with new values
  Object.keys(newFilters).forEach(key => {
    filters[key] = newFilters[key];
  });

  // Reset to first page when filters change
  pagination.currentPage = 1;
  fetchUsers();
};

// Handle role change
const handleRoleChange = (value) => {
  filters.role = value;
  pagination.currentPage = 1;
  fetchUsers();
};

// Handle per page change
const handlePerPageChange = (newPerPage) => {
  pagination.perPage = newPerPage;
  pagination.currentPage = 1; // Reset to first page
  fetchUsers();
};

// Handle sort change
const handleSortChange = (sortData) => {
  filters.sort_field = sortData.key;
  filters.sort_direction = sortData.order;
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