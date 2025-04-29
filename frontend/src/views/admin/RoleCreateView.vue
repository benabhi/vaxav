<template>
  <AdminLayout>
    <template #breadcrumbs>
      <BaseBreadcrumb
        :items="[
          { text: 'Roles', to: '/admin/roles' },
          { text: 'Crear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div class="py-6">
      <!-- Form Card -->
      <div class="max-w-3xl mx-auto bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Crear Nuevo Rol</h2>
        </div>

        <div class="p-6">
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
              <BaseButton type="submit" variant="primary" :full-width="false" :loading="saving">
                Crear rol
              </BaseButton>
              <BaseButton type="button" variant="secondary" :full-width="false" @click="goBack">
                Cancelar
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseCheckbox from '@/components/ui/forms/BaseCheckbox.vue';
import BaseBreadcrumb from '@/components/ui/navigation/BaseBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';
import api from '@/services/api';

const router = useRouter();
const notificationStore = useNotificationStore();

// Role form
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

// Available permissions
const availablePermissions = ref([]);

// Generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Watch for name changes to auto-generate slug
watch(() => roleForm.name, (newName) => {
  roleForm.slug = generateSlug(newName);
});

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
    // Create new role
    const response = await api.post('/admin/roles', roleForm);
    console.log('Role created successfully:', response.data);

    // Show success notification
    notificationStore.adminSuccess(
      `El rol ${roleForm.name} ha sido creado correctamente.`
    );

    // Redirect to roles list
    router.push('/admin/roles');
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

// Go back to roles list
const goBack = () => {
  router.push('/admin/roles');
};

// Fetch data on mount
onMounted(async () => {
  await fetchPermissions();
});
</script>
