<template>
  <span class="vxv-animated-counter" :class="{ 'inline-block': inline }">
    {{ displayValue }}
  </span>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

/**
 * VxvAnimatedCounter - Componente para mostrar un contador animado
 * 
 * Este componente muestra un número que se anima desde un valor inicial
 * hasta un valor final, con opciones para personalizar la duración,
 * el formato y otros aspectos de la animación.
 */
const props = defineProps({
  /**
   * Valor inicial del contador
   */
  initialValue: {
    type: [Number, String],
    default: 0
  },
  /**
   * Valor final del contador
   */
  finalValue: {
    type: [Number, String],
    default: 0,
    required: true
  },
  /**
   * Duración de la animación en milisegundos
   */
  duration: {
    type: Number,
    default: 1500
  },
  /**
   * Número de pasos para la animación
   */
  steps: {
    type: Number,
    default: 20
  },
  /**
   * Prefijo para añadir antes del valor (ej: "$", "€")
   */
  prefix: {
    type: String,
    default: ''
  },
  /**
   * Sufijo para añadir después del valor (ej: "XP", "%")
   */
  suffix: {
    type: String,
    default: ''
  },
  /**
   * Si el contador debe ser un elemento en línea
   */
  inline: {
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
   * Si la animación debe comenzar automáticamente
   */
  autoStart: {
    type: Boolean,
    default: true
  },
  /**
   * Si la animación debe ser de incremento o decremento
   */
  isDecrement: {
    type: Boolean,
    default: false
  },
  /**
   * Número de decimales a mostrar
   */
  decimals: {
    type: Number,
    default: 0
  },
  /**
   * Separador de miles
   */
  thousandsSeparator: {
    type: String,
    default: ','
  },
  /**
   * Separador decimal
   */
  decimalSeparator: {
    type: String,
    default: '.'
  },
  /**
   * Tipo de curva de animación
   * Opciones: linear, easeIn, easeOut, easeInOut
   */
  easing: {
    type: String,
    default: 'easeInOut',
    validator: (value) => ['linear', 'easeIn', 'easeOut', 'easeInOut'].includes(value)
  }
});

const emit = defineEmits(['complete', 'update:value']);

// Estado interno
const currentValue = ref(Number(props.initialValue));
const animationTimer = ref(null);
const isAnimating = ref(false);

// Valor formateado para mostrar
const displayValue = computed(() => {
  let formattedValue;
  
  // Aplicar formato personalizado si se proporciona
  if (props.formatValue) {
    formattedValue = props.formatValue(currentValue.value);
  } else {
    // Formatear con separadores y decimales
    formattedValue = formatNumber(
      currentValue.value, 
      props.decimals, 
      props.thousandsSeparator, 
      props.decimalSeparator
    );
  }
  
  // Añadir prefijo y sufijo
  return `${props.prefix}${formattedValue}${props.suffix}`;
});

// Formatear número con separadores y decimales
function formatNumber(value, decimals, thousandsSeparator, decimalSeparator) {
  // Redondear a los decimales especificados
  const roundedValue = Number(value).toFixed(decimals);
  
  // Dividir en parte entera y decimal
  const parts = roundedValue.split('.');
  
  // Formatear parte entera con separador de miles
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Unir con separador decimal
  return parts.join(decimalSeparator);
}

// Función para aplicar la curva de animación
function applyEasing(progress) {
  switch (props.easing) {
    case 'linear':
      return progress;
    case 'easeIn':
      return progress * progress;
    case 'easeOut':
      return 1 - Math.pow(1 - progress, 2);
    case 'easeInOut':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    default:
      return progress;
  }
}

// Iniciar la animación
function startAnimation() {
  // Detener cualquier animación en curso
  stopAnimation();
  
  // Establecer el valor inicial
  currentValue.value = Number(props.initialValue);
  
  // Calcular valores para la animación
  const initialValue = Number(props.initialValue);
  const finalValue = Number(props.finalValue);
  const totalChange = finalValue - initialValue;
  
  // Si no hay cambio, no animar
  if (totalChange === 0) {
    currentValue.value = finalValue;
    emit('update:value', finalValue);
    emit('complete');
    return;
  }
  
  // Configurar la animación
  const interval = props.duration / props.steps;
  let step = 0;
  
  // Marcar como animando
  isAnimating.value = true;
  
  // Crear un intervalo para actualizar el contador gradualmente
  animationTimer.value = setInterval(() => {
    step++;
    
    // Calcular el progreso (0 a 1)
    const progress = step / props.steps;
    
    // Aplicar la curva de animación
    const easedProgress = applyEasing(progress);
    
    // Calcular el valor actual
    currentValue.value = initialValue + (totalChange * easedProgress);
    
    // Emitir evento de actualización
    emit('update:value', currentValue.value);
    
    // Detener la animación cuando se alcance el valor final
    if (step >= props.steps) {
      currentValue.value = finalValue;
      emit('update:value', finalValue);
      emit('complete');
      stopAnimation();
    }
  }, interval);
}

// Detener la animación
function stopAnimation() {
  if (animationTimer.value) {
    clearInterval(animationTimer.value);
    animationTimer.value = null;
    isAnimating.value = false;
  }
}

// Reiniciar la animación
function resetAnimation() {
  stopAnimation();
  currentValue.value = Number(props.initialValue);
  emit('update:value', currentValue.value);
  if (props.autoStart) {
    startAnimation();
  }
}

// Exponer métodos al componente padre
defineExpose({
  startAnimation,
  stopAnimation,
  resetAnimation,
  isAnimating
});

// Observar cambios en las props para reiniciar la animación
watch(() => props.finalValue, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    resetAnimation();
  }
});

// Iniciar la animación al montar el componente
onMounted(() => {
  if (props.autoStart) {
    startAnimation();
  }
});

// Limpiar al desmontar
onUnmounted(() => {
  stopAnimation();
});
</script>

<style scoped>
.vxv-animated-counter {
  transition: color 0.3s ease;
}
</style>
