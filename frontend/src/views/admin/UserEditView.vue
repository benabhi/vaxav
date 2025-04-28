<template>
  <AdminLayout title="Editar Usuario">
    <template #breadcrumbs>
      <BaseBreadcrumb
        :items="[
          { text: 'Usuarios', to: '/admin/users' },
          { text: 'Editar' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div class="py-6">
      <!-- Form Card -->
      <div class="max-w-3xl mx-auto bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Editar Usuario</h2>
        </div>

        <div v-if="loading" class="p-6 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <div v-else class="p-6">
          <form @submit.prevent="handleSubmit">
            <!-- Name -->
            <div class="mb-4">
              <BaseInput
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
              <BaseInput
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
              <BaseInput
                id="password"
                v-model="values.password"
                label="Contraseña (dejar en blanco para mantener la actual)"
                type="password"
                :error="touched.password && errors.password ? errors.password : ''"
                @blur="() => handleBlur('password')"
                labelClass="text-lg font-bold text-white"
              />
            </div>

            <!-- Password Confirmation -->
            <div class="mb-4">
              <BaseInput
                id="password_confirmation"
                v-model="values.password_confirmation"
                label="Confirmar contraseña"
                type="password"
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
                  <BaseCheckbox
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

            <div class="flex space-x-3">
              <BaseButton type="submit" variant="primary" :full-width="false" :loading="submitting">
                Guardar cambios
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseCheckbox from '@/components/ui/forms/BaseCheckbox.vue';
import BaseBreadcrumb from '@/components/ui/navigation/BaseBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const userId = route.params.id;
const loading = ref(true);

// Available roles
const availableRoles = ref([
  { id: 1, name: 'Super Admin', slug: 'superadmin' },
  { id: 2, name: 'Administrador', slug: 'admin' },
  { id: 3, name: 'Moderador', slug: 'moderator' },
  { id: 4, name: 'Usuario', slug: 'user' }
]);

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
    // Password is optional when editing
    value => value && value.length > 0 && value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null
  ],
  password_confirmation: [
    // Only validate if password is provided
    (value, values) => values.password && value !== values.password ? 'Las contraseñas no coinciden' : null
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
  setValues,
  setErrors
} = useForm({
  initialValues: {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: []
  },
  validationRules,
  onSubmit: async (formValues) => {
    try {
      // Remove password fields if empty
      const userData = { ...formValues };
      if (!userData.password) {
        delete userData.password;
        delete userData.password_confirmation;
      }

      // Update user
      const response = await api.put(`/admin/users/${userId}`, userData);


      // Show success notification
      notificationStore.adminSuccess(
        `El usuario ${formValues.name} ha sido actualizado correctamente.`
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
          'Ha ocurrido un error al actualizar el usuario. Por favor, inténtalo de nuevo.'
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

// Fetch user data
const fetchUser = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/admin/users/${userId}`);
    const userData = response.data;

    // Set form values
    setValues({
      name: userData.name,
      email: userData.email,
      password: '',
      password_confirmation: '',
      roles: userData.roles.map(role => role.id)
    });
  } catch (error) {

    notificationStore.adminError(
      'Ha ocurrido un error al cargar los datos del usuario.'
    );
    router.push('/admin/users');
  } finally {
    loading.value = false;
  }
};

// Go back to users list
const goBack = () => {
  router.push('/admin/users');
};

// Fetch user data on mount
onMounted(() => {
  fetchUser();
});
</script>
