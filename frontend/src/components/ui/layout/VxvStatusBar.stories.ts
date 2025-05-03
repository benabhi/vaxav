import type { Meta, StoryObj } from '@storybook/vue3';
import VxvStatusBar from './VxvStatusBar.vue';
import { ref } from 'vue';

// Metadatos de la historia
const meta = {
  title: 'UI/Layout/VxvStatusBar',
  component: VxvStatusBar,
  tags: ['autodocs'],
  argTypes: {
    showActionTimer: {
      control: 'boolean',
      description: 'Si se debe mostrar el cronómetro de acción en el centro',
      defaultValue: true
    },
    timerDuration: {
      control: { type: 'number', min: 10, max: 600, step: 10 },
      description: 'Duración total del cronómetro en segundos',
      defaultValue: 60
    },
    timerRemainingTime: {
      control: { type: 'number', min: 0, max: 600, step: 10 },
      description: 'Tiempo restante en segundos. Si es null, se usa timerDuration',
      defaultValue: null
    },
    timerAction: {
      control: 'text',
      description: 'Texto que describe la acción en curso',
      defaultValue: 'Cargando...'
    },
    timerIsActive: {
      control: 'boolean',
      description: 'Si el cronómetro está activo y contando',
      defaultValue: true
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
El componente VxvStatusBar es una barra de estado que se coloca en la parte inferior de la pantalla.

## Características

- Permanece fija en la parte inferior de la pantalla
- Incluye tres secciones personalizables: izquierda, centro y derecha
- La sección central muestra por defecto un cronómetro de acción (VxvActionTimer)
        `
      }
    },
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <div style="height: 100vh; display: flex; flex-direction: column; background-color: #111827; position: relative;">
          <div style="flex-grow: 1; padding: 20px;">
            <div style="padding: 20px; background-color: #1F2937; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: white; margin-top: 0;">Contenido de la página</h2>
              <p style="color: #9CA3AF;">Visualización de la barra de estado</p>
            </div>
          </div>
          <story />
          <footer style="background-color: #1F2937; color: white; padding: 20px; text-align: center; border-top: 1px solid #374151; position: relative; min-height: 80px;">
            <div style="margin-bottom: 10px; font-weight: bold; color: #60A5FA;">FOOTER</div>
            <p>&copy; 2023 Vaxav - MMO Espacial en Navegador Web</p>
          </footer>
        </div>
      `
    })
  ]
} satisfies Meta<typeof VxvStatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia básica
export const Default: Story = {
  args: {
    showActionTimer: true,
    timerDuration: 300,
    timerRemainingTime: 300,
    timerAction: 'Navegando',
    timerIsActive: true
  },
  render: (args) => ({
    components: { VxvStatusBar },
    setup() {
      const timerRemainingTime = ref(args.timerRemainingTime || args.timerDuration);

      const updateTimerRemainingTime = (time: number) => {
        timerRemainingTime.value = time;
      };

      return {
        ...args,
        timerRemainingTime,
        updateTimerRemainingTime
      };
    },
    template: `
      <VxvStatusBar
        :showActionTimer="showActionTimer"
        :timerDuration="timerDuration"
        :timerRemainingTime="timerRemainingTime"
        :timerAction="timerAction"
        :timerIsActive="timerIsActive"
        @update:timer-remaining-time="updateTimerRemainingTime"
      >
        <template #left>
          <div class="status-item">
            <span class="status-label">Créditos:</span>
            <span class="status-value">1,250,000 ISK</span>
          </div>
        </template>

        <template #right>
          <div class="status-item">
            <span class="status-label">Sistema:</span>
            <span class="status-value">Alpha Centauri</span>
          </div>
        </template>
      </VxvStatusBar>
    `
  })
};

// Historia sin cronómetro
export const WithoutTimer: Story = {
  args: {
    showActionTimer: false
  },
  render: (args) => ({
    components: { VxvStatusBar },
    setup() {
      return { ...args };
    },
    template: `
      <VxvStatusBar
        :showActionTimer="showActionTimer"
      >
        <template #left>
          <div class="status-item">
            <span class="status-label">Nave:</span>
            <span class="status-value">Viper Mk II</span>
          </div>
        </template>

        <template #center>
          <div style="color: #EF4444; font-weight: bold; text-align: center;">
            ¡ALERTA DE PROXIMIDAD!
          </div>
        </template>

        <template #right>
          <div class="status-item">
            <span class="status-label">Velocidad:</span>
            <span class="status-value">1,200 m/s</span>
          </div>
        </template>
      </VxvStatusBar>
    `
  })
};



// Historia con múltiples elementos en las secciones laterales
export const WithMultipleItems: Story = {
  args: {
    showActionTimer: true,
    timerDuration: 180,
    timerRemainingTime: 120,
    timerAction: 'Minando recursos',
    timerIsActive: true
  },
  render: (args) => ({
    components: { VxvStatusBar },
    setup() {
      const timerRemainingTime = ref(args.timerRemainingTime || args.timerDuration);

      const updateTimerRemainingTime = (time: number) => {
        timerRemainingTime.value = time;
      };

      return {
        ...args,
        timerRemainingTime,
        updateTimerRemainingTime
      };
    },
    template: `
      <VxvStatusBar
        :showActionTimer="showActionTimer"
        :timerDuration="timerDuration"
        :timerRemainingTime="timerRemainingTime"
        :timerAction="timerAction"
        :timerIsActive="timerIsActive"
        @update:timer-remaining-time="updateTimerRemainingTime"
      >
        <template #left>
          <div class="status-item">
            <span class="status-label">Créditos:</span>
            <span class="status-value">1,250,000 ISK</span>
          </div>
          <div class="status-item">
            <span class="status-label">Nave:</span>
            <span class="status-value">Viper Mk II</span>
          </div>
        </template>

        <template #right>
          <div class="status-item">
            <span class="status-label">Sistema:</span>
            <span class="status-value">Alpha Centauri</span>
          </div>
          <div class="status-item">
            <span class="status-label">Seguridad:</span>
            <span class="status-value" style="color: #10B981;">Alta</span>
          </div>
        </template>
      </VxvStatusBar>
    `
  })
};
