<template>
  <div
    class="bg-gray-800 shadow rounded-lg overflow-hidden"
    :class="[
      maxWidth ? maxWidthClass : '',
      centered ? 'mx-auto' : '',
      !hasBorder && !hasTitle ? 'p-6' : ''
    ]"
  >
    <div
      v-if="hasTitle"
      class="px-6"
      :class="{
        'py-4 border-b border-gray-700': hasBorder,
        'pt-4 pb-3': !hasBorder
      }"
    >
      <h2 class="text-xl font-bold text-white">{{ title }}</h2>
    </div>

    <div :class="{
      'p-6': hasBorder || !hasTitle,
      'px-6 pt-2 pb-6': hasTitle && !hasBorder
    }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  hasBorder: {
    type: Boolean,
    default: false
  },
  maxWidth: {
    type: String,
    default: ''
  },
  centered: {
    type: Boolean,
    default: false
  }
});

const hasTitle = computed(() => !!props.title);

const maxWidthClass = computed(() => {
  const widths = {
    'xs': 'max-w-xs',
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return widths[props.maxWidth] || '';
});
</script>
