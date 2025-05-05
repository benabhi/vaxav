<template>
  <div class="overflow-hidden w-full">
    <!-- Header section with title and create button -->
    <div v-if="showHeader" class="flex justify-between items-center mb-4">
      <h2 v-if="title" class="text-xl font-bold text-white">{{ title }}</h2>
      <div v-else></div>

      <VxvButton
        v-if="showCreateButton"
        variant="primary"
        @click="$emit('create')"
      >
        <template #prefix>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </template>
        {{ createButtonLabel }}
      </VxvButton>
    </div>

    <!-- Filters section -->
    <VxvFilters
      v-if="showFilters"
      v-model:filters="localFilters"
      :defaultFilters="defaultFilters"
      :show-search="showSearch"
      :search-label="searchLabel"
      :search-placeholder="searchPlaceholder"
      :immediate="immediateSearch"
      :show-labels="showFilterLabels"
      @filter-change="handleFilterChange"
      @reset="handleFilterReset"
    >
      <template #filters>
        <!-- Per page selector -->
        <div v-if="showPerPage" class="w-full md:w-[150px]">
          <!-- Per page label -->
          <label
            :for="`${id}-per-page`"
            class="block text-sm font-medium text-gray-300 mb-1"
          >
            {{ perPageLabel }}
          </label>

          <!-- Per page selector -->
          <div class="flex items-center space-x-2" v-if="!showFilterLabels">
            <span class="text-sm text-gray-300">{{ perPageLabel }}</span>
            <VxvSelect
              :id="`${id}-per-page`"
              v-model="localPerPage"
              :options="perPageOptionsFormatted"
              size="sm"
              @update:modelValue="handlePerPageChange"
            />
          </div>
          <VxvSelect
            v-else
            :id="`${id}-per-page`"
            v-model="localPerPage"
            :options="perPageOptionsFormatted"
            size="sm"
            @update:modelValue="handlePerPageChange"
          />
        </div>

        <!-- Custom filter slots -->
        <slot name="filters"></slot>
      </template>
    </VxvFilters>

    <!-- Table section -->
    <VxvTable
      :columns="columns"
      :items="items"
      :loading="loading"
      :row-key="rowKey"
      :row-class="rowClass"
      :clickable="clickable"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      @sort="handleSort"
      @update:sortKey="sortKey = $event"
      @update:sortOrder="sortOrder = $event"
      @row-click="$emit('row-click', $event)"
    >
      <!-- Loading slot -->
      <template v-if="$slots.loading" #loading>
        <slot name="loading"></slot>
      </template>

      <!-- Empty slot -->
      <template v-if="$slots.empty" #empty>
        <slot name="empty"></slot>
      </template>

      <!-- Dynamic cell slots -->
      <template v-for="column in columns" :key="column.key" #[`cell(${column.key})`]="slotProps">
        <slot :name="`cell(${column.key})`" v-bind="slotProps">
          {{ slotProps.value }}
        </slot>
      </template>

      <!-- Actions slot -->
      <template v-if="$slots.actions" #actions="slotProps">
        <slot name="actions" v-bind="slotProps"></slot>
      </template>
    </VxvTable>

    <!-- Pagination section -->
    <div v-if="showPagination" class="mt-4">
      <VxvPaginator
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :per-page="localPerPage"
        :item-name="itemName"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import VxvTable from './VxvTable.vue';
import VxvPaginator from '../pagination/VxvPaginator.vue';
import VxvFilters from '../filters/VxvFilters.vue';
import VxvButton from '../buttons/VxvButton.vue';
import VxvSelect from '../forms/VxvSelect.vue';
import VxvClearState from '../feedback/VxvClearState.vue';

// Define props
const props = defineProps({
  /**
   * Unique identifier for the component
   */
  id: {
    type: String,
    default: () => `data-table-${Math.random().toString(36).substring(2, 9)}`
  },
  /**
   * Title for the data table
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Whether to show the header section
   */
  showHeader: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to show the create button
   */
  showCreateButton: {
    type: Boolean,
    default: true
  },
  /**
   * Label for the create button
   */
  createButtonLabel: {
    type: String,
    default: 'Crear nuevo'
  },
  /**
   * Array of column definitions
   */
  columns: {
    type: Array,
    required: true,
    validator: (value: any[]) => {
      return value.every(column => column.key !== undefined && column.label !== undefined);
    }
  },
  /**
   * Array of items to display
   */
  items: {
    type: Array,
    default: () => []
  },
  /**
   * Property name to use as unique key for rows
   */
  rowKey: {
    type: String,
    default: 'id'
  },
  /**
   * CSS class to apply to rows
   */
  rowClass: {
    type: [String, Function],
    default: null
  },
  /**
   * Whether the table is in loading state
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Whether rows are clickable
   */
  clickable: {
    type: Boolean,
    default: false
  },
  /**
   * Initial sort key
   */
  initialSortKey: {
    type: String,
    default: null
  },
  /**
   * Initial sort order
   */
  initialSortOrder: {
    type: String,
    default: 'asc',
    validator: (value: string) => ['asc', 'desc'].includes(value)
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
   */
  defaultFilters: {
    type: Object,
    default: () => ({})
  },
  /**
   * Whether to show filters
   */
  showFilters: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to show search input
   */
  showSearch: {
    type: Boolean,
    default: true
  },
  /**
   * Label for search input
   */
  searchLabel: {
    type: String,
    default: ''
  },
  /**
   * Placeholder for search input
   */
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  /**
   * Whether to emit search changes immediately
   */
  immediateSearch: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to show filter labels in a separate row
   */
  showFilterLabels: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to show pagination
   */
  showPagination: {
    type: Boolean,
    default: true
  },
  /**
   * Current page number
   */
  currentPage: {
    type: Number,
    default: 1
  },
  /**
   * Total number of pages
   */
  totalPages: {
    type: Number,
    default: 1
  },
  /**
   * Total number of items
   */
  total: {
    type: Number,
    default: 0
  },
  /**
   * Whether to show per page selector
   */
  showPerPage: {
    type: Boolean,
    default: true
  },
  /**
   * Label for per page selector
   */
  perPageLabel: {
    type: String,
    default: 'Mostrar'
  },
  /**
   * Initial items per page
   */
  perPage: {
    type: Number,
    default: 10
  },
  /**
   * Available options for items per page
   */
  perPageOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  /**
   * Name of the items being displayed
   */
  itemName: {
    type: String,
    default: 'elementos'
  }
});

// Define emits
const emit = defineEmits([
  'update:currentPage',
  'update:perPage',
  'update:sortKey',
  'update:sortOrder',
  'update:filters',
  'page-change',
  'per-page-change',
  'sort-change',
  'filter-change',
  'row-click',
  'create',
  'edit',
  'delete',
  'reset' // Añadir el evento reset
]);

// Local state
const sortKey = ref(props.initialSortKey);
const sortOrder = ref(props.initialSortOrder);
const localFilters = reactive({ ...props.filters });
const localPerPage = ref(props.perPage);

// Computed properties
const perPageOptionsFormatted = computed(() => {
  return props.perPageOptions.map(option => ({
    value: option,
    label: option.toString()
  }));
});

// Handle sort
const handleSort = (sortData: { key: string, order: string }) => {
  // Los valores de sortKey y sortOrder ya se actualizan a través de los eventos @update:sortKey y @update:sortOrder

  // Update filters with sort information
  const updatedFilters = {
    ...localFilters,
    sort_field: sortData.key,
    sort_direction: sortData.order
  };

  // Update local filters
  Object.keys(updatedFilters).forEach((key: string) => {
    if (key in localFilters) {
      // @ts-ignore - We know these keys exist in localFilters
      localFilters[key] = updatedFilters[key];
    }
  });

  emit('sort-change', sortData);
  emit('update:filters', updatedFilters);
  emit('filter-change', updatedFilters);
};

// Handle page change
const handlePageChange = (page: number) => {
  emit('update:currentPage', page);
  emit('page-change', page);
};

// Handle per page change
const handlePerPageChange = () => {
  // Asegurarse de que localPerPage sea un número
  const perPageNumber = Number(localPerPage.value);
  localPerPage.value = perPageNumber;

  emit('update:perPage', perPageNumber);
  emit('per-page-change', perPageNumber);
};

// Handle filter change
const handleFilterChange = (filters: any) => {
  emit('update:filters', filters);
  emit('filter-change', filters);
};

// Handle filter reset
const handleFilterReset = () => {
  // Crear un objeto para los filtros restablecidos
  const resetFilters = {};

  // Obtener todas las claves de los filtros actuales
  const allKeys = new Set([
    ...Object.keys(localFilters),
    ...Object.keys(props.defaultFilters)
  ]);

  // Restablecer todos los filtros
  allKeys.forEach(key => {
    // Mantener los valores de ordenación si existen
    if (key === 'sort_field' || key === 'sort_direction') {
      resetFilters[key] = localFilters[key];
      return;
    }

    // Si hay un valor por defecto definido, usarlo
    if (key in props.defaultFilters) {
      resetFilters[key] = props.defaultFilters[key];
    } else {
      // Si no hay valor por defecto, restablecer según el tipo
      if (key in localFilters) {
        if (typeof localFilters[key] === 'string') {
          resetFilters[key] = '';
        } else if (Array.isArray(localFilters[key])) {
          resetFilters[key] = [];
        } else if (typeof localFilters[key] === 'object' && localFilters[key] !== null) {
          resetFilters[key] = {};
        } else if (typeof localFilters[key] === 'number') {
          resetFilters[key] = 0;
        } else if (typeof localFilters[key] === 'boolean') {
          resetFilters[key] = false;
        } else {
          resetFilters[key] = null;
        }
      }
    }
  });

  // Actualizar los filtros locales
  Object.keys(resetFilters).forEach(key => {
    localFilters[key] = resetFilters[key];
  });

  // Asegurarse de que se emita un evento de cambio de filtros
  // con un objeto que contenga todos los filtros restablecidos
  emit('update:filters', { ...resetFilters });
  emit('filter-change', { ...resetFilters });

  // Emitir un evento de reset para que los componentes padres puedan realizar acciones adicionales
  emit('reset');

  // Restablecer el valor de perPage a su valor por defecto y emitir el evento
  // Importante: Esto debe hacerse después de emitir los eventos de filtros
  // para que el componente padre pueda manejar correctamente el cambio
  const currentPerPage = Number(localPerPage.value);
  const defaultPerPage = Number(props.perPage);

  if (currentPerPage !== defaultPerPage) {
    localPerPage.value = defaultPerPage;
    emit('update:perPage', defaultPerPage);
    emit('per-page-change', defaultPerPage);
  }
};

// Watch for changes in props
watch(() => props.perPage, (newValue) => {
  // Asegurarse de que el nuevo valor sea un número
  localPerPage.value = Number(newValue);
});

watch(() => props.filters, (newValue) => {
  Object.keys(newValue).forEach(key => {
    localFilters[key] = newValue[key];
  });
}, { deep: true });

// Initialize
onMounted(() => {
  // Set initial sort key and order
  sortKey.value = props.initialSortKey;
  sortOrder.value = props.initialSortOrder;

  // Set initial per page (asegurarse de que sea un número)
  localPerPage.value = Number(props.perPage);

  // Initialize sort filters if they don't exist
  if (!localFilters.sort_field) {
    // @ts-ignore - Adding new properties to reactive object
    localFilters.sort_field = sortKey.value || 'name';
  }

  if (!localFilters.sort_direction) {
    // @ts-ignore - Adding new properties to reactive object
    localFilters.sort_direction = sortOrder.value || 'asc';
  }
});
</script>
