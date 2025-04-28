<template>
  <header class="bg-gray-800 shadow-md">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-blue-400">VAXAV</h1>
        <nav class="ml-8 hidden md:block">
          <ul class="flex space-x-6">
            <li>
              <RouterLink to="/" class="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/universe" class="text-gray-300 hover:text-white transition-colors">
                Universo
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/market" class="text-gray-300 hover:text-white transition-colors">
                Mercado
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/ships" class="text-gray-300 hover:text-white transition-colors">
                Naves
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>
      
      <div class="flex items-center space-x-4">
        <template v-if="isLoggedIn">
          <div class="text-sm text-gray-300">
            <span class="mr-2">{{ user?.name }}</span>
            <span class="text-blue-400">{{ credits }} ISK</span>
          </div>
          <button @click="logout" class="btn btn-secondary text-sm">
            Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-secondary text-sm">
            Iniciar Sesión
          </RouterLink>
          <RouterLink to="/register" class="btn btn-primary text-sm">
            Registrarse
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';

const authStore = useAuthStore();
const pilotStore = usePilotStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.currentUser);
const credits = computed(() => pilotStore.pilotCredits.toLocaleString());

const logout = async () => {
  await authStore.logout();
};
</script>
