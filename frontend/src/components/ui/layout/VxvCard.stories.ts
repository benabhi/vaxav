import type { Meta, StoryObj } from '@storybook/vue3';
import VxvCard from './VxvCard.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvCard es un componente de contenedor que agrupa contenido relacionado.
 * Se utiliza para mostrar información en secciones claramente definidas.
 */
const meta: Meta<typeof VxvCard> = {
  title: 'UI/Layout/VxvCard',
  component: VxvCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título de la tarjeta',
      control: { type: 'text' },
    },
    hasBorder: {
      description: 'Muestra un borde entre el título y el contenido',
      control: { type: 'boolean' },
    },
    maxWidth: {
      description: 'Ancho máximo de la tarjeta',
      control: { type: 'select' },
      options: ['', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'],
    },
    centered: {
      description: 'Centra la tarjeta horizontalmente',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvCard>;

/**
 * Tarjeta básica sin título
 */
export const Default: Story = {
  args: {
    title: '',
    hasBorder: false,
    maxWidth: '',
    centered: false,
  },
  render: (args) => ({
    components: { VxvCard },
    setup() {
      return { args };
    },
    template: `
      <vxv-card v-bind="args">
        <p class="text-white">Este es el contenido de una tarjeta básica sin título.</p>
      </vxv-card>
    `,
  }),
};

/**
 * Tarjeta con título
 */
export const WithTitle: Story = {
  args: {
    title: 'Título de la tarjeta',
    hasBorder: false,
    maxWidth: '',
    centered: false,
  },
  render: (args) => ({
    components: { VxvCard },
    setup() {
      return { args };
    },
    template: `
      <vxv-card v-bind="args">
        <p class="text-white">Este es el contenido de una tarjeta con título.</p>
      </vxv-card>
    `,
  }),
};

/**
 * Tarjeta con título y borde
 */
export const WithTitleAndBorder: Story = {
  args: {
    title: 'Título de la tarjeta',
    hasBorder: true,
    maxWidth: '',
    centered: false,
  },
  render: (args) => ({
    components: { VxvCard },
    setup() {
      return { args };
    },
    template: `
      <vxv-card v-bind="args">
        <p class="text-white">Este es el contenido de una tarjeta con título y borde.</p>
      </vxv-card>
    `,
  }),
};

/**
 * Tarjeta con ancho máximo
 */
export const WithMaxWidth: Story = {
  args: {
    title: 'Tarjeta con ancho máximo',
    hasBorder: true,
    maxWidth: 'md',
    centered: true,
  },
  render: (args) => ({
    components: { VxvCard },
    setup() {
      return { args };
    },
    template: `
      <vxv-card v-bind="args">
        <p class="text-white">Esta tarjeta tiene un ancho máximo de 'md' y está centrada.</p>
      </vxv-card>
    `,
  }),
};

/**
 * Tarjeta con contenido complejo
 */
export const WithComplexContent: Story = {
  args: {
    title: 'Información del usuario',
    hasBorder: true,
    maxWidth: 'lg',
    centered: false,
  },
  render: (args) => ({
    components: { VxvCard, VxvButton },
    setup() {
      return { args };
    },
    template: `
      <vxv-card v-bind="args">
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JP
            </div>
            <div>
              <h3 class="text-lg font-medium text-white">Juan Pérez</h3>
              <p class="text-gray-400">Administrador</p>
            </div>
          </div>
          
          <div class="border-t border-gray-700 pt-4">
            <h4 class="text-sm font-medium text-gray-400 mb-2">INFORMACIÓN DE CONTACTO</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Email</p>
                <p class="text-white">juan.perez@example.com</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Teléfono</p>
                <p class="text-white">+34 612 345 678</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Ubicación</p>
                <p class="text-white">Madrid, España</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Departamento</p>
                <p class="text-white">Tecnología</p>
              </div>
            </div>
          </div>
          
          <div class="border-t border-gray-700 pt-4 flex justify-end space-x-2">
            <vxv-button variant="secondary" size="sm">Cancelar</vxv-button>
            <vxv-button variant="primary" size="sm">Editar perfil</vxv-button>
          </div>
        </div>
      </vxv-card>
    `,
  }),
};

/**
 * Múltiples tarjetas en una cuadrícula
 */
export const CardGrid: Story = {
  render: () => ({
    components: { VxvCard },
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <vxv-card title="Tarjeta 1" has-border>
          <p class="text-white">Contenido de la primera tarjeta.</p>
        </vxv-card>
        <vxv-card title="Tarjeta 2" has-border>
          <p class="text-white">Contenido de la segunda tarjeta.</p>
        </vxv-card>
        <vxv-card title="Tarjeta 3" has-border>
          <p class="text-white">Contenido de la tercera tarjeta.</p>
        </vxv-card>
      </div>
    `,
  }),
};

/**
 * Tarjeta con diferentes tamaños
 */
export const CardSizes: Story = {
  render: () => ({
    components: { VxvCard },
    template: `
      <div class="space-y-4">
        <vxv-card title="Tarjeta XS" has-border max-width="xs" centered>
          <p class="text-white">Esta tarjeta tiene un ancho máximo de 'xs'.</p>
        </vxv-card>
        <vxv-card title="Tarjeta SM" has-border max-width="sm" centered>
          <p class="text-white">Esta tarjeta tiene un ancho máximo de 'sm'.</p>
        </vxv-card>
        <vxv-card title="Tarjeta MD" has-border max-width="md" centered>
          <p class="text-white">Esta tarjeta tiene un ancho máximo de 'md'.</p>
        </vxv-card>
        <vxv-card title="Tarjeta LG" has-border max-width="lg" centered>
          <p class="text-white">Esta tarjeta tiene un ancho máximo de 'lg'.</p>
        </vxv-card>
      </div>
    `,
  }),
};
