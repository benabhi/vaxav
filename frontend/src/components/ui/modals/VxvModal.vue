<template>
  <Transition
    enter-active-class="transition ease-out duration-400"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed z-100 inset-0 overflow-y-auto modal-container" @click.self="closeOnClickOutside && $emit('close')">
      <div class="flex items-center justify-center min-h-screen p-4">
        <!-- Modal -->
        <div
          class="relative bg-gray-800 rounded-lg max-w-lg w-full mx-auto p-6 border-4 z-100 transform transition-all modal-content"
          :class="`border-${color}-500`"
          style="animation: modalAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;"
        >
        <!-- Header -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white modal-title">
            {{ title }}
          </h2>
          <div class="mt-2 w-16 mx-auto border-b-4 modal-divider" :class="`border-${color}-500`"></div>
        </div>

        <!-- Content -->
        <div class="modal-body">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="mt-6 modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<style scoped>
/* Estilo para el overlay del modal con blur */
.modal-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.75); /* bg-gray-900 con opacidad alta */
  backdrop-filter: blur(3px); /* Mayor desenfoque para reducir visibilidad del fondo */
  z-index: 90;
  animation: overlayFadeIn 0.3s ease-out forwards;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animación para el borde del modal */
.modal-content {
  animation: borderPulse 0.6s ease-out forwards;
}

/* Colores específicos para cada variante */
.border-blue-500 {
  animation-name: borderPulseBlue;
}

.border-red-500 {
  animation-name: borderPulseRed;
}

.border-green-500 {
  animation-name: borderPulseGreen;
}

.border-yellow-500 {
  animation-name: borderPulseYellow;
}

.border-gray-500 {
  animation-name: borderPulseGray;
}

@keyframes borderPulseBlue {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes borderPulseRed {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

@keyframes borderPulseGreen {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes borderPulseYellow {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

@keyframes borderPulseGray {
  0% {
    box-shadow: 0 0 0 0 rgba(107, 114, 128, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(107, 114, 128, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(107, 114, 128, 0);
  }
}

/* Animaciones para el título y el divisor */
.modal-title {
  animation: fadeSlideDown 0.5s ease-out 0.2s both;
}

.modal-divider {
  animation: expandWidth 0.6s ease-out 0.4s both;
}

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expandWidth {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 4rem; /* w-16 */
    opacity: 1;
  }
}

/* Animaciones para el contenido y el footer */
.modal-body {
  animation: bodyFadeIn 0.5s ease-out 0.5s both;
}

@keyframes bodyFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-footer {
  animation: fadeSlideUp 0.5s ease-out 0.6s both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación para la aparición del modal */
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}


</style>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'red', 'green', 'yellow', 'gray'].includes(value)
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  }
});

defineEmits(['close']);
</script>
