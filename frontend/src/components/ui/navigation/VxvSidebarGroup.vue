<template>
  <div class="mb-4">
    <!-- Group header (collapsible) -->
    <button
      type="button"
      class="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
      @click="toggleCollapsed"
    >
      <!-- Title (hidden when sidebar is collapsed) -->
      <span
        class="font-semibold transition-opacity duration-200"
        :class="{ 'opacity-0 w-0 overflow-hidden': isSidebarCollapsed && !isMobile }"
      >
        {{ title }}
      </span>

      <!-- Icon for collapsed sidebar -->
      <slot v-if="isSidebarCollapsed && !isMobile" name="icon">
        <svg
          class="h-5 w-5 mx-auto text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </slot>

      <!-- Collapse arrow (hidden when sidebar is collapsed) -->
      <svg
        v-if="!isSidebarCollapsed || isMobile"
        class="h-4 w-4 transition-transform duration-200"
        :class="{ 'transform rotate-180': !isCollapsed }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Group items (links) - hidden when collapsed or sidebar is collapsed -->
    <div
      v-show="(!isCollapsed && !isSidebarCollapsed) || (!isCollapsed && isSidebarCollapsed && isMobile)"
      class="mt-1 space-y-1 transition-all duration-200"
      :class="{ 'pl-2': !isSidebarCollapsed || isMobile }"
    >
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
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(props.defaultCollapsed);

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
