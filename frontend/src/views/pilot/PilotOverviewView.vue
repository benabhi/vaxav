<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification.ts';
import VxvCard from '@/components/ui/layout/VxvCard.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const hasPilot = computed(() => userStore.hasPilot);

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.isLoaded) {
    try {
      await userStore.loadUserData();
    } catch (error) {
      notificationStore.error('Error al cargar datos del usuario');
      console.error('Error al cargar datos del usuario:', error);
    }
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

      <VxvCard
        v-if="!hasPilot && isLoggedIn"
        title="Crea tu Piloto"
        max-width="md"
        centered
      >
      <p class="mb-4 text-gray-300">Para comenzar tu aventura en la galaxia, necesitas crear un piloto.</p>
      <RouterLink to="/create-pilot" custom v-slot="{ navigate }">
        <VxvButton variant="primary" :full-width="true" @click="navigate">
          Crear Piloto
        </VxvButton>
      </RouterLink>
    </VxvCard>

      <div v-else-if="hasPilot" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <VxvCard title="Estado del Piloto" has-border>
          <div v-if="userStore.isUserDataLoading" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <div v-else class="space-y-2">
            <p><span class="text-gray-400">Nombre:</span> <span class="text-white font-medium">{{ userStore.pilotName }}</span></p>
            <p><span class="text-gray-400">Raza:</span> <span class="text-white font-medium">{{ userStore.pilotRace }}</span></p>
            <p><span class="text-gray-400">Créditos:</span> <span class="text-white font-medium">{{ userStore.pilotCredits?.toLocaleString() || '0' }} ISK</span></p>
            <p class="mt-4 text-sm text-gray-400">Ubicación actual:</p>
            <div class="bg-gray-700/50 p-3 rounded-md">
              <p class="text-blue-400 font-medium">Sistema Nexus Prime</p>
              <p class="text-xs text-gray-300">Seguridad: Alta</p>
            </div>
          </div>
        </VxvCard>

        <VxvCard title="Actividad Reciente" has-border>
          <div class="space-y-3">
            <div class="bg-gray-700/30 p-3 rounded-md">
              <p class="text-sm text-gray-300">Has creado tu piloto</p>
              <p class="text-xs text-gray-400">Hace unos momentos</p>
            </div>
            <p class="text-sm text-gray-400 italic">No hay más actividad reciente.</p>
          </div>
        </VxvCard>

        <VxvCard title="Acciones Rápidas" has-border>
          <div class="space-y-2">
            <RouterLink to="/universe/galaxy" custom v-slot="{ navigate }">
              <VxvButton variant="secondary" :full-width="true" @click="navigate">
                Explorar Universo
              </VxvButton>
            </RouterLink>
            <RouterLink to="/market" custom v-slot="{ navigate }">
              <VxvButton variant="secondary" :full-width="true" @click="navigate">
                Visitar Mercado
              </VxvButton>
            </RouterLink>
            <RouterLink to="/ships" custom v-slot="{ navigate }">
              <VxvButton variant="secondary" :full-width="true" @click="navigate">
                Gestionar Naves
              </VxvButton>
            </RouterLink>
          </div>
        </VxvCard>
      </div>

      <div v-else-if="!isLoggedIn" class="text-center mt-8">
        <p class="text-xl mb-4">Para comenzar tu aventura, inicia sesión o regístrate.</p>
        <div class="flex justify-center space-x-4">
          <RouterLink to="/login" custom v-slot="{ navigate }">
            <VxvButton variant="secondary" @click="navigate">
              Iniciar Sesión
            </VxvButton>
          </RouterLink>
          <RouterLink to="/register" custom v-slot="{ navigate }">
            <VxvButton variant="primary" @click="navigate">
              Registrarse
            </VxvButton>
          </RouterLink>
        </div>
      </div>
    </div>
</template>
