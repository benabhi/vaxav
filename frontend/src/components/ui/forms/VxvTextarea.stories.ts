import type { Meta, StoryObj } from '@storybook/vue3';
import VxvTextarea from './VxvTextarea.vue';

/**
 * VxvTextarea es el componente de área de texto principal de la aplicación.
 * Permite a los usuarios ingresar texto en múltiples líneas.
 */
const meta: Meta<typeof VxvTextarea> = {
  title: 'UI/Forms/VxvTextarea',
  component: VxvTextarea,
  tags: ['autodocs'],
  argTypes: {
    id: {
      description: 'ID único del textarea',
      control: { type: 'text' },
    },
    modelValue: {
      description: 'Valor del textarea (v-model)',
      control: { type: 'text' },
    },
    label: {
      description: 'Etiqueta del campo',
      control: { type: 'text' },
    },
    labelClass: {
      description: 'Clases CSS adicionales para la etiqueta',
      control: { type: 'text' },
    },
    helpText: {
      description: 'Texto de ayuda que se muestra debajo del textarea',
      control: { type: 'text' },
    },
    error: {
      description: 'Mensaje de error',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'Texto de placeholder',
      control: { type: 'text' },
    },
    rows: {
      description: 'Número de filas del textarea',
      control: { type: 'number' },
    },
    disabled: {
      description: 'Deshabilita el textarea',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Marca el campo como requerido',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvTextarea>;

/**
 * Textarea básico
 */
export const Default: Story = {
  args: {
    id: 'textarea-default',
    modelValue: '',
    label: 'Descripción',
    placeholder: 'Ingrese una descripción',
    rows: 3,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Textarea con texto de ayuda
 */
export const WithHelpText: Story = {
  args: {
    id: 'textarea-help',
    modelValue: '',
    label: 'Biografía',
    placeholder: 'Cuéntanos sobre ti',
    helpText: 'Máximo 500 caracteres',
    rows: 4,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Textarea con error
 */
export const WithError: Story = {
  args: {
    id: 'textarea-error',
    modelValue: 'Texto demasiado corto',
    label: 'Comentarios',
    placeholder: 'Ingrese sus comentarios',
    error: 'El comentario debe tener al menos 20 caracteres',
    rows: 3,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Textarea deshabilitado
 */
export const Disabled: Story = {
  args: {
    id: 'textarea-disabled',
    modelValue: 'Este contenido no se puede editar',
    label: 'Términos y condiciones',
    disabled: true,
    rows: 5,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Textarea requerido
 */
export const Required: Story = {
  args: {
    id: 'textarea-required',
    modelValue: '',
    label: 'Justificación',
    placeholder: 'Explique por qué solicita este cambio',
    required: true,
    rows: 3,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Textarea con diferentes tamaños
 */
export const DifferentSizes: Story = {
  render: () => ({
    components: { VxvTextarea },
    template: `
      <div class="space-y-4">
        <vxv-textarea 
          id="textarea-small" 
          label="Textarea pequeño" 
          placeholder="2 filas" 
          :rows="2" 
        />
        <vxv-textarea 
          id="textarea-medium" 
          label="Textarea mediano" 
          placeholder="4 filas" 
          :rows="4" 
        />
        <vxv-textarea 
          id="textarea-large" 
          label="Textarea grande" 
          placeholder="6 filas" 
          :rows="6" 
        />
      </div>
    `,
  }),
};

/**
 * Textarea con valor inicial
 */
export const WithInitialValue: Story = {
  args: {
    id: 'textarea-initial-value',
    modelValue: 'Este es un texto de ejemplo que ya está cargado en el textarea cuando se inicializa el componente.',
    label: 'Contenido precargado',
    rows: 4,
  },
  render: (args) => ({
    components: { VxvTextarea },
    setup() {
      return { args };
    },
    template: '<vxv-textarea v-bind="args" />',
  }),
};

/**
 * Formulario con múltiples textareas
 */
export const FormWithMultipleTextareas: Story = {
  render: () => ({
    components: { VxvTextarea },
    template: `
      <form class="space-y-4">
        <vxv-textarea 
          id="textarea-strengths" 
          label="Fortalezas" 
          placeholder="Describa sus principales fortalezas" 
          :rows="3" 
        />
        <vxv-textarea 
          id="textarea-weaknesses" 
          label="Áreas de mejora" 
          placeholder="Describa sus áreas de mejora" 
          :rows="3" 
        />
        <vxv-textarea 
          id="textarea-goals" 
          label="Objetivos" 
          placeholder="Describa sus objetivos a corto y largo plazo" 
          :rows="3" 
        />
        <div class="flex justify-end">
          <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md">Enviar</button>
        </div>
      </form>
    `,
  }),
};
