import VxvCircularSkillLevel from './VxvCircularSkillLevel.vue';
import { BASE_XP_REQUIREMENTS } from '@/config/skillLevels';

export default {
  title: 'Game/Skills/VxvCircularSkillLevel',
  component: VxvCircularSkillLevel,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Nivel actual de la habilidad (0-5)'
    },
    currentXP: {
      control: { type: 'number' },
      description: 'Experiencia actual de la habilidad'
    },
    minXP: {
      control: { type: 'number' },
      description: 'Experiencia mínima para el nivel actual'
    },
    maxXP: {
      control: { type: 'number' },
      description: 'Experiencia necesaria para el siguiente nivel'
    },
    multiplier: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Multiplicador de la habilidad (1-5)'
    },
    size: {
      control: { type: 'number' },
      description: 'Tamaño del círculo en píxeles'
    },
    thickness: {
      control: { type: 'number' },
      description: 'Grosor de la línea del círculo'
    },
    status: {
      control: { type: 'select' },
      options: ['active', 'inactive', 'unlearned'],
      description: 'Estado de la habilidad'
    },
    backgroundColor: {
      control: { type: 'color' },
      description: 'Color de fondo del círculo'
    },
    levelLabel: {
      control: { type: 'text' },
      description: 'Etiqueta para el nivel'
    },
    xpSuffix: {
      control: { type: 'text' },
      description: 'Sufijo para la experiencia'
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Si los contadores deben animarse al cargar'
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
    level: 2,
    currentXP: 250,
    minXP: 200,
    maxXP: 500,
    multiplier: 1,
    size: 100,
    thickness: 8,
    status: 'active',
    backgroundColor: '#1f2937',
    levelLabel: 'Nivel',
    xpSuffix: '/300 XP',
    animated: true,
    animationDuration: 1500
  }
};

// Diferentes niveles
export const DifferentLevels = () => ({
  components: { VxvCircularSkillLevel },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvCircularSkillLevel 
        level="0" 
        currentXP="0" 
        minXP="0" 
        maxXP="50" 
        xpSuffix="/50 XP"
        status="unlearned"
      />
      <VxvCircularSkillLevel 
        level="1" 
        currentXP="100" 
        minXP="50" 
        maxXP="200" 
        xpSuffix="/150 XP"
      />
      <VxvCircularSkillLevel 
        level="2" 
        currentXP="250" 
        minXP="200" 
        maxXP="500" 
        xpSuffix="/300 XP"
      />
      <VxvCircularSkillLevel 
        level="3" 
        currentXP="700" 
        minXP="500" 
        maxXP="1100" 
        xpSuffix="/600 XP"
      />
      <VxvCircularSkillLevel 
        level="4" 
        currentXP="1500" 
        minXP="1100" 
        maxXP="2100" 
        xpSuffix="/1000 XP"
      />
      <VxvCircularSkillLevel 
        level="5" 
        currentXP="2100" 
        minXP="2100" 
        maxXP="2100" 
        xpSuffix=" XP"
      />
    </div>
  `
});

// Diferentes estados
export const DifferentStatuses = () => ({
  components: { VxvCircularSkillLevel },
  template: `
    <div class="flex flex-wrap gap-4">
      <div class="text-center">
        <VxvCircularSkillLevel 
          level="3" 
          currentXP="700" 
          minXP="500" 
          maxXP="1100" 
          status="active"
          xpSuffix="/600 XP"
        />
        <div class="mt-2 text-sm text-gray-400">Activa</div>
      </div>
      
      <div class="text-center">
        <VxvCircularSkillLevel 
          level="3" 
          currentXP="700" 
          minXP="500" 
          maxXP="1100" 
          status="inactive"
          xpSuffix="/600 XP"
        />
        <div class="mt-2 text-sm text-gray-400">Inactiva</div>
      </div>
      
      <div class="text-center">
        <VxvCircularSkillLevel 
          level="0" 
          currentXP="0" 
          minXP="0" 
          maxXP="50" 
          status="unlearned"
          xpSuffix="/50 XP"
        />
        <div class="mt-2 text-sm text-gray-400">No aprendida</div>
      </div>
    </div>
  `
});

// Diferentes tamaños
export const DifferentSizes = () => ({
  components: { VxvCircularSkillLevel },
  template: `
    <div class="flex flex-wrap gap-4 items-center">
      <VxvCircularSkillLevel 
        level="3" 
        currentXP="700" 
        minXP="500" 
        maxXP="1100" 
        size="80"
        thickness="6"
        xpSuffix="/600 XP"
      />
      <VxvCircularSkillLevel 
        level="3" 
        currentXP="700" 
        minXP="500" 
        maxXP="1100" 
        size="100"
        thickness="8"
        xpSuffix="/600 XP"
      />
      <VxvCircularSkillLevel 
        level="3" 
        currentXP="700" 
        minXP="500" 
        maxXP="1100" 
        size="120"
        thickness="10"
        xpSuffix="/600 XP"
      />
      <VxvCircularSkillLevel 
        level="3" 
        currentXP="700" 
        minXP="500" 
        maxXP="1100" 
        size="150"
        thickness="12"
        xpSuffix="/600 XP"
      />
    </div>
  `
});

// Diferentes multiplicadores
export const DifferentMultipliers = () => ({
  components: { VxvCircularSkillLevel },
  setup() {
    // Calcular XP para cada multiplicador
    const getXPForMultiplier = (multiplier) => {
      const baseXP = BASE_XP_REQUIREMENTS[2]; // Nivel 2 -> 3
      return baseXP * multiplier;
    };
    
    return { getXPForMultiplier };
  },
  template: `
    <div class="flex flex-wrap gap-4">
      <div v-for="multiplier in [1, 2, 3, 4, 5]" :key="multiplier" class="text-center">
        <VxvCircularSkillLevel 
          level="2" 
          currentXP="250" 
          minXP="200" 
          :maxXP="200 + getXPForMultiplier(multiplier)" 
          :multiplier="multiplier"
          :xpSuffix="'/' + getXPForMultiplier(multiplier) + ' XP'"
        />
        <div class="mt-2 text-sm text-gray-400">x{{ multiplier }}</div>
      </div>
    </div>
  `
});
