<template>
  <header class="bg-gray-800 shadow-md border-b border-gray-700">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-blue-400">VAXAV</h1>
        <nav v-if="isLoggedIn" class="ml-8 hidden md:block">
          <ul class="flex space-x-6">
            <li>
              <BaseNavLink
                to="/"
                label="Dashboard"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <BaseNavLink
                to="/universe"
                label="Universo"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <BaseNavLink
                to="/market"
                label="Mercado"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <BaseNavLink
                to="/ships"
                label="Naves"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li v-if="isModerator">
              <BaseNavLink
                to="/admin"
                label="Administración"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
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
          <BaseButton variant="secondary" size="sm" @click="logout">
            Cerrar Sesión
          </BaseButton>
        </template>
        <template v-else>
          <RouterLink to="/login" custom v-slot="{ navigate }">
            <BaseButton variant="secondary" size="sm" @click="navigate">
              Iniciar Sesión
            </BaseButton>
          </RouterLink>
          <RouterLink to="/register" custom v-slot="{ navigate }">
            <BaseButton variant="primary" size="sm" @click="navigate">
              Registrarse
            </BaseButton>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseNavLink from '@/components/ui/navigation/BaseNavLink.vue';

const router = useRouter();
const authStore = useAuthStore();
const pilotStore = usePilotStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.currentUser);
const credits = computed(() => pilotStore.pilotCredits.toLocaleString());
const isModerator = computed(() => authStore.isModerator);

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
