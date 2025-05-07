import type { Meta, StoryObj } from '@storybook/vue3';
import VxvSpinner from './VxvSpinner.vue';

/**
 * VxvSpinner es un componente que muestra un indicador de carga animado.
 * Útil para indicar a los usuarios que una operación está en progreso.
 */
const meta: Meta<typeof VxvSpinner> = {
  title: 'UI/Feedback/VxvSpinner',
  component: VxvSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del spinner'
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white'],
      description: 'Color del spinner'
    },
    label: {
      control: { type: 'text' },
      description: 'Texto que se muestra junto al spinner'
    },
    hideText: {
      control: { type: 'boolean' },
      description: 'Ocultar el texto para lectores de pantalla'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Un componente de spinner que indica que una operación está en progreso. Puede personalizarse en tamaño y color.'
      }
    }
  },
  decorators: [
    () => ({ template: '<div class="p-4 bg-gray-800"><story /></div>' })
  ]
};

export default meta;
type Story = StoryObj<typeof VxvSpinner>;

/**
 * Ejemplo básico de spinner
 */
export const Default: Story = {
  args: {
    size: 'md',
    color: 'primary'
  }
};

/**
 * Spinner con etiqueta de texto
 */
export const WithLabel: Story = {
  args: {
    size: 'md',
    color: 'primary',
    label: 'Cargando...'
  }
};

/**
 * Spinner en diferentes tamaños
 */
export const Sizes: Story = {
  render: () => ({
    components: { VxvSpinner },
    template: `
      <div class="flex flex-col space-y-4">
        <div class="flex items-center space-x-4">
          <VxvSpinner size="xs" label="Extra pequeño" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner size="sm" label="Pequeño" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner size="md" label="Mediano" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner size="lg" label="Grande" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner size="xl" label="Extra grande" />
        </div>
      </div>
    `
  })
};

/**
 * Spinner en diferentes colores
 */
export const Colors: Story = {
  render: () => ({
    components: { VxvSpinner },
    template: `
      <div class="flex flex-col space-y-4">
        <div class="flex items-center space-x-4">
          <VxvSpinner color="primary" label="Primary" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="secondary" label="Secondary" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="success" label="Success" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="danger" label="Danger" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="warning" label="Warning" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="info" label="Info" />
        </div>
        <div class="flex items-center space-x-4">
          <VxvSpinner color="light" label="Light" />
        </div>
        <div class="flex items-center space-x-4 bg-gray-900 p-2 rounded">
          <VxvSpinner color="white" label="White" />
        </div>
      </div>
    `
  })
};

/**
 * Spinner en un botón
 */
export const InButton: Story = {
  render: () => ({
    components: { VxvSpinner },
    template: `
      <div class="space-y-4">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <VxvSpinner size="sm" color="white" class="mr-2" hideText />
          <span>Cargando...</span>
        </button>
        
        <button class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <VxvSpinner size="sm" color="white" class="mr-2" hideText />
          <span>Procesando</span>
        </button>
        
        <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <VxvSpinner size="sm" color="white" class="mr-2" hideText />
          <span>Guardando</span>
        </button>
      </div>
    `
  })
};

/**
 * Spinner centrado en un contenedor
 */
export const Centered: Story = {
  render: () => ({
    components: { VxvSpinner },
    template: `
      <div class="bg-gray-700 p-8 rounded-lg flex items-center justify-center">
        <VxvSpinner size="lg" color="white" label="Cargando contenido..." />
      </div>
    `
  })
};
