<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvAlert
        v-if="message"
        :variant="alertVariant"
        :message="message"
        class="mb-6"
      />

      <VxvForm
        title="Restablecer Contraseña"
        :has-border="false"
        submitText="Restablecer Contraseña"
        cancelText="Volver al login"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="goToLogin"
      >
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
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

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

const handleSubmit = async () => {
  loading.value = true;
  message.value = '';

  // Limpiar errores previos
  errors.email = '';
  errors.password = '';
  errors.password_confirmation = '';

  try {
    const response = await authStore.resetPassword(form);
    message.value = response.message || 'Tu contraseña ha sido restablecida correctamente.';
    alertVariant.value = 'success';

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
