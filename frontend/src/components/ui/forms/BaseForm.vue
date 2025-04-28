<template>
  <div class="py-6">
    <BaseCard 
      :title="title" 
      :has-border="true" 
      :max-width="maxWidth" 
      centered
    >
      <form @submit.prevent="onSubmit">
        <slot></slot>

        <div class="flex space-x-3">
          <BaseButton 
            type="submit" 
            variant="primary" 
            :full-width="false" 
            :loading="loading"
          >
            {{ submitText }}
          </BaseButton>
          <BaseButton 
            v-if="showCancel" 
            type="button" 
            variant="secondary" 
            :full-width="false" 
            @click="onCancel"
          >
            {{ cancelText }}
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseCard from '@/components/ui/layout/BaseCard.vue';

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
