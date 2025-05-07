<template>
  <div class="vxv-status-bar-container" ref="containerRef">
    <!-- Espacio reservado para mantener el layout cuando la barra está en modo fixed -->
    <div v-if="isFixed" class="status-bar-placeholder"></div>

    <!-- Barra de estado -->
    <div
      class="vxv-status-bar"
      :class="{ 'is-fixed': isFixed, 'is-docked': isDocked }"
      ref="statusBarRef"
    >
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
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted, watch } from 'vue';
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

// Referencias y estado
const containerRef = ref(null);
const statusBarRef = ref(null);
const isFixed = ref(true); // Siempre en modo flotante
const isDocked = ref(false);
const footerElement = ref(null);

// Métodos para el cronómetro
const onTimerComplete = () => {
  emit('timer-complete');
};

const onUpdateRemainingTime = (time) => {
  emit('update:timer-remaining-time', time);
};

// Método para forzar una actualización de la posición
const forcePositionUpdate = () => {
  // Forzar un reflow para asegurar que la posición se actualice correctamente
  if (statusBarRef.value) {
    const currentDisplay = statusBarRef.value.style.display;
    statusBarRef.value.style.display = 'none';
    // Forzar un reflow
    void statusBarRef.value.offsetHeight;
    statusBarRef.value.style.display = currentDisplay;
  }

  // Verificar la posición después del reflow
  checkFooterPosition();
};

// Función para verificar si la barra ha llegado al footer
const checkFooterPosition = () => {

  // Buscar el footer si aún no lo tenemos
  if (!footerElement.value) {
    // Intentar encontrar el footer por diferentes selectores
    footerElement.value = document.querySelector('footer') ||
                          document.querySelector('.app-footer') ||
                          document.querySelector('.footer');

    // Si aún no lo encontramos, buscar el último elemento del body como fallback
    if (!footerElement.value) {
      const bodyChildren = Array.from(document.body.children);
      // Buscar el último elemento visible que no sea nuestro componente
      for (let i = bodyChildren.length - 1; i >= 0; i--) {
        const el = bodyChildren[i];
        if (el !== containerRef.value &&
            el !== statusBarRef.value &&
            el.offsetParent !== null &&
            !el.contains(containerRef.value) &&
            !el.contains(statusBarRef.value)) {
          footerElement.value = el;
          break;
        }
      }
    }
  }

  if (footerElement.value && statusBarRef.value) {
    const footerRect = footerElement.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Verificar si la página es corta (el footer está visible sin scroll)
    const isShortPage = documentHeight <= viewportHeight;

    // En páginas cortas, siempre acoplar la barra al footer
    if (isShortPage) {
      isDocked.value = true;

      // Calcular la posición exacta para la barra
      if (statusBarRef.value) {
        // Posicionar la barra justo encima del footer
        const topPosition = footerRect.top - statusBarRef.value.offsetHeight;
        statusBarRef.value.style.top = `${topPosition}px`;
      }
    }
    // En páginas largas, acoplar cuando el footer está cerca o visible
    else {
      // Si el footer está visible en la ventana, la barra debe "acoplarse" a él
      const footerVisible = footerRect.top < viewportHeight;

      // Acoplar cuando el footer está visible
      if (footerVisible) {
        isDocked.value = true;

        // Calcular la posición exacta para la barra
        if (statusBarRef.value) {
          // Posicionar la barra justo encima del footer
          const topPosition = footerRect.top - statusBarRef.value.offsetHeight;
          statusBarRef.value.style.top = `${topPosition}px`;
        }
      } else {
        isDocked.value = false;

        // Restaurar la posición bottom: 0 cuando el footer no es visible
        if (statusBarRef.value) {
          statusBarRef.value.style.top = '';
        }
      }
    }
  }
};

// Configurar observadores y eventos
onMounted(() => {
  // Esperar a que las imágenes y otros recursos estén cargados
  window.addEventListener('load', () => {
    // Inicializar la verificación de posición después de que todo esté cargado
    checkFooterPosition();

    // Verificar de nuevo después de un pequeño retraso para manejar cualquier cambio en el layout
    setTimeout(checkFooterPosition, 100);

    // Verificar periódicamente durante los primeros segundos para manejar cambios en el layout
    const intervalId = setInterval(checkFooterPosition, 200);
    setTimeout(() => {
      clearInterval(intervalId);

      // Una verificación final después de que todo esté estable
      checkFooterPosition();
    }, 2000);
  });

  // También inicializar con un retraso por si el evento 'load' ya ocurrió
  setTimeout(() => {
    checkFooterPosition();

    // Verificar de nuevo después de un tiempo más largo
    setTimeout(checkFooterPosition, 500);
  }, 100);

  // Función para verificar la posición con requestAnimationFrame para mayor fluidez
  throttledCheck = () => {
    window.requestAnimationFrame(checkFooterPosition);
  };

  // Añadir listener para el scroll y resize con throttling
  window.addEventListener('scroll', throttledCheck);
  window.addEventListener('resize', throttledCheck);

  // Crear un ResizeObserver para detectar cambios en el tamaño del contenedor
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      // Usar un pequeño retraso para permitir que el DOM se actualice completamente
      setTimeout(checkFooterPosition, 50);
    });

    // Observar el contenedor y el footer si existe
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
    if (footerElement.value) {
      resizeObserver.observe(footerElement.value);
    }
  }

  // Observar cambios en el DOM que puedan afectar la posición del footer
  if (window.MutationObserver) {
    const observer = new MutationObserver(() => {
      // Usar un pequeño retraso para permitir que el DOM se actualice completamente
      setTimeout(checkFooterPosition, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
});

// Variable para almacenar la función throttled
let throttledCheck;

onUnmounted(() => {
  // Eliminar los event listeners
  if (throttledCheck) {
    window.removeEventListener('scroll', throttledCheck);
    window.removeEventListener('resize', throttledCheck);
  }
});



// Observar cambios en isDocked
watch(isDocked, (newValue) => {
  if (newValue) {
    // Forzar una actualización de la posición cuando cambia a modo docked
    setTimeout(forcePositionUpdate, 0);
  }
});
</script>

<style scoped>
.vxv-status-bar-container {
  position: relative;
  width: 100%;
}

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
  transition: position 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

/* Modo fixed: la barra permanece fija en la parte inferior de la ventana */
.vxv-status-bar.is-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  z-index: 40; /* Asegurarse de que esté por debajo del sidebar móvil (z-index: 50) */
}

/* Modo docked: la barra se acopla encima del footer cuando este es visible */
.vxv-status-bar.is-docked {
  position: fixed; /* Mantener fixed para que se mueva con el scroll */
  bottom: auto; /* No usar bottom fijo */
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 0; /* Eliminar cualquier margen */
  transform: translateY(0); /* Asegurar que no haya transformación */
  border-bottom: none; /* Eliminar el borde inferior para evitar espacios */
  z-index: 40; /* Asegurarse de que esté por debajo del sidebar móvil (z-index: 50) */
}



/* Espacio reservado para mantener el layout cuando la barra está en modo fixed */
.status-bar-placeholder {
  height: 3rem; /* Misma altura que la barra */
  width: 100%;
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

  .toggle-fixed-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .toggle-icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>
