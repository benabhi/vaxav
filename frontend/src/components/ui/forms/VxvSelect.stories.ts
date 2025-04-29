import type { Meta, StoryObj } from '@storybook/vue3';
import VxvSelect from './VxvSelect.vue';

/**
 * VxvSelect es el componente de selección principal de la aplicación.
 * Permite a los usuarios elegir una o varias opciones de una lista desplegable.
 */
const meta: Meta<typeof VxvSelect> = {
  title: 'UI/Forms/VxvSelect',
  component: VxvSelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Valor del select (v-model)',
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
    disabled: {
      description: 'Deshabilita el select',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Marca el campo como requerido',
      control: { type: 'boolean' },
    },
    multiple: {
      description: 'Permite selección múltiple',
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
      description: 'Tamaño del select',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    options: {
      description: 'Array de opciones',
      control: { type: 'object' },
    },
    valueKey: {
      description: 'Clave para el valor en las opciones',
      control: { type: 'text' },
    },
    labelKey: {
      description: 'Clave para la etiqueta en las opciones',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvSelect>;

/**
 * Ejemplo básico del select
 */
export const Default: Story = {
  args: {
    modelValue: '',
    label: 'País',
    placeholder: 'Selecciona un país',
    options: [
      { value: 'es', label: 'España' },
      { value: 'mx', label: 'México' },
      { value: 'ar', label: 'Argentina' },
      { value: 'co', label: 'Colombia' },
      { value: 'pe', label: 'Perú' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select con opciones simples (strings)
 */
export const SimpleOptions: Story = {
  args: {
    modelValue: '',
    label: 'Tamaño',
    placeholder: 'Selecciona un tamaño',
    options: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select con campo requerido
 */
export const Required: Story = {
  args: {
    modelValue: '',
    label: 'Categoría',
    placeholder: 'Selecciona una categoría',
    required: true,
    options: [
      { value: 'tech', label: 'Tecnología' },
      { value: 'sports', label: 'Deportes' },
      { value: 'health', label: 'Salud' },
      { value: 'finance', label: 'Finanzas' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select con mensaje de error
 */
export const WithError: Story = {
  args: {
    modelValue: '',
    label: 'País',
    placeholder: 'Selecciona un país',
    error: 'Por favor selecciona un país',
    options: [
      { value: 'es', label: 'España' },
      { value: 'mx', label: 'México' },
      { value: 'ar', label: 'Argentina' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select con texto de ayuda
 */
export const WithHint: Story = {
  args: {
    modelValue: '',
    label: 'Moneda',
    placeholder: 'Selecciona una moneda',
    hint: 'La moneda se utilizará para todas las transacciones',
    options: [
      { value: 'usd', label: 'Dólar estadounidense (USD)' },
      { value: 'eur', label: 'Euro (EUR)' },
      { value: 'gbp', label: 'Libra esterlina (GBP)' },
      { value: 'jpy', label: 'Yen japonés (JPY)' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select deshabilitado
 */
export const Disabled: Story = {
  args: {
    modelValue: 'es',
    label: 'País',
    disabled: true,
    options: [
      { value: 'es', label: 'España' },
      { value: 'mx', label: 'México' },
      { value: 'ar', label: 'Argentina' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Select con selección múltiple
 */
export const Multiple: Story = {
  args: {
    modelValue: [],
    label: 'Idiomas',
    placeholder: 'Selecciona idiomas',
    multiple: true,
    options: [
      { value: 'es', label: 'Español' },
      { value: 'en', label: 'Inglés' },
      { value: 'fr', label: 'Francés' },
      { value: 'de', label: 'Alemán' },
      { value: 'it', label: 'Italiano' },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: '<vxv-select v-bind="args" />',
  }),
};

/**
 * Diferentes tamaños de select
 */
export const Sizes: Story = {
  render: () => ({
    components: { VxvSelect },
    template: `
      <div class="flex flex-col gap-4">
        <vxv-select 
          label="Select pequeño" 
          placeholder="Tamaño pequeño" 
          size="sm"
          :options="['Opción 1', 'Opción 2', 'Opción 3']" 
        />
        <vxv-select 
          label="Select mediano" 
          placeholder="Tamaño mediano" 
          size="md"
          :options="['Opción 1', 'Opción 2', 'Opción 3']" 
        />
        <vxv-select 
          label="Select grande" 
          placeholder="Tamaño grande" 
          size="lg"
          :options="['Opción 1', 'Opción 2', 'Opción 3']" 
        />
      </div>
    `,
  }),
};

/**
 * Select con opciones personalizadas
 */
export const CustomOptions: Story = {
  args: {
    modelValue: '',
    label: 'Selecciona un usuario',
    placeholder: 'Selecciona un usuario',
    size: 'md',
  },
  render: (args) => ({
    components: { VxvSelect },
    setup() {
      return { args };
    },
    template: `
      <vxv-select v-bind="args">
        <option value="" disabled>{{ args.placeholder }}</option>
        <option value="1">👨‍💼 Juan Pérez (Admin)</option>
        <option value="2">👩‍💼 María García (Editor)</option>
        <option value="3">👨‍💻 Carlos López (Desarrollador)</option>
        <option value="4">👩‍🔧 Ana Martínez (Técnico)</option>
      </vxv-select>
    `,
  }),
};
