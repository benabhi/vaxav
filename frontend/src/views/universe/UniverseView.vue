<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Universo Galáctico</h1>

    <VxvCard title="Mapa Estelar" class="mb-6">
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 flex items-center justify-center">
        <p class="text-gray-400">Mapa interactivo en desarrollo</p>
      </div>
    </VxvCard>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <VxvCard title="Regiones" has-border>
        <ul class="space-y-2">
          <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
            Región Alpha
          </li>
          <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
            Región Beta
          </li>
          <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
            Región Gamma
          </li>
          <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
            Región Delta
          </li>
        </ul>
      </VxvCard>

      <VxvCard title="Constelaciones" has-border>
        <p class="text-gray-300 mb-4">Selecciona una región para ver sus constelaciones</p>
      </VxvCard>

      <VxvCard title="Sistemas Solares" has-border>
        <p class="text-gray-300 mb-4">Selecciona una constelación para ver sus sistemas solares</p>
      </VxvCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import VxvCard from '@/components/ui/layout/VxvCard.vue';
// Lógica para cargar datos del universo
</script>
