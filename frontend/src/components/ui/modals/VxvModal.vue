<template>
  <div v-if="show" class="fixed z-50 inset-0 overflow-y-auto modal-container" @click.self="closeOnClickOutside && $emit('close')">
    <div class="flex items-center justify-center min-h-screen p-4">
      <!-- Modal -->
      <div class="relative bg-gray-800 rounded-lg max-w-lg w-full mx-auto p-6 border-4 z-10" :class="`border-${color}-500`">
        <!-- Header -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white">
            {{ title }}
          </h2>
          <div class="mt-2 w-16 mx-auto border-b-4" :class="`border-${color}-500`"></div>
        </div>

        <!-- Content -->
        <div>
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="mt-6">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilo para el overlay del modal con blur */
.modal-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.75); /* bg-gray-900 con opacidad alta */
  backdrop-filter: blur(3px); /* Mayor desenfoque para reducir visibilidad del fondo */
  z-index: 0;
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
