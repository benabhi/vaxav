import { ref } from 'vue';
import VxvProgressBar from './VxvProgressBar.vue';

export default {
  title: 'UI/Progress/VxvProgressBar',
  component: VxvProgressBar,
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
    color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'purple', 'gray'],
      description: 'Color de la barra de progreso'
    },
    height: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Altura de la barra de progreso'
    },
    label: {
      control: { type: 'text' },
      description: 'Etiqueta para mostrar junto a la barra de progreso'
    },
    showValue: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar el valor actual'
    },
    showPercentage: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar el porcentaje'
    },
    showMinMax: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar el valor mínimo y máximo'
    },
    showInfo: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar información adicional debajo de la barra'
    },
    showLabels: {
      control: { type: 'boolean' },
      description: 'Si se debe mostrar etiquetas encima de la barra'
    },
    suffix: {
      control: { type: 'text' },
      description: 'Sufijo para añadir al valor (ej: "XP", "%")'
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Si la barra debe animarse al cargar'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    value: 40,
    max: 100,
    label: 'Progreso',
    showValue: true,
    showInfo: true,
    showLabels: true
  }
};

// Barra de progreso con diferentes colores
export const Colors = () => ({
  components: { VxvProgressBar },
  template: `
    <div class="space-y-4">
      <VxvProgressBar value="30" max="100" color="blue" label="Azul" />
      <VxvProgressBar value="40" max="100" color="green" label="Verde" />
      <VxvProgressBar value="50" max="100" color="red" label="Rojo" />
      <VxvProgressBar value="60" max="100" color="yellow" label="Amarillo" />
      <VxvProgressBar value="70" max="100" color="purple" label="Púrpura" />
      <VxvProgressBar value="80" max="100" color="gray" label="Gris" />
    </div>
  `
});

// Barra de progreso con diferentes alturas
export const Heights = () => ({
  components: { VxvProgressBar },
  template: `
    <div class="space-y-4">
      <VxvProgressBar value="60" max="100" height="xs" label="Extra pequeña" />
      <VxvProgressBar value="60" max="100" height="sm" label="Pequeña" />
      <VxvProgressBar value="60" max="100" height="md" label="Mediana" />
      <VxvProgressBar value="60" max="100" height="lg" label="Grande" />
    </div>
  `
});

// Barra de progreso con información adicional
export const WithInfo = () => ({
  components: { VxvProgressBar },
  template: `
    <div class="space-y-4">
      <VxvProgressBar
        value="750"
        max="1000"
        label="Experiencia Total"
        showPercentage
        showMinMax
        suffix=" XP"
      />
      <VxvProgressBar
        value="3"
        max="5"
        label="Nivel de Habilidad"
        showPercentage
        showMinMax
      />
    </div>
  `
});

// Barra de progreso con formato personalizado
export const WithCustomFormat = () => ({
  components: { VxvProgressBar },
  setup() {
    const formatValue = (value) => `${value.toLocaleString()} XP`;
    const formatMax = (max) => `${max.toLocaleString()} XP`;

    return { formatValue, formatMax };
  },
  template: `
    <div class="space-y-4">
      <VxvProgressBar
        value="12500"
        max="25000"
        label="Experiencia Total"
        :formatValue="formatValue"
        :formatMax="formatMax"
        showMinMax
      />
    </div>
  `
});

// Barra de progreso animada
export const Animated = () => ({
  components: { VxvProgressBar },
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
      <VxvProgressBar
        :value="progress"
        max="100"
        label="Progreso Animado"
        showPercentage
        animated
      />
    </div>
  `
});
