<template>
  <VxvNavbar :links="navLinks">
    <!-- Slot para acciones personalizadas -->
    <template #actions>
      <template v-if="isLoggedIn">
        <VxvDropdown menuClass="w-40">
          <template #trigger>
            <VxvButton variant="secondary" size="md">
              {{ user?.name }}
              <template #icon-right>
                <ChevronDownIcon class="h-4 w-4" />
              </template>
            </VxvButton>
          </template>

          <VxvDropdownItem label="Perfil" to="/profile" />
          <VxvDropdownItem label="Cerrar Sesión" @click="logout" />
        </VxvDropdown>
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
    </template>
  </VxvNavbar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvNavbar from '@/components/ui/navigation/VxvNavbar.vue';
import VxvDropdown from '@/components/ui/navigation/VxvDropdown.vue';
import VxvDropdownItem from '@/components/ui/navigation/VxvDropdownItem.vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();
const pilotStore = usePilotStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const isEmailVerified = computed(() => authStore.isEmailVerified);
const user = computed(() => authStore.currentUser);
const credits = computed(() => pilotStore.pilotCredits.toLocaleString());
const isModerator = computed(() => authStore.isModerator);

// Enlaces de navegación dinámicos basados en el estado de autenticación, verificación y permisos
const navLinks = computed(() => {
  // Si no está autenticado, no mostrar enlaces
  if (!isLoggedIn.value) return [];

  // Si está autenticado pero no ha verificado su email, no mostrar enlaces
  if (!isEmailVerified.value) return [];

  // Si está autenticado y verificado, mostrar enlaces normales
  const links = [
    { to: '/', label: 'Dashboard', exact: true },
    { to: '/universe', label: 'Universo' },
    { to: '/market', label: 'Mercado' },
    { to: '/ships', label: 'Naves' }
  ];

  // Añadir enlace de administración si el usuario es moderador
  if (isModerator.value) {
    links.push({ to: '/admin', label: 'Administración' });
  }

  return links;
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>


