<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="rangeId" :class="['block mb-1', labelClass || 'text-gray-300']">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="flex items-center space-x-3">
      <!-- Min value display -->
      <div v-if="showMinMax" class="text-xs text-gray-400">{{ formattedMin }}</div>

      <!-- Range input container -->
      <div class="relative flex-grow">
        <!-- Range input -->
        <input
          :id="rangeId"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="modelValue"
          :disabled="disabled"
          :class="[
            'w-full appearance-none bg-transparent cursor-pointer',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            rangeClass
          ]"
          @input="updateValue"
          @change="$emit('change', $event.target.value)"
        />

        <!-- Value tooltip -->
        <div
          v-if="showTooltip"
          class="absolute -top-8 px-2 py-1 bg-gray-800 text-white text-xs rounded transform -translate-x-1/2"
          :style="{ left: `${tooltipPosition}%` }"
        >
          {{ formattedValue }}
        </div>
      </div>

      <!-- Max value display -->
      <div v-if="showMinMax" class="text-xs text-gray-400">{{ formattedMax }}</div>

      <!-- Value display -->
      <div v-if="showValue" class="text-sm text-white bg-gray-700 border border-gray-600 rounded px-2 py-1 min-w-[60px] text-center">
        {{ formattedValue }}
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
   * The value of the range (v-model)
   */
  modelValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * The label for the range
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * The minimum value
   */
  min: {
    type: [Number, String],
    default: 0
  },
  /**
   * The maximum value
   */
  max: {
    type: [Number, String],
    default: 100
  },
  /**
   * The step value
   */
  step: {
    type: [Number, String],
    default: 1
  },
  /**
   * The id attribute (auto-generated if not provided)
   */
  id: {
    type: String,
    default: null
  },
  /**
   * Whether the range is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Whether the range is required
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
   * Hint text to display
   */
  hint: {
    type: String,
    default: ''
  },
  /**
   * Additional classes for the range
   */
  rangeClass: {
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
   * Whether to show the min and max values
   */
  showMinMax: {
    type: Boolean,
    default: false
  },
  /**
   * Whether to show the current value
   */
  showValue: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to show a tooltip with the current value
   */
  showTooltip: {
    type: Boolean,
    default: false
  },
  /**
   * Format function for the value
   */
  formatValue: {
    type: Function,
    default: null
  },
  /**
   * Format function for the min value
   */
  formatMin: {
    type: Function,
    default: null
  },
  /**
   * Format function for the max value
   */
  formatMax: {
    type: Function,
    default: null
  }
});

// Define emits
const emit = defineEmits(['update:modelValue', 'change']);

// Generate a unique ID if not provided
const rangeId = computed(() => props.id || `range-${Math.random().toString(36).substring(2, 9)}`);

// Calculate tooltip position as percentage
const tooltipPosition = computed(() => {
  const value = Number(props.modelValue);
  const min = Number(props.min);
  const max = Number(props.max);
  return ((value - min) / (max - min)) * 100;
});

// Format the current value
const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.modelValue);
  }
  return props.modelValue;
});

// Format the min value
const formattedMin = computed(() => {
  if (props.formatMin) {
    return props.formatMin(props.min);
  }
  return props.min;
});

// Format the max value
const formattedMax = computed(() => {
  if (props.formatMax) {
    return props.formatMax(props.max);
  }
  return props.max;
});

// Update the value
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>

<style scoped>
/* Custom styling for the range input */
input[type="range"] {
  -webkit-appearance: none;
  height: 6px;
  background: #4a5568; /* Gray-600 */
  border-radius: 3px;
  outline: none;
}

/* Thumb styles */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3182ce; /* Blue-500 */
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #2b6cb0; /* Blue-600 */
  box-shadow: 0 0 5px rgba(49, 130, 206, 0.5); /* Blue glow */
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3182ce; /* Blue-500 */
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #2b6cb0; /* Blue-600 */
  box-shadow: 0 0 5px rgba(49, 130, 206, 0.5); /* Blue glow */
}

input[type="range"]::-ms-thumb {
  width: 16px;
  height: 16px;
  background: #3182ce; /* Blue-500 */
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #2b6cb0; /* Blue-600 */
  box-shadow: 0 0 5px rgba(49, 130, 206, 0.5); /* Blue glow */
}

/* Track styles */
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #4a5568; /* Gray-600 */
  border-radius: 3px;
}

input[type="range"]::-moz-range-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #4a5568; /* Gray-600 */
  border-radius: 3px;
}

input[type="range"]::-ms-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type="range"]::-ms-fill-lower {
  background: #3182ce; /* Blue-500 */
  border-radius: 3px;
}

input[type="range"]::-ms-fill-upper {
  background: #4a5568; /* Gray-600 */
  border-radius: 3px;
}

/* Focus styles */
input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 8px rgba(49, 130, 206, 0.8); /* Stronger blue glow */
}

input[type="range"]:focus::-moz-range-thumb {
  box-shadow: 0 0 8px rgba(49, 130, 206, 0.8); /* Stronger blue glow */
}

input[type="range"]:focus::-ms-thumb {
  box-shadow: 0 0 8px rgba(49, 130, 206, 0.8); /* Stronger blue glow */
}

/* Disabled styles */
input[type="range"]:disabled::-webkit-slider-thumb {
  background: #718096; /* Gray-500 */
  border-color: #4a5568; /* Gray-600 */
  box-shadow: none;
  cursor: not-allowed;
}

input[type="range"]:disabled::-moz-range-thumb {
  background: #718096; /* Gray-500 */
  border-color: #4a5568; /* Gray-600 */
  box-shadow: none;
  cursor: not-allowed;
}

input[type="range"]:disabled::-ms-thumb {
  background: #718096; /* Gray-500 */
  border-color: #4a5568; /* Gray-600 */
  box-shadow: none;
  cursor: not-allowed;
}
</style>
