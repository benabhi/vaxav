<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto card p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
      
      <div v-if="authStore.error" class="bg-red-900/50 text-red-200 p-3 rounded-md mb-4">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block text-gray-300 mb-1">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-gray-300 mb-1">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Cargando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>
      
      <div class="mt-4 text-center text-gray-400">
        ¿No tienes una cuenta?
        <RouterLink to="/register" class="text-blue-400 hover:underline">
          Regístrate
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  await authStore.login(form);
  
  if (authStore.isLoggedIn) {
    router.push('/');
  }
};
</script>
