<template>
  <VxvNavbar :links="navLinks" @mobile-menu-click="$emit('toggle-sidebar')">
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
import { computed, defineEmits } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvNavbar from '@/components/ui/navigation/VxvNavbar.vue';
import VxvDropdown from '@/components/ui/navigation/VxvDropdown.vue';
import VxvDropdownItem from '@/components/ui/navigation/VxvDropdownItem.vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits(['toggle-sidebar']);
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const isEmailVerified = computed(() => userStore.isEmailVerified);
const user = computed(() => userStore.userData);
const isModerator = computed(() => userStore.isModerator);

// Enlaces de navegación dinámicos basados en el estado de autenticación, verificación y permisos
const navLinks = computed(() => {
  // Si no está autenticado, no mostrar enlaces
  if (!isLoggedIn.value) return [];

  // Si está autenticado pero no ha verificado su email, no mostrar enlaces
  if (!isEmailVerified.value) return [];

  // Verificar si el usuario tiene un piloto
  const hasPilot = userStore.hasPilot;

  // Si está autenticado, verificado pero no tiene piloto, solo mostrar enlace a Piloto
  if (!hasPilot) {
    return [
      { to: '/pilot/overview', label: 'Piloto', exact: false }
    ];
  }

  // Si está autenticado, verificado y tiene piloto, mostrar todos los enlaces
  const links = [
    {
      to: '/pilot',
      label: 'Piloto',
      exact: false,
      children: [
        { to: '/pilot/overview', label: 'Vista General' },
        { to: '/pilot/skills', label: 'Habilidades' }
      ]
    },
    {
      to: '/universe',
      label: 'Universo',
      exact: false,
      children: [
        { to: '/universe/galaxy', label: 'Galaxia' },
        { to: '/universe/solar-system', label: 'Sistema Solar' }
      ]
    },
    { to: '/market', label: 'Mercado' },
    { to: '/ships', label: 'Naves' }
  ];

  // Añadir enlace de administración si el usuario es moderador
  if (isModerator.value) {
    // Añadir enlace de administración (el estilo se aplicará en el componente)
    links.push({
      to: '/admin',
      label: 'Administración'
    });
  }

  return links;
});

const logout = async () => {
  // Usar el store unificado para el logout
  try {
    // Obtener el store de autenticación
    const authStore = useAuthStore();

    // Limpiar el token y redirigir al login
    localStorage.removeItem('auth_token');

    // Eliminar el token de los headers de API
    delete api.defaults.headers.common['Authorization'];

    // Limpiar el estado de autenticación
    authStore.$patch({
      user: null,
      token: null,
      isAuthenticated: false,
      emailVerified: false
    });

    // Limpiar el estado del store unificado
    userStore.isLoaded = false;

    // Recargar la página para asegurar que todos los estados se limpien
    window.location.href = '/login';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>


