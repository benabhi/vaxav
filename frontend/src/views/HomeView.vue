<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';
import BaseCard from '@/components/ui/layout/BaseCard.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';

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

    <BaseCard
      v-if="!hasPilot && isLoggedIn"
      title="Crea tu Piloto"
      max-width="md"
      centered
    >
      <p class="mb-4 text-gray-300">Para comenzar tu aventura en la galaxia, necesitas crear un piloto.</p>
      <RouterLink to="/create-pilot" custom v-slot="{ navigate }">
        <BaseButton variant="primary" :full-width="true" @click="navigate">
          Crear Piloto
        </BaseButton>
      </RouterLink>
    </BaseCard>

    <div v-else-if="hasPilot" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard title="Estado del Piloto" has-border>
        <div v-if="pilotStore.loading">Cargando...</div>
        <div v-else>
          <p><span class="text-gray-400">Nombre:</span> {{ pilotStore.pilotName }}</p>
          <p><span class="text-gray-400">Raza:</span> {{ pilotStore.pilotRace }}</p>
          <p><span class="text-gray-400">Créditos:</span> {{ pilotStore.pilotCredits.toLocaleString() }} ISK</p>
        </div>
      </BaseCard>

      <BaseCard title="Actividad Reciente" has-border>
        <p class="text-gray-300">No hay actividad reciente.</p>
      </BaseCard>

      <BaseCard title="Acciones Rápidas" has-border>
        <div class="space-y-2">
          <RouterLink to="/universe" custom v-slot="{ navigate }">
            <BaseButton variant="secondary" :full-width="true" @click="navigate">
              Explorar Universo
            </BaseButton>
          </RouterLink>
          <RouterLink to="/market" custom v-slot="{ navigate }">
            <BaseButton variant="secondary" :full-width="true" @click="navigate">
              Visitar Mercado
            </BaseButton>
          </RouterLink>
          <RouterLink to="/ships" custom v-slot="{ navigate }">
            <BaseButton variant="secondary" :full-width="true" @click="navigate">
              Gestionar Naves
            </BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </div>

    <div v-else-if="!isLoggedIn" class="text-center mt-8">
      <p class="text-xl mb-4">Para comenzar tu aventura, inicia sesión o regístrate.</p>
      <div class="flex justify-center space-x-4">
        <RouterLink to="/login" custom v-slot="{ navigate }">
          <BaseButton variant="secondary" @click="navigate">
            Iniciar Sesión
          </BaseButton>
        </RouterLink>
        <RouterLink to="/register" custom v-slot="{ navigate }">
          <BaseButton variant="primary" @click="navigate">
            Registrarse
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
