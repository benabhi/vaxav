<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Mis Naves</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="card mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-blue-400">Hangar Personal</h2>
            <button class="btn btn-primary text-sm">Comprar Nueva Nave</button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer">
              <div class="flex justify-between">
                <h3 class="font-bold">Explorador Estelar</h3>
                <span class="text-green-400">Activa</span>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <span class="text-gray-400 text-sm">Tipo:</span>
                  <p>Exploración</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm">Salud:</span>
                  <p>100%</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm">Ubicación:</span>
                  <p>Estación Alpha</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer">
              <div class="flex justify-between">
                <h3 class="font-bold">Minero Industrial</h3>
                <span class="text-gray-400">Inactiva</span>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <span class="text-gray-400 text-sm">Tipo:</span>
                  <p>Minería</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm">Salud:</span>
                  <p>85%</p>
                </div>
                <div>
                  <span class="text-gray-400 text-sm">Ubicación:</span>
                  <p>Estación Beta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lg:col-span-1">
        <div class="card mb-6">
          <h2 class="text-xl font-bold mb-3 text-blue-400">Nave Activa</h2>
          <div class="space-y-3">
            <div>
              <span class="text-gray-400">Nombre:</span>
              <p>Explorador Estelar</p>
            </div>
            <div>
              <span class="text-gray-400">Tipo:</span>
              <p>Exploración</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-gray-400">Escudo:</span>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div class="bg-blue-600 h-2.5 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <span class="text-gray-400">Armadura:</span>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div class="bg-yellow-600 h-2.5 rounded-full" style="width: 90%"></div>
                </div>
              </div>
            </div>
            <div>
              <span class="text-gray-400">Estructura:</span>
              <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div class="bg-red-600 h-2.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>
            <div>
              <span class="text-gray-400">Capacidad de Carga:</span>
              <p>250/500 m³</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h2 class="text-xl font-bold mb-3 text-blue-400">Módulos Instalados</h2>
          <ul class="space-y-2">
            <li class="p-2 bg-gray-700 rounded flex justify-between">
              <span>Escáner Avanzado</span>
              <span class="text-green-400">Activo</span>
            </li>
            <li class="p-2 bg-gray-700 rounded flex justify-between">
              <span>Propulsor Estándar</span>
              <span class="text-green-400">Activo</span>
            </li>
            <li class="p-2 bg-gray-700 rounded flex justify-between">
              <span>Láser de Minería</span>
              <span class="text-gray-400">Inactivo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica para cargar datos de naves
</script>
