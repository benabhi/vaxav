<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading" @click="$emit('click', $event)">
    <!-- Loading state -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <slot name="loading">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </slot>
    </div>

    <!-- Button content with conditional opacity for loading state -->
    <div :class="{ 'opacity-0': loading }" class="flex items-center justify-center">
      <!-- Left icon -->
      <div v-if="$slots['icon-left']" class="button-icon">
        <slot name="icon-left"></slot>
      </div>

      <!-- Main content -->
      <span v-if="$slots.default" class="button-text">
        <slot></slot>
      </span>

      <!-- Right icon -->
      <div v-if="$slots['icon-right']" class="button-icon">
        <slot name="icon-right"></slot>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => {
      return ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'ghost'].includes(value);
    }
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button',
    validator: (value: string) => {
      return ['button', 'submit', 'reset'].includes(value);
    }
  }
});

defineEmits(['click']);

const buttonClasses = computed(() => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  // Size classes - ajustados para coincidir con la altura de los inputs (con bordes)
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-[9px] text-base', // Ajustado para coincidir con la altura de VxvInput (38px)
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  };

  // Icon-only button adjustments - ajustados para coincidir con la altura de los inputs
  const iconClasses = props.icon ? {
    sm: 'p-1.5',
    md: 'p-[9px]', // Ajustado para coincidir con la altura de VxvInput (38px)
    lg: 'p-2.5',
    xl: 'p-3'
  } : {};

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 disabled:bg-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-green-300',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 disabled:bg-yellow-300',
    info: 'bg-blue-400 hover:bg-blue-500 text-white focus:ring-blue-400 disabled:bg-blue-200',
    ghost: 'bg-transparent hover:bg-gray-600 text-gray-300 focus:ring-gray-500 disabled:text-gray-500 border border-gray-600 hover:border-gray-500'
  };

  // Border radius
  const roundedClasses = props.rounded ? 'rounded-full' : 'rounded-md';

  // Width
  const widthClasses = props.fullWidth ? 'w-full' : '';

  // Icon-only shape
  const shapeClasses = props.icon ? 'rounded-full' : roundedClasses;

  return [
    baseClasses,
    props.icon ? iconClasses[props.size] : sizeClasses[props.size],
    variantClasses[props.variant],
    shapeClasses,
    widthClasses,
    'disabled:cursor-not-allowed disabled:opacity-50'
  ];
});
</script>

<style scoped>
.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.375rem;
}

.button-icon:first-child {
  margin-left: 0;
}

.button-icon:last-child {
  margin-right: 0;
}

.button-text {
  display: inline-block;
  line-height: 1;
}

/* Ensure SVG icons are properly aligned */
.button-icon svg {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
