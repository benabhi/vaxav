<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Verificación de Email"
        :has-border="false"
        :show-cancel="false"
        :show-submit="false"
        max-width="md"
      >
        <template #alert>
          <VxvAlert
            v-if="message"
            :variant="alertVariant"
            :message="message"
            :dismissible="false"
            class="mb-6"
          />
        </template>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p class="text-gray-300">Verificando tu dirección de correo electrónico...</p>
        </div>

        <div v-else-if="verified" class="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-green-400 mb-2">¡Verificación Exitosa!</h2>
          <p class="text-gray-300 mb-4">
            Tu dirección de correo electrónico ha sido verificada correctamente.
          </p>
          <p class="text-gray-300 mb-4">
            Serás redirigido a la página de inicio de sesión en unos segundos...
          </p>
          <div class="text-center mt-4">
            <VxvButton
              @click="goToLogin"
              variant="primary"
            >
              Ir a Iniciar Sesión
            </VxvButton>
          </div>
        </div>

        <div v-else-if="error" class="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-red-400 mb-2">Error de Verificación</h2>
          <p class="text-gray-300 mb-4">
            {{ message }}
          </p>
          <div class="text-center mt-4">
            <VxvButton
              @click="goToLogin"
              variant="primary"
            >
              Ir a Iniciar Sesión
            </VxvButton>
          </div>
        </div>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNotificationStore } from '@/stores/notification.ts';
import { useAuthStore } from '@/stores/auth';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// Estados
const loading = ref(true);
const verified = ref(false);
const error = ref(false);
const message = ref('');
const alertVariant = ref('info');

// Función para ir a la página de login
const goToLogin = () => {
  router.push('/login');
};

// Función para verificar el email con los parámetros de la URL
const verifyEmail = async (id: string, hash: string) => {
  try {
    // Mostrar mensaje de carga
    message.value = 'Verificando tu dirección de email...';
    alertVariant.value = 'info';

    // Construir la URL de verificación pública
    const verificationUrl = `/auth/email/verify-public/${id}/${hash}`;

    // Realizar la petición de verificación
    const response = await api.get(verificationUrl);

    // Actualizar el estado
    verified.value = true;
    loading.value = false;
    message.value = response.data.message || 'Email verificado correctamente.';
    alertVariant.value = 'success';

    // Cerrar sesión si el usuario estaba autenticado
    if (authStore.isLoggedIn) {
      await authStore.logout();
    }

    // Mostrar notificación de éxito
    notificationStore.success(
      '¡Tu dirección de correo electrónico ha sido verificada correctamente! Por favor, inicia sesión.',
      'Verificación completada',
      7000
    );

    // Redirigir al usuario a la página de login después de un breve retraso
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (error: any) {
    console.error('Error al verificar email:', error);
    loading.value = false;
    verified.value = false;
    error.value = true;
    message.value = error.response?.data?.message || 'Error al verificar el email.';
    alertVariant.value = 'error';
  }
};

// Verificar el email al montar el componente
onMounted(async () => {
  const id = route.params.id as string;
  const hash = route.params.hash as string;

  if (id && hash) {
    await verifyEmail(id, hash);
  } else {
    loading.value = false;
    error.value = true;
    message.value = 'Parámetros de verificación inválidos.';
    alertVariant.value = 'error';
  }
});
</script>
