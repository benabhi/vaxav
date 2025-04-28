<template>
  <div>
    <label v-if="label" :for="id" :class="['block mb-2', labelClass]">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full bg-gray-700 text-white border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500',
        error ? 'border-red-500' : 'border-gray-600',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    ></textarea>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-if="helpText" class="mt-1 text-sm text-gray-400">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Componente de textarea base para formularios
 * @component BaseTextarea
 */

const props = defineProps({
  /**
   * ID único del textarea
   */
  id: {
    type: String,
    required: true
  },
  /**
   * Valor del textarea (para v-model)
   */
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * Etiqueta del textarea
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Clases CSS adicionales para la etiqueta
   */
  labelClass: {
    type: String,
    default: 'text-white font-medium'
  },
  /**
   * Texto de ayuda que se muestra debajo del textarea
   */
  helpText: {
    type: String,
    default: ''
  },
  /**
   * Mensaje de error que se muestra debajo del textarea
   */
  error: {
    type: String,
    default: ''
  },
  /**
   * Texto de placeholder
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * Número de filas del textarea
   */
  rows: {
    type: Number,
    default: 3
  },
  /**
   * Si el textarea está deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Si el textarea es requerido
   */
  required: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'blur']);
</script>
