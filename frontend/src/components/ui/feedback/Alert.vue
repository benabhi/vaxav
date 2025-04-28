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
      return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
    default:
      return 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  }
});

const iconClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-green-400 dark:text-green-300';
    case 'error':
      return 'text-red-400 dark:text-red-300';
    case 'warning':
      return 'text-yellow-400 dark:text-yellow-300';
    case 'info':
      return 'text-blue-400 dark:text-blue-300';
    default:
      return 'text-gray-400 dark:text-gray-300';
  }
});

const titleClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-green-800 dark:text-green-200';
    case 'error':
      return 'text-red-800 dark:text-red-200';
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-200';
    case 'info':
      return 'text-blue-800 dark:text-blue-200';
    default:
      return 'text-gray-800 dark:text-gray-200';
  }
});

const messageClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-green-700 dark:text-green-300';
    case 'error':
      return 'text-red-700 dark:text-red-300';
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300';
    case 'info':
      return 'text-blue-700 dark:text-blue-300';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
});

const dismissButtonClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 focus:ring-green-500 focus:ring-offset-green-50 dark:focus:ring-offset-green-900';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 focus:ring-red-500 focus:ring-offset-red-50 dark:focus:ring-offset-red-900';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:ring-yellow-500 focus:ring-offset-yellow-50 dark:focus:ring-offset-yellow-900';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 focus:ring-blue-500 focus:ring-offset-blue-50 dark:focus:ring-offset-blue-900';
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900';
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
