import type { Meta, StoryObj } from '@storybook/vue3';
import VxvActionTimer from './VxvActionTimer.vue';

/**
 * VxvActionTimer es un componente que muestra un cronómetro semi-circular que indica el tiempo restante para una acción.
 * Está diseñado para ser colocado entre el contenido principal y el footer, abarcando ambas secciones.
 */
const meta: Meta<typeof VxvActionTimer> = {
  title: 'UI/Timers/VxvActionTimer',
  component: VxvActionTimer,
  tags: ['autodocs'],
  argTypes: {
    duration: {
      description: 'Duración total en segundos',
      control: { type: 'number' },
    },
    remainingTime: {
      description: 'Tiempo restante en segundos',
      control: { type: 'number' },
    },
    action: {
      description: 'Acción que se está realizando',
      control: { type: 'text' },
    },
    isActive: {
      description: 'Si el cronómetro está activo',
      control: { type: 'boolean' },
    },
    autoStart: {
      description: 'Si el cronómetro debe iniciar automáticamente',
      control: { type: 'boolean' },
    },
    onComplete: { action: 'complete' },
    'onUpdate:remainingTime': { action: 'update:remainingTime' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvActionTimer>;

/**
 * Cronómetro de acción básico
 */
export const Default: Story = {
  args: {
    duration: 60,
    remainingTime: 45,
    action: 'Navegando',
    isActive: true,
    autoStart: false,
  },
  render: (args) => ({
    components: { VxvActionTimer },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 p-8" style="height: 200px; position: relative; overflow: visible;">
        <VxvActionTimer
          v-bind="args"
          @complete="args.onComplete"
          @update:remaining-time="args['onUpdate:remainingTime']"
        />
      </div>
    `,
  }),
};

/**
 * Cronómetro de acción con diferentes niveles de progreso
 */
export const ProgressStages: Story = {
  render: () => ({
    components: { VxvActionTimer },
    template: `
      <div class="bg-gray-900 p-8 space-y-4">
        <div class="mb-2 text-white text-sm">25% Completado</div>
        <VxvActionTimer
          :duration="100"
          :remaining-time="75"
          action="Progreso 25%"
          :is-active="true"
          :auto-start="false"
        />

        <div class="mb-2 text-white text-sm mt-4">50% Completado</div>
        <VxvActionTimer
          :duration="100"
          :remaining-time="50"
          action="Progreso 50%"
          :is-active="true"
          :auto-start="false"
        />

        <div class="mb-2 text-white text-sm mt-4">75% Completado</div>
        <VxvActionTimer
          :duration="100"
          :remaining-time="25"
          action="Progreso 75%"
          :is-active="true"
          :auto-start="false"
        />

        <div class="mb-2 text-white text-sm mt-4">95% Completado</div>
        <VxvActionTimer
          :duration="100"
          :remaining-time="5"
          action="Casi completado"
          :is-active="true"
          :auto-start="false"
        />
      </div>
    `,
  }),
};

/**
 * Cronómetro de acción con tiempo casi agotado
 */
export const AlmostComplete: Story = {
  args: {
    duration: 60,
    remainingTime: 5,
    action: 'Finalizando...',
    isActive: true,
    autoStart: false,
  },
  render: (args) => ({
    components: { VxvActionTimer },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 p-8" style="height: 200px; position: relative;">
        <VxvActionTimer
          v-bind="args"
          @complete="args.onComplete"
          @update:remaining-time="args['onUpdate:remainingTime']"
        />
      </div>
    `,
  }),
};

/**
 * Cronómetro de acción inactivo
 */
export const Inactive: Story = {
  args: {
    duration: 60,
    remainingTime: 30,
    action: 'En pausa',
    isActive: false,
    autoStart: false,
  },
  render: (args) => ({
    components: { VxvActionTimer },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 p-8" style="height: 200px; position: relative;">
        <VxvActionTimer
          v-bind="args"
          @complete="args.onComplete"
          @update:remaining-time="args['onUpdate:remainingTime']"
        />
      </div>
    `,
  }),
};

/**
 * Cronómetro de acción con texto largo
 */
export const LongActionText: Story = {
  args: {
    duration: 120,
    remainingTime: 90,
    action: 'Procesando una transacción muy importante que requiere tiempo',
    isActive: true,
    autoStart: false,
  },
  render: (args) => ({
    components: { VxvActionTimer },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 p-8" style="height: 200px; position: relative;">
        <VxvActionTimer
          v-bind="args"
          @complete="args.onComplete"
          @update:remaining-time="args['onUpdate:remainingTime']"
        />
      </div>
    `,
  }),
};

/**
 * Cronómetro de acción en un layout de aplicación
 */
export const InAppLayout: Story = {
  render: () => ({
    components: { VxvActionTimer },
    setup() {
      return {
        duration: 120,
        remainingTime: 75,
        action: 'Cargando datos',
        isActive: true,
      };
    },
    template: `
      <div class="flex flex-col bg-gray-900" style="height: 400px;">
        <!-- Header simulado -->
        <div class="bg-gray-800 p-4 border-b border-gray-700">
          <h1 class="text-xl font-semibold text-white">Título de la página</h1>
        </div>

        <!-- Contenido principal -->
        <div class="flex-grow p-6 bg-gray-900">
          <div class="bg-gray-800 p-4 rounded-lg">
            <h2 class="text-lg font-medium text-white mb-2">Contenido principal</h2>
            <p class="text-gray-300">Este es el contenido principal de la página.</p>
          </div>
        </div>

        <!-- Cronómetro de acción -->
        <VxvActionTimer
          :duration="duration"
          :remaining-time="remainingTime"
          :action="action"
          :is-active="isActive"
        />

        <!-- Footer simulado -->
        <div class="bg-gray-800 p-4 border-t border-gray-700">
          <p class="text-sm text-gray-400 text-center">© 2023 VAXAV. Todos los derechos reservados.</p>
        </div>
      </div>
    `,
  }),
};
