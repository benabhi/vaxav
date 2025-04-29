import type { Meta, StoryObj } from '@storybook/vue3';
import VxvCheckbox from './VxvCheckbox.vue';
import { ref } from 'vue';

/**
 * VxvCheckbox es el componente de casilla de verificación principal de la aplicación.
 * Permite a los usuarios seleccionar una o varias opciones de un conjunto.
 */
const meta: Meta<typeof VxvCheckbox> = {
  title: 'UI/Forms/VxvCheckbox',
  component: VxvCheckbox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      description: 'Valor del checkbox (v-model)',
      control: { type: 'boolean' },
    },
    value: {
      description: 'Valor cuando se usa en un grupo',
      control: { type: 'text' },
    },
    label: {
      description: 'Etiqueta del checkbox',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Deshabilita el checkbox',
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
    indeterminate: {
      description: 'Estado indeterminado del checkbox',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvCheckbox>;

/**
 * Checkbox básico
 */
export const Default: Story = {
  args: {
    modelValue: false,
    label: 'Acepto los términos y condiciones',
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox marcado
 */
export const Checked: Story = {
  args: {
    modelValue: true,
    label: 'Opción seleccionada',
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox requerido
 */
export const Required: Story = {
  args: {
    modelValue: false,
    label: 'Acepto recibir notificaciones',
    required: true,
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox con error
 */
export const WithError: Story = {
  args: {
    modelValue: false,
    label: 'Acepto los términos y condiciones',
    error: 'Debes aceptar los términos para continuar',
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox deshabilitado
 */
export const Disabled: Story = {
  args: {
    modelValue: false,
    label: 'Opción deshabilitada',
    disabled: true,
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox deshabilitado y marcado
 */
export const DisabledChecked: Story = {
  args: {
    modelValue: true,
    label: 'Opción deshabilitada y marcada',
    disabled: true,
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Checkbox en estado indeterminado
 */
export const Indeterminate: Story = {
  args: {
    modelValue: false,
    label: 'Selección parcial',
    indeterminate: true,
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: '<vxv-checkbox v-bind="args" />',
  }),
};

/**
 * Grupo de checkboxes
 */
export const CheckboxGroup: Story = {
  render: () => ({
    components: { VxvCheckbox },
    setup() {
      const selectedOptions = ref(['option1', 'option3']);
      return { selectedOptions };
    },
    template: `
      <div class="flex flex-col gap-2">
        <h3 class="text-white mb-2">Selecciona tus intereses:</h3>
        <vxv-checkbox v-model="selectedOptions" value="option1" label="Tecnología" />
        <vxv-checkbox v-model="selectedOptions" value="option2" label="Deportes" />
        <vxv-checkbox v-model="selectedOptions" value="option3" label="Música" />
        <vxv-checkbox v-model="selectedOptions" value="option4" label="Cine" />
        <vxv-checkbox v-model="selectedOptions" value="option5" label="Literatura" />
        <p class="text-white mt-2">Opciones seleccionadas: {{ selectedOptions.join(', ') }}</p>
      </div>
    `,
  }),
};

/**
 * Checkbox con contenido personalizado
 */
export const CustomContent: Story = {
  args: {
    modelValue: false,
  },
  render: (args) => ({
    components: { VxvCheckbox },
    setup() {
      return { args };
    },
    template: `
      <vxv-checkbox v-bind="args">
        Acepto los <a href="#" class="text-blue-400 hover:underline">términos y condiciones</a> y la 
        <a href="#" class="text-blue-400 hover:underline">política de privacidad</a>
      </vxv-checkbox>
    `,
  }),
};
