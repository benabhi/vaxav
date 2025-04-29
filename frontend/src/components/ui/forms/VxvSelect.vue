<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="selectId" :class="['block mb-1', labelClass || 'text-gray-300']">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Select container -->
    <div class="relative">
      <!-- Select element -->
      <select
        :id="selectId"
        :value="modelValue"
        :name="name"
        :disabled="disabled"
        :required="required"
        :multiple="multiple"
        :class="[
          'w-full bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-500 appearance-none',
          error ? 'border-red-500' : '',
          disabled ? 'bg-gray-800 cursor-not-allowed opacity-70' : '',
          sizeClasses[size],
          selectClass || ''
        ]"
        @change="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <slot>
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option v-for="option in options" :key="getOptionValue(option)" :value="getOptionValue(option)">
            {{ getOptionLabel(option) }}
          </option>
        </slot>
      </select>

      <!-- Dropdown icon -->
      <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-1 text-sm text-red-500">
      <slot name="error">{{ error }}</slot>
    </div>

    <!-- Hint text -->
    <div v-else-if="hint" class="mt-1 text-sm text-gray-400">
      <slot name="hint">{{ hint }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define props
const props = defineProps({
  /**
   * The value of the select (v-model)
   */
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  /**
   * The label for the select
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * The placeholder text
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * The name attribute
   */
  name: {
    type: String,
    default: ''
  },
  /**
   * The id attribute (auto-generated if not provided)
   */
  id: {
    type: String,
    default: null
  },
  /**
   * Whether the select is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Whether the select is required
   */
  required: {
    type: Boolean,
    default: false
  },
  /**
   * Whether multiple options can be selected
   */
  multiple: {
    type: Boolean,
    default: false
  },
  /**
   * Error message to display
   */
  error: {
    type: String,
    default: ''
  },
  /**
   * Hint text to display
   */
  hint: {
    type: String,
    default: ''
  },
  /**
   * The size of the select
   */
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  /**
   * Additional classes for the select element
   */
  selectClass: {
    type: String,
    default: ''
  },
  /**
   * Additional classes for the label
   */
  labelClass: {
    type: String,
    default: ''
  },
  /**
   * Array of options
   */
  options: {
    type: Array,
    default: () => []
  },
  /**
   * The key to use for option values
   */
  valueKey: {
    type: String,
    default: 'value'
  },
  /**
   * The key to use for option labels
   */
  labelKey: {
    type: String,
    default: 'label'
  }
});

// Define emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

// Generate a unique ID if not provided
const selectId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`);

// Size classes - altura estándar para todos los componentes
const sizeClasses = {
  sm: 'py-1.5 pl-3 pr-10 text-sm',     // ~32px de altura total con bordes
  md: 'py-[9px] pl-3 pr-10 text-base', // 38px de altura total con bordes (2px de bordes + 18px de texto + 18px de padding)
  lg: 'py-2.5 pl-3 pr-10 text-lg'      // ~42px de altura total con bordes
};

// Helper functions for options
const getOptionValue = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey];
  }
  return option;
};

const getOptionLabel = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey];
  }
  return option;
};
</script>

<style scoped>
/* Ocultar la flecha nativa en diferentes navegadores */
select {
  /* Para Firefox */
  -moz-appearance: none;
  /* Para Chrome, Safari, Edge, Opera */
  -webkit-appearance: none;
  /* Para IE10+ */
  appearance: none;
}

/* Para IE10+ */
select::-ms-expand {
  display: none;
}
</style>
