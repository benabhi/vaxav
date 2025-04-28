<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div class="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <!-- Search input -->
      <div v-if="showSearch" class="flex-grow">
        <label v-if="searchLabel" :for="`${id}-search`" class="block text-sm font-medium text-gray-300 mb-1">
          {{ searchLabel }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            :id="`${id}-search`"
            v-model="localFilters.search"
            type="text"
            :placeholder="searchPlaceholder"
            class="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
            @input="debouncedEmitChange"
          />
        </div>
      </div>

      <!-- Filter slots -->
      <slot name="filters"></slot>

      <!-- Action buttons -->
      <div class="flex space-x-2 md:self-end">
        <button
          v-if="showReset"
          type="button"
          class="px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none"
          @click="resetFilters"
        >
          {{ resetLabel }}
        </button>
        <button
          v-if="showApply"
          type="button"
          class="px-4 py-2 border border-blue-600 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
          @click="applyFilters"
        >
          {{ applyLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';

// Define props
const props = defineProps({
  /**
   * Unique identifier for the component
   */
  id: {
    type: String,
    default: () => `filters-${Math.random().toString(36).substring(2, 9)}`
  },
  /**
   * Initial filters
   */
  filters: {
    type: Object,
    default: () => ({})
  },
  /**
   * Whether to show the search input
   */
  showSearch: {
    type: Boolean,
    default: true
  },
  /**
   * Label for the search input
   */
  searchLabel: {
    type: String,
    default: ''
  },
  /**
   * Placeholder for the search input
   */
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  /**
   * Whether to show the apply button
   */
  showApply: {
    type: Boolean,
    default: true
  },
  /**
   * Label for the apply button
   */
  applyLabel: {
    type: String,
    default: 'Aplicar'
  },
  /**
   * Whether to show the reset button
   */
  showReset: {
    type: Boolean,
    default: true
  },
  /**
   * Label for the reset button
   */
  resetLabel: {
    type: String,
    default: 'Restablecer'
  },
  /**
   * Debounce time for search input in milliseconds
   */
  debounce: {
    type: Number,
    default: 300
  },
  /**
   * Whether to emit changes immediately
   */
  immediate: {
    type: Boolean,
    default: false
  }
});

// Define emits
const emit = defineEmits(['update:filters', 'filter-change', 'reset']);

// Create a local copy of the filters
const localFilters = reactive({
  search: '',
  ...props.filters
});

// Watch for changes in props.filters
watch(() => props.filters, (newFilters) => {
  // Update local filters when props change
  Object.keys(newFilters).forEach(key => {
    localFilters[key] = newFilters[key];
  });
}, { deep: true });

// Debounce timer
let debounceTimer: number | null = null;

// Debounced emit change function
const debouncedEmitChange = () => {
  if (props.immediate) {
    emitChange();
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    emitChange();
  }, props.debounce);
};

// Emit change function
const emitChange = () => {
  emit('update:filters', { ...localFilters });
  emit('filter-change', { ...localFilters });
};

// Apply filters
const applyFilters = () => {
  emitChange();
};

// Reset filters
const resetFilters = () => {
  // Reset search
  localFilters.search = '';
  
  // Reset other filters
  Object.keys(localFilters).forEach(key => {
    if (key !== 'search') {
      if (Array.isArray(localFilters[key])) {
        localFilters[key] = [];
      } else if (typeof localFilters[key] === 'object' && localFilters[key] !== null) {
        localFilters[key] = {};
      } else {
        localFilters[key] = '';
      }
    }
  });
  
  emit('update:filters', { ...localFilters });
  emit('filter-change', { ...localFilters });
  emit('reset');
};

// Initialize
onMounted(() => {
  // Set initial search value
  if (props.filters.search) {
    localFilters.search = props.filters.search;
  }
});
</script>
