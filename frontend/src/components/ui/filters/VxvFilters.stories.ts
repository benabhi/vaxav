import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvFilters from './VxvFilters.vue';
import VxvInput from '../forms/VxvInput.vue';
import VxvSelect from '../forms/VxvSelect.vue';
import VxvCheckbox from '../forms/VxvCheckbox.vue';
import VxvRange from '../forms/VxvRange.vue';

/**
 * VxvFilters es un componente que proporciona una interfaz para filtrar datos.
 * Incluye un campo de búsqueda y slots para filtros personalizados.
 */
const meta: Meta<typeof VxvFilters> = {
  title: 'UI/Filters/VxvFilters',
  component: VxvFilters,
  tags: ['autodocs'],
  argTypes: {
    id: {
      description: 'Identificador único para el componente',
      control: { type: 'text' },
    },
    filters: {
      description: 'Filtros iniciales',
      control: { type: 'object' },
    },
    showSearch: {
      description: 'Muestra el campo de búsqueda',
      control: { type: 'boolean' },
    },
    searchLabel: {
      description: 'Etiqueta para el campo de búsqueda',
      control: { type: 'text' },
    },
    searchPlaceholder: {
      description: 'Placeholder para el campo de búsqueda',
      control: { type: 'text' },
    },
    showApply: {
      description: 'Muestra el botón de aplicar',
      control: { type: 'boolean' },
    },
    applyLabel: {
      description: 'Etiqueta para el botón de aplicar',
      control: { type: 'text' },
    },
    showReset: {
      description: 'Muestra el botón de restablecer',
      control: { type: 'boolean' },
    },
    resetLabel: {
      description: 'Etiqueta para el botón de restablecer',
      control: { type: 'text' },
    },
    showLabels: {
      description: 'Muestra las etiquetas de los filtros',
      control: { type: 'boolean' },
    },
    debounce: {
      description: 'Tiempo de debounce para el campo de búsqueda en milisegundos',
      control: { type: 'number' },
    },
    immediate: {
      description: 'Emite cambios inmediatamente',
      control: { type: 'boolean' },
    },
    onFilterChange: { action: 'filter-change' },
    onReset: { action: 'reset' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvFilters>;

/**
 * Filtros básicos con búsqueda
 */
export const Default: Story = {
  args: {
    id: 'basic-filters',
    filters: { search: '' },
    showSearch: true,
    searchLabel: 'Búsqueda',
    searchPlaceholder: 'Buscar...',
    showApply: true,
    applyLabel: 'Aplicar',
    showReset: true,
    resetLabel: 'Restablecer',
    showLabels: true,
    debounce: 300,
    immediate: false,
  },
  render: (args) => ({
    components: { VxvFilters },
    setup() {
      const filters = ref({ ...args.filters });

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        args.onFilterChange(newFilters);
      };

      return {
        args,
        filters,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
          @reset="args.onReset"
        />

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Filtros sin búsqueda
 */
export const WithoutSearch: Story = {
  args: {
    id: 'no-search-filters',
    filters: {},
    showSearch: false,
    showApply: true,
    applyLabel: 'Aplicar',
    showReset: true,
    resetLabel: 'Restablecer',
    showLabels: true,
    debounce: 300,
    immediate: false,
  },
  render: (args) => ({
    components: { VxvFilters, VxvSelect },
    setup() {
      const filters = ref({
        status: '',
        category: ''
      });

      const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' }
      ];

      const categoryOptions = [
        { value: '', label: 'Todas las categorías' },
        { value: 'technology', label: 'Tecnología' },
        { value: 'finance', label: 'Finanzas' },
        { value: 'health', label: 'Salud' },
        { value: 'education', label: 'Educación' }
      ];

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        args.onFilterChange(newFilters);
      };

      return {
        args,
        filters,
        statusOptions,
        categoryOptions,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
          @reset="args.onReset"
        >
          <template #filters>
            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Estado
              </label>
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.status"
                  :label="args.showLabels ? '' : 'Estado'"
                  :options="statusOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.status"
                  @click="filters.status = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Categoría
              </label>
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.category"
                  :label="args.showLabels ? '' : 'Categoría'"
                  :options="categoryOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.category"
                  @click="filters.category = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </VxvFilters>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Filtros con búsqueda y filtros personalizados
 */
export const WithCustomFilters: Story = {
  args: {
    id: 'custom-filters',
    filters: { search: '' },
    showSearch: true,
    searchLabel: 'Búsqueda',
    searchPlaceholder: 'Buscar usuarios...',
    showApply: true,
    applyLabel: 'Aplicar filtros',
    showReset: true,
    resetLabel: 'Limpiar filtros',
    showLabels: true,
    debounce: 300,
    immediate: false,
  },
  render: (args) => ({
    components: { VxvFilters, VxvSelect, VxvCheckbox },
    setup() {
      const filters = ref({
        search: '',
        role: '',
        status: '',
        active: false
      });

      const roleOptions = [
        { value: '', label: 'Todos los roles' },
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'user', label: 'Usuario' }
      ];

      const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' }
      ];

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        args.onFilterChange(newFilters);
      };

      return {
        args,
        filters,
        roleOptions,
        statusOptions,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
          @reset="args.onReset"
        >
          <template #filters>
            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Rol
              </label>
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.role"
                  :label="args.showLabels ? '' : 'Rol'"
                  :options="roleOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.role"
                  @click="filters.role = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Estado
              </label>
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.status"
                  :label="args.showLabels ? '' : 'Estado'"
                  :options="statusOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.status"
                  @click="filters.status = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex-shrink-0 self-end">
              <VxvCheckbox
                v-model="filters.active"
                label="Solo activos"
              />
            </div>
          </template>
        </VxvFilters>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Filtros con cambios inmediatos
 */
export const WithImmediateChanges: Story = {
  args: {
    id: 'immediate-filters',
    filters: { search: '' },
    showSearch: true,
    searchLabel: 'Búsqueda',
    searchPlaceholder: 'Buscar...',
    showApply: false,
    showReset: true,
    resetLabel: 'Restablecer',
    showLabels: true,
    debounce: 300,
    immediate: true,
  },
  render: (args) => ({
    components: { VxvFilters, VxvSelect, VxvRange },
    setup() {
      const filters = ref({
        search: '',
        category: '',
        priceRange: 50
      });

      const categoryOptions = [
        { value: '', label: 'Todas las categorías' },
        { value: 'electronics', label: 'Electrónica' },
        { value: 'clothing', label: 'Ropa' },
        { value: 'books', label: 'Libros' },
        { value: 'home', label: 'Hogar' }
      ];

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        args.onFilterChange(newFilters);
      };

      return {
        args,
        filters,
        categoryOptions,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
          @reset="args.onReset"
        >
          <template #filters>
            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Categoría
              </label>
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.category"
                  :label="args.showLabels ? '' : 'Categoría'"
                  :options="categoryOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.category"
                  @click="filters.category = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="w-[180px] flex-shrink-0">
              <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                Precio máximo
              </label>
              <VxvRange
                v-model="filters.priceRange"
                :label="args.showLabels ? '' : 'Precio máximo'"
                :min="0"
                :max="100"
                :step="1"
                show-value
                class="w-full"
              />
            </div>
          </template>
        </VxvFilters>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados (actualizados inmediatamente):</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Filtros sin etiquetas
 */
export const WithoutLabels: Story = {
  args: {
    id: 'no-labels-filters',
    filters: { search: '' },
    showSearch: true,
    searchLabel: 'Búsqueda',
    searchPlaceholder: 'Buscar...',
    showApply: true,
    applyLabel: 'Aplicar',
    showReset: true,
    resetLabel: 'Restablecer',
    showLabels: false,
    debounce: 300,
    immediate: false,
  },
  render: (args) => ({
    components: { VxvFilters, VxvSelect },
    setup() {
      const filters = ref({
        search: '',
        role: '',
        status: ''
      });

      const roleOptions = [
        { value: '', label: 'Todos los roles' },
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'user', label: 'Usuario' }
      ];

      const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' }
      ];

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        args.onFilterChange(newFilters);
      };

      return {
        args,
        filters,
        roleOptions,
        statusOptions,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
          @reset="args.onReset"
        >
          <template #filters>
            <div class="w-[180px] flex-shrink-0">
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.role"
                  label="Rol"
                  :options="roleOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.role"
                  @click="filters.role = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="w-[180px] flex-shrink-0">
              <div class="flex items-center space-x-2">
                <VxvSelect
                  v-model="filters.status"
                  label="Estado"
                  :options="statusOptions"
                  size="sm"
                  class="w-full"
                />
                <button
                  v-if="filters.status"
                  @click="filters.status = ''"
                  class="text-gray-400 hover:text-white flex-shrink-0"
                  title="Quitar filtro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </VxvFilters>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
};

/**
 * Filtros avanzados
 */
export const AdvancedFilters: Story = {
  args: {
    id: 'advanced-filters',
    filters: { search: '' },
    showSearch: true,
    searchLabel: 'Búsqueda',
    searchPlaceholder: 'Buscar productos...',
    showApply: true,
    applyLabel: 'Aplicar filtros',
    showReset: true,
    resetLabel: 'Limpiar filtros',
    showLabels: true,
    debounce: 300,
    immediate: false,
  },
  render: (args) => ({
    components: { VxvFilters, VxvInput, VxvSelect, VxvCheckbox, VxvRange },
    setup() {
      const filters = ref({
        search: '',
        dateFrom: '',
        dateTo: '',
        category: [],
        priceRange: [20, 80],
        inStock: true,
        rating: 3
      });

      const categoryOptions = [
        { value: 'electronics', label: 'Electrónica' },
        { value: 'clothing', label: 'Ropa' },
        { value: 'books', label: 'Libros' },
        { value: 'home', label: 'Hogar' },
        { value: 'sports', label: 'Deportes' }
      ];

      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
      };

      return {
        args,
        filters,
        categoryOptions,
        handleFilterChange
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvFilters
          v-bind="args"
          v-model:filters="filters"
          @filter-change="handleFilterChange"
        >
          <template #filters>
              <div class="w-[180px] flex-shrink-0">
                <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                  Fecha desde
                </label>
                <VxvInput
                  v-model="filters.dateFrom"
                  :label="args.showLabels ? '' : 'Fecha desde'"
                  type="date"
                  size="sm"
                  class="w-full"
                />
              </div>

              <div class="w-[180px] flex-shrink-0">
                <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                  Fecha hasta
                </label>
                <VxvInput
                  v-model="filters.dateTo"
                  :label="args.showLabels ? '' : 'Fecha hasta'"
                  type="date"
                  size="sm"
                  class="w-full"
                />
              </div>

              <div class="w-[180px] flex-shrink-0">
                <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                  Categorías
                </label>
                <div class="flex items-center space-x-2">
                  <VxvSelect
                    v-model="filters.category"
                    :label="args.showLabels ? '' : 'Categorías'"
                    :options="categoryOptions"
                    multiple
                    size="sm"
                    class="w-full"
                  />
                  <button
                    v-if="filters.category && filters.category.length"
                    @click="filters.category = []"
                    class="text-gray-400 hover:text-white flex-shrink-0"
                    title="Quitar filtro"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="w-[250px] flex-shrink-0">
                <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                  Rango de precio
                </label>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-400 text-sm">{{ filters.priceRange[0] }}€</span>
                  <div class="flex-grow">
                    <VxvRange
                      v-model="filters.priceRange"
                      :min="0"
                      :max="100"
                      :step="1"
                      show-tooltip
                    />
                  </div>
                  <span class="text-gray-400 text-sm">{{ filters.priceRange[1] }}€</span>
                </div>
              </div>

              <div class="w-[250px] flex-shrink-0">
                <label v-if="args.showLabels" class="block text-sm font-medium text-gray-300 mb-1">
                  Valoración mínima
                </label>
                <div class="flex items-center space-x-1">
                  <VxvRange
                    v-model="filters.rating"
                    :min="1"
                    :max="5"
                    :step="1"
                    show-value
                  />
                  <div class="flex text-yellow-400 ml-2">
                    <span v-for="i in 5" :key="i" class="mr-1">
                      <svg v-if="i <= filters.rating" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <div class="w-[180px] flex-shrink-0 flex items-end">
                <VxvCheckbox
                  v-model="filters.inStock"
                  label="Solo productos en stock"
                />
              </div>
          </template>
        </VxvFilters>

        <div class="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 class="text-white font-medium mb-2">Filtros aplicados:</h3>
          <pre class="text-gray-300 bg-gray-700 p-2 rounded">{{ JSON.stringify(filters, null, 2) }}</pre>
        </div>

        <!-- Resultados simulados -->
        <div class="mt-6">
          <h3 class="text-xl font-semibold text-white mb-4">Resultados</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-gray-800 rounded-lg overflow-hidden">
              <div class="h-40 bg-gray-700 flex items-center justify-center">
                <span class="text-gray-400">Imagen del producto</span>
              </div>
              <div class="p-4">
                <h4 class="text-white font-medium">Producto 1</h4>
                <div class="flex text-yellow-400 my-1">
                  <svg v-for="i in 4" :key="i" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p class="text-gray-400 text-sm">Categoría: Electrónica</p>
                <p class="text-blue-400 font-bold mt-2">45€</p>
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg overflow-hidden">
              <div class="h-40 bg-gray-700 flex items-center justify-center">
                <span class="text-gray-400">Imagen del producto</span>
              </div>
              <div class="p-4">
                <h4 class="text-white font-medium">Producto 2</h4>
                <div class="flex text-yellow-400 my-1">
                  <svg v-for="i in 3" :key="i" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg v-for="i in 2" :key="i+3" class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p class="text-gray-400 text-sm">Categoría: Ropa</p>
                <p class="text-blue-400 font-bold mt-2">29€</p>
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg overflow-hidden">
              <div class="h-40 bg-gray-700 flex items-center justify-center">
                <span class="text-gray-400">Imagen del producto</span>
              </div>
              <div class="p-4">
                <h4 class="text-white font-medium">Producto 3</h4>
                <div class="flex text-yellow-400 my-1">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p class="text-gray-400 text-sm">Categoría: Libros</p>
                <p class="text-blue-400 font-bold mt-2">15€</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
