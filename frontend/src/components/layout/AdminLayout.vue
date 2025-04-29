<template>
  <!-- Two-column layout that fits within App.vue's main element -->
  <div class="flex min-h-full">
    <!-- Column 1: Sidebar - fixed width, full height -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden lg:block">
      <div class="sticky top-0 h-screen overflow-y-auto">
        <VxvSidebar title="Panel Admin">
          <!-- User Management Group -->
          <VxvSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
            <VxvNavLink to="/admin/users" label="Usuarios" />
            <VxvNavLink to="/admin/roles" label="Roles" />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink to="/admin/settings" label="Configuración" />
        </VxvSidebar>
      </div>
    </aside>

    <!-- Column 2: Content area with three rows -->
    <div class="flex-1 flex flex-col">
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
      <main class="flex-1 overflow-auto p-4">
        <slot></slot>
      </main>

      <!-- Row 3: Footer -->
      <footer v-if="$slots.footer" class="bg-gray-800 border-t border-gray-700 px-4 py-3 flex-shrink-0">
        <slot name="footer"></slot>
      </footer>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 lg:hidden"
      @click="closeMobileMenu"
    >
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true"></div>

      <!-- Sidebar container with animation -->
      <div
        class="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <!-- Close button -->
        <div class="absolute top-0 right-0 pt-2 -mr-12">
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            @click="closeMobileMenu"
          >
            <span class="sr-only">Cerrar menú</span>
            <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile sidebar content -->
        <VxvSidebar title="Panel Admin">
          <!-- User Management Group -->
          <VxvSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
            <VxvNavLink to="/admin/users" label="Usuarios" />
            <VxvNavLink to="/admin/roles" label="Roles" />
          </VxvSidebarGroup>

          <!-- Other menu items -->
          <VxvNavLink to="/admin/settings" label="Configuración" />
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
