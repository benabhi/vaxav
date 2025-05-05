import VxvGeneralProgressCard from './VxvGeneralProgressCard.vue';

export default {
  title: 'Game/Stats/VxvGeneralProgressCard',
  component: VxvGeneralProgressCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título de la tarjeta'
    },
    total: {
      control: 'text',
      description: 'Valor total (opcional)'
    },
    totalFormat: {
      control: 'text',
      description: 'Formato para el valor total'
    },
    showTotal: {
      control: 'boolean',
      description: 'Si se debe mostrar el valor total'
    },
    stat1Label: {
      control: 'text',
      description: 'Etiqueta para la primera estadística'
    },
    stat1Value: {
      control: 'number',
      description: 'Valor de la primera estadística'
    },
    stat1Max: {
      control: 'number',
      description: 'Valor máximo de la primera estadística'
    },
    stat1Color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'purple', 'gray'],
      description: 'Color de la primera estadística'
    },
    stat1Format: {
      control: 'text',
      description: 'Formato para el valor de la primera estadística'
    },
    stat2Label: {
      control: 'text',
      description: 'Etiqueta para la segunda estadística'
    },
    stat2Value: {
      control: 'number',
      description: 'Valor de la segunda estadística'
    },
    stat2Max: {
      control: 'number',
      description: 'Valor máximo de la segunda estadística'
    },
    stat2Color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'purple', 'gray'],
      description: 'Color de la segunda estadística'
    },
    stat2Format: {
      control: 'text',
      description: 'Formato para el valor de la segunda estadística'
    },
    progressLabel: {
      control: 'text',
      description: 'Etiqueta para la barra de progreso general'
    },
    progressValue: {
      control: 'number',
      description: 'Valor de la barra de progreso general'
    },
    progressMax: {
      control: 'number',
      description: 'Valor máximo de la barra de progreso general'
    },
    progressColor: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'yellow', 'purple', 'gray'],
      description: 'Color de la barra de progreso general'
    },
    progressFormat: {
      control: 'text',
      description: 'Formato para el valor de la barra de progreso general'
    },
    barHeight: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Altura de las barras de estadísticas'
    },
    progressBarHeight: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Altura de la barra de progreso general'
    },
    showProgressInfo: {
      control: 'boolean',
      description: 'Si se debe mostrar información adicional en la barra de progreso general'
    },
    showProgressPercentage: {
      control: 'boolean',
      description: 'Si se debe mostrar el porcentaje en la barra de progreso general'
    },
    animated: {
      control: 'boolean',
      description: 'Si las barras deben animarse al cargar'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    title: 'Progreso General',
    total: '45 habilidades',
    totalFormat: '{value}',
    showTotal: true,
    stat1Label: 'Activas',
    stat1Value: 25,
    stat1Max: 45,
    stat1Color: 'blue',
    stat1Format: '{value}',
    stat2Label: 'Inactivas',
    stat2Value: 15,
    stat2Max: 45,
    stat2Color: 'green',
    stat2Format: '{value}',
    progressLabel: 'Progreso Total',
    progressValue: 40,
    progressMax: 45,
    progressColor: 'purple',
    progressFormat: '{value}/{max}',
    barHeight: 'sm',
    progressBarHeight: 'md',
    showProgressInfo: false,
    showProgressPercentage: false,
    animated: true
  }
};

// Tarjeta de progreso de habilidades
export const SkillsProgress = {
  args: {
    title: 'Progreso de Habilidades',
    total: '45 habilidades',
    totalFormat: '{value}',
    showTotal: true,
    stat1Label: 'Activas',
    stat1Value: 25,
    stat1Max: 45,
    stat1Color: 'blue',
    stat1Format: '{value} habilidades',
    stat2Label: 'Inactivas',
    stat2Value: 15,
    stat2Max: 45,
    stat2Color: 'yellow',
    stat2Format: '{value} habilidades',
    progressLabel: 'Progreso Total',
    progressValue: 40,
    progressMax: 45,
    progressColor: 'purple',
    progressFormat: '{value}/{max} habilidades',
    barHeight: 'sm',
    progressBarHeight: 'md',
    showProgressInfo: true,
    showProgressPercentage: true,
    animated: true
  }
};

// Tarjeta de progreso de experiencia
export const ExperienceProgress = {
  args: {
    title: 'Progreso de Experiencia',
    total: '25,000 XP',
    totalFormat: '{value}',
    showTotal: true,
    stat1Label: 'Combate',
    stat1Value: 12500,
    stat1Max: 25000,
    stat1Color: 'red',
    stat1Format: '{value} XP',
    stat2Label: 'Exploración',
    stat2Value: 8500,
    stat2Max: 25000,
    stat2Color: 'green',
    stat2Format: '{value} XP',
    progressLabel: 'Experiencia Total',
    progressValue: 21000,
    progressMax: 25000,
    progressColor: 'blue',
    progressFormat: '{value}/{max} XP',
    barHeight: 'sm',
    progressBarHeight: 'md',
    showProgressInfo: true,
    showProgressPercentage: true,
    animated: true
  }
};

// Tarjeta de progreso de misiones
export const MissionsProgress = {
  args: {
    title: 'Progreso de Misiones',
    total: '120 misiones',
    totalFormat: '{value}',
    showTotal: true,
    stat1Label: 'Completadas',
    stat1Value: 85,
    stat1Max: 120,
    stat1Color: 'green',
    stat1Format: '{value}',
    stat2Label: 'En progreso',
    stat2Value: 15,
    stat2Max: 120,
    stat2Color: 'yellow',
    stat2Format: '{value}',
    progressLabel: 'Progreso Total',
    progressValue: 100,
    progressMax: 120,
    progressColor: 'purple',
    progressFormat: '{value}/{max}',
    barHeight: 'sm',
    progressBarHeight: 'md',
    showProgressInfo: false,
    showProgressPercentage: true,
    animated: true
  }
};
