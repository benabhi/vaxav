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
      <!-- Role form modal (create/edit) -->
      <VxvModal :show="showRoleModal" :title="editingRole ? 'Editar Rol' : 'Crear Rol'" color="blue"
        @close="closeRoleModal">
        <form @submit.prevent="saveRole">
          <!-- Name -->
          <div class="mb-4">
            <VxvInput
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
            <VxvInput
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
                  <VxvCheckbox
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
            <VxvButton type="submit" variant="primary" :full-width="true" :loading="saving">
              {{ editingRole ? 'Guardar cambios' : 'Crear rol' }}
            </VxvButton>
            <VxvButton type="button" variant="secondary" :full-width="true" @click="closeRoleModal">
              Cancelar
            </VxvButton>
          </div>
        </form>
      </VxvModal>

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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRoles } from '@/composables/useRoles';
import api from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Usar el composable de roles
const {
  roles,
  loading,
  pagination,
  filters,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole: deleteRoleApi,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useRoles();

// Check if user is superadmin
const isSuperAdmin = computed(() => {
  return authStore.user?.is_superadmin === true || authStore.user?.roles?.some(role => role.slug === 'superadmin') || false;
});

// Table columns
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'description', label: 'Descripción' },
  { key: 'permissions', label: 'Permisos' }
];

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

// Navigate to create role page
const goToCreateRole = () => {
  router.push('/admin/roles/create');
};

// Navigate to edit role page
const editRole = (role) => {
  router.push(`/admin/roles/${role.id}/edit`);
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
      await updateRole(editingRole.value.id, roleForm);
    } else {
      // Create new role
      await createRole(roleForm);
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