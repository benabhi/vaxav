<template>
  <div
    class="flex flex-col items-center justify-center p-6 rounded-lg"
    :class="[
      containerClass,
      {
        'bg-gray-800 border border-gray-700': variant === 'default',
        'bg-blue-900/20 border border-blue-800': variant === 'primary',
        'bg-gray-900/20 border border-gray-800': variant === 'secondary',
        'bg-red-900/20 border border-red-800': variant === 'danger',
        'bg-yellow-900/20 border border-yellow-800': variant === 'warning',
        'bg-green-900/20 border border-green-800': variant === 'success',
        'bg-indigo-900/20 border border-indigo-800': variant === 'info',
      }
    ]"
  >
    <!-- Icono (si se proporciona) -->
    <div v-if="icon || $slots.icon" class="mb-4 text-center">
      <slot name="icon">
        <component
          :is="icon"
          class="w-12 h-12"
          :class="[
            iconClass,
            {
              'text-gray-400': variant === 'default',
              'text-blue-400': variant === 'primary',
              'text-gray-400': variant === 'secondary',
              'text-red-400': variant === 'danger',
              'text-yellow-400': variant === 'warning',
              'text-green-400': variant === 'success',
              'text-indigo-400': variant === 'info',
            }
          ]"
        />
      </slot>
    </div>

    <!-- Mensaje -->
    <div
      class="text-center"
      :class="[
        messageClass,
        {
          'text-gray-300': variant === 'default',
          'text-blue-300': variant === 'primary',
          'text-gray-300': variant === 'secondary',
          'text-red-300': variant === 'danger',
          'text-yellow-300': variant === 'warning',
          'text-green-300': variant === 'success',
          'text-indigo-300': variant === 'info',
        }
      ]"
    >
      <slot>{{ message }}</slot>
    </div>

    <!-- Acción (si se proporciona) -->
    <div v-if="$slots.action" class="mt-4">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Definición de props
const props = defineProps({
  /**
   * Mensaje a mostrar
   */
  message: {
    type: String,
    default: 'No hay datos disponibles'
  },
  /**
   * Icono a mostrar (componente)
   */
  icon: {
    type: Object,
    default: null
  },
  /**
   * Variante de estilo
   */
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'primary', 'secondary', 'danger', 'warning', 'success', 'info'].includes(value);
    }
  },
  /**
   * Clase CSS adicional para el contenedor
   */
  containerClass: {
    type: String,
    default: ''
  },
  /**
   * Clase CSS adicional para el icono
   */
  iconClass: {
    type: String,
    default: ''
  },
  /**
   * Clase CSS adicional para el mensaje
   */
  messageClass: {
    type: String,
    default: ''
  }
});
</script>
