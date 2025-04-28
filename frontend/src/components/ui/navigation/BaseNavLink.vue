<template>
  <router-link
    :to="to"
    :class="[
      isActive ? activeClass : inactiveClass,
      'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
      className
    ]"
  >
    <div class="flex items-center">
      <component
        v-if="icon"
        :is="icon"
        class="mr-2 h-5 w-5"
        :class="isActive ? activeIconClass : inactiveIconClass"
      />
      <span>{{ label }}</span>
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
