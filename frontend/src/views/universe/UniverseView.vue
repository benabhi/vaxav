<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Universo Galáctico</h1>
    
    <div class="card mb-6">
      <h2 class="text-xl font-bold mb-3">Mapa Estelar</h2>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 flex items-center justify-center">
        <p class="text-gray-400">Mapa interactivo en desarrollo</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Regiones</h2>
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
      </div>
      
      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Constelaciones</h2>
        <p class="text-gray-300 mb-4">Selecciona una región para ver sus constelaciones</p>
      </div>
      
      <div class="card">
        <h2 class="text-xl font-bold mb-3 text-blue-400">Sistemas Solares</h2>
        <p class="text-gray-300 mb-4">Selecciona una constelación para ver sus sistemas solares</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica para cargar datos del universo
</script>
