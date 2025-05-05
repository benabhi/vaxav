<template>
  <div class="bg-gray-800 p-3 rounded-lg mb-4">
    <!-- Filters container -->
    <div class="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
      <!-- Search section -->
      <div v-if="showSearch" class="w-full md:flex-grow md:min-w-[250px]">
        <!-- Search label -->
        <label
          v-if="showLabels && searchLabel"
          :for="`${id}-search`"
          class="block text-sm font-medium text-gray-300 mb-1"
        >
          {{ searchLabel }}
        </label>

        <!-- Search input -->
        <VxvInput
          :id="`${id}-search`"
          v-model="localFilters.search"
          :label="showLabels ? '' : searchLabel"
          :placeholder="searchPlaceholder"
          prefixIcon
          size="sm"
          class="w-full"
          @update:modelValue="debouncedEmitChange"
        >
          <template #prefix>
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </template>
        </VxvInput>
      </div>

      <!-- Custom filters wrapper with horizontal scroll -->
      <div class="w-full md:w-auto overflow-x-auto">
        <div class="flex flex-col w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0 md:items-end">
          <!-- Custom filters -->
          <slot name="filters"></slot>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex space-x-2 flex-shrink-0">
        <VxvButton
          v-if="showReset"
          variant="secondary"
          size="md"
          @click="resetFilters"
        >
          {{ resetLabel }}
        </VxvButton>
        <VxvButton
          v-if="showApply"
          variant="primary"
          size="md"
          @click="applyFilters"
        >
          {{ applyLabel }}
        </VxvButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import VxvInput from '../forms/VxvInput.vue';
import VxvButton from '../buttons/VxvButton.vue';

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
   * Default filter values to use when resetting
   * If not provided, filters will be reset to empty values
   */
  defaultFilters: {
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
  },
  /**
   * Whether to show labels in a separate row above inputs
   */
  showLabels: {
    type: Boolean,
    default: true
  }
});

// Define emits
const emit = defineEmits(['update:filters', 'filter-change', 'reset']);

// Create a local copy of the filters, merging with default values for any missing properties
const localFilters = reactive({
  search: '',
  ...props.defaultFilters, // Aplicar valores por defecto primero
  ...props.filters // Los filtros iniciales tienen prioridad sobre los valores por defecto
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
  // Crear un objeto para los filtros restablecidos
  const resetFiltersObj = {};

  // Obtener todas las claves de los filtros actuales
  const allKeys = new Set([
    ...Object.keys(localFilters),
    ...Object.keys(props.defaultFilters)
  ]);

  // Restablecer todos los filtros
  allKeys.forEach(key => {
    // Mantener los valores de ordenación si existen
    if (key === 'sort_field' || key === 'sort_direction') {
      resetFiltersObj[key] = localFilters[key];
      return;
    }

    // Si hay un valor por defecto definido, usarlo
    if (key in props.defaultFilters) {
      resetFiltersObj[key] = props.defaultFilters[key];
    } else {
      // Si no hay valor por defecto, restablecer según el tipo
      if (key in localFilters) {
        if (typeof localFilters[key] === 'string') {
          resetFiltersObj[key] = '';
        } else if (Array.isArray(localFilters[key])) {
          resetFiltersObj[key] = [];
        } else if (typeof localFilters[key] === 'object' && localFilters[key] !== null) {
          resetFiltersObj[key] = {};
        } else if (typeof localFilters[key] === 'number') {
          resetFiltersObj[key] = 0;
        } else if (typeof localFilters[key] === 'boolean') {
          resetFiltersObj[key] = false;
        } else {
          resetFiltersObj[key] = null;
        }
      }
    }
  });

  // Actualizar los filtros locales
  Object.keys(resetFiltersObj).forEach(key => {
    localFilters[key] = resetFiltersObj[key];
  });

  // Filtros restablecidos

  // Emitir eventos con una copia de los filtros para asegurar que se detecten los cambios
  emit('update:filters', { ...resetFiltersObj });
  emit('filter-change', { ...resetFiltersObj });

  // Emitir un evento de reset para que los componentes padres puedan realizar acciones adicionales
  // Este evento es importante para que VxvDataTable pueda restablecer el valor de perPage
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
