<template>
  <!-- Two-column layout that fits within App.vue's main element -->
  <div class="flex min-h-full">
    <!-- Column 1: Sidebar - fixed width, full height -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden lg:block">
      <div class="sticky top-0 h-screen overflow-y-auto">
        <BaseSidebar title="Panel Admin">
          <!-- User Management Group -->
          <BaseSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
            <BaseNavLink to="/admin/users" label="Usuarios" />
            <BaseNavLink to="/admin/roles" label="Roles" />
          </BaseSidebarGroup>

          <!-- Other menu items -->
          <BaseNavLink to="/admin/settings" label="Configuración" />
        </BaseSidebar>
      </div>
    </aside>

    <!-- Column 2: Content area with three rows -->
    <div class="flex-1 flex flex-col">
      <!-- Row 1: Header -->
      <header class="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h1 class="text-xl font-semibold text-white">{{ title }}</h1>

          <!-- Mobile menu button - only visible on small screens -->
          <button
            type="button"
            class="lg:hidden text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="openMobileMenu"
          >
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Breadcrumbs -->
        <div v-if="$slots.breadcrumbs" class="px-4 py-2">
          <slot name="breadcrumbs"></slot>
        </div>
      </header>

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
        <BaseSidebar title="Panel Admin">
          <!-- User Management Group -->
          <BaseSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
            <BaseNavLink to="/admin/users" label="Usuarios" />
            <BaseNavLink to="/admin/roles" label="Roles" />
          </BaseSidebarGroup>

          <!-- Other menu items -->
          <BaseNavLink to="/admin/settings" label="Configuración" />
        </BaseSidebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseSidebar from '@/components/ui/navigation/BaseSidebar.vue';
import BaseSidebarGroup from '@/components/ui/navigation/BaseSidebarGroup.vue';
import BaseNavLink from '@/components/ui/navigation/BaseNavLink.vue';

defineProps({
  title: {
    type: String,
    default: 'Panel de Administración'
  }
});

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
