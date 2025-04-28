<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-400">Mercado Galáctico</h1>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1">
        <div class="card mb-6">
          <h2 class="text-xl font-bold mb-3">Categorías</h2>
          <ul class="space-y-2">
            <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
              Naves
            </li>
            <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
              Módulos
            </li>
            <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
              Recursos
            </li>
            <li class="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
              Planos
            </li>
          </ul>
        </div>

        <div class="card">
          <h2 class="text-xl font-bold mb-3">Filtros</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-gray-300 mb-1">Precio Máximo</label>
              <input type="range" min="0" max="1000000" class="w-full" />
            </div>
            <div>
              <BaseSelect
                label="Ubicación"
                :options="[
                  'Cualquier ubicación',
                  'Sistema actual',
                  'Región actual'
                ]"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-blue-400">Artículos en Venta</h2>
            <div class="flex space-x-2">
              <BaseButton variant="secondary" size="sm">
                Mis Órdenes
              </BaseButton>
              <BaseButton variant="primary" size="sm">
                Vender
              </BaseButton>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="text-left py-2 px-3">Artículo</th>
                  <th class="text-left py-2 px-3">Precio</th>
                  <th class="text-left py-2 px-3">Ubicación</th>
                  <th class="text-left py-2 px-3">Vendedor</th>
                  <th class="text-left py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                  <td class="py-2 px-3">Nave Exploradora</td>
                  <td class="py-2 px-3">50,000 ISK</td>
                  <td class="py-2 px-3">Estación Alpha</td>
                  <td class="py-2 px-3">Comerciante NPC</td>
                  <td class="py-2 px-3">
                    <BaseButton variant="primary" size="sm">Comprar</BaseButton>
                  </td>
                </tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                  <td class="py-2 px-3">Módulo de Escudo</td>
                  <td class="py-2 px-3">15,000 ISK</td>
                  <td class="py-2 px-3">Estación Beta</td>
                  <td class="py-2 px-3">Comerciante NPC</td>
                  <td class="py-2 px-3">
                    <BaseButton variant="primary" size="sm">Comprar</BaseButton>
                  </td>
                </tr>
                <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                  <td class="py-2 px-3">Mineral Exótico</td>
                  <td class="py-2 px-3">5,000 ISK</td>
                  <td class="py-2 px-3">Estación Gamma</td>
                  <td class="py-2 px-3">Piloto Vendedor</td>
                  <td class="py-2 px-3">
                    <BaseButton variant="primary" size="sm">Comprar</BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseSelect from '@/components/ui/forms/BaseSelect.vue';
// Lógica para cargar datos del mercado
</script>
