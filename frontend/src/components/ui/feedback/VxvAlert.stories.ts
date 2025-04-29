import type { Meta, StoryObj } from '@storybook/vue3';
import VxvAlert from './VxvAlert.vue';

/**
 * VxvAlert es un componente para mostrar mensajes importantes, notificaciones o alertas al usuario.
 * Proporciona diferentes variantes para indicar el tipo de mensaje y opciones de personalización.
 */
const meta: Meta<typeof VxvAlert> = {
  title: 'UI/Feedback/VxvAlert',
  component: VxvAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Estilo visual de la alerta',
      control: { type: 'select' },
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
    title: {
      description: 'Título de la alerta',
      control: { type: 'text' },
    },
    message: {
      description: 'Mensaje de la alerta',
      control: { type: 'text' },
    },
    dismissible: {
      description: 'Permite cerrar la alerta',
      control: { type: 'boolean' },
    },
    duration: {
      description: 'Duración en milisegundos antes de que la alerta se cierre automáticamente (0 para no cerrar)',
      control: { type: 'number' },
    },
    className: {
      description: 'Clases CSS adicionales',
      control: { type: 'text' },
    },
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvAlert>;

/**
 * Alerta por defecto
 */
export const Default: Story = {
  args: {
    variant: 'default',
    title: 'Información',
    message: 'Esta es una alerta informativa básica.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta de éxito
 */
export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Operación exitosa',
    message: 'Los cambios se han guardado correctamente.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta de error
 */
export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    message: 'Ha ocurrido un error al procesar su solicitud.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta de advertencia
 */
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Advertencia',
    message: 'Esta acción no se puede deshacer.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta informativa
 */
export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Información',
    message: 'Hay actualizaciones disponibles para su sistema.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta sin título
 */
export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    message: 'Esta es una alerta sin título, solo con mensaje.',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta no descartable
 */
export const NonDismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Aviso importante',
    message: 'Esta alerta no se puede cerrar manualmente.',
    dismissible: false,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta con cierre automático
 */
export const AutoDismiss: Story = {
  args: {
    variant: 'success',
    title: 'Guardado',
    message: 'Esta alerta se cerrará automáticamente después de 3 segundos.',
    dismissible: true,
    duration: 3000,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: '<vxv-alert v-bind="args" @dismiss="args.onDismiss" />',
  }),
};

/**
 * Alerta con contenido personalizado
 */
export const CustomContent: Story = {
  args: {
    variant: 'info',
    title: 'Información personalizada',
    dismissible: true,
    duration: 0,
  },
  render: (args) => ({
    components: { VxvAlert },
    setup() {
      return { args };
    },
    template: `
      <vxv-alert v-bind="args" @dismiss="args.onDismiss">
        <p>Este es un contenido personalizado con <strong>formato</strong> y un <a href="#" class="underline">enlace</a>.</p>
        <ul class="list-disc ml-5 mt-2">
          <li>Elemento 1</li>
          <li>Elemento 2</li>
          <li>Elemento 3</li>
        </ul>
      </vxv-alert>
    `,
  }),
};
