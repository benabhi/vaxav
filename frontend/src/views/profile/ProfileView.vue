<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto py-8 px-4">
      <h1 class="text-3xl font-bold mb-6 text-blue-400">Perfil de Usuario</h1>

      <div v-if="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else>
        <VxvForm
          title="Editar Perfil"
          submitText="Guardar cambios"
          :loading="submitting"
          :show-cancel="true"
          cancel-text="Cancelar"
          :has-border="false"
          @submit="handleSubmit"
          @cancel="goToHome"
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
              label="Contraseña (dejar en blanco para mantener la actual)"
              type="password"
              :error="touched.password && errors.password ? errors.password : ''"
              @blur="() => handleBlur('password')"
              labelClass="text-lg font-bold text-white"
            />
          </div>

          <!-- Password Confirmation -->
          <div class="mb-6">
            <VxvInput
              id="password_confirmation"
              v-model="values.password_confirmation"
              label="Confirmar contraseña"
              type="password"
              :error="touched.password_confirmation && errors.password_confirmation ? errors.password_confirmation : ''"
              @blur="() => handleBlur('password_confirmation')"
              labelClass="text-lg font-bold text-white"
            />
          </div>

          <!-- Roles (solo lectura) -->
          <div class="mb-6" v-if="userRoles.length > 0">
            <label class="block text-lg font-bold text-white mb-2">Roles</label>
            <div class="bg-gray-700 border border-gray-600 rounded-md p-4">
              <div v-for="role in userRoles" :key="role.id" class="mb-2 last:mb-0">
                <VxvBadge :color="getRoleBadgeColor(role.slug)">{{ role.name }}</VxvBadge>
              </div>
            </div>
          </div>
        </VxvForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import { useNotificationStore } from '@/stores/notification.ts';
import { useUserStore } from '@/stores/user';
import { useForm } from '@/composables/useForm';
import api from '@/services/api';

const router = useRouter();
const notificationStore = useNotificationStore();
const userStore = useUserStore();

const loading = ref(true);
const userRoles = ref<any[]>([]);

// Validation rules
const validationRules = {
  name: [
    value => !value ? 'El nombre es obligatorio' : null
  ],
  email: [
    value => !value ? 'El correo electrónico es obligatorio' : null,
    value => value && !/\S+@\S+\.\S+/.test(value) ? 'El correo electrónico no es válido' : null
  ],
  password: [
    value => value && value.length < 8 && value.length > 0 ? 'La contraseña debe tener al menos 8 caracteres' : null,
    value => value && value.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) ?
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' : null
  ],
  password_confirmation: [
    (value, values) => values.password && !value ? 'La confirmación de contraseña es obligatoria' : null,
    (value, values) => values.password && value !== values.password ? 'Las contraseñas no coinciden' : null
  ]
};

// Use form composable
const {
  values,
  errors,
  touched,
  submitting,
  handleBlur,
  handleSubmit,
  setValues,
  setErrors
} = useForm({
  initialValues: {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  },
  validationRules,
  onSubmit: async (formValues) => {
    try {
      // Remove password fields if empty
      const userData = { ...formValues };
      if (!userData.password) {
        delete userData.password;
        delete userData.password_confirmation;
      } else {
        // Validate password manually before sending to backend
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(userData.password)) {
          setErrors({
            password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
          });
          throw new Error('Contraseña inválida');
        }

        // Validate password confirmation
        if (userData.password !== userData.password_confirmation) {
          setErrors({
            password_confirmation: 'Las contraseñas no coinciden'
          });
          throw new Error('Las contraseñas no coinciden');
        }
      }

      // Update user profile
      await api.put('/auth/profile', userData);

      // Update user in user store
      await userStore.refreshUserData();

      // Show success notification
      notificationStore.success('Tu perfil ha sido actualizado correctamente.');

      // Redirect to pilot overview page
      router.push('/pilot/overview');
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        const errorData = error.response.data.errors;

        Object.keys(errorData).forEach(key => {
          apiErrors[key] = errorData[key][0];
        });

        setErrors(apiErrors);
      } else {
        // Show generic error notification
        notificationStore.error(
          error.response?.data?.message || 'Ha ocurrido un error al actualizar tu perfil.'
        );
      }

      throw error;
    }
  }
});

// Get role badge color based on role slug
const getRoleBadgeColor = (roleSlug: string) => {
  switch (roleSlug) {
    case 'superadmin':
      return 'red';
    case 'admin':
      return 'purple';
    case 'moderator':
      return 'blue';
    default:
      return 'gray';
  }
};

// Navigate to pilot overview page
const goToHome = () => {
  router.push('/pilot/overview');
};

// Load user data
onMounted(async () => {
  try {
    // Ensure we have the latest user data
    await userStore.loadUserData();

    const user = userStore.userData;

    if (user) {
      // Set form values
      setValues({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: ''
      });

      // Set user roles
      if (user.roles && Array.isArray(user.roles)) {
        userRoles.value = user.roles;
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    notificationStore.error('No se pudo cargar la información del usuario.');
  } finally {
    loading.value = false;
  }
});
</script>
