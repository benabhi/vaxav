<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';

const authStore = useAuthStore();
const pilotStore = usePilotStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const hasPilot = computed(() => pilotStore.hasPilot);

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await pilotStore.fetchCurrentPilot();
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-blue-400 mb-4">Bienvenido a VAXAV</h1>
      <p class="text-xl text-gray-300 max-w-3xl mx-auto">
        Un MMO espacial en navegador con ambientación sci-fi retro. Explora, comercia, mina recursos y participa en batallas épicas.
      </p>
    </div>

    <div v-if="!hasPilot && isLoggedIn" class="card max-w-md mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">Crea tu Piloto</h2>
      <p class="mb-4 text-gray-300">Para comenzar tu aventura en la galaxia, necesitas crear un piloto.</p>
      <RouterLink to="/create-pilot" class="btn btn-primary block text-center">
        Crear Piloto
      </RouterLink>
    </div>

    <div v-else-if="hasPilot" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Estado del Piloto</h2>
        <div v-if="pilotStore.loading">Cargando...</div>
        <div v-else>
          <p><span class="text-gray-400">Nombre:</span> {{ pilotStore.pilotName }}</p>
          <p><span class="text-gray-400">Raza:</span> {{ pilotStore.pilotRace }}</p>
          <p><span class="text-gray-400">Créditos:</span> {{ pilotStore.pilotCredits.toLocaleString() }} ISK</p>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Actividad Reciente</h2>
        <p class="text-gray-300">No hay actividad reciente.</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Acciones Rápidas</h2>
        <div class="space-y-2">
          <RouterLink to="/universe" class="btn btn-secondary block text-center">
            Explorar Universo
          </RouterLink>
          <RouterLink to="/market" class="btn btn-secondary block text-center">
            Visitar Mercado
          </RouterLink>
          <RouterLink to="/ships" class="btn btn-secondary block text-center">
            Gestionar Naves
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoggedIn" class="text-center mt-8">
      <p class="text-xl mb-4">Para comenzar tu aventura, inicia sesión o regístrate.</p>
      <div class="flex justify-center space-x-4">
        <RouterLink to="/login" class="btn btn-secondary">
          Iniciar Sesión
        </RouterLink>
        <RouterLink to="/register" class="btn btn-primary">
          Registrarse
        </RouterLink>
      </div>
    </div>
  </div>
</template>
