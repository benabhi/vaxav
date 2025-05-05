<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Crear Cuenta"
        :has-border="false"
        submitText="Registrarse"
        :show-cancel="false"
        :full-width-submit="true"
        :loading="authStore.loading"
        @submit="handleSubmit"
      >
        <template #alert>
          <VxvAlert
            v-if="authStore.error"
            variant="error"
            :message="authStore.error"
            :dismissible="false"
            class="mb-6"
          />
        </template>
        <div class="mb-4">
          <VxvInput
            id="name"
            v-model="form.name"
            label="Nombre"
            type="text"
            required
            :error="errors.name"
          />
        </div>

        <div class="mb-4">
          <VxvInput
            id="email"
            v-model="form.email"
            label="Email"
            type="email"
            required
            :error="errors.email"
          />
        </div>

        <div class="mb-4">
          <VxvInput
            id="email_confirmation"
            v-model="form.email_confirmation"
            label="Confirmar Email"
            type="email"
            required
            :error="errors.email_confirmation"
          />
        </div>

        <div class="mb-4">
          <VxvInput
            id="password"
            v-model="form.password"
            label="Contraseña"
            type="password"
            required
            :error="errors.password"
          />
        </div>

        <div class="mb-6">
          <VxvInput
            id="password_confirmation"
            v-model="form.password_confirmation"
            label="Confirmar Contraseña"
            type="password"
            required
            :error="errors.password_confirmation"
          />
        </div>

        <template #footer>
          <div class="mt-6 text-center text-gray-400">
            ¿Ya tienes una cuenta?
            <RouterLink to="/login" class="text-blue-400 hover:underline">
              Inicia Sesión
            </RouterLink>
          </div>
        </template>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  email_confirmation: '',
  password: '',
  password_confirmation: '',
});

const errors = reactive({
  name: '',
  email: '',
  email_confirmation: '',
  password: '',
  password_confirmation: '',
});

// Validaciones del lado del cliente
const validateForm = (): boolean => {
  let isValid = true;

  // Limpiar errores previos
  errors.name = '';
  errors.email = '';
  errors.email_confirmation = '';
  errors.password = '';
  errors.password_confirmation = '';

  // Validar nombre (solo letras y números, 3-12 caracteres)
  if (!form.name) {
    errors.name = 'El nombre es obligatorio';
    isValid = false;
  } else if (!/^[a-zA-Z0-9]{3,12}$/.test(form.name)) {
    errors.name = 'El nombre debe tener entre 3 y 12 caracteres alfanuméricos';
    isValid = false;
  }

  // Validar email (formato de email)
  if (!form.email) {
    errors.email = 'El email es obligatorio';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email debe tener un formato válido';
    isValid = false;
  }

  // Validar confirmación de email
  if (!form.email_confirmation) {
    errors.email_confirmation = 'La confirmación de email es obligatoria';
    isValid = false;
  } else if (form.email !== form.email_confirmation) {
    errors.email_confirmation = 'Los emails no coinciden';
    isValid = false;
  }

  // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial)
  if (!form.password) {
    errors.password = 'La contraseña es obligatoria';
    isValid = false;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
    isValid = false;
  }

  // Validar confirmación de contraseña
  if (!form.password_confirmation) {
    errors.password_confirmation = 'La confirmación de contraseña es obligatoria';
    isValid = false;
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateForm()) {
    return;
  }

  try {
    await authStore.register(form);

    if (authStore.isLoggedIn) {
      // Redirigir a la página de verificación de email
      router.push({ name: 'verification.notice' });
    }
  } catch (error: any) {
    // Los errores de validación del servidor ya son manejados por el store
    console.error('Error en el registro:', error);

    // Si hay errores de validación del servidor, actualizar los errores locales
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;

      if (serverErrors.name) {
        errors.name = Array.isArray(serverErrors.name) ? serverErrors.name[0] : serverErrors.name;
      }

      if (serverErrors.email) {
        errors.email = Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email;
      }

      if (serverErrors.password) {
        errors.password = Array.isArray(serverErrors.password) ? serverErrors.password[0] : serverErrors.password;
      }

      if (serverErrors.password_confirmation) {
        errors.password_confirmation = Array.isArray(serverErrors.password_confirmation)
          ? serverErrors.password_confirmation[0]
          : serverErrors.password_confirmation;
      }
    }
  }
};
</script>
