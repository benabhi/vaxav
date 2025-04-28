<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Modal backdrop -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"
        @click="closeIfClickOutside"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal panel -->
      <div :class="[
        'inline-block align-middle bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6 border-2',
        `border-${color}-500`
      ]">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 v-if="title" class="text-xl leading-6 font-bold" :class="`text-${color}-400 mb-4`" id="modal-title">
              {{ title }}
            </h3>

            <div class="mt-4">
              <slot></slot>
            </div>
          </div>
        </div>

        <div v-if="$slots.footer" class="mt-8 sm:mt-6">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// defineProps y defineEmits son macros de compilación en <script setup>, no necesitan ser importados

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value: string) => {
      return ['blue', 'red', 'green', 'yellow', 'purple', 'gray'].includes(value);
    }
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const closeIfClickOutside = () => {
  if (props.closeOnClickOutside) {
    emit('update:modelValue', false);
  }
};
</script>
