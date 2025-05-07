<template>
  <div class="py-6">
    <VxvCard
      :title="title"
      :has-border="hasBorder"
      :max-width="maxWidth"
      centered
    >
      <!-- Slot para alertas -->
      <slot name="alert"></slot>

      <form @submit.prevent="onSubmit">
        <slot></slot>

        <!-- Slot para botones personalizados -->
        <slot name="buttons">
          <div v-if="showSubmit" class="flex space-x-3">
            <VxvButton
              type="submit"
              variant="primary"
              :full-width="fullWidthSubmit"
              :loading="loading"
              :disabled="disabled"
            >
              {{ submitText }}
            </VxvButton>
            <VxvButton
              v-if="showCancel"
              type="button"
              variant="secondary"
              :full-width="false"
              @click="onCancel"
            >
              {{ cancelText }}
            </VxvButton>
          </div>
        </slot>

        <!-- Slot para contenido debajo de los botones -->
        <slot name="footer"></slot>
      </form>
    </VxvCard>
  </div>
</template>

<script setup lang="ts">
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvCard from '@/components/ui/layout/VxvCard.vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  submitText: {
    type: String,
    default: 'Guardar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxWidth: {
    type: String,
    default: '3xl'
  },
  hasBorder: {
    type: Boolean,
    default: true
  },
  fullWidthSubmit: {
    type: Boolean,
    default: false
  },
  showSubmit: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const onSubmit = () => {
  emit('submit');
};

const onCancel = () => {
  emit('cancel');
};
</script>
