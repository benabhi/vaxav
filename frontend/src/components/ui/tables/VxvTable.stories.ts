import type { Meta, StoryObj } from '@storybook/vue3';
import VxvTable from './VxvTable.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvTable es un componente para mostrar datos tabulares con opciones de ordenación, 
 * personalización de celdas y acciones por fila.
 */
const meta: Meta<typeof VxvTable> = {
  title: 'UI/Tables/VxvTable',
  component: VxvTable,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      description: 'Array de definiciones de columnas',
      control: { type: 'object' },
    },
    items: {
      description: 'Array de elementos a mostrar',
      control: { type: 'object' },
    },
    rowKey: {
      description: 'Nombre de la propiedad a usar como clave única para las filas',
      control: { type: 'text' },
    },
    loading: {
      description: 'Indica si la tabla está en estado de carga',
      control: { type: 'boolean' },
    },
    clickable: {
      description: 'Indica si las filas son clickeables',
      control: { type: 'boolean' },
    },
    sortKey: {
      description: 'Clave de ordenación actual',
      control: { type: 'text' },
    },
    sortOrder: {
      description: 'Orden de ordenación actual',
      control: { type: 'select' },
      options: ['asc', 'desc'],
    },
    onSort: { action: 'sort' },
    onRowClick: { action: 'row-click' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvTable>;

// Datos de ejemplo
const sampleColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
];

const sampleItems = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Administrador', status: 'Activo' },
  { id: 2, name: 'María García', email: 'maria@example.com', role: 'Editor', status: 'Activo' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Usuario', status: 'Inactivo' },
  { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Editor', status: 'Activo' },
  { id: 5, name: 'Roberto Sánchez', email: 'roberto@example.com', role: 'Usuario', status: 'Pendiente' },
];

/**
 * Tabla básica con datos
 */
export const Default: Story = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: '<vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick" />',
  }),
};

/**
 * Tabla con ordenación activa
 */
export const WithSorting: Story = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: 'name',
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: '<vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick" />',
  }),
};

/**
 * Tabla con filas clickeables
 */
export const ClickableRows: Story = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    rowKey: 'id',
    loading: false,
    clickable: true,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: '<vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick" />',
  }),
};

/**
 * Tabla en estado de carga
 */
export const Loading: Story = {
  args: {
    columns: sampleColumns,
    items: [],
    rowKey: 'id',
    loading: true,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: '<vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick" />',
  }),
};

/**
 * Tabla sin datos
 */
export const Empty: Story = {
  args: {
    columns: sampleColumns,
    items: [],
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: '<vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick" />',
  }),
};

/**
 * Tabla con mensaje personalizado cuando está vacía
 */
export const CustomEmptyMessage: Story = {
  args: {
    columns: sampleColumns,
    items: [],
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: `
      <vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick">
        <template #empty>
          <div class="py-2">
            <p>No hay datos disponibles.</p>
            <p class="text-blue-400 mt-1">Intente con otros criterios de búsqueda.</p>
          </div>
        </template>
      </vxv-table>
    `,
  }),
};

/**
 * Tabla con acciones por fila
 */
export const WithActions: Story = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable, VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick">
        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-table>
    `,
  }),
};

/**
 * Tabla con celdas personalizadas
 */
export const CustomCells: Story = {
  args: {
    columns: sampleColumns,
    items: sampleItems,
    rowKey: 'id',
    loading: false,
    clickable: false,
    sortKey: null,
    sortOrder: 'asc',
  },
  render: (args) => ({
    components: { VxvTable },
    setup() {
      return { args };
    },
    template: `
      <vxv-table v-bind="args" @sort="args.onSort" @row-click="args.onRowClick">
        <template #cell(status)="{ value }">
          <span :class="{
            'px-2 py-1 rounded-full text-xs font-medium': true,
            'bg-green-900 text-green-200': value === 'Activo',
            'bg-red-900 text-red-200': value === 'Inactivo',
            'bg-yellow-900 text-yellow-200': value === 'Pendiente'
          }">
            {{ value }}
          </span>
        </template>
        <template #cell(email)="{ value }">
          <a :href="'mailto:' + value" class="text-blue-400 hover:underline">{{ value }}</a>
        </template>
      </vxv-table>
    `,
  }),
};
