<template>
  <div class="vxv-action-timer" :class="{ 'is-active': isActive }">
    <!-- Contenedor principal del cronómetro -->
    <div class="timer-container">
      <!-- Barra de progreso de fondo -->
      <div class="timer-bar-background"></div>

      <!-- Barra de progreso -->
      <div
        class="timer-bar-progress"
        :style="{
          width: `${progressPercentage}%`,
          backgroundColor: getProgressColor(progressPercentage)
        }"
      ></div>

      <!-- Contenido central del cronómetro -->
      <div class="timer-content">
        <div class="timer-action">{{ action }}</div>
        <div class="timer-time">{{ formattedTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // Duración total en segundos
  duration: {
    type: Number,
    default: 60
  },
  // Tiempo restante en segundos
  remainingTime: {
    type: Number,
    default: null
  },
  // Acción que se está realizando
  action: {
    type: String,
    default: 'Cargando...'
  },
  // Si el cronómetro está activo
  isActive: {
    type: Boolean,
    default: true
  },
  // Si el cronómetro debe iniciar automáticamente
  autoStart: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['complete', 'update:remainingTime']);

// Estado interno del cronómetro
const internalRemainingTime = ref(props.remainingTime !== null ? props.remainingTime : props.duration);
const intervalId = ref(null);

// Calcular el porcentaje de progreso para la barra (llenándose en lugar de vaciándose)
const progressPercentage = computed(() => {
  const progress = 1 - (internalRemainingTime.value / props.duration);
  return progress * 100;
});

// Formatear el tiempo restante en MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(internalRemainingTime.value / 60);
  const seconds = Math.floor(internalRemainingTime.value % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Función para calcular el color de la barra de progreso basado en el porcentaje
const getProgressColor = (percentage) => {
  // Comenzamos con un color más tenue y vamos hacia un azul más intenso
  if (percentage < 25) {
    return '#93c5fd'; // blue-300
  } else if (percentage < 50) {
    return '#60a5fa'; // blue-400
  } else if (percentage < 75) {
    return '#3b82f6'; // blue-500
  } else if (percentage < 90) {
    return '#2563eb'; // blue-600
  } else {
    return '#1d4ed8'; // blue-700
  }
};

// Iniciar el cronómetro
const startTimer = () => {
  if (intervalId.value) return;

  intervalId.value = setInterval(() => {
    if (internalRemainingTime.value <= 0) {
      stopTimer();
      emit('complete');
      return;
    }

    internalRemainingTime.value -= 0.1;
    emit('update:remainingTime', internalRemainingTime.value);
  }, 100);
};

// Detener el cronómetro
const stopTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Reiniciar el cronómetro
const resetTimer = () => {
  stopTimer();
  internalRemainingTime.value = props.duration;
  emit('update:remainingTime', internalRemainingTime.value);
  if (props.autoStart) {
    startTimer();
  }
};

// Observar cambios en las props
watch(() => props.remainingTime, (newValue) => {
  if (newValue !== null) {
    internalRemainingTime.value = newValue;
  }
});

watch(() => props.isActive, (newValue) => {
  if (newValue) {
    startTimer();
  } else {
    stopTimer();
  }
});

watch(() => props.duration, (newValue) => {
  // Si cambia la duración, reiniciar el cronómetro
  if (newValue !== internalRemainingTime.value) {
    resetTimer();
  }
});

// Ciclo de vida del componente
onMounted(() => {
  if (props.autoStart && props.isActive) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});

// Exponer métodos para uso externo
defineExpose({
  startTimer,
  stopTimer,
  resetTimer
});
</script>

<style scoped>
.vxv-action-timer {
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 2rem;
  margin: 0 auto;
  z-index: 10;
}

.timer-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px; /* rounded-full */
  overflow: hidden;
  background-color: #111827; /* bg-gray-900 */
}

.timer-bar-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1f2937; /* bg-gray-800 */
  z-index: 1;
}

.timer-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.1s linear, background-color 0.5s ease;
  z-index: 2;
  /* Añadir un sutil efecto de brillo */
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.timer-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 1rem;
  z-index: 3;
}

.timer-action {
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
  color: #f3f4f6; /* text-gray-100 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); /* Sombra para mejorar legibilidad */
}

.timer-time {
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff; /* white */
  margin-left: auto;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); /* Sombra para mejorar legibilidad */
}

/* Cuando está inactivo */
.vxv-action-timer:not(.is-active) .timer-bar-progress {
  background-color: #4b5563 !important; /* bg-gray-600 - !important para anular el color dinámico */
  box-shadow: 0 0 8px rgba(75, 85, 99, 0.5); /* Sombra gris */
}

/* Estilos responsivos */
@media (max-width: 640px) {
  .timer-action {
    max-width: 50%;
    font-size: 0.7rem;
  }

  .timer-time {
    font-size: 0.75rem;
  }
}
</style>
