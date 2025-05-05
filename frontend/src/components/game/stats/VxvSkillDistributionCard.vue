<template>
  <div class="vxv-skill-distribution-card bg-gray-800 rounded-lg p-4 border border-gray-700">
    <!-- Título de la tarjeta -->
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-base font-medium text-gray-300">{{ title }}</h3>
      <div v-if="showTotal" class="text-sm text-gray-400">
        {{ formattedTotal }}
      </div>
    </div>
    
    <!-- Distribución de habilidades -->
    <div class="space-y-3">
      <!-- Habilidades activas -->
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span class="text-xs text-gray-400 flex-grow">{{ activeLabel }}</span>
        <span class="text-xs font-medium text-green-400">{{ formattedActiveValue }}</span>
      </div>
      
      <!-- Habilidades inactivas -->
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <span class="text-xs text-gray-400 flex-grow">{{ inactiveLabel }}</span>
        <span class="text-xs font-medium text-yellow-400">{{ formattedInactiveValue }}</span>
      </div>
      
      <!-- Habilidades no aprendidas -->
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <span class="text-xs text-gray-400 flex-grow">{{ unlearnedLabel }}</span>
        <span class="text-xs font-medium text-red-400">{{ formattedUnlearnedValue }}</span>
      </div>
      
      <!-- Habilidades no disponibles -->
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
        <span class="text-xs text-gray-400 flex-grow">{{ unavailableLabel }}</span>
        <span class="text-xs font-medium text-gray-400">{{ formattedUnavailableValue }}</span>
      </div>
    </div>
    
    <!-- Gráfico de distribución (opcional) -->
    <div v-if="showChart" class="mt-4 pt-3 border-t border-gray-700">
      <div class="flex h-6 rounded-md overflow-hidden">
        <!-- Barra para habilidades activas -->
        <div 
          class="bg-green-500 h-full transition-all duration-500"
          :style="{ width: `${activePercentage}%` }"
          :title="`${activePercentage}% ${activeLabel}`"
        ></div>
        
        <!-- Barra para habilidades inactivas -->
        <div 
          class="bg-yellow-500 h-full transition-all duration-500"
          :style="{ width: `${inactivePercentage}%` }"
          :title="`${inactivePercentage}% ${inactiveLabel}`"
        ></div>
        
        <!-- Barra para habilidades no aprendidas -->
        <div 
          class="bg-red-500 h-full transition-all duration-500"
          :style="{ width: `${unlearnedPercentage}%` }"
          :title="`${unlearnedPercentage}% ${unlearnedLabel}`"
        ></div>
        
        <!-- Barra para habilidades no disponibles -->
        <div 
          class="bg-gray-500 h-full transition-all duration-500"
          :style="{ width: `${unavailablePercentage}%` }"
          :title="`${unavailablePercentage}% ${unavailableLabel}`"
        ></div>
      </div>
      
      <!-- Leyenda del gráfico -->
      <div v-if="showChartLegend" class="flex justify-between mt-2 text-xs text-gray-500">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * VxvSkillDistributionCard - Componente para mostrar la distribución de habilidades
 * 
 * Este componente muestra una tarjeta con la distribución de habilidades por estado
 * (activas, inactivas, no aprendidas, no disponibles) y opcionalmente un gráfico.
 */
const props = defineProps({
  /**
   * Título de la tarjeta
   */
  title: {
    type: String,
    default: 'Distribución de Habilidades'
  },
  /**
   * Valor total de habilidades
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
    default: '{value} habilidades'
  },
  /**
   * Si se debe mostrar el valor total
   */
  showTotal: {
    type: Boolean,
    default: true
  },
  /**
   * Etiqueta para habilidades activas
   */
  activeLabel: {
    type: String,
    default: 'Activas'
  },
  /**
   * Valor de habilidades activas
   */
  activeValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Formato para el valor de habilidades activas
   */
  activeFormat: {
    type: String,
    default: '{value}'
  },
  /**
   * Etiqueta para habilidades inactivas
   */
  inactiveLabel: {
    type: String,
    default: 'Inactivas'
  },
  /**
   * Valor de habilidades inactivas
   */
  inactiveValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Formato para el valor de habilidades inactivas
   */
  inactiveFormat: {
    type: String,
    default: '{value}'
  },
  /**
   * Etiqueta para habilidades no aprendidas
   */
  unlearnedLabel: {
    type: String,
    default: 'No aprendidas'
  },
  /**
   * Valor de habilidades no aprendidas
   */
  unlearnedValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Formato para el valor de habilidades no aprendidas
   */
  unlearnedFormat: {
    type: String,
    default: '{value}'
  },
  /**
   * Etiqueta para habilidades no disponibles
   */
  unavailableLabel: {
    type: String,
    default: 'No disponibles'
  },
  /**
   * Valor de habilidades no disponibles
   */
  unavailableValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Formato para el valor de habilidades no disponibles
   */
  unavailableFormat: {
    type: String,
    default: '{value}'
  },
  /**
   * Si se debe mostrar el gráfico de distribución
   */
  showChart: {
    type: Boolean,
    default: true
  },
  /**
   * Si se debe mostrar la leyenda del gráfico
   */
  showChartLegend: {
    type: Boolean,
    default: true
  }
});

// Formatear el valor total
const formattedTotal = computed(() => {
  return props.totalFormat.replace('{value}', props.total);
});

// Formatear el valor de habilidades activas
const formattedActiveValue = computed(() => {
  return props.activeFormat.replace('{value}', props.activeValue);
});

// Formatear el valor de habilidades inactivas
const formattedInactiveValue = computed(() => {
  return props.inactiveFormat.replace('{value}', props.inactiveValue);
});

// Formatear el valor de habilidades no aprendidas
const formattedUnlearnedValue = computed(() => {
  return props.unlearnedFormat.replace('{value}', props.unlearnedValue);
});

// Formatear el valor de habilidades no disponibles
const formattedUnavailableValue = computed(() => {
  return props.unavailableFormat.replace('{value}', props.unavailableValue);
});

// Calcular el porcentaje de habilidades activas
const activePercentage = computed(() => {
  if (Number(props.total) === 0) return 0;
  return Math.round((Number(props.activeValue) / Number(props.total)) * 100);
});

// Calcular el porcentaje de habilidades inactivas
const inactivePercentage = computed(() => {
  if (Number(props.total) === 0) return 0;
  return Math.round((Number(props.inactiveValue) / Number(props.total)) * 100);
});

// Calcular el porcentaje de habilidades no aprendidas
const unlearnedPercentage = computed(() => {
  if (Number(props.total) === 0) return 0;
  return Math.round((Number(props.unlearnedValue) / Number(props.total)) * 100);
});

// Calcular el porcentaje de habilidades no disponibles
const unavailablePercentage = computed(() => {
  if (Number(props.total) === 0) return 0;
  return Math.round((Number(props.unavailableValue) / Number(props.total)) * 100);
});
</script>

<style scoped>
.vxv-skill-distribution-card {
  width: 100%;
  transition: all 0.3s ease;
}

.vxv-skill-distribution-card:hover {
  border-color: rgba(124, 58, 237, 0.3); /* purple-600 con opacidad */
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1);
}
</style>
