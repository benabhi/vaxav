<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    @click="handleClick"
    class="block w-full px-4 py-2 text-sm transition-colors"
    :class="[
      disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer',
      className
    ]"
    :disabled="disabled"
  >
    <div class="flex items-center">
      <component
        v-if="icon"
        :is="icon"
        class="mr-3 h-5 w-5 text-gray-400"
      />
      <slot>{{ label }}</slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  to: {
    type: [String, Object],
    default: null
  },
  href: {
    type: String,
    default: null
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

// Computed
const tag = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});

// Methods
const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }

  emit('click', event);
};
</script>
