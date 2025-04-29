<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Mis Naves</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <VxvCard title="Hangar Personal" has-border class="mb-6">
          <div class="flex justify-end mb-4">
            <VxvButton variant="primary" size="sm">
              Comprar Nueva Nave
            </VxvButton>
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
        </VxvCard>
      </div>

      <div class="lg:col-span-1">
        <VxvCard title="Nave Activa" has-border class="mb-6">
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
        </VxvCard>

        <VxvCard title="Módulos Instalados" has-border>
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
        </VxvCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvCard from '@/components/ui/layout/VxvCard.vue';
// Lógica para cargar datos de naves
</script>
