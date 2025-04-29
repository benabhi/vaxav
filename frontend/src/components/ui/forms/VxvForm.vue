<template>
  <div class="py-6">
    <VxvCard
      :title="title"
      :has-border="true"
      :max-width="maxWidth"
      centered
    >
      <form @submit.prevent="onSubmit">
        <slot></slot>

        <div class="flex space-x-3">
          <VxvButton
            type="submit"
            variant="primary"
            :full-width="false"
            :loading="loading"
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
      </form>
    </VxvCard>
  </div>
</template>

<script setup>
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
  }
});

const emit = defineEmits(['submit', 'cancel']);

const onSubmit = () => {
  emit('submit');
};

const onCancel = () => {
  emit('cancel');
};
</script>
