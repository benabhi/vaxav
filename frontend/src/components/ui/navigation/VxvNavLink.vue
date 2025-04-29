<template>
  <router-link
    :to="to"
    :class="[
      isActive ? activeClass : inactiveClass,
      'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
      isSidebarCollapsed && !isMobile ? 'px-2 py-2 text-center' : '',
      className
    ]"
    :title="label"
  >
    <div
      class="flex items-center"
      :class="{ 'justify-center': isSidebarCollapsed && !isMobile }"
    >
      <component
        v-if="icon"
        :is="icon"
        class="h-5 w-5"
        :class="[
          isActive ? activeIconClass : inactiveIconClass,
          { 'mr-0': isSidebarCollapsed && !isMobile, 'mr-2': !isSidebarCollapsed || isMobile }
        ]"
      />
      <span
        :class="{ 'sr-only': isSidebarCollapsed && !isMobile }"
      >
        {{ label }}
      </span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  exact: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  activeClass: {
    type: String,
    default: 'bg-gray-700 text-blue-400'
  },
  inactiveClass: {
    type: String,
    default: 'text-gray-300 hover:text-white'
  },
  activeIconClass: {
    type: String,
    default: 'text-blue-400'
  },
  inactiveIconClass: {
    type: String,
    default: 'text-gray-400'
  },
  className: {
    type: String,
    default: ''
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

const route = useRoute();

// Check if the current route matches this link
const isActive = computed(() => {
  if (props.exact) {
    return route.path === props.to;
  }
  return route.path === props.to || route.path.startsWith(`${props.to}/`);
});
</script>
