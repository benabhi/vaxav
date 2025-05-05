<template>
  <div
    class="vxv-circular-skill-level"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <!-- Barra de progreso circular -->
    <VxvProgressCircular
      :value="level >= 5 ? 100 : progressPercentage"
      :min="0"
      :max="100"
      :size="size"
      :thickness="thickness"
      :color="progressColor"
      :backgroundColor="backgroundColor"
      :animated="internalAnimated"
      :animationDuration="animationDuration"
    >
      <!-- Contenido central -->
      <div class="flex flex-col items-center justify-center">
        <!-- Nivel actual (animado) -->
        <VxvAnimatedCounter
          ref="levelCounter"
          :initialValue="0"
          :finalValue="Number(level)"
          :duration="animationDuration"
          :autoStart="false"
          key="level-counter"
          class="text-2xl font-bold"
          :class="levelTextClass"
        />

        <!-- Etiqueta de nivel -->
        <span class="text-xs text-gray-400">{{ levelLabel }}</span>

        <!-- Experiencia actual / siguiente nivel (animado) -->
        <span class="text-xs text-gray-500 mt-1">
          <template v-if="Number(level) >= 5">
            <span class="text-green-400 font-medium">NIVEL MÁXIMO</span>
          </template>
          <template v-else>
            <span>{{ Number(currentXP || 0).toLocaleString() }}{{ xpSuffix }}</span>
          </template>
        </span>
      </div>
    </VxvProgressCircular>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import VxvProgressCircular from '../../ui/progress/VxvProgressCircular.vue';
import VxvAnimatedCounter from '../../ui/progress/VxvAnimatedCounter.vue';
import { MAX_SKILL_LEVEL } from '@/config/skillLevels';

/**
 * VxvCircularSkillLevel - Componente para mostrar el nivel de una habilidad con progreso circular
 *
 * Este componente muestra el nivel actual de una habilidad con un círculo de progreso,
 * el nivel en el centro y la experiencia actual/necesaria para el siguiente nivel.
 */
const props = defineProps({
  /**
   * Nivel actual de la habilidad (0-5)
   */
  level: {
    type: [Number, String],
    default: 0,
    validator: (value) => Number(value) >= 0 && Number(value) <= MAX_SKILL_LEVEL
  },
  /**
   * Porcentaje de progreso hacia el siguiente nivel (0-100)
   */
  progressPercentage: {
    type: [Number, String],
    default: 0,
    validator: (value) => Number(value) >= 0 && Number(value) <= 100
  },
  /**
   * Experiencia acumulada en el nivel actual
   */
  currentLevelXP: {
    type: [Number, String],
    default: 0
  },
  /**
   * Experiencia total acumulada
   */
  currentXP: {
    type: [Number, String],
    default: 0
  },
  /**
   * Sufijo para la experiencia (ej: "/150 XP")
   */
  xpSuffix: {
    type: String,
    default: '/100 XP'
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
   * Color del progreso según el estado
   * Opciones: active, inactive, unlearned, o un color específico
   */
  status: {
    type: String,
    default: 'active',
    validator: (value) => ['active', 'inactive', 'unlearned'].includes(value) || value.startsWith('#')
  },
  /**
   * Color de fondo del círculo
   */
  backgroundColor: {
    type: String,
    default: '#1f2937' // gray-800
  },
  /**
   * Etiqueta para el nivel
   */
  levelLabel: {
    type: String,
    default: 'Nivel'
  },
  /**
   * Sufijo para la experiencia
   */
  xpSuffix: {
    type: String,
    default: '/100 XP'
  },
  /**
   * Si los contadores deben animarse al cargar
   */
  animated: {
    type: Boolean,
    default: false
  },
  /**
   * Duración de la animación en milisegundos
   */
  animationDuration: {
    type: [Number, String],
    default: 1000
  }
});

// Calcular el color del progreso según el estado
const progressColor = computed(() => {
  // Si es un color hexadecimal, devolverlo directamente
  if (props.status.startsWith('#')) {
    return props.status;
  }

  // Mapear el estado a un color
  const statusColorMap = {
    active: getProgressColorByLevel(Number(props.level)),
    inactive: '#ca8a04', // yellow-600
    unlearned: '#4b5563'  // gray-600
  };

  return statusColorMap[props.status] || statusColorMap.active;
});

// Obtener el color del progreso según el nivel
function getProgressColorByLevel(level) {
  // Asignar color según el nivel (tonalidades de azul, más oscuro a mayor nivel)
  switch (level) {
    case 0: return '#93c5fd'; // blue-300
    case 1: return '#60a5fa'; // blue-400
    case 2: return '#3b82f6'; // blue-500
    case 3: return '#2563eb'; // blue-600
    case 4: return '#1d4ed8'; // blue-700
    case 5: return '#1e40af'; // blue-800
    default: return '#93c5fd'; // blue-300
  }
}

// Estado interno para controlar la animación
const internalAnimated = ref(false);

// Referencias a los componentes de contador
const levelCounter = ref(null);
const xpCounter = ref(null);

// No hay cálculos de nivel o porcentaje de progreso,
// estos valores se reciben directamente como props

// Clase CSS para el color del texto del nivel
const levelTextClass = computed(() => {
  if (props.status === 'inactive') {
    return 'text-yellow-400';
  } else if (props.status === 'unlearned') {
    return 'text-gray-400';
  } else if (Number(props.level) > 0) {
    return 'text-blue-400';
  } else {
    return 'text-gray-400';
  }
});

// No hay funciones de cálculo de experiencia,
// estos valores se reciben directamente como props

// Función para iniciar todas las animaciones de forma sincronizada
const startAnimations = () => {
  // Primero, asegurarse de que todas las animaciones estén detenidas
  internalAnimated.value = false;

  // Forzar un reflow del DOM para asegurar que los cambios se apliquen
  document.body.offsetHeight;

  // Iniciar inmediatamente la animación del círculo
  internalAnimated.value = true;

  // Reiniciar y comenzar las animaciones de los contadores inmediatamente
  if (levelCounter.value && levelCounter.value.resetAnimation) {
    levelCounter.value.resetAnimation();
    levelCounter.value.startAnimation();
  }

  if (xpCounter.value && xpCounter.value.resetAnimation) {
    xpCounter.value.resetAnimation();
    xpCounter.value.startAnimation();
  }
};

// Iniciar animaciones al montar el componente
onMounted(() => {
  // Iniciar animaciones inmediatamente si está habilitado
  if (props.animated) {
    startAnimations();
  }
});

// Observar cambios en la prop animated
watch(() => props.animated, (newValue) => {
  if (newValue) {
    startAnimations();
  } else {
    internalAnimated.value = false;
  }
});
</script>

<style scoped>
.vxv-circular-skill-level {
  position: relative;
  display: inline-flex;
}
</style>
