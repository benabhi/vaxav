<template>
  <footer class="bg-gray-800 py-4 mt-auto border-t border-gray-700">
    <div class="container mx-auto px-4 text-center text-gray-400 text-sm">
      <p>&copy; {{ currentYear }} Vaxav - MMO Espacial en Navegador Web</p>
      <p class="mt-1">Desarrollado con Laravel y Vue.js</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>
