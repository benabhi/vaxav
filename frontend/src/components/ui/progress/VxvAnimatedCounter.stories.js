import { ref } from 'vue';
import VxvAnimatedCounter from './VxvAnimatedCounter.vue';

export default {
  title: 'UI/Progress/VxvAnimatedCounter',
  component: VxvAnimatedCounter,
  tags: ['autodocs'],
  argTypes: {
    initialValue: {
      control: { type: 'number' },
      description: 'Valor inicial del contador'
    },
    finalValue: {
      control: { type: 'number' },
      description: 'Valor final del contador'
    },
    duration: {
      control: { type: 'number' },
      description: 'Duración de la animación en milisegundos'
    },
    steps: {
      control: { type: 'number' },
      description: 'Número de pasos para la animación'
    },
    prefix: {
      control: { type: 'text' },
      description: 'Prefijo para añadir antes del valor'
    },
    suffix: {
      control: { type: 'text' },
      description: 'Sufijo para añadir después del valor'
    },
    inline: {
      control: { type: 'boolean' },
      description: 'Si el contador debe ser un elemento en línea'
    },
    autoStart: {
      control: { type: 'boolean' },
      description: 'Si la animación debe comenzar automáticamente'
    },
    isDecrement: {
      control: { type: 'boolean' },
      description: 'Si la animación debe ser de incremento o decremento'
    },
    decimals: {
      control: { type: 'number' },
      description: 'Número de decimales a mostrar'
    },
    thousandsSeparator: {
      control: { type: 'text' },
      description: 'Separador de miles'
    },
    decimalSeparator: {
      control: { type: 'text' },
      description: 'Separador decimal'
    },
    easing: {
      control: { type: 'select' },
      options: ['linear', 'easeIn', 'easeOut', 'easeInOut'],
      description: 'Tipo de curva de animación'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    initialValue: 0,
    finalValue: 1000,
    duration: 1500,
    autoStart: true
  }
};

// Contador con prefijo y sufijo
export const WithPrefixAndSuffix = {
  args: {
    initialValue: 0,
    finalValue: 1000,
    duration: 1500,
    prefix: '$',
    suffix: ' XP',
    autoStart: true
  }
};

// Contador con decimales
export const WithDecimals = {
  args: {
    initialValue: 0,
    finalValue: 1000,
    duration: 1500,
    decimals: 2,
    autoStart: true
  }
};

// Contador con diferentes curvas de animación
export const EasingTypes = () => ({
  components: { VxvAnimatedCounter },
  template: `
    <div class="space-y-4">
      <div>
        <strong>Linear:</strong>
        <VxvAnimatedCounter :initialValue="0" :finalValue="1000" easing="linear" />
      </div>
      <div>
        <strong>Ease In:</strong>
        <VxvAnimatedCounter :initialValue="0" :finalValue="1000" easing="easeIn" />
      </div>
      <div>
        <strong>Ease Out:</strong>
        <VxvAnimatedCounter :initialValue="0" :finalValue="1000" easing="easeOut" />
      </div>
      <div>
        <strong>Ease In Out:</strong>
        <VxvAnimatedCounter :initialValue="0" :finalValue="1000" easing="easeInOut" />
      </div>
    </div>
  `
});

// Contador con formato personalizado
export const WithCustomFormat = {
  args: {
    initialValue: 0,
    finalValue: 1000000,
    duration: 2000,
    formatValue: (value) => `${(value / 1000).toFixed(1)}K`,
    autoStart: true
  }
};

// Contador con control manual
export const ManualControl = () => ({
  components: { VxvAnimatedCounter },
  setup() {
    const counterRef = ref(null);
    const currentValue = ref(0);
    const finalValue = ref(1000);

    const startAnimation = () => {
      if (counterRef.value) {
        counterRef.value.startAnimation();
      }
    };

    const stopAnimation = () => {
      if (counterRef.value) {
        counterRef.value.stopAnimation();
      }
    };

    const resetAnimation = () => {
      if (counterRef.value) {
        counterRef.value.resetAnimation();
      }
    };

    return {
      counterRef,
      currentValue,
      finalValue,
      startAnimation,
      stopAnimation,
      resetAnimation
    };
  },
  template: `
    <div class="space-y-4">
      <div>
        <VxvAnimatedCounter
          ref="counterRef"
          :initialValue="0"
          :finalValue="finalValue"
          :autoStart="false"
          @update:value="currentValue = $event"
        />
      </div>
      <div>Valor actual: {{ currentValue }}</div>
      <div class="flex space-x-2">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded"
          @click="startAnimation"
        >
          Iniciar
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded"
          @click="stopAnimation"
        >
          Detener
        </button>
        <button
          class="px-4 py-2 bg-gray-500 text-white rounded"
          @click="resetAnimation"
        >
          Reiniciar
        </button>
      </div>
    </div>
  `
});

// Contador con valores que cambian
export const ChangingValues = () => ({
  components: { VxvAnimatedCounter },
  setup() {
    const finalValue = ref(1000);

    const increaseValue = () => {
      finalValue.value += 500;
    };

    const decreaseValue = () => {
      finalValue.value = Math.max(0, finalValue.value - 500);
    };

    return {
      finalValue,
      increaseValue,
      decreaseValue
    };
  },
  template: `
    <div class="space-y-4">
      <div>
        <VxvAnimatedCounter
          :initialValue="0"
          :finalValue="finalValue"
          suffix=" XP"
        />
      </div>
      <div class="flex space-x-2">
        <button
          class="px-4 py-2 bg-green-500 text-white rounded"
          @click="increaseValue"
        >
          +500 XP
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded"
          @click="decreaseValue"
        >
          -500 XP
        </button>
      </div>
    </div>
  `
});
