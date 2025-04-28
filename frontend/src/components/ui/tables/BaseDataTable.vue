<template>
  <div>
    <!-- Header section with title and create button -->
    <div v-if="showHeader" class="flex justify-between items-center mb-4">
      <h2 v-if="title" class="text-xl font-bold text-white">{{ title }}</h2>
      <div v-else></div>

      <button
        v-if="showCreateButton"
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
        @click="$emit('create')"
      >
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        {{ createButtonLabel }}
      </button>
    </div>

    <!-- Filters section -->
    <BaseFilters
      v-if="showFilters"
      v-model:filters="localFilters"
      :show-search="showSearch"
      :search-label="searchLabel"
      :search-placeholder="searchPlaceholder"
      :immediate="immediateSearch"
      @filter-change="handleFilterChange"
      @reset="handleFilterReset"
    >
      <template #filters>
        <!-- Per page selector -->
        <div v-if="showPerPage" class="w-full md:w-auto">
          <label :for="`${id}-per-page`" class="block text-sm font-medium text-gray-300 mb-1">
            {{ perPageLabel }}
          </label>
          <select
            :id="`${id}-per-page`"
            v-model="localPerPage"
            class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
            @change="handlePerPageChange"
          >
            <option v-for="option in perPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Custom filter slots -->
        <slot name="filters"></slot>
      </template>
    </BaseFilters>

    <!-- Table section -->
    <BaseTable
      :columns="columns"
      :items="items"
      :loading="loading"
      :row-key="rowKey"
      :row-class="rowClass"
      :clickable="clickable"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      @sort="handleSort"
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
    </BaseTable>

    <!-- Pagination section -->
    <div v-if="showPagination" class="mt-4">
      <BasePaginator
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
import BaseTable from './BaseTable.vue';
import BasePaginator from '../pagination/BasePaginator.vue';
import BaseFilters from '../filters/BaseFilters.vue';

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
  'delete'
]);

// Local state
const sortKey = ref(props.initialSortKey);
const sortOrder = ref(props.initialSortOrder);
const localFilters = reactive({ ...props.filters });
const localPerPage = ref(props.perPage);

// Handle sort
const handleSort = (key: string) => {
  if (sortKey.value === key) {
    // Toggle sort order if the same key is clicked
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort key and reset sort order to asc
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  emit('update:sortKey', sortKey.value);
  emit('update:sortOrder', sortOrder.value);
  emit('sort-change', { key: sortKey.value, order: sortOrder.value });
};

// Handle page change
const handlePageChange = (page: number) => {
  emit('update:currentPage', page);
  emit('page-change', page);
};

// Handle per page change
const handlePerPageChange = () => {
  emit('update:perPage', localPerPage.value);
  emit('per-page-change', localPerPage.value);
};

// Handle filter change
const handleFilterChange = (filters: any) => {
  emit('update:filters', filters);
  emit('filter-change', filters);
};

// Handle filter reset
const handleFilterReset = () => {
  emit('update:filters', { search: '' });
  emit('filter-change', { search: '' });
};

// Watch for changes in props
watch(() => props.perPage, (newValue) => {
  localPerPage.value = newValue;
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

  // Set initial per page
  localPerPage.value = props.perPage;
});
</script>
