<template>
  <div 
    class="inline-block"
    :class="[sizeClasses[size]]"
    role="status"
    aria-label="Cargando"
  >
    <svg 
      class="animate-spin"
      :class="[colorClasses[color]]"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="label" class="ml-2">{{ label }}</span>
    <span v-if="!label && !hideText" class="sr-only">Cargando...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  /**
   * Tamaño del spinner
   */
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  /**
   * Color del spinner
   */
  color: {
    type: String,
    default: 'primary',
    validator: (value: string) => [
      'primary', 'secondary', 'success', 'danger', 
      'warning', 'info', 'light', 'dark', 'white'
    ].includes(value)
  },
  /**
   * Etiqueta de texto junto al spinner
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Ocultar el texto para lectores de pantalla
   */
  hideText: {
    type: Boolean,
    default: false
  }
});

/**
 * Clases de tamaño para el spinner
 */
const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

/**
 * Clases de color para el spinner
 */
const colorClasses = {
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  success: 'text-green-500',
  danger: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-cyan-500',
  light: 'text-gray-300',
  dark: 'text-gray-800',
  white: 'text-white'
};
</script>
