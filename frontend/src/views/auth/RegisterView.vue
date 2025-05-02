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
          />
        </div>

        <div class="mb-4">
          <VxvInput
            id="email"
            v-model="form.email"
            label="Email"
            type="email"
            required
          />
        </div>

        <div class="mb-4">
          <VxvInput
            id="password"
            v-model="form.password"
            label="Contraseña"
            type="password"
            required
          />
        </div>

        <div class="mb-6">
          <VxvInput
            id="password_confirmation"
            v-model="form.password_confirmation"
            label="Confirmar Contraseña"
            type="password"
            required
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
import { reactive } from 'vue';
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
  password: '',
  password_confirmation: '',
});

const handleSubmit = async () => {
  await authStore.register(form);

  if (authStore.isLoggedIn) {
    router.push('/create-pilot');
  }
};
</script>
