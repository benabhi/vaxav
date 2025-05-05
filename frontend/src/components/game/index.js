/**
 * Exportación de componentes de juego para Vaxav
 *
 * Este archivo exporta todos los componentes de juego para facilitar su importación.
 */

// Componentes de progreso (ahora en ui/progress)
export { default as VxvProgressBar } from '../ui/progress/VxvProgressBar.vue';
export { default as VxvAnimatedCounter } from '../ui/progress/VxvAnimatedCounter.vue';
export { default as VxvProgressCircular } from '../ui/progress/VxvProgressCircular.vue';

// Componentes de habilidades
export { default as VxvCircularSkillLevel } from './skills/VxvCircularSkillLevel.vue';
export { default as VxvDashedSkillLevel } from './skills/VxvDashedSkillLevel.vue';
export { default as VxvSkillCard } from './skills/VxvSkillCard.vue';

// Componentes de estadísticas
export { default as VxvGeneralProgressCard } from './stats/VxvGeneralProgressCard.vue';
export { default as VxvSkillDistributionCard } from './stats/VxvSkillDistributionCard.vue';
export { default as VxvDistributionCard } from './stats/VxvDistributionCard.vue';

// Configuración de niveles de habilidades
export { default as skillLevels } from '../../config/skillLevels.js';
