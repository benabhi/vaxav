<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Sidebar (mobile) -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 flex z-40 lg:hidden" role="dialog" aria-modal="true">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" @click="closeMobileMenu"></div>

      <!-- Sidebar component -->
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 focus:outline-none">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button type="button"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            @click="closeMobileMenu">
            <span class="sr-only">Cerrar menú</span>
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sidebar content -->
        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-4">
            <span class="text-xl font-bold text-white">Vaxav</span>
          </div>
          <slot name="sidebar">
            <!-- Default sidebar content -->
            <nav class="mt-5 px-2 space-y-1">
              <router-link v-for="item in defaultSidebarItems" :key="item.name" :to="item.to" :class="[
                isActiveRoute(item.to) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-base font-medium rounded-md'
              ]">
                <component :is="item.icon" :class="[
                  isActiveRoute(item.to) ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400',
                  'mr-4 flex-shrink-0 h-6 w-6'
                ]" aria-hidden="true" />
                {{ item.name }}
              </router-link>
            </nav>
          </slot>
        </div>
      </div>
    </div>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div :class="[
        'flex-1 flex flex-col min-h-0 border-r border-gray-700 bg-gray-800',
        sidebarCollapsed ? 'w-16' : 'w-64',
        'transition-all duration-300'
      ]">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <span class="text-xl font-bold text-white">Vaxav</span>
            <h1 v-if="!sidebarCollapsed" class="ml-2 text-xl font-semibold text-white">Admin</h1>
          </div>

          <slot name="sidebar">
            <!-- Default sidebar content -->
            <nav class="mt-5 flex-1 px-2 space-y-1">
              <router-link v-for="item in defaultSidebarItems" :key="item.name" :to="item.to" :class="[
                isActiveRoute(item.to) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                sidebarCollapsed ? 'justify-center' : ''
              ]" :title="sidebarCollapsed ? item.name : ''">
                <component :is="item.icon" :class="[
                  isActiveRoute(item.to) ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400',
                  'flex-shrink-0 h-6 w-6',
                  sidebarCollapsed ? 'mx-auto' : 'mr-3'
                ]" aria-hidden="true" />
                <span v-if="!sidebarCollapsed">{{ item.name }}</span>
              </router-link>
            </nav>
          </slot>
        </div>

        <!-- Collapse button -->
        <div class="flex-shrink-0 flex border-t border-gray-700 p-2">
          <button :class="[
            'flex-shrink-0 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white',
            sidebarCollapsed ? 'justify-center' : ''
          ]" @click="toggleSidebar" :title="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'">
            <svg :class="[
              'flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-blue-400',
              sidebarCollapsed ? 'mx-auto' : 'mr-3'
            ]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="sidebarCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span v-if="!sidebarCollapsed">{{ sidebarCollapsed ? 'Expandir' : 'Colapsar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div :class="[
      'flex flex-col',
      sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
      'transition-all duration-300'
    ]">
      <!-- Mobile menu button only -->
      <div class="sticky top-0 z-10 flex-shrink-0 flex h-12 bg-gray-800 shadow lg:hidden">
        <button type="button"
          class="px-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          @click="openMobileMenu">
          <span class="sr-only">Abrir menú</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            aria-hidden="true">
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

      <!-- Main content -->
      <main class="flex-1">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <slot></slot>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon as CogIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  title: {
    type: String,
    default: 'Panel de Administración'
  },
  collapsibleSidebar: {
    type: Boolean,
    default: true
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
});

// Sidebar state
const sidebarCollapsed = ref(props.defaultCollapsed);
const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

// Toggle sidebar collapse state
const toggleSidebar = () => {
  if (props.collapsibleSidebar) {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
};

// Mobile menu controls
const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// User menu controls
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Get current route
const route = useRoute();

// Function to check if a route is active
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`);
};



// Default sidebar items (used if no custom sidebar is provided)
const defaultSidebarItems = computed(() => [
  { name: 'Usuarios', to: '/admin/users', icon: UserIcon },
  { name: 'Roles', to: '/admin/roles', icon: ShieldCheckIcon },
  { name: 'Configuración', to: '/admin/settings', icon: CogIcon }
]);
</script>
