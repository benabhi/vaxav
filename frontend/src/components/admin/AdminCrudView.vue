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
        @reset="onReset"
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
  'row-click',
  'reset'
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

/**
 * Maneja el evento de reset de filtros
 * Restablece todos los filtros y la paginación a su estado por defecto
 */
const onReset = () => {
  console.log('Evento reset recibido en AdminCrudView');

  // Restablecer todos los filtros a su estado por defecto
  Object.keys(props.filters).forEach(key => {
    if (key !== 'sort_field' && key !== 'sort_direction') {
      if (typeof props.filters[key] === 'string') {
        props.filters[key] = '';
      } else if (Array.isArray(props.filters[key])) {
        props.filters[key] = [];
      } else if (typeof props.filters[key] === 'object' && props.filters[key] !== null) {
        props.filters[key] = {};
      } else if (typeof props.filters[key] === 'number') {
        props.filters[key] = 0;
      } else if (typeof props.filters[key] === 'boolean') {
        props.filters[key] = false;
      }
    }
  });

  // Restablecer la paginación a su estado por defecto
  props.pagination.currentPage = 1;
  props.pagination.perPage = 10; // Valor por defecto

  console.log('Filtros restablecidos en AdminCrudView:', props.filters);
  console.log('Paginación restablecida en AdminCrudView:', props.pagination);

  // Emitir el evento reset para que los componentes padres puedan realizar acciones adicionales
  emit('reset');

  // Emitir eventos de cambio para asegurar que los componentes padres actualicen sus datos
  emit('filter-change', props.filters);
  emit('per-page-change', props.pagination.perPage);
};
</script>
