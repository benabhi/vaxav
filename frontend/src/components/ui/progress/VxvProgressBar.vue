<template>
  <div class="vxv-progress-bar">
    <!-- Label section (optional) -->
    <div v-if="showLabels" class="flex justify-between mb-1">
      <span v-if="label" class="text-xs text-gray-500">{{ label }}</span>
      <span v-if="showValue" class="text-xs font-medium" :class="valueTextClass">{{ formattedValue }}</span>
    </div>
    
    <!-- Progress bar container -->
    <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden" :class="[heightClass]">
      <!-- Progress bar fill -->
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="[colorClass]"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <!-- Additional information (optional) -->
    <div v-if="showInfo" class="flex justify-between text-xs text-gray-500 mt-1">
      <slot name="info-left">
        <span v-if="showPercentage">{{ progressPercentage }}% completado</span>
      </slot>
      <slot name="info-right">
        <span v-if="showMinMax">{{ formattedValue }}/{{ formattedMax }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * VxvProgressBar - Componente de barra de progreso horizontal
 * 
 * Este componente muestra una barra de progreso horizontal con opciones
 * para mostrar etiquetas, valores, porcentajes y personalizar colores.
 */
const props = defineProps({
  /**
   * Valor actual de la barra de progreso
   */
  value: {
    type: [Number, String],
    default: 0,
    required: true
  },
  /**
   * Valor mínimo de la barra de progreso
   */
  min: {
    type: [Number, String],
    default: 0
  },
  /**
   * Valor máximo de la barra de progreso
   */
  max: {
    type: [Number, String],
    default: 100
  },
  /**
   * Color de la barra de progreso
   * Opciones: blue, green, red, yellow, purple, gray
   */
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'gray'].includes(value)
  },
  /**
   * Altura de la barra de progreso
   * Opciones: xs, sm, md, lg
   */
  height: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  /**
   * Etiqueta para mostrar junto a la barra de progreso
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Si se debe mostrar el valor actual
   */
  showValue: {
    type: Boolean,
    default: true
  },
  /**
   * Si se debe mostrar el porcentaje
   */
  showPercentage: {
    type: Boolean,
    default: false
  },
  /**
   * Si se debe mostrar el valor mínimo y máximo
   */
  showMinMax: {
    type: Boolean,
    default: false
  },
  /**
   * Si se debe mostrar información adicional debajo de la barra
   */
  showInfo: {
    type: Boolean,
    default: true
  },
  /**
   * Si se debe mostrar etiquetas encima de la barra
   */
  showLabels: {
    type: Boolean,
    default: true
  },
  /**
   * Función para formatear el valor
   */
  formatValue: {
    type: Function,
    default: null
  },
  /**
   * Función para formatear el valor máximo
   */
  formatMax: {
    type: Function,
    default: null
  },
  /**
   * Sufijo para añadir al valor (ej: "XP", "%")
   */
  suffix: {
    type: String,
    default: ''
  },
  /**
   * Si la barra debe animarse al cargar
   */
  animated: {
    type: Boolean,
    default: false
  }
});

// Calcular el porcentaje de progreso
const progressPercentage = computed(() => {
  const value = Number(props.value);
  const min = Number(props.min);
  const max = Number(props.max);
  
  // Validar que los valores sean números válidos
  if (isNaN(value) || isNaN(min) || isNaN(max) || max <= min) {
    return 0;
  }
  
  // Calcular el porcentaje
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Limitar el porcentaje entre 0 y 100
  return Math.min(100, Math.max(0, Math.round(percentage)));
});

// Formatear el valor actual
const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.value);
  }
  return `${props.value}${props.suffix}`;
});

// Formatear el valor máximo
const formattedMax = computed(() => {
  if (props.formatMax) {
    return props.formatMax(props.max);
  }
  return `${props.max}${props.suffix}`;
});

// Clase CSS para el color de la barra
const colorClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  };
  
  return colorMap[props.color] || 'bg-blue-500';
});

// Clase CSS para el color del texto del valor
const valueTextClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400'
  };
  
  return colorMap[props.color] || 'text-blue-400';
});

// Clase CSS para la altura de la barra
const heightClass = computed(() => {
  const heightMap = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  return heightMap[props.height] || 'h-2';
});
</script>

<style scoped>
.vxv-progress-bar {
  width: 100%;
}

/* Animación para la barra de progreso */
@keyframes progress-bar-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}

.vxv-progress-bar[data-animated="true"] .progress-bar-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}
</style>
