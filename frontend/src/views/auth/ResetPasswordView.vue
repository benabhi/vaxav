<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Restablecer Contraseña"
        :has-border="false"
        submitText="Restablecer Contraseña"
        cancelText="Volver al login"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="goToLogin"
      >
        <template #alert>
          <VxvAlert
            v-if="message"
            :variant="alertVariant"
            :message="message"
            class="mb-6"
          />
        </template>
        <p class="text-gray-300 mb-6">
          Ingresa tu dirección de correo electrónico y tu nueva contraseña.
        </p>

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
            id="password"
            v-model="form.password"
            label="Nueva Contraseña"
            type="password"
            required
            :error="errors.password"
          />
          <p class="text-xs text-gray-400 mt-1">
            La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
          </p>
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
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const form = reactive({
  email: '',
  password: '',
  password_confirmation: '',
  token: props.token
});

const errors = reactive({
  email: '',
  password: '',
  password_confirmation: ''
});

const loading = ref(false);
const message = ref('');
const alertVariant = ref('info');

// Obtener el email del query string si está disponible
onMounted(() => {
  const email = route.query.email as string;
  if (email) {
    form.email = email;
  }
});

// Validar el formulario antes de enviarlo
const validateForm = (): boolean => {
  let isValid = true;

  // Limpiar errores previos
  errors.email = '';
  errors.password = '';
  errors.password_confirmation = '';

  // Validar email
  if (!form.email) {
    errors.email = 'El email es obligatorio';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email debe tener un formato válido';
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

  loading.value = true;
  message.value = '';

  try {
    const response = await authStore.resetPassword(form);
    message.value = response.message || 'Tu contraseña ha sido restablecida correctamente.';
    alertVariant.value = 'success';

    // Mostrar notificación de éxito
    notificationStore.success(
      'Tu contraseña ha sido restablecida correctamente.',
      'Contraseña actualizada',
      7000
    );

    // Redirigir al login después de un breve retraso
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err: any) {
    alertVariant.value = 'error';

    // Manejar errores de validación
    if (err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;

      if (validationErrors.email) {
        errors.email = Array.isArray(validationErrors.email)
          ? validationErrors.email[0]
          : validationErrors.email;
      }

      if (validationErrors.password) {
        errors.password = Array.isArray(validationErrors.password)
          ? validationErrors.password[0]
          : validationErrors.password;
      }

      if (validationErrors.password_confirmation) {
        errors.password_confirmation = Array.isArray(validationErrors.password_confirmation)
          ? validationErrors.password_confirmation[0]
          : validationErrors.password_confirmation;
      }

      message.value = 'Por favor, corrige los errores en el formulario.';
    } else {
      message.value = authStore.error || 'Ha ocurrido un error al restablecer tu contraseña.';
    }
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>
