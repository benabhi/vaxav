<template>
  <BaseModal 
    :show="isOpen" 
    :title="config.title" 
    :color="config.color" 
    @close="handleCancel"
  >
    <div class="text-center">
      <div v-if="config.icon" class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
        :class="iconBackgroundClass">
        <component :is="iconComponent" class="h-10 w-10" :class="iconColorClass" />
      </div>

      <p class="text-gray-300 mb-6">
        {{ config.message }}
      </p>
    </div>

    <div class="flex space-x-3">
      <BaseButton 
        type="button" 
        :variant="config.color === 'red' ? 'danger' : 'primary'" 
        :full-width="true" 
        :loading="isLoading" 
        @click="handleConfirm"
      >
        {{ config.confirmText }}
      </BaseButton>
      <BaseButton 
        type="button" 
        variant="secondary" 
        :full-width="true" 
        @click="handleCancel"
      >
        {{ config.cancelText }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from '@/components/ui/modals/BaseModal.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import { useConfirmation } from '@/composables/useConfirmation';

// Iconos
import TrashIcon from '@/components/icons/TrashIcon.vue';
import SaveIcon from '@/components/icons/SaveIcon.vue';
import ExclamationIcon from '@/components/icons/ExclamationIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';

// Usar el composable de confirmación
const { 
  isOpen, 
  isLoading, 
  config, 
  handleConfirm, 
  handleCancel 
} = useConfirmation();

// Determinar el componente de icono a usar
const iconComponent = computed(() => {
  switch (config.icon) {
    case 'trash':
      return TrashIcon;
    case 'save':
      return SaveIcon;
    case 'check':
      return CheckIcon;
    default:
      return ExclamationIcon;
  }
});

// Determinar la clase de fondo del icono
const iconBackgroundClass = computed(() => {
  switch (config.color) {
    case 'red':
      return 'bg-red-100';
    case 'green':
      return 'bg-green-100';
    case 'yellow':
      return 'bg-yellow-100';
    default:
      return 'bg-blue-100';
  }
});

// Determinar la clase de color del icono
const iconColorClass = computed(() => {
  switch (config.color) {
    case 'red':
      return 'text-red-600';
    case 'green':
      return 'text-green-600';
    case 'yellow':
      return 'text-yellow-600';
    default:
      return 'text-blue-600';
  }
});
</script>
