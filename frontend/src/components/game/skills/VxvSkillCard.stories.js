import VxvSkillCard from './VxvSkillCard.vue';
import { DEFAULT_XP_REQUIREMENTS } from '@/config/skillLevels';

export default {
  title: 'Game/Skills/VxvSkillCard',
  component: VxvSkillCard,
  tags: ['autodocs'],
  argTypes: {
    skill: {
      control: 'object',
      description: 'Datos de la habilidad'
    },
    status: {
      control: { type: 'select' },
      options: ['active', 'inactive', 'unlearned'],
      description: 'Estado de la habilidad'
    },
    available: {
      control: 'boolean',
      description: 'Si la habilidad está disponible para aprender'
    },
    animated: {
      control: 'boolean',
      description: 'Si los elementos deben animarse al cargar'
    },
    animationDuration: {
      control: 'number',
      description: 'Duración de la animación en milisegundos'
    },
    index: {
      control: 'number',
      description: 'Índice de la tarjeta (para animaciones escalonadas)'
    }
  }
};

// Crear una habilidad de ejemplo
const createSkill = (level, multiplier, status) => {
  // Calcular XP para el nivel actual
  const getMinXP = (level) => {
    if (level === 0) return 0;

    let xp = 0;
    for (let i = 0; i < level; i++) {
      xp += DEFAULT_XP_REQUIREMENTS[i] * multiplier;
    }
    return xp;
  };

  // Calcular XP para el siguiente nivel
  const getMaxXP = (level) => {
    if (level >= 5) return getMinXP(5);
    return getMinXP(level + 1);
  };

  // Calcular XP actual (entre el mínimo y el máximo)
  const minXP = getMinXP(level);
  const maxXP = getMaxXP(level);
  const currentXP = level >= 5 ? minXP : minXP + Math.floor((maxXP - minXP) * 0.6);

  return {
    id: 1,
    name: 'Armas Láser Avanzadas',
    category: 'Combate',
    description: 'Dominio avanzado de sistemas láser, permitiendo mayor daño y eficiencia energética. Incluye técnicas de enfoque de haz y gestión térmica para maximizar el rendimiento en combate.',
    level,
    multiplier,
    currentXP,
    minXP,
    maxXP,
    prerequisites: [
      {
        id: 2,
        name: 'Armas Láser Básicas',
        level: 3,
        fulfilled: true
      },
      {
        id: 3,
        name: 'Electrónica Básica',
        level: 2,
        fulfilled: status !== 'unlearned'
      }
    ]
  };
};

// Historia básica
export const Default = {
  args: {
    skill: createSkill(3, 2, 'active'),
    status: 'active',
    available: true,
    animated: true,
    animationDuration: 1500,
    index: 0
  }
};

// Diferentes estados
export const DifferentStatuses = () => ({
  components: { VxvSkillCard },
  setup() {
    const activeSkill = createSkill(3, 2, 'active');
    const inactiveSkill = createSkill(3, 2, 'inactive');
    const unlearnedSkill = createSkill(0, 2, 'unlearned');

    return { activeSkill, inactiveSkill, unlearnedSkill };
  },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvSkillCard
        :skill="activeSkill"
        status="active"
        :index="0"
      />
      <VxvSkillCard
        :skill="inactiveSkill"
        status="inactive"
        :index="1"
      />
      <VxvSkillCard
        :skill="unlearnedSkill"
        status="unlearned"
        :index="2"
      />
    </div>
  `
});

// Diferentes niveles
export const DifferentLevels = () => ({
  components: { VxvSkillCard },
  setup() {
    const skills = [0, 1, 2, 3, 4, 5].map(level => ({
      skill: createSkill(level, 2, level > 0 ? 'active' : 'unlearned'),
      status: level > 0 ? 'active' : 'unlearned'
    }));

    return { skills };
  },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvSkillCard
        v-for="(item, index) in skills"
        :key="index"
        :skill="item.skill"
        :status="item.status"
        :index="index"
      />
    </div>
  `
});

// Diferentes multiplicadores
export const DifferentMultipliers = () => ({
  components: { VxvSkillCard },
  setup() {
    const skills = [1, 2, 3, 4, 5].map(multiplier => {
      const skill = createSkill(2, multiplier, 'active');
      skill.name = `Habilidad x${multiplier}`;
      return { skill, multiplier };
    });

    return { skills };
  },
  template: `
    <div class="flex flex-wrap gap-4">
      <VxvSkillCard
        v-for="(item, index) in skills"
        :key="index"
        :skill="item.skill"
        status="active"
        :index="index"
      />
    </div>
  `
});

// Habilidad no disponible
export const UnavailableSkill = {
  args: {
    skill: createSkill(0, 3, 'unlearned'),
    status: 'unlearned',
    available: false,
    animated: true,
    animationDuration: 1500,
    index: 0
  }
};

// Habilidad sin prerrequisitos
export const SkillWithoutPrerequisites = () => ({
  components: { VxvSkillCard },
  setup() {
    const skill = createSkill(2, 1, 'active');
    skill.prerequisites = [];

    return { skill };
  },
  template: `
    <VxvSkillCard
      :skill="skill"
      status="active"
    />
  `
});
