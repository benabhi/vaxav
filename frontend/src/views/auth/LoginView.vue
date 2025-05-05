<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <VxvForm
        title="Iniciar Sesión"
        :has-border="false"
        submitText="Iniciar Sesión"
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
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// No necesitamos verificar si el usuario viene de restablecer su contraseña
// ya que la notificación se muestra en la página de restablecimiento

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  await authStore.login(form);

  if (authStore.isLoggedIn) {
    // No redirigir directamente a la página principal
    // Dejar que el middleware de navegación maneje la redirección según el estado del usuario
    // Si el usuario no ha verificado su email, será redirigido a la página de verificación
    // Si el usuario ha verificado su email pero no tiene piloto, será redirigido a la página de creación de piloto
    router.push({ name: 'home' });
  }
};
</script>
