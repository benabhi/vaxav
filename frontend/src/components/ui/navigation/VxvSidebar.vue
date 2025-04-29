<template>
  <div
    class="h-full flex flex-col bg-gray-800 w-full"
    :class="[className]"
  >
    <!-- Header with title -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
      <!-- Title -->
      <h2
        v-if="title"
        class="text-lg font-semibold text-white"
      >
        {{ title }}
      </h2>

      <!-- Collapse button (only visible in desktop if collapsible is true) -->
      <button
        v-if="collapsible && !isMobile"
        type="button"
        class="text-gray-400 hover:text-white focus:outline-none focus:text-white"
        @click="toggleCollapse"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transition-transform duration-200"
          :class="{ 'transform rotate-180': isCollapsed }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <!-- Close button (only visible in mobile) -->
      <button
        v-if="isMobile"
        type="button"
        class="text-gray-400 hover:text-white focus:outline-none focus:text-white"
        @click="$emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-2 overflow-y-auto">
      <slot></slot>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['collapse', 'expand', 'close']);

// State
const isCollapsedInternal = ref(props.defaultCollapsed);

// Computed
const isCollapsed = computed({
  get: () => isCollapsedInternal.value,
  set: (value) => {
    isCollapsedInternal.value = value;
    if (value) {
      emit('collapse');
    } else {
      emit('expand');
    }
  }
});

// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
