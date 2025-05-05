import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvDataTable from './VxvDataTable.vue';
import VxvButton from '../buttons/VxvButton.vue';
import VxvBadge from '../feedback/VxvBadge.vue';

/**
 * VxvDataTable es un componente completo para mostrar datos tabulares con funcionalidades
 * de filtrado, ordenación, paginación y acciones por fila.
 */
const meta: Meta<typeof VxvDataTable> = {
  title: 'UI/Tables/VxvDataTable',
  component: VxvDataTable,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título de la tabla',
      control: { type: 'text' },
    },
    showHeader: {
      description: 'Muestra la sección de encabezado',
      control: { type: 'boolean' },
    },
    showCreateButton: {
      description: 'Muestra el botón de crear',
      control: { type: 'boolean' },
    },
    createButtonLabel: {
      description: 'Etiqueta del botón de crear',
      control: { type: 'text' },
    },
    columns: {
      description: 'Array de definiciones de columnas',
      control: { type: 'object' },
    },
    items: {
      description: 'Array de elementos a mostrar',
      control: { type: 'object' },
    },
    rowKey: {
      description: 'Propiedad a usar como clave única para las filas',
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
    showFilters: {
      description: 'Muestra la sección de filtros',
      control: { type: 'boolean' },
    },
    showSearch: {
      description: 'Muestra el campo de búsqueda',
      control: { type: 'boolean' },
    },
    showPagination: {
      description: 'Muestra la sección de paginación',
      control: { type: 'boolean' },
    },
    showPerPage: {
      description: 'Muestra el selector de elementos por página',
      control: { type: 'boolean' },
    },
    showFilterLabels: {
      description: 'Muestra las etiquetas de los filtros',
      control: { type: 'boolean' },
    },
    onCreate: { action: 'create' },
    onRowClick: { action: 'row-click' },
    onPageChange: { action: 'page-change' },
    onPerPageChange: { action: 'per-page-change' },
    onSortChange: { action: 'sort-change' },
    onFilterChange: { action: 'filter-change' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvDataTable>;

// Datos de ejemplo
const sampleColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false },
];

const sampleItems = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const roles = ['Administrador', 'Editor', 'Usuario'];
  const statuses = ['Activo', 'Inactivo', 'Pendiente'];

  return {
    id,
    name: `Usuario ${id}`,
    email: `usuario${id}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
});

/**
 * DataTable básica
 */
export const Default: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    showFilterLabels: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton, VxvBadge },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable con celdas personalizadas
 */
export const CustomCells: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton, VxvBadge },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #cell(email)="{ value }">
          <a :href="'mailto:' + value" class="text-blue-400 hover:underline">{{ value }}</a>
        </template>

        <template #cell(status)="{ value }">
          <vxv-badge
            :variant="
              value === 'Activo' ? 'success' :
              value === 'Inactivo' ? 'danger' :
              'warning'
            "
          >
            {{ value }}
          </vxv-badge>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable en estado de carga
 */
export const Loading: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: [],
    rowKey: 'id',
    loading: true,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #loading>
          <div class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-300">Cargando usuarios...</p>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable sin datos
 */
export const Empty: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: [],
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #empty>
          <div class="py-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-300">No hay usuarios</h3>
            <p class="mt-1 text-sm text-gray-400">Comienza creando un nuevo usuario.</p>
            <div class="mt-6">
              <vxv-button variant="primary" @click="args.onCreate">
                <template #prefix>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </template>
                Crear usuario
              </vxv-button>
            </div>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable con filas clickeables
 */
export const ClickableRows: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns.filter(col => col.key !== 'actions'),
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: true,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvBadge },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #cell(status)="{ value }">
          <vxv-badge
            :variant="
              value === 'Activo' ? 'success' :
              value === 'Inactivo' ? 'danger' :
              'warning'
            "
          >
            {{ value }}
          </vxv-badge>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable sin filtros
 */
export const WithoutFilters: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: false,
    showSearch: false,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="args.onFilterChange"
      >
        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable con valores por defecto para filtros
 */
export const WithDefaultFilters: Story = {
  args: {
    title: 'Usuarios con filtros por defecto',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
    filters: {
      search: '',
      role: 'Administrador',
      status: 'Activo'
    },
    defaultFilters: {
      search: '',
      role: 'Usuario', // Valor por defecto diferente al inicial
      status: 'Activo' // Valor por defecto igual al inicial
    }
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton, VxvBadge },
    setup() {
      const filters = ref({
        search: args.filters.search,
        role: args.filters.role,
        status: args.filters.status
      });

      const handleFilterChange = (newFilters) => {
        Object.assign(filters.value, newFilters);
        args.onFilterChange(filters.value);
      };

      return {
        args,
        filters,
        handleFilterChange
      };
    },
    template: `
      <div>
        <div class="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 class="text-white font-medium mb-2">Instrucciones:</h3>
          <p class="text-gray-300">
            Este ejemplo muestra cómo funcionan los valores por defecto al restablecer los filtros.
            <br>
            - El filtro "Rol" tiene un valor inicial "Administrador", pero al restablecer volverá a "Usuario".
            <br>
            - El filtro "Estado" tiene un valor inicial "Activo" y también un valor por defecto "Activo".
            <br>
            - Prueba a cambiar los filtros y luego presiona el botón "Restablecer".
          </p>
        </div>

        <vxv-data-table
          v-bind="args"
          :filters="filters"
          @create="args.onCreate"
          @row-click="args.onRowClick"
          @page-change="args.onPageChange"
          @per-page-change="args.onPerPageChange"
          @sort-change="args.onSortChange"
          @filter-change="handleFilterChange"
        >
          <template #filters>
            <div class="w-full md:w-auto">
              <label class="block text-sm text-gray-300 mb-1">Rol</label>
              <select v-model="filters.role" class="w-full md:w-auto bg-gray-700 text-white border border-gray-600 rounded-md py-1.5 pl-3 pr-10 text-sm">
                <option value="">Todos</option>
                <option value="Administrador">Administrador</option>
                <option value="Editor">Editor</option>
                <option value="Usuario">Usuario</option>
              </select>
            </div>

            <div class="w-full md:w-auto">
              <label class="block text-sm text-gray-300 mb-1">Estado</label>
              <select v-model="filters.status" class="w-full md:w-auto bg-gray-700 text-white border border-gray-600 rounded-md py-1.5 pl-3 pr-10 text-sm">
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </template>

          <template #cell(status)="{ value }">
            <vxv-badge
              :variant="
                value === 'Activo' ? 'success' :
                value === 'Inactivo' ? 'danger' :
                'warning'
              "
            >
              {{ value }}
            </vxv-badge>
          </template>

          <template #actions="{ item }">
            <div class="flex space-x-2">
              <vxv-button size="sm" variant="info">Ver</vxv-button>
              <vxv-button size="sm" variant="warning">Editar</vxv-button>
              <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
            </div>
          </template>
        </vxv-data-table>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Valores por defecto:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(args.defaultFilters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * DataTable con filtros personalizados
 */
export const CustomFilters: Story = {
  args: {
    title: 'Usuarios',
    showHeader: true,
    showCreateButton: true,
    createButtonLabel: 'Crear usuario',
    columns: sampleColumns,
    items: sampleItems.slice(0, 10),
    rowKey: 'id',
    loading: false,
    clickable: false,
    showFilters: true,
    showSearch: true,
    showPagination: true,
    showPerPage: true,
    currentPage: 1,
    totalPages: 3,
    total: 25,
    perPage: 10,
  },
  render: (args) => ({
    components: { VxvDataTable, VxvButton },
    setup() {
      const filters = ref({
        search: '',
        role: '',
        status: ''
      });

      return {
        args,
        filters
      };
    },
    template: `
      <vxv-data-table
        v-bind="args"
        :filters="filters"
        @create="args.onCreate"
        @row-click="args.onRowClick"
        @page-change="args.onPageChange"
        @per-page-change="args.onPerPageChange"
        @sort-change="args.onSortChange"
        @filter-change="(newFilters) => {
          filters = { ...filters, ...newFilters };
          args.onFilterChange(filters);
        }"
      >
        <template #filters>
          <div class="w-full md:w-auto">
            <label class="block text-sm text-gray-300 mb-1">Rol</label>
            <select v-model="filters.role" class="w-full md:w-auto bg-gray-700 text-white border border-gray-600 rounded-md py-1.5 pl-3 pr-10 text-sm">
              <option value="">Todos</option>
              <option value="Administrador">Administrador</option>
              <option value="Editor">Editor</option>
              <option value="Usuario">Usuario</option>
            </select>
          </div>

          <div class="w-full md:w-auto">
            <label class="block text-sm text-gray-300 mb-1">Estado</label>
            <select v-model="filters.status" class="w-full md:w-auto bg-gray-700 text-white border border-gray-600 rounded-md py-1.5 pl-3 pr-10 text-sm">
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};

/**
 * DataTable interactiva
 */
export const Interactive: Story = {
  render: () => ({
    components: { VxvDataTable, VxvButton, VxvBadge },
    setup() {
      const currentPage = ref(1);
      const perPage = ref(10);
      const filters = ref({
        search: '',
        sort_field: 'name',
        sort_direction: 'asc'
      });

      // Filtrar y paginar los datos
      const filteredItems = computed(() => {
        let result = [...sampleItems];

        // Aplicar búsqueda
        if (filters.value.search) {
          const search = filters.value.search.toLowerCase();
          result = result.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.email.toLowerCase().includes(search) ||
            item.role.toLowerCase().includes(search) ||
            item.status.toLowerCase().includes(search)
          );
        }

        // Aplicar ordenación
        if (filters.value.sort_field) {
          result.sort((a, b) => {
            const aValue = a[filters.value.sort_field];
            const bValue = b[filters.value.sort_field];

            if (filters.value.sort_direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        return result;
      });

      const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * perPage.value;
        const end = start + perPage.value;
        return filteredItems.value.slice(start, end);
      });

      const totalPages = computed(() => {
        return Math.ceil(filteredItems.value.length / perPage.value) || 1;
      });

      // Manejadores de eventos
      const handlePageChange = (page) => {
        currentPage.value = page;
      };

      const handlePerPageChange = (value) => {
        perPage.value = value;
        currentPage.value = 1; // Reset to first page
      };

      const handleFilterChange = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters };
        currentPage.value = 1; // Reset to first page
      };

      const handleSortChange = ({ key, order }) => {
        filters.value.sort_field = key;
        filters.value.sort_direction = order;
      };

      const handleRowClick = (item) => {
        alert(`Clicked on user: ${item.name}`);
      };

      const handleCreate = () => {
        alert('Create new user clicked');
      };

      return {
        currentPage,
        perPage,
        filters,
        paginatedItems,
        filteredItems,
        totalPages,
        handlePageChange,
        handlePerPageChange,
        handleFilterChange,
        handleSortChange,
        handleRowClick,
        handleCreate,
        sampleColumns
      };
    },
    template: `
      <vxv-data-table
        title="Usuarios"
        :columns="sampleColumns"
        :items="paginatedItems"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="filteredItems.length"
        :per-page="perPage"
        :filters="filters"
        row-key="id"
        :clickable="true"
        @create="handleCreate"
        @row-click="handleRowClick"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
      >
        <template #cell(email)="{ value }">
          <a :href="'mailto:' + value" class="text-blue-400 hover:underline">{{ value }}</a>
        </template>

        <template #cell(status)="{ value }">
          <vxv-badge
            :variant="
              value === 'Activo' ? 'success' :
              value === 'Inactivo' ? 'danger' :
              'warning'
            "
          >
            {{ value }}
          </vxv-badge>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <vxv-button size="sm" variant="info">Ver</vxv-button>
            <vxv-button size="sm" variant="warning">Editar</vxv-button>
            <vxv-button size="sm" variant="danger">Eliminar</vxv-button>
          </div>
        </template>
      </vxv-data-table>
    `,
  }),
};
