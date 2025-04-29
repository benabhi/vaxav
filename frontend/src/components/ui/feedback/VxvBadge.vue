<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="[
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size],
      { 'cursor-pointer hover:opacity-80': clickable }
    ]"
    @click="clickable ? $emit('click') : null"
  >
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'success', 'warning', 'danger', 'info',
      'purple', 'blue', 'green', 'yellow', 'red', 'gray'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);

const variantClasses = {
  // Colores sólidos con texto blanco
  default: 'bg-gray-600 text-white',
  primary: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  danger: 'bg-red-600 text-white',
  info: 'bg-cyan-600 text-white',
  
  // Colores específicos
  purple: 'bg-purple-600 text-white',
  blue: 'bg-blue-600 text-white',
  green: 'bg-green-600 text-white',
  yellow: 'bg-yellow-600 text-white',
  red: 'bg-red-600 text-white',
  gray: 'bg-gray-600 text-white'
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1'
};
</script>
