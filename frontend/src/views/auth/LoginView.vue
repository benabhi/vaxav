<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Iniciar Sesión"
        :has-border="false"
        submitText="Iniciar Sesión"
        :show-cancel="false"
        :full-width-submit="true"
        :loading="userStore.isUserDataLoading"
        @submit="handleSubmit"
      >

        <div class="mb-4">
          <VxvInput
            id="email"
            v-model="form.email"
            label="Email"
            type="email"
            required
          />
        </div>

        <div class="mb-6">
          <VxvInput
            id="password"
            v-model="form.password"
            label="Contraseña"
            type="password"
            required
          />
        </div>

        <template #footer>
          <div class="mt-6 text-center text-gray-400">
            ¿No tienes una cuenta?
            <RouterLink to="/register" class="text-blue-400 hover:underline">
              Regístrate
            </RouterLink>
          </div>

          <div class="mt-2 text-center text-gray-400">
            <RouterLink to="/forgot-password" class="text-blue-400 hover:underline text-sm">
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>
        </template>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification.ts';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

// Verificar si hay un parámetro redirect que contiene los parámetros de verificación de email
onMounted(() => {
  const redirect = route.query.redirect as string;
  if (redirect && redirect.startsWith('/email/verify')) {
    // Extraer los parámetros de la URL de redirección para mostrarlos en el formulario
    const urlParams = new URLSearchParams(redirect.split('?')[1]);
    if (urlParams.has('id') && urlParams.has('hash')) {
      notificationStore.info(
        'Por favor, inicia sesión para verificar tu dirección de correo electrónico.',
        'Verificación de email pendiente',
        10000
      );
    }
  }
});

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  try {
    // Usar el store unificado para iniciar sesión
    // Este método se encargará de llamar a authStore.login internamente
    await userStore.login(form);

    if (userStore.isLoggedIn) {
      // Mostrar notificación de éxito
      notificationStore.success('Sesión iniciada correctamente');

      // Verificar si hay un parámetro redirect que contiene los parámetros de verificación de email
      const redirect = route.query.redirect as string;
      if (redirect && redirect.startsWith('/email/verify')) {
        // Redirigir a la página de verificación de email con los parámetros originales
        router.push(redirect);
      } else {
        // No redirigir directamente a la página principal
        // Dejar que el middleware de navegación maneje la redirección según el estado del usuario
        // Si el usuario no ha verificado su email, será redirigido a la página de verificación
        // Si el usuario ha verificado su email pero no tiene piloto, será redirigido a la página de creación de piloto
        router.push({ name: 'pilot-overview' });
      }
    }
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);

    // Mostrar mensaje de error más descriptivo
    if (error.response?.status === 422) {
      // Error de validación (credenciales incorrectas)
      if (error.response?.data?.errors?.email) {
        // Si hay un mensaje específico para el email, mostrarlo
        const errorMessage = Array.isArray(error.response.data.errors.email)
          ? error.response.data.errors.email[0]
          : error.response.data.errors.email;

        notificationStore.error(errorMessage, 'Error de autenticación');
      } else {
        // Mensaje genérico para credenciales incorrectas
        notificationStore.error('El usuario no existe o la contraseña es incorrecta', 'Error de autenticación');
      }
    } else if (error.response?.status === 429) {
      // Error de límite de intentos
      notificationStore.error('Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.', 'Error de autenticación');
    } else {
      // Otros errores
      const errorMessage = error.response?.data?.message || userStore.error || 'Error al iniciar sesión';
      notificationStore.error(errorMessage, 'Error de autenticación');
    }
  }
};
</script>
