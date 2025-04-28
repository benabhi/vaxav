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
              <BaseRange
                v-model="filters.maxPrice"
                label="Precio Máximo"
                :min="0"
                :max="1000000"
                :step="10000"
                :show-min-max="true"
                :format-value="formatPrice"
                :format-min="formatPrice"
                :format-max="formatPrice"
              />
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
            <BaseTable
              :columns="columns"
              :items="marketItems"
              row-key="id"
            >
              <template #cell(item)="{ item }">
                {{ item.name }}
              </template>

              <template #cell(price)="{ item }">
                {{ item.price }} ISK
              </template>

              <template #cell(location)="{ item }">
                {{ item.location }}
              </template>

              <template #cell(seller)="{ item }">
                {{ item.seller }}
              </template>

              <template #actions="{ item }">
                <BaseButton variant="primary" size="sm">Comprar</BaseButton>
              </template>
            </BaseTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseSelect from '@/components/ui/forms/BaseSelect.vue';
import BaseRange from '@/components/ui/forms/BaseRange.vue';
import BaseTable from '@/components/ui/tables/BaseTable.vue';

// Filtros reactivos
const filters = reactive({
  maxPrice: 500000,
  location: ''
});

// Formatear precio con separador de miles y símbolo de moneda
const formatPrice = (value: number | string) => {
  const numValue = Number(value);
  return numValue.toLocaleString('es-ES') + ' ISK';
};

// Definición de columnas para la tabla
const columns = [
  { key: 'item', label: 'Artículo' },
  { key: 'price', label: 'Precio' },
  { key: 'location', label: 'Ubicación' },
  { key: 'seller', label: 'Vendedor' }
];

// Datos de ejemplo para el mercado
const marketItems = [
  { id: 1, name: 'Nave Exploradora', price: '50,000', location: 'Estación Alpha', seller: 'Comerciante NPC' },
  { id: 2, name: 'Módulo de Escudo', price: '15,000', location: 'Estación Beta', seller: 'Comerciante NPC' },
  { id: 3, name: 'Mineral Exótico', price: '5,000', location: 'Estación Gamma', seller: 'Piloto Vendedor' }
];

// Lógica para cargar datos del mercado
</script>
