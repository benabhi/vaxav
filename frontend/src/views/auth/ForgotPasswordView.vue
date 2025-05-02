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
        title="Recuperar Contraseña"
        :has-border="false"
        submitText="Enviar enlace"
        cancelText="Volver al login"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="goToLogin"
      >
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
import { useAuthStore } from '@/stores/auth';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const authStore = useAuthStore();

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
    const response = await authStore.forgotPassword(email.value);
    message.value = response.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
    alertVariant.value = 'success';
    email.value = ''; // Limpiar el campo después de enviar
  } catch (err: any) {
    error.value = authStore.error || 'Ha ocurrido un error al procesar tu solicitud.';
    alertVariant.value = 'error';
    message.value = error.value;
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>
