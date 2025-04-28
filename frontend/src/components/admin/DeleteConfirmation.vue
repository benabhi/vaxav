<template>
  <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Modal backdrop -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal panel -->
      <div
        class="inline-block align-middle bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6 border-2 border-red-500"
      >
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
          >
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-xl leading-6 font-bold text-red-400 mb-4" id="modal-title">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-300">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse">
          <BaseButton variant="danger" :loading="loading" @click="$emit('confirm')" class="sm:ml-3">
            {{ confirmText }}
          </BaseButton>
          <BaseButton variant="ghost" @click="$emit('close')">
            {{ cancelText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/buttons/BaseButton.vue';

defineProps({
  title: {
    type: String,
    default: 'Confirmar eliminación'
  },
  message: {
    type: String,
    default: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.'
  },
  confirmText: {
    type: String,
    default: 'Eliminar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['confirm', 'close']);
</script>
