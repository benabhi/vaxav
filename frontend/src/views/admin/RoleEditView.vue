<template>
  <AdminLayout title="Editar Rol">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Roles', to: '/admin/roles' },
          { text: 'Editar' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="py-6 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <VxvForm
      v-else
      title="Editar Rol"
      submitText="Guardar cambios"
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
          :disabled="isSystemRole"
        />
        <p v-if="isSystemRole" class="mt-1 text-sm text-yellow-500">
          Este es un rol del sistema y su slug no puede ser modificado.
        </p>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import { useRoles } from '@/composables/useRoles';
import { usePermissions } from '@/composables/usePermissions';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const roleId = route.params.id;
const loading = ref(true);
const availablePermissions = ref([]);

// Use permissions composable
const { getAllPermissions } = usePermissions();

// Check if it's a system role
const isSystemRole = computed(() => {
  return ['superadmin', 'admin', 'moderator', 'user'].includes(values.slug);
});

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
  setValues,
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
      // Update role
      const response = await api.put(`/admin/roles/${roleId}`, formValues);


      // Show success notification
      notificationStore.adminSuccess(
        `El rol ${formValues.name} ha sido actualizado correctamente.`
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
          'Ha ocurrido un error al actualizar el rol. Por favor, inténtalo de nuevo.'
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

// Fetch role data
const fetchRole = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/admin/roles/${roleId}`);
    const roleData = response.data;

    // Set form values
    setValues({
      name: roleData.name,
      slug: roleData.slug,
      description: roleData.description || '',
      permissions: roleData.permissions ? roleData.permissions.map(p => p.id) : []
    });
  } catch (error) {

    notificationStore.adminError(
      'Ha ocurrido un error al cargar los datos del rol.'
    );
    router.push('/admin/roles');
  } finally {
    loading.value = false;
  }
};

// Fetch available permissions
const fetchPermissions = async () => {
  try {
    const permissions = await getAllPermissions();
    availablePermissions.value = permissions;
  } catch (error) {

    availablePermissions.value = [];
  }
};

// Go back to roles list
const goBack = () => {
  router.push('/admin/roles');
};

// Fetch data on mount
onMounted(() => {
  fetchRole();
  fetchPermissions();
});
</script>
