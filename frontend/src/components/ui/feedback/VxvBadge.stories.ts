import type { Meta, StoryObj } from '@storybook/vue3';
import VxvBadge from './VxvBadge.vue';

/**
 * VxvBadge es un componente para mostrar etiquetas, estados o contadores.
 * Se utiliza para destacar información o estados en la interfaz.
 */
const meta: Meta<typeof VxvBadge> = {
  title: 'UI/Feedback/VxvBadge',
  component: VxvBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Estilo visual del badge',
      control: { type: 'select' },
      options: [
        'default', 'primary', 'success', 'warning', 'danger', 'info',
        'purple', 'blue', 'green', 'yellow', 'red', 'gray'
      ],
    },
    size: {
      description: 'Tamaño del badge',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    clickable: {
      description: 'Indica si el badge es clickeable',
      control: { type: 'boolean' },
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvBadge>;

/**
 * Badge por defecto
 */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    clickable: false,
  },
  render: (args) => ({
    components: { VxvBadge },
    setup() {
      return { args };
    },
    template: '<vxv-badge v-bind="args" @click="args.onClick">Badge</vxv-badge>',
  }),
};

/**
 * Variantes de color
 */
export const Variants: Story = {
  render: () => ({
    components: { VxvBadge },
    template: `
      <div class="flex flex-wrap gap-2">
        <vxv-badge variant="default">Default</vxv-badge>
        <vxv-badge variant="primary">Primary</vxv-badge>
        <vxv-badge variant="success">Success</vxv-badge>
        <vxv-badge variant="warning">Warning</vxv-badge>
        <vxv-badge variant="danger">Danger</vxv-badge>
        <vxv-badge variant="info">Info</vxv-badge>
        <vxv-badge variant="purple">Purple</vxv-badge>
        <vxv-badge variant="blue">Blue</vxv-badge>
        <vxv-badge variant="green">Green</vxv-badge>
        <vxv-badge variant="yellow">Yellow</vxv-badge>
        <vxv-badge variant="red">Red</vxv-badge>
        <vxv-badge variant="gray">Gray</vxv-badge>
      </div>
    `,
  }),
};

/**
 * Tamaños disponibles
 */
export const Sizes: Story = {
  render: () => ({
    components: { VxvBadge },
    template: `
      <div class="flex items-center gap-2">
        <vxv-badge variant="primary" size="sm">Small</vxv-badge>
        <vxv-badge variant="primary" size="md">Medium</vxv-badge>
        <vxv-badge variant="primary" size="lg">Large</vxv-badge>
      </div>
    `,
  }),
};

/**
 * Badge clickeable
 */
export const Clickable: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    clickable: true,
  },
  render: (args) => ({
    components: { VxvBadge },
    setup() {
      return { args };
    },
    template: '<vxv-badge v-bind="args" @click="args.onClick">Click me</vxv-badge>',
  }),
};

/**
 * Uso con contadores
 */
export const WithCounter: Story = {
  render: () => ({
    components: { VxvBadge },
    template: `
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="text-white">Notificaciones</span>
          <vxv-badge variant="danger" size="sm">5</vxv-badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-white">Mensajes</span>
          <vxv-badge variant="primary" size="sm">12</vxv-badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-white">Tareas pendientes</span>
          <vxv-badge variant="warning" size="sm">3</vxv-badge>
        </div>
      </div>
    `,
  }),
};

/**
 * Uso para estados
 */
export const StatusBadges: Story = {
  render: () => ({
    components: { VxvBadge },
    template: `
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <vxv-badge variant="success">Activo</vxv-badge>
        </div>
        <div class="flex items-center gap-2">
          <vxv-badge variant="danger">Inactivo</vxv-badge>
        </div>
        <div class="flex items-center gap-2">
          <vxv-badge variant="warning">Pendiente</vxv-badge>
        </div>
        <div class="flex items-center gap-2">
          <vxv-badge variant="info">En progreso</vxv-badge>
        </div>
      </div>
    `,
  }),
};

/**
 * Badges con iconos
 */
export const WithIcons: Story = {
  render: () => ({
    components: { VxvBadge },
    template: `
      <div class="flex flex-wrap gap-2">
        <vxv-badge variant="success">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Aprobado
        </vxv-badge>
        <vxv-badge variant="danger">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Rechazado
        </vxv-badge>
        <vxv-badge variant="warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Atención
        </vxv-badge>
      </div>
    `,
  }),
};
