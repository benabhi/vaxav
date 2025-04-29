<template>
  <AdminLayout title="Crear Rol">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Roles', to: '/admin/roles' },
          { text: 'Crear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <VxvForm
      title="Crear Nuevo Rol"
      submitText="Crear rol"
      :loading="submitting"
      @submit="handleSubmit"
      @cancel="goBack"
    >
      <!-- Name -->
      <div class="mb-4">
        <VxvInput
          id="name"
          v-model="values.name"
          label="Nombre"
          type="text"
          required
          :error="touched.name && errors.name ? errors.name : ''"
          @blur="() => handleBlur('name')"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Slug -->
      <div class="mb-4">
        <VxvInput
          id="slug"
          v-model="values.slug"
          label="Slug"
          type="text"
          required
          :error="touched.slug && errors.slug ? errors.slug : ''"
          @blur="() => handleBlur('slug')"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Description -->
      <div class="mb-4">
        <VxvTextarea
          id="description"
          v-model="values.description"
          label="Descripción"
          :error="touched.description && errors.description ? errors.description : ''"
          @blur="() => handleBlur('description')"
          labelClass="text-lg font-bold text-white"
          rows="3"
        />
      </div>

      <!-- Permissions -->
      <div class="mb-6">
        <label class="block text-lg font-bold text-white mb-2">Permisos</label>
        <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-60 overflow-y-auto">
          <div v-if="availablePermissions.length === 0" class="text-gray-400">
            Cargando permisos...
          </div>
          <div v-else>
            <div v-for="permission in availablePermissions" :key="permission.id" class="mb-2 last:mb-0">
              <VxvCheckbox
                :id="`permission-${permission.id}`"
                :value="permission.id"
                v-model="values.permissions"
                :label="permission.name"
                @blur="() => handleBlur('permissions')"
              />
            </div>
          </div>
        </div>
        <p v-if="touched.permissions && errors.permissions" class="mt-1 text-sm text-red-500">{{ errors.permissions }}</p>
      </div>
    </VxvForm>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import { usePermissions } from '@/composables/usePermissions';
import api from '@/services/api';

const router = useRouter();
const notificationStore = useNotificationStore();

// Available permissions
const availablePermissions = ref([]);

// Use permissions composable
const { getAllPermissions } = usePermissions();

// Generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Validation rules
const validationRules = {
  name: [
    value => !value ? 'El nombre es obligatorio' : null,
    value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
  ],
  slug: [
    value => !value ? 'El slug es obligatorio' : null,
    value => !/^[a-z0-9-]+$/.test(value) ? 'El slug solo puede contener letras minúsculas, números y guiones' : null
  ],
  permissions: [
    value => !value || value.length === 0 ? 'Debe seleccionar al menos un permiso' : null
  ]
};

// Use form composable
const {
  values,
  errors,
  touched,
  submitting,
  handleChange,
  handleBlur,
  handleSubmit,
  setErrors
} = useForm({
  initialValues: {
    name: '',
    slug: '',
    description: '',
    permissions: []
  },
  validationRules,
  onSubmit: async (formValues) => {
    try {
      // Create new role
      const response = await api.post('/admin/roles', formValues);


      // Show success notification
      notificationStore.adminSuccess(
        `El rol ${formValues.name} ha sido creado correctamente.`
      );

      // Redirect to roles list
      router.push('/admin/roles');
    } catch (error) {


      // Handle validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        const errors = error.response.data.errors;

        if (errors.name) apiErrors.name = errors.name[0];
        if (errors.slug) apiErrors.slug = errors.slug[0];
        if (errors.description) apiErrors.description = errors.description[0];
        if (errors.permissions) apiErrors.permissions = errors.permissions[0];

        setErrors(apiErrors);
      } else {
        // Show error notification
        notificationStore.adminError(
          'Ha ocurrido un error al crear el rol. Por favor, inténtalo de nuevo.'
        );
      }

      // Re-throw to prevent form from being reset
      throw error;
    }
  },
  onError: (formErrors) => {
    // Handle form validation errors
  }
});

// Watch for name changes to auto-generate slug
watch(() => values.name, (newName) => {
  values.slug = generateSlug(newName);
});

// Fetch available permissions
const fetchPermissions = async () => {
  try {
    const permissions = await getAllPermissions();

    if (Array.isArray(permissions)) {
      availablePermissions.value = permissions;
    } else {
      console.error('Permissions is not an array:', permissions);
      availablePermissions.value = [];
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
    availablePermissions.value = [];
  }
};

// Go back to roles list
const goBack = () => {
  router.push('/admin/roles');
};

// Fetch data on mount
onMounted(() => {
  fetchPermissions();
});
</script>
