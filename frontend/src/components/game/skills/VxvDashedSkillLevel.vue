<template>
  <div class="vxv-dashed-skill-level">
    <div class="flex justify-between space-x-1">
      <!-- Cuando animated=false, mostrar todas las barras normalmente -->
      <template v-if="!animated">
        <div
          v-for="level in maxLevel"
          :key="level"
          class="flex-1 rounded-sm level-bar"
          :class="[
            heightClass,
            getLevelClass(level),
            `level-${level}`
          ]"
        ></div>
      </template>

      <!-- Cuando animated=true, usar un enfoque diferente para la animación -->
      <template v-else>
        <div
          v-for="level in maxLevel"
          :key="level"
          class="flex-1 rounded-sm level-bar"
          :class="[
            heightClass,
            getLevelClass(level),
            Number(props.level) >= level ? (animationsReady ? 'animated-level-bar' : 'pre-animation') : 'hidden-bar',
            `level-${level}`
          ]"
          :style="{
            '--level': level,
            '--animation-duration': animationDuration + 'ms',
            '--animation-delay': (level - 1) * Number(staggerDelay) + 'ms'
          }"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { MAX_SKILL_LEVEL } from '@/config/skillLevels';

/**
 * VxvDashedSkillLevel - Componente para mostrar el nivel de una habilidad con líneas
 *
 * Este componente muestra el nivel actual de una habilidad con líneas horizontales,
 * donde cada línea representa un nivel y se colorea según el estado de la habilidad.
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
   * Nivel máximo posible
   */
  maxLevel: {
    type: [Number, String],
    default: MAX_SKILL_LEVEL,
    validator: (value) => Number(value) > 0 && Number(value) <= MAX_SKILL_LEVEL
  },
  /**
   * Estado de la habilidad
   * Opciones: active, inactive, unlearned
   */
  status: {
    type: String,
    default: 'active',
    validator: (value) => ['active', 'inactive', 'unlearned'].includes(value)
  },
  /**
   * Altura de las líneas
   * Opciones: xs, sm, md, lg
   */
  height: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  /**
   * Si las barras deben animarse al cargar
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
  },
  /**
   * Retraso adicional entre la animación de cada barra (en milisegundos)
   */
  staggerDelay: {
    type: [Number, String],
    default: 150
  }
});

// Clase CSS para la altura de las líneas
const heightClass = computed(() => {
  const heightMap = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return heightMap[props.height] || 'h-1.5';
});

// Obtener la clase CSS para un nivel específico
function getLevelClass(level) {
  // Convertir level y props.level a números para comparación
  const currentLevel = Number(props.level);
  const levelNum = Number(level);

  // Verificar si el nivel actual es mayor o igual al nivel que estamos evaluando
  if (currentLevel >= levelNum) {
    // Si la habilidad está activa, usar tonalidades de azul según el nivel
    if (props.status === 'active') {
      switch (levelNum) {
        case 1: return 'border-blue-400 bg-blue-400';
        case 2: return 'border-blue-500 bg-blue-500';
        case 3: return 'border-blue-600 bg-blue-600';
        case 4: return 'border-blue-700 bg-blue-700';
        case 5: return 'border-blue-800 bg-blue-800';
        default: return 'border-blue-400 bg-blue-400';
      }
    } else if (props.status === 'inactive') {
      // Si la habilidad no está activa, mostrarla como "apagada" (tonos más claros y semitransparentes)
      return 'border-blue-300/40 bg-blue-300/40';
    } else {
      // Si la habilidad no está aprendida, mostrarla en gris
      return 'border-gray-600 bg-gray-800';
    }
  } else {
    // Si el nivel actual es menor que el nivel que estamos evaluando, mostrar en gris
    return 'border-gray-600 bg-gray-800';
  }
}

// Variable reactiva para controlar si las animaciones están listas para comenzar
const animationsReady = ref(false);

// Reiniciar animaciones cuando cambia la propiedad animated
watch(() => props.animated, (newValue) => {
  if (newValue) {
    // Reiniciar el estado de las animaciones
    animationsReady.value = false;

    // Pequeño retraso para asegurar que las barras estén ocultas antes de iniciar las animaciones
    setTimeout(() => {
      // Activar las animaciones
      animationsReady.value = true;
    }, 100);
  }
});

// Iniciar animaciones al montar el componente si animated=true
onMounted(() => {
  if (props.animated) {
    // Asegurar que las barras estén ocultas inicialmente
    animationsReady.value = false;

    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      // Activar las animaciones
      animationsReady.value = true;
    }, 200);
  }
});
</script>

<style scoped>
.vxv-dashed-skill-level {
  width: 100%;
}

/* Estilos para la animación de las barras de nivel */
.level-bar {
  opacity: 1; /* Visible por defecto (solo para cuando animated=false) */
  transform: scale(1);
}

/* Barras que deben permanecer ocultas cuando animated=true */
.hidden-bar {
  opacity: 0 !important; /* Forzar opacidad 0 */
  transform: scale(0.5);
  visibility: hidden; /* Asegurar que esté completamente oculto */
}

/* Estado previo a la animación - completamente invisible */
.pre-animation {
  opacity: 0 !important; /* Forzar opacidad 0 */
  transform: scaleX(0);
  visibility: visible; /* Visible pero con opacidad 0 */
  transform-origin: left;
}

/* Barras que deben animarse cuando animated=true */
.animated-level-bar {
  opacity: 0; /* Iniciar invisible */
  transform: scaleX(0);
  visibility: visible; /* Asegurar que sea visible para la animación */
  animation: appearComplete var(--animation-duration) ease-in-out forwards;
  /* Usar el delay definido en el estilo en línea */
  animation-delay: var(--animation-delay);
  transform-origin: left;
}

@keyframes appearComplete {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  30% {
    opacity: 0.7;
    transform: scaleX(0.3);
  }
  70% {
    opacity: 0.9;
    transform: scaleX(1.05);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
