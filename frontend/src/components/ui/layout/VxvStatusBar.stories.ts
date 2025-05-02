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
Permanece fija mientras se hace scroll y se acopla automáticamente encima del footer cuando este es visible.

## Características

- Permanece fija en la parte inferior de la pantalla mientras se hace scroll
- Se acopla automáticamente encima del footer cuando este es visible
- Vuelve a flotar cuando el footer deja de ser visible
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
          <div style="flex-grow: 1; overflow: auto; padding: 20px;">
            <div style="min-height: 200vh; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="padding: 20px; background-color: #1F2937; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: white; margin-top: 0;">Contenido de la página</h2>
                <p style="color: #9CA3AF;">Haz scroll hacia abajo para ver cómo la barra de estado se acopla al footer cuando este es visible.</p>
              </div>
              <div style="padding: 20px; background-color: #1F2937; border-radius: 8px; margin-top: 20px;">
                <h2 style="color: white; margin-top: 0;">Contenido al final de la página</h2>
                <p style="color: #9CA3AF;">Cuando llegas aquí, la barra de estado debería acoplarse al footer.</p>
              </div>
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

      // Añadir un mensaje para explicar cómo ver el comportamiento
      const mounted = () => {
        setTimeout(() => {
          const message = document.createElement('div');
          message.style.position = 'fixed';
          message.style.top = '10px';
          message.style.left = '50%';
          message.style.transform = 'translateX(-50%)';
          message.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
          message.style.color = 'white';
          message.style.padding = '10px 20px';
          message.style.borderRadius = '8px';
          message.style.zIndex = '1000';
          message.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          message.style.fontSize = '14px';
          message.style.textAlign = 'center';
          message.innerHTML = '👇 Haz scroll hacia abajo para ver cómo la barra se acopla al footer 👇';
          document.body.appendChild(message);

          setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 1s ease';
            setTimeout(() => {
              document.body.removeChild(message);
            }, 1000);
          }, 5000);
        }, 1000);
      };

      return {
        ...args,
        timerRemainingTime,
        updateTimerRemainingTime,
        mounted
      };
    },
    mounted() {
      this.mounted();
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

// Historia específica para demostrar el comportamiento de acoplamiento
export const DockingBehavior: Story = {
  args: {
    showActionTimer: true,
    timerDuration: 300,
    timerRemainingTime: 300,
    timerAction: 'Demostración de acoplamiento',
    timerIsActive: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Esta historia demuestra cómo la barra de estado se acopla automáticamente al footer cuando este es visible. Haz scroll hacia abajo para ver el comportamiento.'
      }
    }
  },
  render: (args) => ({
    components: { VxvStatusBar },
    setup() {
      const timerRemainingTime = ref(args.timerRemainingTime || args.timerDuration);

      const updateTimerRemainingTime = (time: number) => {
        timerRemainingTime.value = time;
      };

      // Añadir un mensaje para explicar cómo ver el comportamiento
      const mounted = () => {
        setTimeout(() => {
          const message = document.createElement('div');
          message.style.position = 'fixed';
          message.style.top = '10px';
          message.style.left = '50%';
          message.style.transform = 'translateX(-50%)';
          message.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
          message.style.color = 'white';
          message.style.padding = '10px 20px';
          message.style.borderRadius = '8px';
          message.style.zIndex = '1000';
          message.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          message.style.fontSize = '14px';
          message.style.textAlign = 'center';
          message.innerHTML = '<strong>DEMOSTRACIÓN DE ACOPLAMIENTO</strong><br>👇 Haz scroll hacia abajo para ver cómo la barra se acopla al footer 👇';
          document.body.appendChild(message);

          // Iniciar scroll automático después de 2 segundos
          setTimeout(() => {
            const scrollHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const scrollDistance = scrollHeight - viewportHeight;

            // Scroll suave hacia abajo
            let currentScroll = 0;
            const scrollStep = 5;
            const scrollInterval = setInterval(() => {
              if (currentScroll >= scrollDistance) {
                clearInterval(scrollInterval);

                // Después de 2 segundos, scroll hacia arriba
                setTimeout(() => {
                  let upScroll = scrollDistance;
                  const upScrollInterval = setInterval(() => {
                    if (upScroll <= 0) {
                      clearInterval(upScrollInterval);
                      message.style.opacity = '0';
                      message.style.transition = 'opacity 1s ease';
                      setTimeout(() => {
                        document.body.removeChild(message);
                      }, 1000);
                    } else {
                      upScroll -= scrollStep;
                      window.scrollTo(0, upScroll);
                    }
                  }, 10);
                }, 2000);
              } else {
                currentScroll += scrollStep;
                window.scrollTo(0, currentScroll);
              }
            }, 10);
          }, 2000);
        }, 1000);
      };

      return {
        ...args,
        timerRemainingTime,
        updateTimerRemainingTime,
        mounted
      };
    },
    mounted() {
      this.mounted();
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
            <span class="status-label">Modo:</span>
            <span class="status-value">Demostración</span>
          </div>
        </template>

        <template #right>
          <div class="status-item">
            <span class="status-label">Estado:</span>
            <span class="status-value" style="color: #10B981;">Activo</span>
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
