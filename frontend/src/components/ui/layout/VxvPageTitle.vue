<template>
  <header class="bg-gray-800 border-b border-gray-700 flex-shrink-0">
    <div class="flex items-center px-4 py-3">
      <!-- Título y menú en el lado izquierdo -->
      <div class="flex items-center flex-grow">
        <h1 class="text-xl font-semibold text-white mr-6">{{ title }}</h1>

        <!-- Menú secundario en la misma línea que el título -->
        <div v-if="$slots.menu" class="hidden md:flex space-x-2">
          <slot name="menu"></slot>
        </div>
      </div>

      <!-- Mobile menu button - only visible on small screens -->
      <button
        v-if="showMobileMenuButton"
        type="button"
        class="md:hidden text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="$emit('mobile-menu-click')"
      >
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Menú secundario para móviles y breadcrumbs -->
    <div v-if="($slots.menu && isMobile) || $slots.breadcrumbs" class="px-4 py-2 flex items-center justify-between border-t border-gray-700">
      <slot name="breadcrumbs"></slot>
      <div v-if="$slots.menu && isMobile" class="md:hidden flex space-x-2 overflow-x-auto">
        <slot name="menu"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  /**
   * The title of the page
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Whether to show the mobile menu button
   */
  showMobileMenuButton: {
    type: Boolean,
    default: true
  },

  /**
   * Whether the current view is in mobile mode
   */
  isMobile: {
    type: Boolean,
    default: false
  }
});

defineEmits(['mobile-menu-click']);
</script>
