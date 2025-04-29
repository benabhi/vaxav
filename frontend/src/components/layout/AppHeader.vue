<template>
  <header class="bg-gray-800 shadow-md border-b border-gray-700">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <VxvLogo size="md" />
        <nav v-if="isLoggedIn" class="ml-8 hidden md:block">
          <ul class="flex space-x-6">
            <li>
              <VxvNavLink
                to="/"
                label="Dashboard"
                :horizontal="true"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <VxvNavLink
                to="/universe"
                label="Universo"
                :horizontal="true"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <VxvNavLink
                to="/market"
                label="Mercado"
                :horizontal="true"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li>
              <VxvNavLink
                to="/ships"
                label="Naves"
                :horizontal="true"
                activeClass="bg-gray-700 text-blue-400"
                inactiveClass="text-gray-300 hover:text-white"
              />
            </li>
            <li v-if="isModerator">
              <VxvNavLink
                to="/admin"
                label="Administración"
                :horizontal="true"
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
          <VxvButton variant="secondary" size="md" @click="logout">
            Cerrar Sesión
          </VxvButton>
        </template>
        <template v-else>
          <RouterLink to="/login" custom v-slot="{ navigate }">
            <VxvButton variant="secondary" size="md" @click="navigate">
              Iniciar Sesión
            </VxvButton>
          </RouterLink>
          <RouterLink to="/register" custom v-slot="{ navigate }">
            <VxvButton variant="primary" size="md" @click="navigate">
              Registrarse
            </VxvButton>
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
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvNavLink from '@/components/ui/navigation/VxvNavLink.vue';
import VxvLogo from '@/components/ui/branding/VxvLogo.vue';

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


