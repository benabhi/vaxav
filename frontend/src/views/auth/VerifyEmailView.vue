<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto card p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Verificación de Email</h1>

      <VxvAlert
        v-if="message"
        :variant="alertVariant"
        :message="message"
        :dismissible="false"
        class="mb-6"
      />

      <div v-if="!verified" class="mb-6">
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
      </div>

      <div v-else class="text-center">
        <div class="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 mb-6">
          <p class="text-green-400 font-semibold">¡Tu dirección de correo electrónico ha sido verificada!</p>
          <p class="text-gray-300 mt-2">Ahora puedes acceder a todas las funciones de VAXAV.</p>
        </div>

        <RouterLink to="/" custom v-slot="{ navigate }">
          <VxvButton variant="primary" @click="navigate">
            Ir al inicio
          </VxvButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
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
const authStore = useAuthStore();

const verified = ref(false);
const resending = ref(false);
const message = ref('');
const alertVariant = ref('info');
const verificationCode = ref('');
const verifyingCode = ref(false);
const generatingCode = ref(false);


// Función para verificar el email con los parámetros de la URL
const verifyEmailWithParams = async (id: string, hash: string, expires?: string, signature?: string) => {
  try {
    // Mostrar mensaje de carga
    message.value = 'Verificando tu dirección de email...';
    alertVariant.value = 'info';

    // Primero, asegurarse de que el usuario esté autenticado
    if (!authStore.isLoggedIn) {
      message.value = 'Debes iniciar sesión para verificar tu email.';
      alertVariant.value = 'error';
      return;
    }

    // Construir la URL de verificación
    let verificationUrl = `/auth/email/verify/${id}/${hash}`;

    // Añadir parámetros de expires y signature si existen
    if (expires && signature) {
      verificationUrl += `?expires=${expires}&signature=${signature}`;
    }

    // Realizar la petición de verificación
    const response = await api.get(verificationUrl);

    // Actualizar el estado
    verified.value = true;
    message.value = response.data.message || 'Email verificado correctamente.';
    alertVariant.value = 'success';

    // Actualizar el usuario en el store
    await authStore.fetchUser();

    // Forzar una actualización del estado de verificación
    await authStore.checkEmailVerification();

    if (authStore.isEmailVerified) {
      // Mostrar mensaje de éxito y redirigir
      message.value = '¡Email verificado correctamente! Redirigiendo a la página principal...';

      // Redirigir al usuario a la página principal después de verificar
      setTimeout(() => {
        router.push('/');
      }, 2000);
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
    const response = await api.get('/auth/email/verify');
    verified.value = response.data.verified;

    if (verified.value) {
      message.value = 'Tu dirección de correo electrónico ya ha sido verificada.';
      alertVariant.value = 'success';
    }
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Error al verificar el estado del email.';
    alertVariant.value = 'error';
  }

  // Verificar si hay parámetros de verificación en las props o en la URL
  const id = props.id || route.query.id as string;
  const hash = props.hash || route.query.hash as string;
  const expires = props.expires || route.query.expires as string;
  const signature = props.signature || route.query.signature as string;

  if (id && hash && expires && signature) {
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
    const result = await authStore.verifyEmailWithCode(verificationCode.value);

    if (result.verified) {
      verified.value = true;
      message.value = result.message || 'Email verificado correctamente.';
      alertVariant.value = 'success';
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

// Generar código de verificación
const generateCode = async () => {
  generatingCode.value = true;
  message.value = '';

  try {
    const result = await authStore.generateVerificationCode();
    message.value = result.message || 'Se ha enviado un código de verificación a tu email.';
    alertVariant.value = 'success';
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Error al generar el código de verificación.';
    alertVariant.value = 'error';
  } finally {
    generatingCode.value = false;
  }
};
</script>
