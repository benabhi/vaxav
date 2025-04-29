<template>
  <div v-if="message" :class="['admin-alert', `admin-alert-${type}`]">
    <div class="admin-alert-content">
      <div v-if="title" class="admin-alert-title">
        {{ title }}
      </div>
      <div class="admin-alert-message">
        {{ message }}
      </div>
    </div>
    <button
      v-if="dismissible"
      class="admin-alert-close"
      @click="dismiss"
      aria-label="Cerrar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-5 h-5"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['dismiss']);

const dismiss = () => {
  emit('dismiss');
};
</script>

<style scoped>
.admin-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  margin: 0 1rem 1rem 1rem;
  border-radius: 0.375rem;
}

.admin-alert-success {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.admin-alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.admin-alert-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}

.admin-alert-info {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #3b82f6;
}

.admin-alert-content {
  flex: 1;
}

.admin-alert-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.admin-alert-message {
  font-size: 0.875rem;
}

.admin-alert-close {
  margin-left: 0.75rem;
  color: currentColor;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.admin-alert-close:hover {
  opacity: 1;
}
</style>
