<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';

interface RouterMockProps {
  path?: string;
}

// Props para configurar la ruta simulada
const props = withDefaults(defineProps<RouterMockProps>(), {
  path: '/'
});

interface RouteObject {
  path: string;
}

// Crear un objeto route simulado
const route = ref<RouteObject>({
  path: props.path
});

// Proporcionar el objeto route a los componentes hijos
provide('route', route);
</script>
