<template>
  <div class="vxv-distribution-card bg-gray-800 rounded-lg p-4 border border-gray-700">
    <!-- Título de la tarjeta -->
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-base font-medium text-gray-300">{{ title }}</h3>
      <div v-if="showTotal" class="text-sm text-gray-400">
        {{ formattedTotal }}
      </div>
    </div>
    
    <!-- Distribución por items -->
    <div class="space-y-3">
      <!-- Iteración sobre cada item -->
      <div v-for="(item, index) in items" :key="index" class="flex flex-col">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-gray-500">{{ item.label }}</span>
          <span class="text-xs font-medium" :class="getTextColorClass(item.color)">
            {{ formatItemValue(item) }}
          </span>
        </div>
        <VxvProgressBar
          :value="item.value"
          :max="total"
          :color="item.color"
          :height="barHeight"
          :animated="animated"
          :showLabels="false"
        />
      </div>
    </div>
    
    <!-- Información adicional (opcional) -->
    <div v-if="showFooter" class="mt-2 pt-2 border-t border-gray-700">
      <slot name="footer">
        <!-- Contenido por defecto del footer -->
        <div v-for="(info, index) in footerInfo" :key="index" class="flex justify-between text-xs">
          <span class="text-gray-500">{{ info.label }}:</span>
          <span class="text-gray-300">{{ info.value }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VxvProgressBar from '../../ui/progress/VxvProgressBar.vue';

/**
 * VxvDistributionCard - Componente para mostrar distribuciones con barras de progreso
 * 
 * Este componente muestra una tarjeta con distribución de items utilizando barras de progreso
 * para visualizar la proporción de cada item. Puede usarse para mostrar distribuciones
 * por nivel, multiplicador, estado, etc.
 */
const props = defineProps({
  /**
   * Título de la tarjeta
   */
  title: {
    type: String,
    default: 'Distribución'
  },
  /**
   * Valor total
   */
  total: {
    type: [Number, String],
    default: 0
  },
  /**
   * Formato para el valor total
   */
  totalFormat: {
    type: String,
    default: '{value}'
  },
  /**
   * Si se debe mostrar el valor total
   */
  showTotal: {
    type: Boolean,
    default: true
  },
  /**
   * Array de items para mostrar
   * Cada item debe tener: label, value, color (opcional), format (opcional)
   */
  items: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every(item => 
        typeof item === 'object' && 
        'label' in item && 
        'value' in item
      );
    }
  },
  /**
   * Altura de las barras
   */
  barHeight: {
    type: String,
    default: 'sm'
  },
  /**
   * Si las barras deben animarse al cargar
   */
  animated: {
    type: Boolean,
    default: true
  },
  /**
   * Si se debe mostrar el footer
   */
  showFooter: {
    type: Boolean,
    default: false
  },
  /**
   * Información adicional para el footer
   * Array de objetos con label y value
   */
  footerInfo: {
    type: Array,
    default: () => []
  }
});

// Formatear el valor total
const formattedTotal = computed(() => {
  return props.totalFormat.replace('{value}', props.total);
});

// Formatear el valor de un item
function formatItemValue(item) {
  if (item.format) {
    return item.format.replace('{value}', item.value);
  }
  return item.value;
}

// Obtener la clase CSS para el color del texto
function getTextColorClass(color) {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400'
  };
  
  return colorMap[color] || 'text-gray-400';
}
</script>

<style scoped>
.vxv-distribution-card {
  width: 100%;
  transition: all 0.3s ease;
}

.vxv-distribution-card:hover {
  border-color: rgba(124, 58, 237, 0.3); /* purple-600 con opacidad */
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1);
}
</style>
