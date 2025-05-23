<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'rounded-md p-4 mb-4',
        variantClasses,
        dismissible ? 'pr-10' : '',
        className
      ]"
      role="alert"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <component
            :is="icon"
            v-if="icon"
            class="h-5 w-5"
            :class="iconClass"
            aria-hidden="true"
          />
          <svg
            v-else-if="variant !== 'default'"
            class="h-5 w-5"
            :class="iconClass"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              v-if="variant === 'success'"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
            <path
              v-else-if="variant === 'error'"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
            <path
              v-else-if="variant === 'warning'"
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
            <path
              v-else-if="variant === 'info'"
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3
            v-if="title"
            class="text-sm font-medium"
            :class="titleClass"
          >
            {{ title }}
          </h3>
          <div
            class="text-sm"
            :class="[title ? 'mt-2' : '', messageClass]"
          >
            <slot>{{ message }}</slot>
          </div>
        </div>
        <div v-if="dismissible" class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              type="button"
              :class="[
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                dismissButtonClass
              ]"
              @click="dismiss"
            >
              <span class="sr-only">Dismiss</span>
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'error', 'warning', 'info'].includes(value)
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
  },
  duration: {
    type: Number,
    default: 0 // 0 means it won't auto-dismiss
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['dismiss']);

const show = ref(true);
let dismissTimer = null;

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-800 text-white shadow-md';
    case 'error':
      return 'bg-red-800 text-white shadow-md';
    case 'warning':
      return 'bg-yellow-800 text-white shadow-md';
    case 'info':
      return 'bg-blue-800 text-white shadow-md';
    default:
      return 'bg-gray-800 text-white shadow-md';
  }
});

const iconClass = computed(() => {
  return 'text-white';
});

const titleClass = computed(() => {
  return 'text-white font-bold';
});

const messageClass = computed(() => {
  return 'text-white';
});

const dismissButtonClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-white hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-800';
    case 'error':
      return 'text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-800';
    case 'warning':
      return 'text-white hover:bg-yellow-700 focus:ring-yellow-500 focus:ring-offset-yellow-800';
    case 'info':
      return 'text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-800';
    default:
      return 'text-white hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-800';
  }
});

const dismiss = () => {
  show.value = false;
  emit('dismiss');
};

watch(() => props.duration, (newDuration) => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  if (newDuration > 0) {
    dismissTimer = setTimeout(() => {
      dismiss();
    }, newDuration);
  }
}, { immediate: true });

onMounted(() => {
  if (props.duration > 0) {
    dismissTimer = setTimeout(() => {
      dismiss();
    }, props.duration);
  }
});
</script>
