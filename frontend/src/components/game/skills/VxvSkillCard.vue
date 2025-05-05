<template>
  <div
    class="vxv-skill-card rounded-lg overflow-hidden transition-all duration-200 h-[329px]"
    :class="[cardClasses, { 'animate-fade-in': animated }]"
    :style="{
      '--animation-delay': `${index * 100}ms`,
      'animation-delay': `${index * 100}ms`,
      'animation-fill-mode': 'both'
    }"
  >
    <!--
      Encabezado de la tarjeta (altura fija: 72px)
      Contiene el nombre, categoría y multiplicador de la habilidad
    -->
    <div class="p-4 flex justify-between items-start h-[72px]">
      <!-- Nombre y categoría -->
      <div class="flex flex-col justify-center">
        <div class="flex items-center">
          <div
            class="w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0"
            :class="statusDotClass"
          ></div>
          <h3
            class="font-medium text-base truncate max-w-[180px]"
            :class="nameClass"
            :title="skill.name"
          >
            {{ skill.name }}
          </h3>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ skill.category }}
        </div>
      </div>

      <!-- Multiplicador -->
      <div class="flex-shrink-0">
        <VxvBadge
          :variant="getMultiplierVariant(skill.multiplier)"
          size="sm"
        >
          x{{ skill.multiplier }}
        </VxvBadge>
      </div>
    </div>

    <!--
      Barra de progreso circular (altura fija: 132px)
      Muestra el progreso de experiencia de la habilidad visualmente
    -->
    <div class="flex justify-center items-center py-4 h-[132px]">
      <VxvCircularSkillLevel
        :level="skill.level"
        :progressPercentage="getProgressPercentage()"
        :currentLevelXP="getCurrentLevelXP()"
        :currentXP="Number(skill.currentXP)"
        :status="status"
        :size="128"
        :thickness="8"
        :animated="animated"
        :animationDuration="animationDuration"
        :xpSuffix="getSuffix()"
      />
    </div>

    <!--
      Descripción (altura fija: 40px con scroll al hacer hover)
      Muestra la descripción de la habilidad
    -->
    <div class="px-4 pb-2 description-container">
      <div class="description-wrapper h-[40px] relative">
        <p
          class="text-xs italic description-text"
          :class="descriptionClass"
        >
          {{ skill.description }}
        </p>
        <!-- Indicador de scroll (solo visible si la descripción es larga) -->
        <div
          class="scroll-indicator"
          v-if="skill.description && skill.description.length > 100"
        ></div>
      </div>
    </div>

    <!--
      Indicadores de nivel (altura fija: 20px)
      Muestra visualmente los 5 niveles posibles de la habilidad
    -->
    <div class="px-4 pb-3 pt-2 h-[20px]">
      <VxvDashedSkillLevel
        :level="skill.level"
        :maxLevel="5"
        :status="status"
        height="sm"
        :animated="animated"
        :animationDuration="animationDuration"
        :staggerDelay="10"
      />
    </div>

    <!--
      Prerrequisitos (altura fija: 65px)
      Muestra los prerrequisitos necesarios para aprender la habilidad
    -->
    <div class="px-4 pb-4 pt-1 h-[65px]">
      <div class="text-xs text-gray-400 mb-1">Requisitos:</div>
      <div class="flex flex-wrap gap-1 min-h-[32px] max-h-[36px] overflow-y-auto prereq-container gap-y-0.5">
        <!-- Si tiene prerrequisitos, mostrarlos -->
        <template v-if="skill.prerequisites && skill.prerequisites.length > 0">
          <VxvBadge
            v-for="(prereq, index) in skill.prerequisites"
            :key="index"
            :variant="prereq.fulfilled ? 'success' : 'danger'"
            size="sm"
            class="h-[18px] max-w-[120px] truncate"
            :title="prereq.name + ' (Nivel ' + prereq.level + ')'"
          >
            {{ prereq.name }} L{{ prereq.level }}
          </VxvBadge>
        </template>
        <!-- Si no tiene prerrequisitos, mostrar mensaje como texto simple -->
        <p v-else class="text-xs text-gray-500 italic h-[18px] pl-1 m-0 border-0 bg-transparent">
          No requiere habilidades previas
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vxv-skill-card {
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.description-container {
  position: relative;
}

.description-wrapper {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.description-wrapper::-webkit-scrollbar {
  width: 4px;
}

.description-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.description-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.scroll-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(transparent, rgba(17, 24, 39, 0.8));
  pointer-events: none;
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import VxvCircularSkillLevel from './VxvCircularSkillLevel.vue';
import VxvDashedSkillLevel from './VxvDashedSkillLevel.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import type { Skill } from '@/composables/usePilotSkills';
import { useSkillCalculations } from '@/composables/useSkillCalculations';

// Interfaz para los datos de la tarjeta de habilidad
interface SkillCardData extends Skill {
  progressPercentage?: number;
  currentLevelXP?: number;
}

// Obtener las funciones de cálculo de habilidades
const {
  calculateProgressPercentage,
  calculateCurrentLevelXP,
  getXPSuffix
} = useSkillCalculations();

/**
 * VxvSkillCard - Componente para mostrar una tarjeta de habilidad
 *
 * Este componente muestra una tarjeta con información detallada de una habilidad,
 * incluyendo nombre, categoría, nivel, experiencia, descripción y prerrequisitos.
 */
const props = defineProps({
  /**
   * Datos de la habilidad
   */
  skill: {
    type: Object as () => SkillCardData,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'name' in value;
    }
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
   * Si la habilidad está disponible para aprender
   */
  available: {
    type: Boolean,
    default: true
  },
  /**
   * Si los elementos deben animarse al cargar
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
   * Índice de la tarjeta (para animaciones escalonadas)
   */
  index: {
    type: [Number, String],
    default: 0
  }
});

// Clases CSS para la tarjeta según el estado
const cardClasses = computed(() => {
  const baseClasses = {
    'bg-gray-800': true,
    'opacity-70': props.status === 'unlearned',
    'opacity-50': props.status === 'unlearned' && !props.available,
    'hover:shadow-lg': true
  };

  // Añadir clases según el estado
  if (props.status === 'active') {
    return {
      ...baseClasses,
      'border border-blue-600/30': true,
      'hover:shadow-blue-500/10': true
    };
  } else if (props.status === 'inactive') {
    return {
      ...baseClasses,
      'border border-yellow-500/30': true,
      'hover:shadow-yellow-500/10': true
    };
  } else {
    return {
      ...baseClasses,
      'border border-gray-700': true,
      'hover:shadow-gray-500/10': true
    };
  }
});

// Clase CSS para el punto de estado
const statusDotClass = computed(() => {
  if (props.status === 'active') {
    return 'bg-green-500 border border-green-400';
  } else if (props.status === 'inactive') {
    return 'bg-yellow-500 border border-yellow-400';
  } else {
    return 'bg-red-500 border border-red-400';
  }
});

// Clase CSS para el nombre de la habilidad
const nameClass = computed(() => {
  if (props.status === 'active') {
    return 'text-white';
  } else if (props.status === 'inactive') {
    return 'text-yellow-400';
  } else {
    return 'text-gray-400';
  }
});

// Clase CSS para la descripción de la habilidad
const descriptionClass = computed(() => {
  if (props.status === 'active') {
    return 'text-gray-300';
  } else if (props.status === 'inactive') {
    return 'text-gray-400';
  } else {
    return 'text-gray-500';
  }
});

// Obtener la variante del badge para el multiplicador
function getMultiplierVariant(multiplier) {
  // Verificar que el multiplicador sea un número válido
  if (isNaN(multiplier)) {
    return 'gray';
  }

  // Convertir a número para asegurar la comparación correcta
  switch (Number(multiplier)) {
    case 1: return 'gray';
    case 2: return 'green';
    case 3: return 'blue';
    case 4: return 'purple';
    case 5: return 'red';
    default: return 'gray';
  }
}

// Calcular el porcentaje de progreso hacia el siguiente nivel
function getProgressPercentage() {
  if (!props.skill) return 0;

  // Si ya se proporcionó el porcentaje de progreso, usarlo
  if (props.skill.progressPercentage !== undefined) {
    return props.skill.progressPercentage;
  }

  // Calcular el porcentaje de progreso usando el composable
  return calculateProgressPercentage(
    Number(props.skill.currentXP) || 0,
    Number(props.skill.level) || 0,
    Number(props.skill.multiplier) || 1
  );
}

// Calcular la experiencia acumulada en el nivel actual
function getCurrentLevelXP() {
  if (!props.skill) return 0;

  // Si ya se proporcionó la experiencia acumulada en el nivel actual, usarla
  if (props.skill.currentLevelXP !== undefined) {
    return props.skill.currentLevelXP;
  }

  // Calcular la experiencia acumulada en el nivel actual usando el composable
  return calculateCurrentLevelXP(
    Number(props.skill.currentXP) || 0,
    Number(props.skill.level) || 0,
    Number(props.skill.multiplier) || 1
  );
}

// Obtener el sufijo para la experiencia
function getSuffix() {
  if (!props.skill) return '/0 XP';

  // Obtener el sufijo usando el composable
  return getXPSuffix(
    Number(props.skill.level) || 0,
    Number(props.skill.multiplier) || 1
  );
}
</script>

<style scoped>
/* Estilos para el círculo de progreso */
.progress-circle {
  transition: stroke-dashoffset 0s; /* Inicialmente sin transición, se añade dinámicamente */
}

/* Estilos base para las tarjetas de habilidades */
.vxv-skill-card {
  transition: all 0.3s ease; /* Transición suave para efectos hover */
  display: flex;
  flex-direction: column;
}

/* Efecto hover para las tarjetas */
.vxv-skill-card:hover {
  transform: translateY(-5px);
}

/*
 * Estilos para la descripción con scroll
 * La descripción tiene una altura fija pero se expande al hacer hover
 * Incluye un efecto de desvanecimiento en la parte inferior
 */
.description-wrapper {
  overflow: hidden;
  position: relative;
  /* Efecto de desvanecimiento en la parte inferior */
  mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
}

.description-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow-y: hidden;
  transition: all 0.3s ease;
  padding-right: 5px; /* Espacio para la barra de scroll */
}

.vxv-skill-card:hover .description-text {
  overflow-y: auto;
  max-height: 80px;
  mask-image: none;
  -webkit-mask-image: none;
  z-index: 10; /* Asegura que el texto esté por encima de otros elementos */
}

/* Estilo para la barra de scroll */
.description-text::-webkit-scrollbar {
  width: 4px;
}

.description-text::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 10px;
}

.description-text::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 10px;
}

.description-text::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}

/* Indicador de scroll */
.scroll-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(59, 130, 246, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vxv-skill-card:hover .description-wrapper:hover .scroll-indicator {
  opacity: 1;
}

/* Estilos para la sección de prerrequisitos */
.prereq-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.5) rgba(31, 41, 55, 0.5);
}

/* Estilos para los badges de requisitos */
.prereq-container > div:not(p) {
  border-width: 1px;
  font-size: 0.65rem;
  line-height: 1;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* Estilo específico para el mensaje de no requisitos */
.prereq-container > p {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  display: flex;
  align-items: center;
}

.prereq-container::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

.prereq-container::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 10px;
}

.prereq-container::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 10px;
}

.prereq-container::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
</style>
