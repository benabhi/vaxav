<template>
  <div class="flex min-h-screen bg-gray-900 text-gray-100">
    <!-- Desktop sidebar - fixed position -->
    <aside class="hidden lg:block w-64 fixed top-[57px] bottom-0 left-0 z-10">
      <BaseSidebar title="Panel Admin">
        <!-- User Management Group -->
        <BaseSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
          <BaseNavLink to="/admin/users" label="Usuarios" />
          <BaseNavLink to="/admin/roles" label="Roles" />
        </BaseSidebarGroup>

        <!-- Other menu items -->
        <BaseNavLink to="/admin/settings" label="Configuración" />
      </BaseSidebar>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 lg:ml-64">
      <!-- Mobile menu button -->
      <div class="sticky top-[57px] z-20 lg:hidden bg-gray-800 border-b border-gray-700 p-2">
        <button
          type="button"
          class="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="openMobileMenu"
        >
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Breadcrumbs -->
      <div v-if="$slots.breadcrumbs" class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <slot name="breadcrumbs"></slot>
        </div>
      </div>

      <!-- Page content -->
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <slot></slot>
        </div>
      </div>
    </main>

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
        class="fixed top-[57px] bottom-0 left-0 flex flex-col w-64 max-w-xs transform transition-transform duration-300 ease-in-out bg-gray-800 shadow-lg"
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
import { useRoute } from 'vue-router';
import BaseSidebar from '@/components/ui/navigation/BaseSidebar.vue';
import BaseSidebarGroup from '@/components/ui/navigation/BaseSidebarGroup.vue';
import BaseNavLink from '@/components/ui/navigation/BaseNavLink.vue';

const props = defineProps({
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

// Get current route
const route = useRoute();
</script>
