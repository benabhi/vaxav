<template>
  <a
    :href="to"
    :class="[
      isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white',
      'block text-base font-medium transition-all duration-150',
      !simple ? 'px-4 py-2 rounded-md hover:bg-gray-700' : 'px-3 py-1',
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
      className
    ]"
    :title="label"
  >
    <div
      class="flex items-center"
    >
      <component
        v-if="icon"
        :is="icon"
        class="h-5 w-5 mr-2"
        :class="isActive ? 'text-blue-400' : 'text-gray-400'"
      />
      <span>
        {{ label }}
      </span>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  exact: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  simple: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  // Para Storybook, podemos simular si el enlace está activo
  active: {
    type: Boolean,
    default: false
  },
  // Ruta actual simulada para Storybook
  currentPath: {
    type: String,
    default: ''
  }
});

// Determinar si el enlace está activo
const isActive = computed(() => {
  if (props.active) return true;
  
  if (props.currentPath) {
    if (props.to === '/') {
      if (props.exact) {
        return props.currentPath === '/';
      }
      return props.currentPath === '/' || 
             props.currentPath === '/skills' || 
             props.currentPath.startsWith('/skills/');
    }
    
    if (props.exact) {
      return props.currentPath === props.to;
    }
    
    return props.currentPath === props.to || props.currentPath.startsWith(`${props.to}/`);
  }
  
  return false;
});
</script>
