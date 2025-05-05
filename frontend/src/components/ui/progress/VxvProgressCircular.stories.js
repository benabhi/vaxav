import { ref } from 'vue';
import VxvProgressCircular from './VxvProgressCircular.vue';

export default {
  title: 'UI/Progress/VxvProgressCircular',
  component: VxvProgressCircular,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number' },
      description: 'Valor actual de la barra de progreso'
    },
    min: {
      control: { type: 'number' },
      description: 'Valor mínimo de la barra de progreso'
    },
    max: {
      control: { type: 'number' },
      description: 'Valor máximo de la barra de progreso'
    },
    size: {
      control: { type: 'number' },
      description: 'Tamaño del círculo en píxeles'
    },
    thickness: {
      control: { type: 'number' },
      description: 'Grosor de la línea del círculo'
    },
    color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'purple', 'gray', '#3b82f6', '#10b981', '#ef4444'],
      description: 'Color de la barra de progreso'
    },
    backgroundColor: {
      control: { type: 'color' },
      description: 'Color de fondo de la barra de progreso'
    },
    showPercentage: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar el porcentaje en el centro'
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Si la barra debe animarse al cargar'
    },
    animationDuration: {
      control: { type: 'number' },
      description: 'Duración de la animación en milisegundos'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    value: 40,
    max: 100,
    size: 100,
    thickness: 8,
    color: 'blue',
    backgroundColor: '#1f2937',
    showPercentage: true,
    animated: true,
    animationDuration: 1500
  }
};

// Diferentes tamaños
export const Sizes = () => ({
  components: { VxvProgressCircular },
  template: `
    <div class="flex flex-wrap gap-4 items-center">
      <VxvProgressCircular value="40" size="50" thickness="4" showPercentage />
      <VxvProgressCircular value="50" size="80" thickness="6" showPercentage />
      <VxvProgressCircular value="60" size="100" thickness="8" showPercentage />
      <VxvProgressCircular value="70" size="120" thickness="10" showPercentage />
      <VxvProgressCircular value="80" size="150" thickness="12" showPercentage />
    </div>
  `
});

// Diferentes colores
export const Colors = () => ({
  components: { VxvProgressCircular },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvProgressCircular value="40" color="blue" showPercentage />
      <VxvProgressCircular value="50" color="green" showPercentage />
      <VxvProgressCircular value="60" color="red" showPercentage />
      <VxvProgressCircular value="70" color="yellow" showPercentage />
      <VxvProgressCircular value="80" color="purple" showPercentage />
      <VxvProgressCircular value="90" color="gray" showPercentage />
      <VxvProgressCircular value="100" color="#ff5722" showPercentage />
    </div>
  `
});

// Con contenido personalizado
export const CustomContent = () => ({
  components: { VxvProgressCircular },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvProgressCircular value="40" size="100">
        <div class="text-center">
          <div class="text-xl font-bold text-blue-500">4</div>
          <div class="text-xs text-gray-400">Nivel</div>
        </div>
      </VxvProgressCircular>

      <VxvProgressCircular value="75" size="100" color="green">
        <div class="text-center">
          <div class="text-xl font-bold text-green-500">75%</div>
          <div class="text-xs text-gray-400">Completado</div>
        </div>
      </VxvProgressCircular>

      <VxvProgressCircular value="90" size="100" color="purple">
        <div class="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </VxvProgressCircular>
    </div>
  `
});

// Progreso animado
export const AnimatedProgress = () => ({
  components: { VxvProgressCircular },
  setup() {
    const progress = ref(0);

    // Incrementar el progreso cada segundo
    const interval = setInterval(() => {
      progress.value = (progress.value + 5) % 100;
    }, 1000);

    // Limpiar el intervalo cuando el componente se desmonta
    onUnmounted(() => {
      clearInterval(interval);
    });

    return { progress };
  },
  template: `
    <div class="space-y-4">
      <div>Progreso: {{ progress }}%</div>
      <VxvProgressCircular
        :value="progress"
        :animated="false"
        showPercentage
      />
    </div>
  `
});
