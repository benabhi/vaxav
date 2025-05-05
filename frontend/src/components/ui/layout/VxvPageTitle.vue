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

      <!-- Espacio para acciones (si se necesitan) -->
      <div class="md:hidden w-6"></div>
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
   * Whether the current view is in mobile mode
   */
  isMobile: {
    type: Boolean,
    default: false
  }
});


</script>
