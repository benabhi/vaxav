<template>
  <div class="h-full flex flex-col bg-gray-800 w-full">
    <!-- Optional title -->
    <div v-if="title" class="mb-4 px-4 py-3 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-2 overflow-y-auto">
      <slot></slot>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>
