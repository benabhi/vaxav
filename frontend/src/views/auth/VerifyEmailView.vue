<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        v-if="!verified"
        title="Verificación de Email"
        :has-border="false"
        :show-cancel="false"
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
        <div class="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-blue-400 mb-2">Acceso Restringido</h2>
          <p class="text-gray-300">
            Para acceder a todas las funciones de VAXAV, debes verificar tu dirección de correo electrónico.
            No podrás navegar por la aplicación hasta que completes este paso.
          </p>
        </div>

        <p class="text-gray-300 mb-4">
          Gracias por registrarte. Antes de comenzar, ¿podrías verificar tu dirección de correo electrónico haciendo clic en el enlace que acabamos de enviar? Si no recibiste el correo, con gusto te enviaremos otro.
        </p>

        <!-- Verificación por código -->
        <div class="mt-6 border-t border-gray-700 pt-6">
          <h2 class="text-lg font-semibold mb-4">Verificar con código</h2>
          <p class="text-gray-300 mb-4">
            Ingresa el código de 6 dígitos que recibiste en tu correo electrónico:
          </p>
          <div class="flex space-x-2">
            <VxvInput
              v-model="verificationCode"
              placeholder="Código de verificación"
              class="flex-grow"
              maxlength="6"
            />
            <VxvButton
              @click="verifyWithCode"
              variant="primary"
              :loading="verifyingCode"
            >
              Verificar
            </VxvButton>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-gray-400 mb-2">¿No recibiste el correo de verificación?</p>
          <VxvButton
            @click="resendEmail"
            variant="secondary"
            :loading="resending"
            class="mb-4"
          >
            Reenviar correo de verificación
          </VxvButton>
        </div>
      </VxvForm>

      <VxvForm
        v-else
        title="Verificación de Email"
        :has-border="false"
        :show-cancel="false"
        :show-submit="false"
        max-width="md"
      >
        <template #alert>
          <VxvAlert
            v-if="message && verified"
            :variant="alertVariant"
            :message="message"
            :dismissible="false"
            class="mb-6"
          />
        </template>
        <div class="text-center">
          <div class="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 mb-6">
            <p class="text-green-400 font-semibold">¡Tu dirección de correo electrónico ha sido verificada!</p>
            <p class="text-gray-300 mt-2">Ahora puedes acceder a todas las funciones de VAXAV.</p>
          </div>

          <VxvButton variant="primary" @click="goToLogin" class="w-full">
            Ir a Iniciar Sesión
          </VxvButton>
        </div>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification.ts';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import api from '@/services/api';

// Recibir props de la ruta
const props = defineProps({
  id: String,
  hash: String,
  expires: String,
  signature: String
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const verified = ref(false);
const resending = ref(false);
const message = ref('');
const alertVariant = ref('info');
const verificationCode = ref('');
const verifyingCode = ref(false);

// Función para ir a la página de login
const goToLogin = () => {
  // Asegurarnos de que el usuario esté deslogueado antes de redirigir
  userStore.logout().then(() => {
    // Usar window.location.replace para evitar que quede en el historial
    window.location.replace('/login');
  });
};


// Función para verificar el email con los parámetros de la URL
const verifyEmailWithParams = async (id: string, hash: string, expires?: string, signature?: string) => {
  try {
    // Mostrar mensaje de carga
    message.value = 'Verificando tu dirección de email...';
    alertVariant.value = 'info';

    // Decodificar los parámetros si es necesario
    const decodedId = decodeURIComponent(id);
    const decodedHash = decodeURIComponent(hash);
    const decodedExpires = expires ? decodeURIComponent(expires) : undefined;
    const decodedSignature = signature ? decodeURIComponent(signature) : undefined;

    // Construir la URL de verificación
    let verificationUrl = `/auth/email/verify/${decodedId}/${decodedHash}`;

    // Añadir parámetros de expires y signature si existen
    if (decodedExpires && decodedSignature) {
      verificationUrl += `?expires=${decodedExpires}&signature=${decodedSignature}`;
    }

    // Realizar la petición de verificación
    const response = await api.get(verificationUrl);

    if (response.data.verified) {
      // Actualizar el estado
      verified.value = true;
      message.value = response.data.message || 'Email verificado correctamente.';
      alertVariant.value = 'success';

      // Si la respuesta indica que se cerró la sesión del usuario
      if (response.data.logout) {
        // Cerrar sesión en el frontend también
        await userStore.logout();
      } else {
        // Recargar los datos del usuario para obtener el estado actualizado del backend
        await userStore.refreshUserData();
      }

      // Mostrar mensaje de éxito
      message.value = '¡Email verificado correctamente! Ahora puedes iniciar sesión para continuar.';

      // Mostrar notificación de éxito
      notificationStore.success(
        '¡Tu dirección de correo electrónico ha sido verificada correctamente! Por favor, inicia sesión para continuar.',
        'Verificación completada',
        7000
      );

      // Actualizar el estado para mostrar el botón de ir a login
      verified.value = true;
    } else {
      message.value = 'El email no se marcó como verificado. Por favor, contacta al soporte.';
      alertVariant.value = 'error';
    }
  } catch (error: any) {
    console.error('Error al verificar email:', error);
    message.value = error.response?.data?.message || 'Error al verificar el email.';
    alertVariant.value = 'error';
  }
};



// Verificar si hay parámetros de verificación en la URL
onMounted(async () => {
  // Verificar si el usuario ya está verificado
  try {
    // Cargar los datos del usuario si no están cargados
    if (userStore.isLoggedIn && !userStore.isLoaded) {
      await userStore.loadUserData();
    }

    // Si el usuario ya está verificado y no hay parámetros de verificación en la URL,
    // mostrar un mensaje y redirigir al login
    const id = props.id || route.query.id as string;
    const hash = props.hash || route.query.hash as string;

    if (userStore.isEmailVerified && !id && !hash) {
      // El usuario ya está verificado y no viene de un proceso de verificación
      message.value = 'Tu dirección de correo electrónico ya ha sido verificada.';
      alertVariant.value = 'success';
      verified.value = true;

      // Cerrar sesión
      await userStore.logout();
      return;
    }

    // Actualizar el estado local
    verified.value = userStore.isEmailVerified;

    // Solo mostrar el mensaje de éxito si hay parámetros de verificación en la URL (viene desde un enlace de verificación)
    if (verified.value && (id && hash)) {
      message.value = 'Tu dirección de correo electrónico ha sido verificada.';
      alertVariant.value = 'success';
    }
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Error al verificar el estado del email.';
    alertVariant.value = 'error';
  }

  // Verificar si hay parámetros de verificación en las props o en la URL
  let id = props.id || route.query.id as string;
  let hash = props.hash || route.query.hash as string;
  let expires = props.expires || route.query.expires as string;
  let signature = props.signature || route.query.signature as string;

  // Verificar si hay un parámetro redirect que contiene los parámetros de verificación
  const redirect = route.query.redirect as string;
  if (redirect && redirect.startsWith('/email/verify')) {
    // Extraer los parámetros de la URL de redirección
    const urlParams = new URLSearchParams(redirect.split('?')[1]);

    // Obtener los parámetros individuales
    if (urlParams.has('id')) id = urlParams.get('id') || id;
    if (urlParams.has('hash')) hash = urlParams.get('hash') || hash;
    if (urlParams.has('expires')) expires = urlParams.get('expires') || expires;
    if (urlParams.has('signature')) signature = urlParams.get('signature') || signature;

    // Parámetros extraídos de redirect
  }

  if (id && hash) {
    await verifyEmailWithParams(id, hash, expires, signature);
  }
});

// Reenviar email de verificación
const resendEmail = async () => {
  resending.value = true;
  message.value = '';

  try {
    const response = await api.post('/auth/email/verification-notification');
    message.value = response.data.message || 'Se ha enviado un nuevo enlace de verificación.';
    alertVariant.value = 'success';
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Error al reenviar el email de verificación.';
    alertVariant.value = 'error';
  } finally {
    resending.value = false;
  }
};

// Verificar con código
const verifyWithCode = async () => {
  if (!verificationCode.value) {
    message.value = 'Por favor, ingresa un código de verificación.';
    alertVariant.value = 'error';
    return;
  }

  verifyingCode.value = true;
  message.value = '';

  try {
    // Usar la API directamente para verificar el código
    const response = await api.post('/auth/email/verify-code', {
      code: verificationCode.value
    });

    const result = response.data;

    if (result.verified) {
      verified.value = true;
      message.value = result.message || 'Email verificado correctamente.';
      alertVariant.value = 'success';

      // Recargar los datos del usuario para obtener el estado actualizado del backend
      await userStore.refreshUserData();

      // Verificar si el email se marcó como verificado en el backend
      const authStore = useAuthStore();

      // Verificar que el estado se haya actualizado correctamente
      if (!userStore.isEmailVerified) {
        console.error('Error: El estado de verificación de email no se actualizó correctamente');
        // Intentar actualizar de nuevo
        await authStore.checkEmailVerification();
      }

      // Cerrar sesión para forzar al usuario a iniciar sesión nuevamente
      await userStore.logout();

      // Mostrar notificación de éxito
      notificationStore.success(
        '¡Tu dirección de correo electrónico ha sido verificada correctamente! Por favor, inicia sesión para continuar.',
        'Verificación completada',
        7000
      );

      // Actualizar el mensaje para indicar que puede iniciar sesión
      message.value = '¡Email verificado correctamente! Ahora puedes iniciar sesión para continuar.';
    } else {
      message.value = result.message || 'Código de verificación inválido.';
      alertVariant.value = 'error';
    }
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Código de verificación inválido.';
    alertVariant.value = 'error';
  } finally {
    verifyingCode.value = false;
  }
};


</script>
