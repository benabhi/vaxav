<template>
  <div class="vxv-status-bar">
    <!-- Sección izquierda para información de estado -->
    <div class="status-section left-section">
      <slot name="left">
        <!-- Contenido por defecto para la sección izquierda -->
        <div class="status-item">
          <span class="status-label">Estado:</span>
          <span class="status-value">En línea</span>
        </div>
      </slot>
    </div>

    <!-- Sección central para el cronómetro de acción -->
    <div class="status-section center-section">
      <slot name="center">
        <!-- Por defecto, mostrar el cronómetro de acción -->
        <VxvActionTimer
          v-if="showActionTimer"
          :duration="timerDuration"
          :remaining-time="timerRemainingTime"
          :action="timerAction"
          :is-active="timerIsActive"
          @complete="onTimerComplete"
          @update:remaining-time="onUpdateRemainingTime"
        />
      </slot>
    </div>

    <!-- Sección derecha para información adicional -->
    <div class="status-section right-section">
      <slot name="right">
        <!-- Contenido por defecto para la sección derecha -->
        <div class="status-item">
          <span class="status-label">Ubicación:</span>
          <span class="status-value">Sistema Solar</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import VxvActionTimer from '../timers/VxvActionTimer.vue';

const props = defineProps({
  // Props para el cronómetro de acción
  showActionTimer: {
    type: Boolean,
    default: true
  },
  timerDuration: {
    type: Number,
    default: 60
  },
  timerRemainingTime: {
    type: Number,
    default: null
  },
  timerAction: {
    type: String,
    default: 'Cargando...'
  },
  timerIsActive: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['timer-complete', 'update:timer-remaining-time']);

const onTimerComplete = () => {
  emit('timer-complete');
};

const onUpdateRemainingTime = (time) => {
  emit('update:timer-remaining-time', time);
};
</script>

<style scoped>
.vxv-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1f2937; /* bg-gray-800 */
  border-top: 1px solid #374151; /* border-gray-700 */
  padding: 0.5rem 1rem;
  height: 3rem; /* h-12 */
  width: 100%;
  position: relative;
  z-index: 40;
}

.status-section {
  display: flex;
  align-items: center;
}

.left-section {
  justify-content: flex-start;
  flex: 1;
}

.center-section {
  justify-content: center;
  flex: 2;
  position: relative;
}

.right-section {
  justify-content: flex-end;
  flex: 1;
}

.status-item {
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
}

.status-label {
  font-size: 0.75rem;
  color: #9ca3af; /* text-gray-400 */
  margin-right: 0.25rem;
}

.status-value {
  font-size: 0.875rem;
  color: #e5e7eb; /* text-gray-200 */
  font-weight: 500;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .status-label {
    display: none;
  }
  
  .left-section, .right-section {
    flex: 0.5;
  }
  
  .center-section {
    flex: 3;
  }
}
</style>
