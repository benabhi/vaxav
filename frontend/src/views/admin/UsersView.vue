<template>
  <AdminCrudView
    title="Gestión de Usuarios"
    tableTitle="Usuarios"
    :breadcrumbItems="[{ text: 'Usuarios' }]"
    :columns="columns"
    :items="users"
    :loading="loading"
    :total="totalUsers"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nuevo Usuario"
    searchPlaceholder="Buscar por nombre o email"
    itemName="usuarios"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateUser"
  >
    <!-- Custom filters -->
    <template #filters>
      <div class="w-full md:w-[180px]">
        <!-- Role label -->
        <label
          for="role-filter"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          Rol
        </label>

        <!-- Role selector with clear button -->
        <div class="flex items-center space-x-2">
          <VxvSelect
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
          <button
            v-if="filters.role"
            @click="clearRoleFilter"
            class="text-gray-400 hover:text-white flex-shrink-0"
            title="Quitar filtro"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
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
      <div class="flex flex-wrap gap-1">
        <VxvBadge
          v-for="role in item.roles"
          :key="role.id"
          :variant="roleBadgeVariants[role.slug] || 'gray'"
          class="mr-1"
        >
          {{ role.name }}
        </VxvBadge>
      </div>
    </template>

    <template #cell(status)="{ item }">
      <VxvBadge variant="success">
        Activo
      </VxvBadge>
    </template>

    <template #cell(created_at)="{ item }">
      {{ formatDate(item.created_at) }}
    </template>

    <template #actions="{ item }">
      <button @click="editUser(item)" class="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
      <button @click="confirmDeleteUser(item)" class="text-red-400 hover:text-red-300">Eliminar</button>
    </template>

    <!-- Modals -->
    <template #modals>
      <!-- User form modal (create/edit) -->
      <VxvModal :show="showUserModal" :title="editingUser ? 'Editar Usuario' : 'Crear Usuario'" color="blue"
        @close="closeUserModal">
        <form @submit.prevent="saveUser">
          <!-- Name -->
          <div class="mb-4">
            <VxvInput
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
            <VxvInput
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
            <VxvInput
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
            <VxvInput
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
                <VxvCheckbox
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
            <VxvButton type="submit" variant="primary" :full-width="true" :loading="saving">
              {{ editingUser ? 'Guardar cambios' : 'Crear usuario' }}
            </VxvButton>
            <VxvButton type="button" variant="secondary" :full-width="true" @click="closeUserModal">
              Cancelar
            </VxvButton>
          </div>
        </form>
      </VxvModal>

      <!-- Delete confirmation modal -->
      <VxvModal :show="showDeleteModal" title="Eliminar usuario" color="red" @close="closeDeleteModal">
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
          <VxvButton type="button" variant="danger" :full-width="true" :loading="deleting" @click="deleteUser">
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import { useNotificationStore } from '@/stores/notification';
import { useUsers } from '@/composables/useUsers';

// Mostrar etiquetas de filtros
const showFilterLabels = true;

const router = useRouter();
const notificationStore = useNotificationStore();

// Usar el composable de usuarios
const {
  users,
  totalUsers,
  loading,
  pagination,
  filters,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser: deleteUserApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useUsers();

// Table columns
const columns = [
  { key: 'name', label: 'Usuario', sortable: true, width: '30%' },
  { key: 'roles', label: 'Roles', width: '30%' },
  { key: 'status', label: 'Estado', width: '15%' },
  { key: 'created_at', label: 'Fecha de registro', sortable: true, width: '25%' }
];

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

// Role badge variants
const roleBadgeVariants = {
  superadmin: 'purple',
  admin: 'blue',
  moderator: 'green',
  user: 'gray',
  default: 'gray'
};

// Handle role change
const handleRoleChange = (value) => {
  filters.role = value;
  updateFilters(filters);
};

// Clear role filter
const clearRoleFilter = () => {
  filters.role = '';
  updateFilters(filters);
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

// Navigate to create user page
const goToCreateUser = () => {
  router.push('/admin/users/create');
};

// Navigate to edit user page
const editUser = (user) => {
  router.push(`/admin/users/${user.id}/edit`);
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
      await updateUser(editingUser.value.id, userForm);
    } else {
      // Create new user
      await createUser(userForm);
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
    const success = await deleteUserApi(userToDelete.value.id);

    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};

// Fetch data on mount
onMounted(() => {
  fetchUsers();
});
</script>