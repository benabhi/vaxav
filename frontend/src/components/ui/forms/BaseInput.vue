<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="['block text-sm font-medium mb-1', labelClass || 'text-gray-700']">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input container -->
    <div class="relative">
      <!-- Prefix slot -->
      <div v-if="$slots.prefix || prefixIcon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix"></slot>
      </div>

      <!-- Input element -->
      <input :id="inputId" :type="type" :value="modelValue" :name="name" :placeholder="placeholder" :disabled="disabled"
        :readonly="readonly" :required="required" :autocomplete="autocomplete" :class="[
          'block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
          error ? 'border-red-300' : (inputClass ? '' : 'border-gray-300'),
          disabled ? 'bg-gray-100 cursor-not-allowed' : '',
          readonly ? 'bg-gray-50' : '',
          prefixIcon ? 'pl-10' : '',
          suffixIcon ? 'pr-10' : '',
          sizeClasses[size],
          inputClass || ''
        ]" @input="$emit('update:modelValue', $event.target.value)" @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)" />

      <!-- Suffix slot -->
      <div v-if="$slots.suffix || suffixIcon"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <slot name="suffix"></slot>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-1 text-sm text-red-600">
      <slot name="error">{{ error }}</slot>
    </div>

    <!-- Hint text -->
    <div v-else-if="hint" class="mt-1 text-sm text-gray-500">
      <slot name="hint">{{ hint }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg'].includes(value);
    }
  },
  prefixIcon: {
    type: Boolean,
    default: false
  },
  suffixIcon: {
    type: Boolean,
    default: false
  },
  labelClass: {
    type: String,
    default: ''
  },
  inputClass: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue', 'focus', 'blur', 'input']);

// Generate a unique ID if not provided
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`);

// Size classes
const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-4 py-3 text-lg'
};
</script>
