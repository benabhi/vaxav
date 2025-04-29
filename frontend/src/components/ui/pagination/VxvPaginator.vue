<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <!-- Mobile pagination -->
    <div class="flex justify-between sm:hidden">
      <button
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
        :class="[
          'relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600',
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        Anterior
      </button>
      <button
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
        :class="[
          'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600',
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        Siguiente
      </button>
    </div>
    
    <!-- Desktop pagination -->
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <!-- Info text -->
      <div v-if="showInfo">
        <p class="text-sm text-gray-300">
          Mostrando 
          <span class="font-medium">{{ from }}</span> 
          a 
          <span class="font-medium">{{ to }}</span> 
          de 
          <span class="font-medium">{{ total }}</span> 
          {{ itemName }}
        </p>
      </div>
      <div v-else></div>
      
      <!-- Page buttons -->
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Previous button -->
          <button
            :disabled="currentPage === 1"
            @click="$emit('page-change', currentPage - 1)"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600',
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <span class="sr-only">Anterior</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- First page (if not in visible range) -->
          <template v-if="showFirstEllipsis">
            <button
              @click="$emit('page-change', 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600"
            >
              1
            </button>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300">
              ...
            </span>
          </template>
          
          <!-- Page numbers -->
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            @click="$emit('page-change', page)"
            :class="[
              'relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium',
              page === currentPage
                ? 'bg-gray-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
          
          <!-- Last page (if not in visible range) -->
          <template v-if="showLastEllipsis">
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300">
              ...
            </span>
            <button
              @click="$emit('page-change', totalPages)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600"
            >
              {{ totalPages }}
            </button>
          </template>
          
          <!-- Next button -->
          <button
            :disabled="currentPage === totalPages"
            @click="$emit('page-change', currentPage + 1)"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600',
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <span class="sr-only">Siguiente</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define props
const props = defineProps({
  /**
   * Current page number
   */
  currentPage: {
    type: Number,
    required: true
  },
  /**
   * Total number of pages
   */
  totalPages: {
    type: Number,
    required: true
  },
  /**
   * Total number of items
   */
  total: {
    type: Number,
    default: 0
  },
  /**
   * Number of items per page
   */
  perPage: {
    type: Number,
    default: 10
  },
  /**
   * Maximum number of page buttons to show
   */
  maxVisibleButtons: {
    type: Number,
    default: 5
  },
  /**
   * Whether to show the info text
   */
  showInfo: {
    type: Boolean,
    default: true
  },
  /**
   * Name of the items being paginated (e.g., "usuarios", "roles")
   */
  itemName: {
    type: String,
    default: 'elementos'
  }
});

// Define emits
const emit = defineEmits(['page-change']);

// Calculate the range of items being displayed
const from = computed(() => {
  if (props.total === 0) return 0;
  return (props.currentPage - 1) * props.perPage + 1;
});

const to = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(props.currentPage * props.perPage, props.total);
});

// Calculate visible page numbers
const visiblePageNumbers = computed(() => {
  if (props.totalPages <= props.maxVisibleButtons) {
    // If total pages is less than max visible buttons, show all pages
    return Array.from({ length: props.totalPages }, (_, i) => i + 1);
  }

  // Calculate the range of visible page numbers
  const halfVisible = Math.floor(props.maxVisibleButtons / 2);
  let startPage = Math.max(props.currentPage - halfVisible, 1);
  let endPage = Math.min(startPage + props.maxVisibleButtons - 1, props.totalPages);

  // Adjust if we're near the end
  if (endPage === props.totalPages) {
    startPage = Math.max(endPage - props.maxVisibleButtons + 1, 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
});

// Determine if ellipsis should be shown
const showFirstEllipsis = computed(() => {
  return visiblePageNumbers.value[0] > 1;
});

const showLastEllipsis = computed(() => {
  return visiblePageNumbers.value[visiblePageNumbers.value.length - 1] < props.totalPages;
});
</script>
