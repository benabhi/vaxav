import type { Meta, StoryObj } from '@storybook/vue3';
import VxvClearState from './VxvClearState.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvClearState es un componente para mostrar estados vacíos o sin resultados.
 * Se utiliza en tablas, listas o filtros que no devuelven datos.
 */
const meta: Meta<typeof VxvClearState> = {
  title: 'UI/Feedback/VxvClearState',
  component: VxvClearState,
  tags: ['autodocs'],
  argTypes: {
    message: {
      description: 'Mensaje a mostrar cuando no hay datos',
      control: { type: 'text' },
    },
    icon: {
      description: 'Componente de icono a mostrar (opcional)',
      control: { type: 'object' },
    },
    variant: {
      description: 'Variante de estilo',
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'danger', 'warning', 'success', 'info'],
    },
    containerClass: {
      description: 'Clases CSS adicionales para el contenedor',
      control: { type: 'text' },
    },
    iconClass: {
      description: 'Clases CSS adicionales para el icono',
      control: { type: 'text' },
    },
    messageClass: {
      description: 'Clases CSS adicionales para el mensaje',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvClearState>;

// Iconos para los ejemplos
const InfoIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
};

const SearchIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  `
};

const DocumentIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `
};

const InboxIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  `
};

/**
 * Estado vacío básico
 */
export const Default: Story = {
  args: {
    message: 'No hay datos disponibles',
    variant: 'default',
    icon: InfoIcon,
  },
  render: (args) => ({
    components: { VxvClearState },
    setup() {
      return { args };
    },
    template: '<vxv-clear-state v-bind="args" />',
  }),
};

/**
 * Variantes de estilo
 */
export const Variants: Story = {
  render: () => ({
    components: { VxvClearState },
    setup() {
      return { InfoIcon };
    },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-clear-state message="Variante por defecto" variant="default" :icon="InfoIcon" />
        <vxv-clear-state message="Variante primaria" variant="primary" :icon="InfoIcon" />
        <vxv-clear-state message="Variante secundaria" variant="secondary" :icon="InfoIcon" />
        <vxv-clear-state message="Variante de peligro" variant="danger" :icon="InfoIcon" />
        <vxv-clear-state message="Variante de advertencia" variant="warning" :icon="InfoIcon" />
        <vxv-clear-state message="Variante de éxito" variant="success" :icon="InfoIcon" />
        <vxv-clear-state message="Variante de información" variant="info" :icon="InfoIcon" />
      </div>
    `,
  }),
};

/**
 * Con diferentes iconos
 */
export const WithDifferentIcons: Story = {
  render: () => ({
    components: { VxvClearState },
    setup() {
      return { InfoIcon, SearchIcon, DocumentIcon, InboxIcon };
    },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-clear-state message="Con icono de información" :icon="InfoIcon" />
        <vxv-clear-state message="Sin resultados de búsqueda" :icon="SearchIcon" variant="primary" />
        <vxv-clear-state message="No hay documentos disponibles" :icon="DocumentIcon" variant="secondary" />
        <vxv-clear-state message="Bandeja de entrada vacía" :icon="InboxIcon" variant="info" />
      </div>
    `,
  }),
};

/**
 * Con acciones
 */
export const WithActions: Story = {
  render: () => ({
    components: { VxvClearState, VxvButton },
    setup() {
      return { SearchIcon };
    },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-clear-state 
          message="No se encontraron resultados para tu búsqueda" 
          :icon="SearchIcon"
          variant="primary"
        >
          <template #action>
            <vxv-button variant="primary" size="sm">Limpiar filtros</vxv-button>
          </template>
        </vxv-clear-state>
        
        <vxv-clear-state 
          message="No hay elementos en la lista" 
          variant="secondary"
        >
          <template #action>
            <div class="flex gap-2">
              <vxv-button variant="secondary" size="sm">Crear nuevo</vxv-button>
              <vxv-button variant="outline" size="sm">Importar</vxv-button>
            </div>
          </template>
        </vxv-clear-state>
      </div>
    `,
  }),
};

/**
 * Con contenido personalizado
 */
export const WithCustomContent: Story = {
  render: () => ({
    components: { VxvClearState, VxvButton },
    setup() {
      return { SearchIcon };
    },
    template: `
      <vxv-clear-state variant="primary" :icon="SearchIcon">
        <p class="text-blue-300 font-medium">No se encontraron resultados para tu búsqueda.</p>
        <p class="text-blue-400 text-sm mt-2">Intenta con otros términos o ajusta los filtros.</p>
        
        <template #action>
          <vxv-button variant="primary" size="sm">Restablecer búsqueda</vxv-button>
        </template>
      </vxv-clear-state>
    `,
  }),
};

/**
 * Ejemplo de uso en tabla
 */
export const TableExample: Story = {
  render: () => ({
    components: { VxvClearState, VxvButton },
    setup() {
      return { DocumentIcon };
    },
    template: `
      <div class="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-white text-lg font-medium">Listado de usuarios</h3>
          <div class="flex gap-2">
            <input type="text" placeholder="Buscar..." class="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700">
            <vxv-button variant="primary" size="sm">Buscar</vxv-button>
          </div>
        </div>
        
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <vxv-clear-state 
            message="No se encontraron usuarios que coincidan con los criterios de búsqueda" 
            :icon="DocumentIcon"
            variant="secondary"
          >
            <template #action>
              <vxv-button variant="secondary" size="sm">Limpiar filtros</vxv-button>
            </template>
          </vxv-clear-state>
        </div>
      </div>
    `,
  }),
};
