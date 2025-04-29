<template>
  <header class="bg-gray-800 border-b border-gray-700 flex-shrink-0">
    <div class="flex justify-between items-center px-4 py-3 border-b border-gray-700">
      <h1 class="text-xl font-semibold text-white">{{ title }}</h1>

      <!-- Mobile menu button - only visible on small screens -->
      <button
        v-if="showMobileMenuButton"
        type="button"
        class="lg:hidden text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="$emit('mobile-menu-click')"
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
  }
});

defineEmits(['mobile-menu-click']);
</script>
