import type { Meta, StoryObj } from '@storybook/vue3';
import VxvInput from './VxvInput.vue';

/**
 * VxvInput es el componente de entrada de texto principal de la aplicación.
 * Proporciona diferentes variantes, tamaños y estados para adaptarse a diversas necesidades de formularios.
 */
const meta: Meta<typeof VxvInput> = {
  title: 'UI/Forms/VxvInput',
  component: VxvInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Valor del input (v-model)',
      control: { type: 'text' },
    },
    label: {
      description: 'Etiqueta del campo',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'Texto de placeholder',
      control: { type: 'text' },
    },
    type: {
      description: 'Tipo de input HTML',
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'],
    },
    disabled: {
      description: 'Deshabilita el input',
      control: { type: 'boolean' },
    },
    readonly: {
      description: 'Hace que el input sea de solo lectura',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Marca el campo como requerido',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Mensaje de error',
      control: { type: 'text' },
    },
    hint: {
      description: 'Texto de ayuda',
      control: { type: 'text' },
    },
    size: {
      description: 'Tamaño del input',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    prefixIcon: {
      description: 'Indica si tiene un icono de prefijo',
      control: { type: 'boolean' },
    },
    suffixIcon: {
      description: 'Indica si tiene un icono de sufijo',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvInput>;

/**
 * Ejemplo básico del input de texto
 */
export const Default: Story = {
  args: {
    modelValue: '',
    label: 'Nombre',
    placeholder: 'Ingrese su nombre',
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Input con etiqueta y campo requerido
 */
export const Required: Story = {
  args: {
    modelValue: '',
    label: 'Correo electrónico',
    placeholder: 'Ingrese su correo electrónico',
    type: 'email',
    required: true,
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Input con mensaje de error
 */
export const WithError: Story = {
  args: {
    modelValue: 'correo@invalido',
    label: 'Correo electrónico',
    placeholder: 'Ingrese su correo electrónico',
    type: 'email',
    error: 'Por favor ingrese un correo electrónico válido',
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Input con texto de ayuda
 */
export const WithHint: Story = {
  args: {
    modelValue: '',
    label: 'Contraseña',
    placeholder: 'Ingrese su contraseña',
    type: 'password',
    hint: 'La contraseña debe tener al menos 8 caracteres',
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Input deshabilitado
 */
export const Disabled: Story = {
  args: {
    modelValue: 'Valor deshabilitado',
    label: 'Campo deshabilitado',
    disabled: true,
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Input de solo lectura
 */
export const Readonly: Story = {
  args: {
    modelValue: 'Valor de solo lectura',
    label: 'Campo de solo lectura',
    readonly: true,
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: '<vxv-input v-bind="args" />',
  }),
};

/**
 * Diferentes tamaños de input
 */
export const Sizes: Story = {
  render: () => ({
    components: { VxvInput },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-input label="Input pequeño" placeholder="Tamaño pequeño" size="sm" />
        <vxv-input label="Input mediano" placeholder="Tamaño mediano" size="md" />
        <vxv-input label="Input grande" placeholder="Tamaño grande" size="lg" />
      </div>
    `,
  }),
};

/**
 * Input con icono de prefijo
 */
export const WithPrefixIcon: Story = {
  args: {
    modelValue: '',
    label: 'Buscar',
    placeholder: 'Buscar...',
    prefixIcon: true,
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: `
      <vxv-input v-bind="args">
        <template #prefix>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </template>
      </vxv-input>
    `,
  }),
};

/**
 * Input con icono de sufijo
 */
export const WithSuffixIcon: Story = {
  args: {
    modelValue: '',
    label: 'Correo electrónico',
    placeholder: 'Ingrese su correo electrónico',
    type: 'email',
    suffixIcon: true,
    size: 'md',
  },
  render: (args) => ({
    components: { VxvInput },
    setup() {
      return { args };
    },
    template: `
      <vxv-input v-bind="args">
        <template #suffix>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </template>
      </vxv-input>
    `,
  }),
};

/**
 * Diferentes tipos de input
 */
export const InputTypes: Story = {
  render: () => ({
    components: { VxvInput },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-input label="Texto" placeholder="Ingrese texto" type="text" />
        <vxv-input label="Correo electrónico" placeholder="Ingrese correo" type="email" />
        <vxv-input label="Contraseña" placeholder="Ingrese contraseña" type="password" />
        <vxv-input label="Número" placeholder="Ingrese número" type="number" />
        <vxv-input label="Fecha" type="date" />
      </div>
    `,
  }),
};
