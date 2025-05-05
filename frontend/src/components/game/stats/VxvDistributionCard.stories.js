import VxvDistributionCard from './VxvDistributionCard.vue';

export default {
  title: 'Game/Stats/VxvDistributionCard',
  component: VxvDistributionCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título de la tarjeta'
    },
    total: {
      control: 'number',
      description: 'Valor total'
    },
    totalFormat: {
      control: 'text',
      description: 'Formato para el valor total'
    },
    showTotal: {
      control: 'boolean',
      description: 'Si se debe mostrar el valor total'
    },
    items: {
      control: 'object',
      description: 'Array de items para mostrar'
    },
    barHeight: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Altura de las barras'
    },
    animated: {
      control: 'boolean',
      description: 'Si las barras deben animarse al cargar'
    },
    showFooter: {
      control: 'boolean',
      description: 'Si se debe mostrar el footer'
    },
    footerInfo: {
      control: 'object',
      description: 'Información adicional para el footer'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    title: 'Distribución',
    total: 100,
    totalFormat: '{value} items',
    showTotal: true,
    items: [
      { label: 'Item 1', value: 40, color: 'blue' },
      { label: 'Item 2', value: 30, color: 'green' },
      { label: 'Item 3', value: 20, color: 'red' },
      { label: 'Item 4', value: 10, color: 'purple' }
    ],
    barHeight: 'sm',
    animated: true,
    showFooter: false,
    footerInfo: []
  }
};

// Distribución por nivel
export const LevelDistribution = {
  args: {
    title: 'Distribución por Nivel',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    items: [
      { label: 'Nivel 0', value: 40, color: 'gray', format: '{value}' },
      { label: 'Nivel 1', value: 25, color: 'blue', format: '{value}' },
      { label: 'Nivel 2', value: 15, color: 'blue', format: '{value}' },
      { label: 'Nivel 3', value: 10, color: 'blue', format: '{value}' },
      { label: 'Nivel 4', value: 7, color: 'blue', format: '{value}' },
      { label: 'Nivel 5', value: 3, color: 'blue', format: '{value}' }
    ],
    barHeight: 'sm',
    animated: true,
    showFooter: true,
    footerInfo: [
      { label: 'Nivel más alto', value: '5' },
      { label: 'Nivel promedio', value: '2.3' }
    ]
  }
};

// Distribución por multiplicador
export const MultiplierDistribution = {
  args: {
    title: 'Distribución por Multiplicador',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    items: [
      { label: 'x1 (Básico)', value: 40, color: 'gray', format: '{value}' },
      { label: 'x2 (Intermedio)', value: 25, color: 'green', format: '{value}' },
      { label: 'x3 (Avanzado)', value: 20, color: 'blue', format: '{value}' },
      { label: 'x4 (Experto)', value: 10, color: 'purple', format: '{value}' },
      { label: 'x5 (Maestro)', value: 5, color: 'red', format: '{value}' }
    ],
    barHeight: 'sm',
    animated: true,
    showFooter: true,
    footerInfo: [
      { label: 'Multiplicador promedio', value: '2.1' }
    ]
  }
};

// Distribución con porcentajes
export const WithPercentages = {
  args: {
    title: 'Distribución con Porcentajes',
    total: 100,
    totalFormat: '{value} items',
    showTotal: true,
    items: [
      { label: 'Categoría A', value: 40, color: 'blue', format: '{value} (40%)' },
      { label: 'Categoría B', value: 30, color: 'green', format: '{value} (30%)' },
      { label: 'Categoría C', value: 20, color: 'red', format: '{value} (20%)' },
      { label: 'Categoría D', value: 10, color: 'purple', format: '{value} (10%)' }
    ],
    barHeight: 'sm',
    animated: true,
    showFooter: false
  }
};

// Distribución con barras más grandes
export const WithLargerBars = {
  args: {
    title: 'Distribución con Barras Grandes',
    total: 100,
    totalFormat: '{value} items',
    showTotal: true,
    items: [
      { label: 'Item 1', value: 40, color: 'blue' },
      { label: 'Item 2', value: 30, color: 'green' },
      { label: 'Item 3', value: 20, color: 'red' },
      { label: 'Item 4', value: 10, color: 'purple' }
    ],
    barHeight: 'md',
    animated: true,
    showFooter: false
  }
};
