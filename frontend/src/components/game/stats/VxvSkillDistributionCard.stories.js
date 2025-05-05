import VxvSkillDistributionCard from './VxvSkillDistributionCard.vue';

export default {
  title: 'Game/Stats/VxvSkillDistributionCard',
  component: VxvSkillDistributionCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título de la tarjeta'
    },
    total: {
      control: 'number',
      description: 'Valor total de habilidades'
    },
    totalFormat: {
      control: 'text',
      description: 'Formato para el valor total'
    },
    showTotal: {
      control: 'boolean',
      description: 'Si se debe mostrar el valor total'
    },
    activeLabel: {
      control: 'text',
      description: 'Etiqueta para habilidades activas'
    },
    activeValue: {
      control: 'number',
      description: 'Valor de habilidades activas'
    },
    activeFormat: {
      control: 'text',
      description: 'Formato para el valor de habilidades activas'
    },
    inactiveLabel: {
      control: 'text',
      description: 'Etiqueta para habilidades inactivas'
    },
    inactiveValue: {
      control: 'number',
      description: 'Valor de habilidades inactivas'
    },
    inactiveFormat: {
      control: 'text',
      description: 'Formato para el valor de habilidades inactivas'
    },
    unlearnedLabel: {
      control: 'text',
      description: 'Etiqueta para habilidades no aprendidas'
    },
    unlearnedValue: {
      control: 'number',
      description: 'Valor de habilidades no aprendidas'
    },
    unlearnedFormat: {
      control: 'text',
      description: 'Formato para el valor de habilidades no aprendidas'
    },
    unavailableLabel: {
      control: 'text',
      description: 'Etiqueta para habilidades no disponibles'
    },
    unavailableValue: {
      control: 'number',
      description: 'Valor de habilidades no disponibles'
    },
    unavailableFormat: {
      control: 'text',
      description: 'Formato para el valor de habilidades no disponibles'
    },
    showChart: {
      control: 'boolean',
      description: 'Si se debe mostrar el gráfico de distribución'
    },
    showChartLegend: {
      control: 'boolean',
      description: 'Si se debe mostrar la leyenda del gráfico'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    title: 'Distribución de Habilidades',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    activeLabel: 'Activas',
    activeValue: 25,
    activeFormat: '{value}',
    inactiveLabel: 'Inactivas',
    inactiveValue: 15,
    inactiveFormat: '{value}',
    unlearnedLabel: 'No aprendidas',
    unlearnedValue: 40,
    unlearnedFormat: '{value}',
    unavailableLabel: 'No disponibles',
    unavailableValue: 20,
    unavailableFormat: '{value}',
    showChart: true,
    showChartLegend: true
  }
};

// Distribución con porcentajes
export const WithPercentages = {
  args: {
    title: 'Distribución de Habilidades',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    activeLabel: 'Activas',
    activeValue: 25,
    activeFormat: '{value} (25%)',
    inactiveLabel: 'Inactivas',
    inactiveValue: 15,
    inactiveFormat: '{value} (15%)',
    unlearnedLabel: 'No aprendidas',
    unlearnedValue: 40,
    unlearnedFormat: '{value} (40%)',
    unavailableLabel: 'No disponibles',
    unavailableValue: 20,
    unavailableFormat: '{value} (20%)',
    showChart: true,
    showChartLegend: true
  }
};

// Distribución sin gráfico
export const WithoutChart = {
  args: {
    title: 'Distribución de Habilidades',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    activeLabel: 'Activas',
    activeValue: 25,
    activeFormat: '{value}',
    inactiveLabel: 'Inactivas',
    inactiveValue: 15,
    inactiveFormat: '{value}',
    unlearnedLabel: 'No aprendidas',
    unlearnedValue: 40,
    unlearnedFormat: '{value}',
    unavailableLabel: 'No disponibles',
    unavailableValue: 20,
    unavailableFormat: '{value}',
    showChart: false,
    showChartLegend: false
  }
};

// Distribución con etiquetas personalizadas
export const WithCustomLabels = {
  args: {
    title: 'Estado de Conocimientos',
    total: 100,
    totalFormat: '{value} técnicas',
    showTotal: true,
    activeLabel: 'Dominadas',
    activeValue: 25,
    activeFormat: '{value}',
    inactiveLabel: 'En práctica',
    inactiveValue: 15,
    inactiveFormat: '{value}',
    unlearnedLabel: 'Por aprender',
    unlearnedValue: 40,
    unlearnedFormat: '{value}',
    unavailableLabel: 'Bloqueadas',
    unavailableValue: 20,
    unavailableFormat: '{value}',
    showChart: true,
    showChartLegend: true
  }
};

// Distribución con valores desequilibrados
export const UnbalancedDistribution = {
  args: {
    title: 'Distribución de Habilidades',
    total: 100,
    totalFormat: '{value} habilidades',
    showTotal: true,
    activeLabel: 'Activas',
    activeValue: 5,
    activeFormat: '{value}',
    inactiveLabel: 'Inactivas',
    inactiveValue: 5,
    inactiveFormat: '{value}',
    unlearnedLabel: 'No aprendidas',
    unlearnedValue: 80,
    unlearnedFormat: '{value}',
    unavailableLabel: 'No disponibles',
    unavailableValue: 10,
    unavailableFormat: '{value}',
    showChart: true,
    showChartLegend: true
  }
};
