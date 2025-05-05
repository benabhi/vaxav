<template>
  <div class="vxv-general-progress-card bg-gray-800 rounded-lg p-4 border border-gray-700">
    <!-- Título de la tarjeta -->
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-base font-medium text-gray-300">{{ title }}</h3>
      <div v-if="showTotal" class="text-sm text-gray-400">
        {{ formattedTotal }}
      </div>
    </div>

    <!-- Estadísticas principales -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <!-- Estadística 1 -->
      <div class="flex flex-col">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-gray-500">{{ stat1Label }}</span>
          <span class="text-xs font-medium text-blue-400">{{ formattedStat1Value }}</span>
        </div>
        <VxvProgressBar
          :value="stat1Value"
          :max="stat1Max"
          :color="stat1Color"
          :height="barHeight"
          :animated="animated"
          :showLabels="false"
        />
      </div>

      <!-- Estadística 2 -->
      <div class="flex flex-col">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-gray-500">{{ stat2Label }}</span>
          <span class="text-xs font-medium text-green-400">{{ formattedStat2Value }}</span>
        </div>
        <VxvProgressBar
          :value="stat2Value"
          :max="stat2Max"
          :color="stat2Color"
          :height="barHeight"
          :animated="animated"
          :showLabels="false"
        />
      </div>
    </div>

    <!-- Barra de progreso general -->
    <div class="flex flex-col">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs text-gray-500">{{ progressLabel }}</span>
        <span class="text-xs font-medium" :class="progressTextColorClass">
          {{ formattedProgressValue }}
        </span>
      </div>
      <VxvProgressBar
        :value="progressValue"
        :max="progressMax"
        :color="progressColor"
        :height="progressBarHeight"
        :animated="animated"
        :showLabels="false"
        :showInfo="showProgressInfo"
        :showPercentage="showProgressPercentage"
      />
    </div>

    <!-- Índice de Progresión (I.P.) -->
    <div v-if="showProgressionIndex" class="mt-3 pt-3 border-t border-gray-700">
      <div class="flex justify-between mb-1">
        <span class="text-xs text-gray-500">Índice de Progresión (I.P.)</span>
        <span class="text-xs font-bold text-purple-400">{{ progressionIndex.toLocaleString() }}</span>
      </div>
      <div v-if="showProgressionDetails" class="text-xs text-gray-500 mt-2">
        <p class="text-xs text-gray-400 italic mb-2">
          El Índice de Progresión (I.P.) mide tu avance como piloto considerando múltiples factores:
        </p>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1">
          <div class="flex justify-between">
            <span>Habilidades ({{ Math.round(progressionComponents.HS) }}%)</span>
            <span class="text-gray-400">{{ Math.round(progressionComponents.HS * 10) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Nivel ({{ progressionComponents.AL.toFixed(1) }})</span>
            <span class="text-gray-400">{{ Math.round(progressionComponents.AL * 25) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Experiencia</span>
            <span class="text-gray-400">{{ Math.round(progressionComponents.XP / 100) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Activas ({{ Math.round(progressionComponents.AS) }}%)</span>
            <span class="text-gray-400">{{ Math.round(progressionComponents.AS * 15) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Multiplicador ({{ progressionComponents.MP.toFixed(1) }})</span>
            <span class="text-gray-400">{{ Math.round(progressionComponents.MP * 5) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VxvProgressBar from '../../ui/progress/VxvProgressBar.vue';

/**
 * VxvGeneralProgressCard - Componente para mostrar una tarjeta de progreso general
 *
 * Este componente muestra una tarjeta con estadísticas de progreso general,
 * incluyendo dos estadísticas específicas y una barra de progreso general.
 */
const props = defineProps({
  /**
   * Título de la tarjeta
   */
  title: {
    type: String,
    default: 'Progreso General'
  },
  /**
   * Valor total (opcional)
   */
  total: {
    type: [Number, String],
    default: null
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
   * Etiqueta para la primera estadística
   */
  stat1Label: {
    type: String,
    default: 'Estadística 1'
  },
  /**
   * Valor de la primera estadística
   */
  stat1Value: {
    type: [Number, String],
    default: 0
  },
  /**
   * Valor máximo de la primera estadística
   */
  stat1Max: {
    type: [Number, String],
    default: 100
  },
  /**
   * Color de la primera estadística
   */
  stat1Color: {
    type: String,
    default: 'blue'
  },
  /**
   * Formato para el valor de la primera estadística
   */
  stat1Format: {
    type: String,
    default: '{value}'
  },
  /**
   * Etiqueta para la segunda estadística
   */
  stat2Label: {
    type: String,
    default: 'Estadística 2'
  },
  /**
   * Valor de la segunda estadística
   */
  stat2Value: {
    type: [Number, String],
    default: 0
  },
  /**
   * Valor máximo de la segunda estadística
   */
  stat2Max: {
    type: [Number, String],
    default: 100
  },
  /**
   * Color de la segunda estadística
   */
  stat2Color: {
    type: String,
    default: 'green'
  },
  /**
   * Formato para el valor de la segunda estadística
   */
  stat2Format: {
    type: String,
    default: '{value}'
  },
  /**
   * Etiqueta para la barra de progreso general
   */
  progressLabel: {
    type: String,
    default: 'Progreso Total'
  },
  /**
   * Valor de la barra de progreso general
   */
  progressValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Valor máximo de la barra de progreso general
   */
  progressMax: {
    type: [Number, String],
    default: 100
  },
  /**
   * Color de la barra de progreso general
   */
  progressColor: {
    type: String,
    default: 'purple'
  },
  /**
   * Formato para el valor de la barra de progreso general
   */
  progressFormat: {
    type: String,
    default: '{value}/{max}'
  },
  /**
   * Altura de las barras de estadísticas
   */
  barHeight: {
    type: String,
    default: 'sm'
  },
  /**
   * Altura de la barra de progreso general
   */
  progressBarHeight: {
    type: String,
    default: 'md'
  },
  /**
   * Si se debe mostrar información adicional en la barra de progreso general
   */
  showProgressInfo: {
    type: Boolean,
    default: false
  },
  /**
   * Si se debe mostrar el porcentaje en la barra de progreso general
   */
  showProgressPercentage: {
    type: Boolean,
    default: false
  },
  /**
   * Si las barras deben animarse al cargar
   */
  animated: {
    type: Boolean,
    default: false
  },
  /**
   * Si se debe mostrar el Índice de Progresión (I.P.)
   */
  showProgressionIndex: {
    type: Boolean,
    default: false
  },
  /**
   * Si se deben mostrar los detalles del Índice de Progresión
   */
  showProgressionDetails: {
    type: Boolean,
    default: false
  },
  /**
   * Valor del Índice de Progresión
   */
  progressionIndex: {
    type: Number,
    default: 0
  },
  /**
   * Componentes del Índice de Progresión
   */
  progressionComponents: {
    type: Object,
    default: () => ({
      HS: 0, // Porcentaje de Habilidades Aprendidas
      AL: 0, // Nivel Promedio
      XP: 0, // Experiencia Total
      AS: 0, // Porcentaje de Habilidades Activas
      MP: 0  // Multiplicador Promedio
    })
  }
});

// Formatear el valor total
const formattedTotal = computed(() => {
  if (props.total === null) return '';

  return props.totalFormat.replace('{value}', props.total);
});

// Formatear el valor de la primera estadística
const formattedStat1Value = computed(() => {
  return props.stat1Format.replace('{value}', props.stat1Value);
});

// Formatear el valor de la segunda estadística
const formattedStat2Value = computed(() => {
  return props.stat2Format.replace('{value}', props.stat2Value);
});

// Formatear el valor de la barra de progreso general
const formattedProgressValue = computed(() => {
  return props.progressFormat
    .replace('{value}', props.progressValue)
    .replace('{max}', props.progressMax);
});

// Clase CSS para el color del texto de la barra de progreso general
const progressTextColorClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400'
  };

  return colorMap[props.progressColor] || 'text-purple-400';
});
</script>

<style scoped>
.vxv-general-progress-card {
  width: 100%;
  transition: all 0.3s ease;
}

.vxv-general-progress-card:hover {
  border-color: rgba(124, 58, 237, 0.3); /* purple-600 con opacidad */
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1);
}
</style>
