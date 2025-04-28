<template>
  <div class="flex items-center">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :value="value"
      :name="name"
      :disabled="disabled"
      :required="required"
      :class="[
        'h-4 w-4 rounded border-gray-500 focus:ring-blue-500',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        error ? 'border-red-500' : 'text-blue-600',
        checkboxClass
      ]"
      @change="handleChange"
    />
    <label
      v-if="label || $slots.default"
      :for="checkboxId"
      :class="[
        'ml-2',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        error ? 'text-red-500' : 'text-white',
        labelClass
      ]"
    >
      <slot>{{ label }}</slot>
      <span v-if="required && !$slots.default" class="text-red-500 ml-1">*</span>
    </label>
    <div v-if="error" class="ml-2 text-sm text-red-500">
      <slot name="error">{{ error }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  /**
   * The value of the checkbox (v-model)
   */
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  /**
   * The value when used in a group
   */
  value: {
    type: [String, Number, Boolean, Object],
    default: true
  },
  /**
   * The label for the checkbox
   */
  label: {
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
   * Whether the checkbox is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Whether the checkbox is required
   */
  required: {
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
   * Additional classes for the checkbox
   */
  checkboxClass: {
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
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Generate a unique ID if not provided
const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`);

// Handle checkbox change
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  
  if (Array.isArray(props.modelValue)) {
    // If modelValue is an array (multiple checkboxes)
    const newValue = [...props.modelValue];
    
    if (target.checked) {
      // Add value to array if not already present
      if (!newValue.includes(props.value)) {
        newValue.push(props.value);
      }
    } else {
      // Remove value from array
      const index = newValue.indexOf(props.value);
      if (index !== -1) {
        newValue.splice(index, 1);
      }
    }
    
    emit('update:modelValue', newValue);
  } else {
    // Single checkbox
    emit('update:modelValue', target.checked);
  }
  
  emit('change', target.checked);
};
</script>
