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
          >
            <VxvNavLink
              to="/admin/users"
              label="Usuarios"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
            />
            <VxvNavLink
              to="/admin/roles"
              label="Roles"
              :is-sidebar-collapsed="false"
              :is-mobile="false"
            />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink
            to="/admin/settings"
            label="Configuración"
            :is-sidebar-collapsed="false"
            :is-mobile="false"
          />
        </VxvSidebar>
      </div>
    </aside>

    <!-- Column 2: Content area with three rows -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Row 1: Header -->
      <VxvPageTitle
        :title="title"
        @mobile-menu-click="openMobileMenu"
      >
        <template #breadcrumbs>
          <slot name="breadcrumbs"></slot>
        </template>
      </VxvPageTitle>

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
          >
            <VxvNavLink
              to="/admin/users"
              label="Usuarios"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
            />
            <VxvNavLink
              to="/admin/roles"
              label="Roles"
              :is-sidebar-collapsed="false"
              :is-mobile="true"
            />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink
            to="/admin/settings"
            label="Configuración"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
        </VxvSidebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VxvSidebar from '@/components/ui/navigation/VxvSidebar.vue';
import VxvSidebarGroup from '@/components/ui/navigation/VxvSidebarGroup.vue';
import VxvNavLink from '@/components/ui/navigation/VxvNavLink.vue';
import VxvPageTitle from '@/components/ui/layout/VxvPageTitle.vue';
import VxvNotification from '@/components/ui/feedback/VxvNotification.vue';
import { useNotificationStore } from '@/stores/notification';

defineProps({
  title: {
    type: String,
    default: 'Panel de Administración'
  }
});

// Initialize notification store
const notificationStore = useNotificationStore();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Mobile menu controls
const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
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
