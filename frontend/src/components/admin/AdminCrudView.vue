<template>
  <AdminLayout :title="title">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="breadcrumbItems"
        :home-link="homeLink"
      />
    </template>

    <div class="py-6 overflow-hidden w-full">
      <VxvDataTable
        :title="tableTitle"
        :columns="columns"
        :items="items"
        :loading="loading"
        :total="total"
        :total-pages="pagination.totalPages"
        :current-page="pagination.currentPage"
        :per-page="pagination.perPage"
        :filters="filters"
        :create-button-label="createButtonLabel"
        :search-placeholder="searchPlaceholder"
        :item-name="itemName"
        :show-create-button="showCreateButton"
        :show-filter-labels="showFilterLabels"
        @page-change="onPageChange"
        @per-page-change="onPerPageChange"
        @filter-change="onFilterChange"
        @sort-change="onSortChange"
        @create="onCreateItem"
        @row-click="onRowClick"
      >
        <!-- Pasar todos los slots -->
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps"></slot>
        </template>
      </VxvDataTable>
    </div>

    <slot name="modals"></slot>
  </AdminLayout>
</template>

<script setup>
import { computed } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvDataTable from '@/components/ui/tables/VxvDataTable.vue';

const props = defineProps({
  /**
   * Título de la página
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Título de la tabla
   */
  tableTitle: {
    type: String,
    required: true
  },

  /**
   * Elementos para el breadcrumb
   */
  breadcrumbItems: {
    type: Array,
    default: () => []
  },

  /**
   * Enlace a la página de inicio
   */
  homeLink: {
    type: String,
    default: '/admin'
  },

  /**
   * Definición de columnas para la tabla
   */
  columns: {
    type: Array,
    required: true
  },

  /**
   * Elementos a mostrar en la tabla
   */
  items: {
    type: Array,
    required: true
  },

  /**
   * Estado de carga
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * Número total de elementos
   */
  total: {
    type: Number,
    default: 0
  },

  /**
   * Objeto de paginación
   */
  pagination: {
    type: Object,
    required: true
  },

  /**
   * Objeto de filtros
   */
  filters: {
    type: Object,
    required: true
  },

  /**
   * Etiqueta para el botón de crear
   */
  createButtonLabel: {
    type: String,
    default: 'Crear nuevo'
  },

  /**
   * Placeholder para el campo de búsqueda
   */
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },

  /**
   * Nombre de los elementos (para mensajes)
   */
  itemName: {
    type: String,
    required: true
  },

  /**
   * Si se debe mostrar el botón de crear
   */
  showCreateButton: {
    type: Boolean,
    default: true
  },

  /**
   * Si se deben mostrar las etiquetas de los filtros en una fila separada
   */
  showFilterLabels: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'page-change',
  'per-page-change',
  'filter-change',
  'sort-change',
  'create',
  'row-click'
]);

/**
 * Maneja el cambio de página
 */
const onPageChange = (page) => emit('page-change', page);

/**
 * Maneja el cambio de elementos por página
 */
const onPerPageChange = (perPage) => emit('per-page-change', perPage);

/**
 * Maneja el cambio de filtros
 */
const onFilterChange = (filters) => emit('filter-change', filters);

/**
 * Maneja el cambio de ordenación
 */
const onSortChange = (sort) => emit('sort-change', sort);

/**
 * Maneja el clic en el botón de crear
 */
const onCreateItem = () => emit('create');

/**
 * Maneja el clic en una fila
 */
const onRowClick = (item) => emit('row-click', item);
</script>
