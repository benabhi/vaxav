<template>
  <div class="flex items-center">
    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        modelValue ? activeColor : inactiveColor,
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      :aria-checked="modelValue"
      :aria-label="label"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      ></span>
    </button>
    <span 
      v-if="showLabel" 
      class="ml-2 text-sm" 
      :class="modelValue ? activeTextColor : inactiveTextColor"
    >
      {{ modelValue ? activeText : inactiveText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  /**
   * Estado actual del toggle (true = activo, false = inactivo)
   */
  modelValue: {
    type: Boolean,
    required: true
  },
  /**
   * Texto para el estado activo
   */
  activeText: {
    type: String,
    default: 'Activo'
  },
  /**
   * Texto para el estado inactivo
   */
  inactiveText: {
    type: String,
    default: 'Inactivo'
  },
  /**
   * Color de fondo para el estado activo
   */
  activeColor: {
    type: String,
    default: 'bg-green-500'
  },
  /**
   * Color de fondo para el estado inactivo
   */
  inactiveColor: {
    type: String,
    default: 'bg-gray-600'
  },
  /**
   * Color del texto para el estado activo
   */
  activeTextColor: {
    type: String,
    default: 'text-green-400'
  },
  /**
   * Color del texto para el estado inactivo
   */
  inactiveTextColor: {
    type: String,
    default: 'text-gray-400'
  },
  /**
   * Etiqueta para accesibilidad
   */
  label: {
    type: String,
    default: 'Toggle'
  },
  /**
   * Si el toggle está deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Si se debe mostrar la etiqueta de texto
   */
  showLabel: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

/**
 * Alterna el estado del toggle
 */
const toggle = () => {
  if (props.disabled) return;
  
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>
