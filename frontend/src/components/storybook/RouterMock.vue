<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup>
import { provide, ref } from 'vue';

// Props para configurar la ruta simulada
const props = defineProps({
  path: {
    type: String,
    default: '/'
  }
});

// Crear un objeto route simulado
const route = ref({
  path: props.path
});

// Proporcionar el objeto route a los componentes hijos
provide('route', route);
</script>
