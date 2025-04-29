<template>
  <div class="overflow-x-auto rounded-lg">
    <div class="w-full align-middle">
      <div class="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
        <table class="w-full min-w-[800px] divide-y divide-gray-700">
          <thead class="bg-gray-800">
            <tr>
              <th
              v-for="(column, index) in columns"
              :key="index"
              scope="col"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap',
                column.class || '',
                column.sortable ? 'cursor-pointer' : ''
              ]"
              :style="column.width ? { width: column.width } : {}"
              @click="column.sortable ? $emit('sort', column.key) : null"
            >
              <div class="flex items-center group">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="ml-1">
                  <template v-if="sortKey === column.key">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </template>
                  <svg v-else class="w-4 h-4 opacity-30 group-hover:opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4"></path>
                  </svg>
                </span>
              </div>
              </th>
              <th v-if="$slots.actions" scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-if="loading">
              <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-4 text-center text-sm text-gray-300">
                <slot name="loading">
                  Cargando...
                </slot>
              </td>
            </tr>
            <tr v-else-if="!items || items.length === 0">
              <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-4 text-center text-sm text-gray-300">
                <slot name="empty">
                  No se encontraron resultados
                </slot>
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="(item, rowIndex) in items"
                :key="rowKey ? item[rowKey] : rowIndex"
                :class="[
                  'hover:bg-gray-700',
                  rowClass ? (typeof rowClass === 'function' ? rowClass(item, rowIndex) : rowClass) : '',
                  { 'cursor-pointer': clickable }
                ]"
                @click="clickable ? $emit('row-click', item) : null"
              >
                <td
                  v-for="(column, colIndex) in columns"
                  :key="colIndex"
                  :class="[
                    'px-6 py-4',
                    column.tdClass || '',
                    { 'whitespace-nowrap': column.nowrap !== false }
                  ]"
                >
                  <slot :name="`cell(${column.key})`" :item="item" :value="getValue(item, column.key)" :index="rowIndex">
                    <div v-if="column.html" v-html="getValue(item, column.key)"></div>
                    <template v-else>{{ getValue(item, column.key) }}</template>
                  </slot>
                </td>
                <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <slot name="actions" :item="item" :index="rowIndex"></slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define props
const props = defineProps({
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
    default: null
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
   * Current sort key
   */
  sortKey: {
    type: String,
    default: null
  },
  /**
   * Current sort order
   */
  sortOrder: {
    type: String,
    default: 'asc',
    validator: (value: string) => ['asc', 'desc'].includes(value)
  }
});

// Define emits
const emit = defineEmits(['sort', 'row-click']);

/**
 * Get value from item by key
 * Supports nested keys with dot notation (e.g. 'user.name')
 */
const getValue = (item: any, key: string) => {
  if (!item || !key) return '';

  // Handle nested keys (e.g. 'user.name')
  if (key.includes('.')) {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : '', item);
  }

  return item[key] !== undefined ? item[key] : '';
};
</script>
