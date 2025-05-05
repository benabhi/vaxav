<template>
  <div class="vxv-dropdown relative" ref="dropdownRef">
    <!-- Trigger element -->
    <div
      @click="toggleDropdown"
      class="dropdown-trigger cursor-pointer"
      :class="triggerClass"
    >
      <slot name="trigger"></slot>
    </div>

    <!-- Dropdown menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        :class="[
          'absolute z-50 mt-2 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none',
          positionClass,
          menuClass
        ]"
      >
        <div class="py-1">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, provide } from 'vue';

const props = defineProps({
  position: {
    type: String,
    default: 'bottom-right',
    validator: (value: string) => {
      return ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right'].includes(value);
    }
  },
  triggerClass: {
    type: String,
    default: ''
  },
  menuClass: {
    type: String,
    default: 'w-48'
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['open', 'close']);

// State
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Computed
const positionClass = computed(() => {
  switch (props.position) {
    case 'top-left':
      return 'origin-bottom-left bottom-full left-0';
    case 'top-right':
      return 'origin-bottom-right bottom-full right-0';
    case 'bottom-left':
      return 'origin-top-left top-full left-0';
    case 'bottom-right':
      return 'origin-top-right top-full right-0';
    case 'left':
      return 'origin-top-right right-full top-0';
    case 'right':
      return 'origin-top-left left-full top-0';
    default:
      return 'origin-top-right top-full right-0';
  }
});

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    emit('open');
  } else {
    emit('close');
  }
};

const closeDropdown = () => {
  if (isOpen.value) {
    isOpen.value = false;
    emit('close');
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (props.closeOnClickOutside && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

const handleEscKey = (event: KeyboardEvent) => {
  if (props.closeOnEsc && event.key === 'Escape') {
    closeDropdown();
  }
};

// Provide closeDropdown method to child components
provide('closeDropdown', closeDropdown);

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscKey);
});

// Expose methods
defineExpose({
  isOpen,
  toggleDropdown,
  closeDropdown
});
</script>

<style scoped>
.vxv-dropdown {
  display: inline-block;
}
</style>
