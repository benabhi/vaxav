<template>
  <Modal :show="show" title="Eliminar rol" @close="$emit('close')">
    <div class="sm:flex sm:items-start">
      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
        <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <div class="mt-2">
          <p class="text-sm text-gray-300">
            ¿Estás seguro de que deseas eliminar el rol <span class="font-semibold">{{ role?.name }}</span>? Esta acción no se puede deshacer.
          </p>
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <BaseButton variant="danger" :loading="loading" @click="$emit('confirm')">
        Eliminar
      </BaseButton>
      <BaseButton variant="secondary" class="mr-3" @click="$emit('close')">
        Cancelar
      </BaseButton>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/ui/Modal.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close', 'confirm']);
</script>
