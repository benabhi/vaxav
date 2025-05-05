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

<script setup lang="ts">
import { computed } from 'vue';

interface NavLinkStubProps {
  to: string;
  label: string;
  icon?: object | Function | null;
  exact?: boolean;
  horizontal?: boolean;
  simple?: boolean;
  className?: string;
  // Para Storybook, podemos simular si el enlace está activo
  active?: boolean;
  // Ruta actual simulada para Storybook
  currentPath?: string;
}

const props = defineProps<NavLinkStubProps>();

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
