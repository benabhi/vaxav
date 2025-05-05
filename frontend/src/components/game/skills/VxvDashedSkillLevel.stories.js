import VxvDashedSkillLevel from './VxvDashedSkillLevel.vue';

export default {
  title: 'Game/Skills/VxvDashedSkillLevel',
  component: VxvDashedSkillLevel,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Nivel actual de la habilidad (0-5)'
    },
    maxLevel: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Nivel máximo posible'
    },
    status: {
      control: { type: 'select' },
      options: ['active', 'inactive', 'unlearned'],
      description: 'Estado de la habilidad'
    },
    height: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Altura de las líneas'
    },
    animated: {
      control: 'boolean',
      description: 'Si las barras deben animarse al cargar'
    },
    animationDuration: {
      control: { type: 'number', min: 100, max: 2000, step: 100 },
      description: 'Duración de la animación en milisegundos'
    },
    staggerDelay: {
      control: { type: 'number', min: 50, max: 500, step: 50 },
      description: 'Retraso entre la animación de cada barra (en milisegundos)'
    }
  }
};

// Historia básica
export const Default = {
  args: {
    level: 3,
    maxLevel: 5,
    status: 'active',
    height: 'sm',
    animated: false,
    animationDuration: 400,
    staggerDelay: 250
  }
};

// Diferentes niveles
export const DifferentLevels = () => ({
  components: { VxvDashedSkillLevel },
  template: `
    <div class="space-y-4">
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 0:</span>
        <VxvDashedSkillLevel level="0" maxLevel="5" status="unlearned" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 1:</span>
        <VxvDashedSkillLevel level="1" maxLevel="5" status="active" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 2:</span>
        <VxvDashedSkillLevel level="2" maxLevel="5" status="active" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 3:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" status="active" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 4:</span>
        <VxvDashedSkillLevel level="4" maxLevel="5" status="active" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Nivel 5:</span>
        <VxvDashedSkillLevel level="5" maxLevel="5" status="active" />
      </div>
    </div>
  `
});

// Diferentes estados
export const DifferentStatuses = () => ({
  components: { VxvDashedSkillLevel },
  template: `
    <div class="space-y-4">
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Activa:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" status="active" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Inactiva:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" status="inactive" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">No aprendida:</span>
        <VxvDashedSkillLevel level="0" maxLevel="5" status="unlearned" />
      </div>
    </div>
  `
});

// Diferentes alturas
export const DifferentHeights = () => ({
  components: { VxvDashedSkillLevel },
  template: `
    <div class="space-y-4">
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">XS:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" height="xs" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">SM:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" height="sm" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">MD:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" height="md" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">LG:</span>
        <VxvDashedSkillLevel level="3" maxLevel="5" height="lg" />
      </div>
    </div>
  `
});

// Diferentes niveles máximos
export const DifferentMaxLevels = () => ({
  components: { VxvDashedSkillLevel },
  template: `
    <div class="space-y-4">
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Max 3:</span>
        <VxvDashedSkillLevel level="2" maxLevel="3" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Max 4:</span>
        <VxvDashedSkillLevel level="2" maxLevel="4" />
      </div>
      <div class="flex items-center">
        <span class="w-16 text-sm text-gray-400">Max 5:</span>
        <VxvDashedSkillLevel level="2" maxLevel="5" />
      </div>
    </div>
  `
});

// Animación básica
export const AnimatedLevel3 = {
  args: {
    level: 3,
    maxLevel: 5,
    status: 'active',
    height: 'sm',
    animated: true,
    animationDuration: 400,
    staggerDelay: 250
  },
  parameters: {
    docs: {
      description: {
        story: 'Muestra una animación secuencial de nivel 3 con un retraso de 250ms entre barras.'
      }
    }
  },
  // Función que se ejecuta cuando se carga la historia
  play: async ({ canvasElement }) => {
    // Obtener el elemento del componente
    const component = canvasElement.querySelector('.vxv-dashed-skill-level');

    if (component) {
      // Forzar un reflow del DOM para reiniciar las animaciones
      component.offsetHeight;
    }
  }
};

// Animación rápida
export const AnimatedLevel4Fast = {
  args: {
    level: 4,
    maxLevel: 5,
    status: 'active',
    height: 'sm',
    animated: true,
    animationDuration: 200,
    staggerDelay: 150
  },
  parameters: {
    docs: {
      description: {
        story: 'Muestra una animación rápida de nivel 4 con un retraso de 150ms entre barras.'
      }
    }
  }
};

// Animación lenta
export const AnimatedLevel5Slow = {
  args: {
    level: 5,
    maxLevel: 5,
    status: 'active',
    height: 'sm',
    animated: true,
    animationDuration: 600,
    staggerDelay: 300
  },
  parameters: {
    docs: {
      description: {
        story: 'Muestra una animación lenta de nivel 5 con un retraso de 300ms entre barras.'
      }
    }
  }
};
