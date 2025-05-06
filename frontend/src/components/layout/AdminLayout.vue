<template>
  <!-- Two-column layout that fits within App.vue's main element -->
  <div class="flex min-h-full">
    <!-- Column 1: Sidebar - fixed width, full height -->
    <aside
      class="w-64 bg-gray-800 border-r border-gray-700 hidden lg:block"
    >
      <div class="sticky top-0 h-screen overflow-y-auto">
        <VxvSidebar
          title="Panel Admin"
          :collapsible="false"
          :is-mobile="false"
        >
          <!-- User Management Group -->
          <VxvSidebarGroup
            title="Gestión de Usuarios"
            :default-collapsed="false"
            :is-sidebar-collapsed="false"
            :is-mobile="false"
            basePath="/admin/users"
            :additional-paths="['/admin/roles', '/admin/pilots']"
          >
            <VxvNavLink
              to="/admin/users"
              label="Usuarios"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/roles"
              label="Roles"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/pilots"
              label="Pilotos"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
              active-class="text-blue-400"
            />
          </VxvSidebarGroup>

          <!-- Skills Management Group -->
          <VxvSidebarGroup
            title="Gestión de Habilidades"
            :default-collapsed="false"
            :is-sidebar-collapsed="false"
            :is-mobile="false"
            basePath="/admin/skills"
            :additional-paths="['/admin/skill-categories']"
          >
            <VxvNavLink
              to="/admin/skills"
              label="Habilidades"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/skill-categories"
              label="Categorías"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
              active-class="text-blue-400"
            />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink
            to="/admin/settings"
            label="Configuración"
            :is-sidebar-collapsed="false"
            :is-mobile="false"
            active-class="text-blue-400"
          />
        </VxvSidebar>
      </div>
    </aside>

    <!-- Column 2: Content area with three rows -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Row 1: Header -->
      <div class="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <!-- Título -->
        <h1 class="text-xl font-semibold text-white">{{ title }}</h1>
      </div>

      <!-- Breadcrumbs (si existen) -->
      <div v-if="$slots.breadcrumbs" class="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <slot name="breadcrumbs"></slot>
      </div>

      <!-- Notifications -->
      <VxvNotification />

      <!-- Row 2: Main content - takes all available space -->
      <main class="flex-1 overflow-y-auto p-4 w-full">
        <slot></slot>
      </main>

      <!-- Row 3: Footer -->
      <footer v-if="$slots.footer" class="bg-gray-800 border-t border-gray-700 px-4 py-3 flex-shrink-0">
        <slot name="footer"></slot>
      </footer>
    </div>

    <!-- Mobile sidebar con overlay alternativo -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 lg:hidden mobile-sidebar-container"
      @click="closeMobileMenu"
    >
      <!-- Sidebar container with animation -->
      <div
        class="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out border-r border-gray-700 z-10"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <!-- Mobile sidebar content -->
        <VxvSidebar
          title="Panel Admin"
          :collapsible="false"
          :is-mobile="true"
          @close="closeMobileMenu"
        >
          <!-- User Management Group -->
          <VxvSidebarGroup
            title="Gestión de Usuarios"
            :default-collapsed="false"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            basePath="/admin/users"
            :additional-paths="['/admin/roles', '/admin/pilots']"
          >
            <VxvNavLink
              to="/admin/users"
              label="Usuarios"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/roles"
              label="Roles"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/pilots"
              label="Pilotos"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
              active-class="text-blue-400"
            />
          </VxvSidebarGroup>

          <!-- Skills Management Group -->
          <VxvSidebarGroup
            title="Gestión de Habilidades"
            :default-collapsed="false"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            basePath="/admin/skills"
            :additional-paths="['/admin/skill-categories']"
          >
            <VxvNavLink
              to="/admin/skills"
              label="Habilidades"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
              active-class="text-blue-400"
            />
            <VxvNavLink
              to="/admin/skill-categories"
              label="Categorías"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
              active-class="text-blue-400"
            />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink
            to="/admin/settings"
            label="Configuración"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            active-class="text-blue-400"
          />

          <!-- Separador -->
          <div class="mt-6 mb-4 border-t border-gray-700"></div>

          <!-- Título VAXAV -->
          <div class="px-4 py-2 text-lg font-semibold text-blue-400">VAXAV</div>

          <!-- Menús principales de VAXAV -->
          <template v-for="(link, index) in mainNavLinks" :key="index">
            <!-- Si el enlace tiene submenús, usar SidebarGroup -->
            <template v-if="link.children && link.children.length > 0">
              <VxvSidebarGroup
                :title="link.label"
                :default-collapsed="false"
                :is-sidebar-collapsed="false"
                :is-mobile="true"
                :basePath="link.to"
              >
                <VxvNavLink
                  v-for="(child, childIndex) in link.children"
                  :key="childIndex"
                  :to="child.to"
                  :label="child.label"
                  :is-sidebar-collapsed="false"
                  :is-mobile="true"
                  active-class="text-blue-400"
                />
              </VxvSidebarGroup>
            </template>

            <!-- Si el enlace no tiene submenús, usar NavLink normal -->
            <template v-else>
              <VxvNavLink
                :to="link.to"
                :label="link.label"
                :is-sidebar-collapsed="false"
                :is-mobile="true"
                active-class="text-blue-400"
              />
            </template>
          </template>
        </VxvSidebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VxvSidebar from '@/components/ui/navigation/VxvSidebar.vue';
import VxvSidebarGroup from '@/components/ui/navigation/VxvSidebarGroup.vue';
import VxvNavLink from '@/components/ui/navigation/VxvNavLink.vue';
import VxvNotification from '@/components/ui/feedback/VxvNotification.vue';
import { useNotificationStore } from '@/stores/notification.ts';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  title: {
    type: String,
    default: 'Panel de Administración'
  }
});

// Definir eventos para exponer el método de abrir el sidebar móvil
const emit = defineEmits(['register-open-sidebar']);

// Initialize stores
const notificationStore = useNotificationStore();
const userStore = useUserStore();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Mobile menu controls
const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Definir método para abrir el sidebar móvil desde fuera
defineExpose({
  openMobileMenu
});

// Escuchar el evento global para abrir el sidebar móvil
onMounted(() => {
  window.addEventListener('open-admin-sidebar', openMobileMenu);

  // Emitir el evento register-open-sidebar para que los componentes padres puedan registrar la función
  emit('register-open-sidebar', openMobileMenu);
});

// Limpiar el evento al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('open-admin-sidebar', openMobileMenu);
});

// Datos para el menú principal de VAXAV
const isLoggedIn = computed(() => userStore.isLoggedIn);
const isEmailVerified = computed(() => userStore.isEmailVerified);
const isModerator = computed(() => userStore.isModerator);

// Enlaces de navegación para el menú principal
const mainNavLinks = computed(() => {
  // Si no está autenticado o no ha verificado su email, no mostrar enlaces
  if (!isLoggedIn.value || !isEmailVerified.value) return [];

  // Verificar si el usuario tiene un piloto
  const hasPilot = userStore.hasPilot;
  if (!hasPilot) return [];

  // Enlaces principales de VAXAV
  return [
    {
      to: '/pilot',
      label: 'Piloto',
      children: [
        { to: '/pilot/overview', label: 'Vista General' },
        { to: '/pilot/skills', label: 'Habilidades' }
      ]
    },
    {
      to: '/universe',
      label: 'Universo',
      children: [
        { to: '/universe/galaxy', label: 'Galaxia' },
        { to: '/universe/solar-system', label: 'Sistema Solar' }
      ]
    },
    { to: '/market', label: 'Mercado' },
    { to: '/ships', label: 'Naves' }
  ];
});
</script>

<style scoped>
/* Estilo para el overlay del sidebar móvil */
.mobile-sidebar-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.25); /* bg-gray-900 con opacidad media */
  backdrop-filter: blur(1px); /* Ligero desenfoque para mejorar el contraste */
  pointer-events: none; /* Permite que los clics pasen a través del overlay */
}
</style>
