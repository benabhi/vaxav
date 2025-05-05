<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Recuperar Contraseña"
        :has-border="false"
        submitText="Enviar enlace"
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
          Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div class="mb-6">
          <VxvInput
            id="email"
            v-model="email"
            label="Email"
            type="email"
            required
            :error="error"
          />
        </div>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification.ts';
import api from '@/services/api';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const email = ref('');
const loading = ref(false);
const error = ref('');
const message = ref('');
const alertVariant = ref('info');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  message.value = '';

  try {
    // Llamar directamente a la API para solicitar el restablecimiento de contraseña
    const response = await api.post('/auth/forgot-password', { email: email.value });

    // Mostrar mensaje de éxito
    message.value = response.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
    alertVariant.value = 'success';

    // Mostrar notificación
    notificationStore.success(
      'Se ha enviado un enlace de recuperación a tu correo electrónico.',
      'Solicitud enviada'
    );

    email.value = ''; // Limpiar el campo después de enviar
  } catch (err: any) {
    // Manejar errores
    const errorMessage = err.response?.data?.message || 'Ha ocurrido un error al procesar tu solicitud.';
    error.value = errorMessage;
    alertVariant.value = 'error';
    message.value = error.value;

    // Mostrar notificación de error
    notificationStore.error(
      errorMessage,
      'Error'
    );
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>
