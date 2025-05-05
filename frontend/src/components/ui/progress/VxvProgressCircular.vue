<template>
  <div
    class="vxv-progress-circular"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <!-- SVG para el círculo de progreso -->
    <svg class="w-full h-full" viewBox="0 0 100 100">
      <!-- Círculo de fondo -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="transparent"
        stroke="#374151"
        :stroke-width="thickness"
        class="progress-circle-background"
      />

      <!-- Círculo de progreso con animación -->
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="transparent"
        :stroke="color"
        :stroke-width="thickness"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :style="{
          '--final-dashoffset': finalStrokeDashoffset,
          '--initial-dashoffset': circumference
        }"
        :class="{
          'progress-circle-animated': animated,
          'progress-circle-no-transition': !animated
        }"
        transform="rotate(-90 50 50)"
      />
    </svg>

    <!-- Contenido central (slot) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <slot>
        <div v-if="showPercentage" class="text-center">
          <span class="text-lg font-bold" :class="textColorClass">{{ progressPercentage }}%</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * VxvProgressCircular - Componente de barra de progreso circular
 *
 * Este componente muestra una barra de progreso circular con opciones
 * para personalizar el tamaño, grosor, colores y animación.
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
   * Tamaño del círculo en píxeles
   */
  size: {
    type: [Number, String],
    default: 100
  },
  /**
   * Grosor de la línea del círculo
   */
  thickness: {
    type: [Number, String],
    default: 8
  },
  /**
   * Color de la barra de progreso
   * Opciones: blue, green, red, yellow, purple, gray
   * O un valor hexadecimal (#RRGGBB)
   */
  color: {
    type: String,
    default: 'blue'
  },
  /**
   * Color de fondo de la barra de progreso
   */
  backgroundColor: {
    type: String,
    default: '#374151' // gray-700 (igual que en VxvProgressBar)
  },
  /**
   * Si se debe mostrar el porcentaje en el centro
   */
  showPercentage: {
    type: Boolean,
    default: false
  },
  /**
   * Si la barra debe animarse al cargar
   */
  animated: {
    type: Boolean,
    default: true
  },
  /**
   * Duración de la animación en milisegundos
   */
  animationDuration: {
    type: [Number, String],
    default: 1500
  }
});

// Calcular el radio del círculo
const radius = computed(() => {
  // Restar el grosor para que el círculo no se corte
  return 50 - (Number(props.thickness) / 2);
});

// Calcular la circunferencia del círculo
const circumference = computed(() => {
  return 2 * Math.PI * radius.value;
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

// Valor inicial para la animación (círculo vacío)
const initialDashoffset = computed(() => {
  return circumference.value;
});

// Calcular el valor de stroke-dashoffset para el círculo de progreso
const strokeDashoffset = computed(() => {
  // Si no está animado, mostrar directamente el valor final
  if (!props.animated) {
    return finalStrokeDashoffset.value;
  }

  // Si está animado, el valor inicial será la circunferencia completa (círculo vacío)
  // La animación se manejará en CSS
  return initialDashoffset.value;
});

// Calcular el valor final de stroke-dashoffset
// Un valor de 0 significa círculo completo, un valor de circumference significa círculo vacío
const finalStrokeDashoffset = computed(() => {
  // Si el porcentaje es 100%, asegurar que el círculo esté completamente lleno
  if (progressPercentage.value >= 100) {
    return 0;
  }

  // Invertir el cálculo para que el círculo se llene en lugar de vaciarse
  return circumference.value * (1 - progressPercentage.value / 100);
});

// Convertir el nombre del color a un valor hexadecimal si es necesario
const color = computed(() => {
  // Si el color es un valor hexadecimal, devolverlo directamente
  if (props.color.startsWith('#')) {
    return props.color;
  }

  // Mapear nombres de colores a valores hexadecimales
  const colorMap = {
    blue: '#3b82f6', // blue-500
    green: '#10b981', // green-500
    red: '#ef4444', // red-500
    yellow: '#f59e0b', // yellow-500
    purple: '#8b5cf6', // purple-500
    gray: '#6b7280' // gray-500
  };

  return colorMap[props.color] || '#3b82f6'; // blue-500 por defecto
});

// Mapear el color a una clase CSS de Tailwind para el texto
const textColorClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500'
  };

  return colorMap[props.color] || 'text-blue-500';
});
</script>

<style scoped>
.vxv-progress-circular {
  position: relative;
  display: inline-flex;
}

.progress-circle-background {
  transition: stroke 0.3s ease;
  opacity: 1; /* Opacidad completa para que sea totalmente visible */
  stroke-width: calc(v-bind('props.thickness')); /* Mismo grosor que el círculo de progreso */
}

.progress-circle-animated {
  stroke-dashoffset: var(--initial-dashoffset);
  transition: stroke-dashoffset v-bind('props.animationDuration + "ms"') ease-out;
  animation: progress-fill v-bind('props.animationDuration + "ms"') forwards ease-out;
}

.progress-circle-no-transition {
  transition: none;
  animation: none;
}

@keyframes progress-fill {
  from {
    stroke-dashoffset: var(--initial-dashoffset);
  }
  to {
    stroke-dashoffset: var(--final-dashoffset);
  }
}
</style>
