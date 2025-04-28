<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto card p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>

      <div v-if="authStore.error" class="bg-red-900/50 text-red-200 p-3 rounded-md mb-4">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <BaseInput
            id="name"
            v-model="form.name"
            label="Nombre"
            type="text"
            required
          />
        </div>

        <div class="mb-4">
          <BaseInput
            id="email"
            v-model="form.email"
            label="Email"
            type="email"
            required
          />
        </div>

        <div class="mb-4">
          <BaseInput
            id="password"
            v-model="form.password"
            label="Contraseña"
            type="password"
            required
          />
        </div>

        <div class="mb-6">
          <BaseInput
            id="password_confirmation"
            v-model="form.password_confirmation"
            label="Confirmar Contraseña"
            type="password"
            required
          />
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          :full-width="true"
          :loading="authStore.loading"
        >
          Registrarse
        </BaseButton>
      </form>

      <div class="mt-4 text-center text-gray-400">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login" class="text-blue-400 hover:underline">
          Inicia Sesión
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';

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
