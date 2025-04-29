<template>
  <div class="mb-4">
    <!-- Group header (collapsible) -->
    <button 
      type="button" 
      class="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
      @click="toggleCollapsed"
    >
      <span class="font-semibold">{{ title }}</span>
      <svg 
        class="h-4 w-4 transition-transform duration-200" 
        :class="{ 'transform rotate-180': !isCollapsed }"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Group items (links) -->
    <div v-show="!isCollapsed" class="mt-1 pl-2 space-y-1">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(props.defaultCollapsed);

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
