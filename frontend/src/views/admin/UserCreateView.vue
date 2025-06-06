<template>
  <AdminLayout title="Crear Usuario">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Usuarios', to: '/admin/users' },
          { text: 'Crear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <VxvForm
      title="Crear Nuevo Usuario"
      submitText="Crear usuario"
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

      <!-- Email -->
      <div class="mb-4">
        <VxvInput
          id="email"
          v-model="values.email"
          label="Correo electrónico"
          type="email"
          required
          :error="touched.email && errors.email ? errors.email : ''"
          @blur="() => handleBlur('email')"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Password -->
      <div class="mb-4">
        <VxvInput
          id="password"
          v-model="values.password"
          label="Contraseña"
          type="password"
          required
          :error="touched.password && errors.password ? errors.password : ''"
          @blur="() => handleBlur('password')"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Password Confirmation -->
      <div class="mb-4">
        <VxvInput
          id="password_confirmation"
          v-model="values.password_confirmation"
          label="Confirmar contraseña"
          type="password"
          required
          :error="touched.password_confirmation && errors.password_confirmation ? errors.password_confirmation : ''"
          @blur="() => handleBlur('password_confirmation')"
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
              v-model="values.roles"
              :label="role.name"
              @blur="() => handleBlur('roles')"
            />
          </div>
        </div>
        <p v-if="touched.roles && errors.roles" class="mt-1 text-sm text-red-500">{{ errors.roles }}</p>
      </div>
    </VxvForm>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification.ts';
import { useForm } from '@/composables/useForm';
import { useRoles } from '@/composables/useRoles';
import api from '@/services/api';

const router = useRouter();
const notificationStore = useNotificationStore();

// Use roles composable to get all roles
const { roles: availableRoles, fetchRoles } = useRoles();

// Load roles on mount
onMounted(async () => {
  await fetchRoles();

  // Find the user role ID to set as default
  const userRole = availableRoles.value.find(role => role.slug === 'user');
  if (userRole) {
    values.roles = [userRole.id];
  }
});

// Validation rules
const validationRules = {
  name: [
    value => !value ? 'El nombre es obligatorio' : null,
    value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
  ],
  email: [
    value => !value ? 'El correo electrónico es obligatorio' : null,
    value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'El correo electrónico no es válido' : null
  ],
  password: [
    value => !value ? 'La contraseña es obligatoria' : null,
    value => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null
  ],
  password_confirmation: [
    value => !value ? 'La confirmación de contraseña es obligatoria' : null,
    (value, values) => value !== values.password ? 'Las contraseñas no coinciden' : null
  ],
  roles: [
    value => !value || value.length === 0 ? 'Debe seleccionar al menos un rol' : null
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
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] // Will be set after roles are loaded
  },
  validationRules,
  onSubmit: async (formValues) => {
    try {
      // Create new user
      const response = await api.post('/admin/users', formValues);


      // Show success notification
      notificationStore.adminSuccess(
        `El usuario ${formValues.name} ha sido creado correctamente.`
      );

      // Redirect to users list
      router.push('/admin/users');
    } catch (error) {


      // Handle validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const apiErrors = {};
        const errors = error.response.data.errors;

        if (errors.name) apiErrors.name = errors.name[0];
        if (errors.email) apiErrors.email = errors.email[0];
        if (errors.password) apiErrors.password = errors.password[0];
        if (errors.roles) apiErrors.roles = errors.roles[0];

        setErrors(apiErrors);
      } else {
        // Show error notification
        notificationStore.adminError(
          'Ha ocurrido un error al crear el usuario. Por favor, inténtalo de nuevo.'
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

// Go back to users list
const goBack = () => {
  router.push('/admin/users');
};
</script>
