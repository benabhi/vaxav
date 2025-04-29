import type { Meta, StoryObj } from '@storybook/vue3';
import VxvButton from './VxvButton.vue';

/**
 * VxvButton es el componente de botón principal de la aplicación.
 * Proporciona diferentes variantes, tamaños y estados para adaptarse a diversas necesidades de la interfaz.
 */
const meta: Meta<typeof VxvButton> = {
  title: 'UI/Buttons/VxvButton',
  component: VxvButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Estilo visual del botón',
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'ghost'],
    },
    size: {
      description: 'Tamaño del botón',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      description: 'Deshabilita el botón',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Muestra un indicador de carga',
      control: { type: 'boolean' },
    },
    fullWidth: {
      description: 'Hace que el botón ocupe todo el ancho disponible',
      control: { type: 'boolean' },
    },
    rounded: {
      description: 'Aplica bordes redondeados al botón',
      control: { type: 'boolean' },
    },
    icon: {
      description: 'Formato de botón de icono (circular)',
      control: { type: 'boolean' },
    },
    type: {
      description: 'Tipo de botón HTML',
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvButton>;

/**
 * Ejemplo básico del botón con estilo primario
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    default: 'Botón Primario',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Variante secundaria del botón
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    default: 'Botón Secundario',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Variante de peligro/eliminación
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
    default: 'Eliminar',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Variante de éxito/confirmación
 */
export const Success: Story = {
  args: {
    variant: 'success',
    size: 'md',
    default: 'Guardar',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Botón en estado de carga
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
    default: 'Cargando...',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Botón deshabilitado
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    default: 'Deshabilitado',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};

/**
 * Diferentes tamaños de botón
 */
export const Sizes: Story = {
  render: () => ({
    components: { VxvButton },
    template: `
      <div class="flex flex-wrap gap-2 items-center">
        <vxv-button size="sm">Pequeño</vxv-button>
        <vxv-button size="md">Mediano</vxv-button>
        <vxv-button size="lg">Grande</vxv-button>
        <vxv-button size="xl">Extra Grande</vxv-button>
      </div>
    `,
  }),
};

/**
 * Botón con icono a la derecha
 */
export const WithRightIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    default: 'Continuar',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-button v-bind="args">
        {{ args.default }}
        <template #icon-right>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </template>
      </vxv-button>
    `,
  }),
};

/**
 * Botón con icono a la izquierda
 */
export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    default: 'Volver',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-button v-bind="args">
        <template #icon-left>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </template>
        {{ args.default }}
      </vxv-button>
    `,
  }),
};

/**
 * Botón de solo icono
 */
export const IconOnly: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    icon: true,
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-button v-bind="args">
        <template #default>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </template>
      </vxv-button>
    `,
  }),
};

/**
 * Botón de ancho completo
 */
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    default: 'Botón de ancho completo',
  },
  render: (args) => ({
    components: { VxvButton },
    setup() {
      return { args };
    },
    template: '<vxv-button v-bind="args">{{ args.default }}</vxv-button>',
  }),
};
