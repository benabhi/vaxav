import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvRange from './VxvRange.vue';

/**
 * VxvRange es un componente para seleccionar valores numéricos dentro de un rango.
 * Proporciona diferentes opciones de visualización y personalización.
 */
const meta: Meta<typeof VxvRange> = {
  title: 'UI/Forms/VxvRange',
  component: VxvRange,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Valor actual del rango (v-model)',
      control: { type: 'number' },
    },
    min: {
      description: 'Valor mínimo del rango',
      control: { type: 'number' },
    },
    max: {
      description: 'Valor máximo del rango',
      control: { type: 'number' },
    },
    step: {
      description: 'Incremento del rango',
      control: { type: 'number' },
    },
    label: {
      description: 'Etiqueta del rango',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Deshabilita el rango',
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
    showMinMax: {
      description: 'Muestra los valores mínimo y máximo',
      control: { type: 'boolean' },
    },
    showValue: {
      description: 'Muestra el valor actual',
      control: { type: 'boolean' },
    },
    showTooltip: {
      description: 'Muestra un tooltip con el valor actual',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvRange>;

/**
 * Rango básico
 */
export const Default: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: false,
    required: false,
    error: '',
    hint: '',
    showMinMax: false,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con valores mínimo y máximo visibles
 */
export const WithMinMax: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: false,
    required: false,
    error: '',
    hint: '',
    showMinMax: true,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con tooltip
 */
export const WithTooltip: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: false,
    required: false,
    error: '',
    hint: '',
    showMinMax: false,
    showValue: false,
    showTooltip: true,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con texto de ayuda
 */
export const WithHint: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: false,
    required: false,
    error: '',
    hint: 'Ajusta el volumen del sistema',
    showMinMax: false,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con error
 */
export const WithError: Story = {
  args: {
    modelValue: 5,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: false,
    required: false,
    error: 'El volumen debe ser al menos 10',
    hint: '',
    showMinMax: false,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango deshabilitado
 */
export const Disabled: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    label: 'Volumen',
    disabled: true,
    required: false,
    error: '',
    hint: 'Este control está deshabilitado',
    showMinMax: false,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con paso personalizado
 */
export const CustomStep: Story = {
  args: {
    modelValue: 25,
    min: 0,
    max: 100,
    step: 25,
    label: 'Progreso',
    disabled: false,
    required: false,
    error: '',
    hint: 'Incrementos de 25%',
    showMinMax: true,
    showValue: true,
    showTooltip: false,
  },
  render: (args) => ({
    components: { VxvRange },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<vxv-range v-model="value" v-bind="args" />',
  }),
};

/**
 * Rango con formato personalizado
 */
export const CustomFormat: Story = {
  render: () => ({
    components: { VxvRange },
    setup() {
      const temperature = ref(20);

      const formatTemperature = (value) => `${value}°C`;
      const formatMin = (value) => `${value}°C (Frío)`;
      const formatMax = (value) => `${value}°C (Caliente)`;

      return {
        temperature,
        formatTemperature,
        formatMin,
        formatMax
      };
    },
    template: `
      <vxv-range
        v-model="temperature"
        label="Temperatura"
        :min="0"
        :max="40"
        :step="1"
        :format-value="formatTemperature"
        :format-min="formatMin"
        :format-max="formatMax"
        show-min-max
        show-value
      />
    `,
  }),
};

/**
 * Múltiples rangos
 */
export const MultipleRanges: Story = {
  render: () => ({
    components: { VxvRange },
    setup() {
      const brightness = ref(80);
      const contrast = ref(50);
      const saturation = ref(60);

      return {
        brightness,
        contrast,
        saturation
      };
    },
    template: `
      <div class="space-y-6">
        <vxv-range
          v-model="brightness"
          label="Brillo"
          :min="0"
          :max="100"
          :step="1"
          show-min-max
          show-value
        />

        <vxv-range
          v-model="contrast"
          label="Contraste"
          :min="0"
          :max="100"
          :step="1"
          show-min-max
          show-value
        />

        <vxv-range
          v-model="saturation"
          label="Saturación"
          :min="0"
          :max="100"
          :step="1"
          show-min-max
          show-value
        />
      </div>
    `,
  }),
};

/**
 * Rango interactivo
 */
export const Interactive: Story = {
  render: () => ({
    components: { VxvRange },
    setup() {
      const value = ref(50);

      return { value };
    },
    template: `
      <div class="space-y-4">
        <vxv-range
          v-model="value"
          label="Valor interactivo"
          :min="0"
          :max="100"
          :step="1"
          show-min-max
          show-value
          show-tooltip
        />

        <div class="bg-gray-700 p-4 rounded">
          <div class="text-white">Valor seleccionado: {{ value }}</div>
          <div class="mt-2 h-4 bg-gray-600 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 transition-all duration-300"
              :style="{ width: value + '%' }"
            ></div>
          </div>
        </div>
      </div>
    `,
  }),
};
