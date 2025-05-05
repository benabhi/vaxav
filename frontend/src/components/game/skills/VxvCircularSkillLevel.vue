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
      :value="Number(level) >= 5 ? 100 : currentXP"
      :min="Number(level) >= 5 ? 0 : minXP"
      :max="Number(level) >= 5 ? 100 : maxXP"
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
          :finalValue="level"
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
          <VxvAnimatedCounter
            ref="xpCounter"
            :initialValue="0"
            :finalValue="currentXP"
            :duration="animationDuration"
            :autoStart="false"
            :suffix="xpSuffix"
            :thousandsSeparator="','"
            key="xp-counter"
            class="text-xs"
          />
        </span>
      </div>
    </VxvProgressCircular>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import VxvProgressCircular from '../../ui/progress/VxvProgressCircular.vue';
import VxvAnimatedCounter from '../../ui/progress/VxvAnimatedCounter.vue';
import { getNextLevelXP, getProgressPercentage, MAX_SKILL_LEVEL } from '@/config/skillLevels';

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
   * Experiencia actual de la habilidad
   */
  currentXP: {
    type: [Number, String],
    default: 0
  },
  /**
   * Experiencia mínima para el nivel actual
   */
  minXP: {
    type: [Number, String],
    default: 0
  },
  /**
   * Experiencia necesaria para el siguiente nivel
   */
  maxXP: {
    type: [Number, String],
    default: 0
  },
  /**
   * Multiplicador de la habilidad (1-5)
   */
  multiplier: {
    type: [Number, String],
    default: 1,
    validator: (value) => Number(value) >= 1 && Number(value) <= 5
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
    default: 1500
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

// Calcular el porcentaje de progreso
const progressPercentage = computed(() => {
  // Si la habilidad está en nivel 5 (nivel máximo), mostrar 100% de progreso
  if (Number(props.level) >= 5) {
    return 100;
  }

  // Calcular el porcentaje basado en la experiencia actual, mínima y máxima
  const currentXP = Number(props.currentXP) || 0;
  const minXP = Number(props.minXP) || 0;
  const maxXP = Number(props.maxXP) || 0;

  // Si no hay diferencia entre min y max, mostrar 0%
  if (maxXP <= minXP) {
    return 0;
  }

  // Calcular el porcentaje de progreso
  const xpProgress = currentXP - minXP;
  const xpNeeded = maxXP - minXP;
  const percentage = Math.min(100, Math.max(0, Math.round((xpProgress / xpNeeded) * 100)));

  return percentage;
});

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

// Función para iniciar todas las animaciones de forma sincronizada
const startAnimations = () => {
  // Primero, asegurarse de que todas las animaciones estén detenidas
  internalAnimated.value = false;

  // Forzar un reflow del DOM para asegurar que los cambios se apliquen
  document.body.offsetHeight;

  // Después de un pequeño retraso, iniciar todas las animaciones
  setTimeout(() => {
    // Iniciar la animación del círculo
    internalAnimated.value = true;

    // Reiniciar y comenzar las animaciones de los contadores
    // Usar un pequeño retraso para asegurar que las animaciones estén sincronizadas
    setTimeout(() => {
      if (levelCounter.value && levelCounter.value.resetAnimation) {
        levelCounter.value.resetAnimation();
        levelCounter.value.startAnimation();
      }

      if (xpCounter.value && xpCounter.value.resetAnimation) {
        xpCounter.value.resetAnimation();
        xpCounter.value.startAnimation();
      }
    }, 10);
  }, 50);
};

// Iniciar animaciones al montar el componente
onMounted(() => {
  // Esperar a que el DOM esté completamente renderizado
  setTimeout(() => {
    if (props.animated) {
      startAnimations();
    }
  }, 100);
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
