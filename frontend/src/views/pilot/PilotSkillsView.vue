<template>
  <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-blue-400 mb-3">Habilidades de Piloto</h1>

    <!-- Descripción detallada de la vista -->
    <div class="bg-gray-800/70 border border-blue-900/50 rounded-lg p-4 mb-4 text-gray-300 leading-relaxed">
      <p class="mb-2">
        Esta sección te permite gestionar las habilidades de tu piloto, fundamentales para tu progreso en el universo.
        Cada habilidad puede subir hasta el nivel 5 y proporciona ventajas específicas según su categoría.
      </p>
      <p>
        Las habilidades <span class="text-green-400 font-medium">activas</span> (verde) están en uso actualmente,
        las <span class="text-yellow-400 font-medium">inactivas</span> (amarillo) están aprendidas pero no en uso, y
        las <span class="text-red-400 font-medium">no aprendidas</span> (rojo) aún pueden ser adquiridas.
        Utiliza los filtros para encontrar habilidades específicas y gestiona tu progreso de manera eficiente.
      </p>
    </div>

    <!--
      Panel de estadísticas
      Muestra información detallada sobre las habilidades del piloto:
      - Progreso general (experiencia total, barra de progreso)
      - Distribución de habilidades (activas, inactivas, por aprender)
      - Distribución por nivel (niveles 1-5)
      - Distribución por multiplicador (x1-x5)
    -->
    <div v-if="!loading && filteredSkills.length > 0" class="bg-gray-800/80 border border-blue-900/50 rounded-lg p-4 mb-4">
      <h2 class="text-lg font-semibold text-blue-400 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Estadísticas de Habilidades
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Progreso general -->
        <VxvGeneralProgressCard
          title="Progreso General"
          :total="stats.totalSkills"
          totalFormat="{value} habilidades"
          stat1Label="Activas"
          :stat1Value="stats.activeSkills"
          :stat1Max="stats.totalSkills"
          stat2Label="Inactivas"
          :stat2Value="stats.inactiveSkills"
          :stat2Max="stats.totalSkills"
          progressLabel="Progreso Total"
          :progressValue="stats.totalXP"
          :progressMax="stats.maxPossibleXP"
          :showProgressPercentage="true"
          :animated="animationStarted"
          :showProgressionIndex="true"
          :showProgressionDetails="true"
          :progressionIndex="stats.progressionIndex"
          :progressionComponents="stats.progressionComponents"
        />

        <!-- Distribución de habilidades -->
        <VxvSkillDistributionCard
          title="Distribución de Habilidades"
          :total="stats.totalSkills"
          totalFormat="{value} habilidades"
          activeLabel="Activas"
          :activeValue="stats.activeSkills"
          activeFormat="{value}"
          inactiveLabel="Inactivas"
          :inactiveValue="stats.inactiveSkills"
          inactiveFormat="{value}"
          unlearnedLabel="Por aprender"
          :unlearnedValue="stats.remainingSkills"
          unlearnedFormat="{value}"
          unavailableLabel="No disponibles"
          :unavailableValue="0"
          unavailableFormat="{value}"
          :showChart="true"
        />

        <!-- Distribución por nivel -->
        <VxvDistributionCard
          title="Distribución por Nivel"
          :total="stats.learnedSkills"
          totalFormat="{value} habilidades"
          :items="[
            { label: 'Nivel 1', value: stats.skillsByLevel[1], color: 'blue', format: '{value}' },
            { label: 'Nivel 2', value: stats.skillsByLevel[2], color: 'blue', format: '{value}' },
            { label: 'Nivel 3', value: stats.skillsByLevel[3], color: 'blue', format: '{value}' },
            { label: 'Nivel 4', value: stats.skillsByLevel[4], color: 'blue', format: '{value}' },
            { label: 'Nivel 5', value: stats.skillsByLevel[5], color: 'blue', format: '{value}' }
          ]"
          :showFooter="true"
          :footerInfo="[
            { label: 'Nivel más alto', value: stats.highestLevel },
            { label: 'Nivel promedio', value: stats.learnedSkills > 0
              ? (stats.skillsByLevel.reduce((sum, count, level) => sum + (count * level), 0) / stats.learnedSkills).toFixed(1)
              : '0.0' }
          ]"
        />

        <!-- Distribución por multiplicador -->
        <VxvDistributionCard
          title="Distribución por Multiplicador"
          :total="stats.learnedSkills"
          totalFormat="{value} habilidades"
          :items="[
            { label: 'x1 (Básico)', value: stats.multiplierStats[1], color: 'gray', format: '{value}' },
            { label: 'x2 (Intermedio)', value: stats.multiplierStats[2], color: 'green', format: '{value}' },
            { label: 'x3 (Avanzado)', value: stats.multiplierStats[3], color: 'blue', format: '{value}' },
            { label: 'x4 (Experto)', value: stats.multiplierStats[4], color: 'purple', format: '{value}' },
            { label: 'x5 (Maestro)', value: stats.multiplierStats[5], color: 'red', format: '{value}' }
          ]"
          :showFooter="true"
          :footerInfo="[
            { label: 'Multiplicador promedio', value: stats.learnedSkills > 0
              ? (Object.entries(stats.multiplierStats).reduce((sum, [mult, count]) => sum + (Number(mult) * count), 0) / stats.learnedSkills).toFixed(1)
              : '0.0' }
          ]"
        />
      </div>
    </div>

    <!-- Loader mientras se cargan los datos -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="bg-red-900/50 border border-red-700 text-white p-4 rounded-md mb-6">
      {{ error }}
    </div>

    <!-- Contenido principal -->
    <div v-else class="bg-gray-900 rounded-lg overflow-hidden">
      <!--
        Barra de filtros
        Permite filtrar las habilidades por diferentes criterios:
        - Búsqueda por texto
        - Categoría
        - Estado (activas, inactivas, no aprendidas)
        - Multiplicador
        - Nivel mínimo
      -->
      <VxvFilters
        v-model:filters="activeFilters"
        :defaultFilters="defaultFilters"
        :show-search="true"
        search-label="Buscar"
        search-placeholder="Buscar habilidades..."
        @filter-change="applyFilters"
      >
        <template #filters>
          <!-- Filtro por categoría -->
          <div class="w-full md:w-[200px] min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <VxvSelect
              v-model="activeFilters.category"
              size="sm"
              :options="[
                { value: 'all', label: 'Todas las categorías' },
                ...categories.map(category => ({
                  value: category.id.toString(),
                  label: category.name
                }))
              ]"
              class="block w-full min-w-[200px]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Filtro por estado -->
          <div class="w-full md:w-[200px] min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <VxvSelect
              v-model="activeFilters.status"
              size="sm"
              :options="[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activas' },
                { value: 'inactive', label: 'No activadas' },
                { value: 'unlearned', label: 'No aprendidas' }
              ]"
              class="block w-full min-w-[200px]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Filtro por multiplicador -->
          <div class="w-full md:w-[200px] min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Multiplicador</label>
            <VxvSelect
              v-model="activeFilters.multiplier"
              size="sm"
              :options="[
                { value: 'all', label: 'Todos' },
                { value: '1', label: 'x1' },
                { value: '2', label: 'x2' },
                { value: '3', label: 'x3' },
                { value: '4', label: 'x4' },
                { value: '5', label: 'x5' }
              ]"
              class="block w-full min-w-[200px]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Filtro por nivel mínimo -->
          <div class="w-full md:w-[200px] min-w-[200px]">
            <label class="block text-sm font-medium text-gray-300 mb-1">Nivel mínimo</label>
            <VxvSelect
              v-model="activeFilters.level"
              size="sm"
              :options="[
                { value: 'all', label: 'Todos' },
                { value: '1', label: 'Nivel 1+' },
                { value: '2', label: 'Nivel 2+' },
                { value: '3', label: 'Nivel 3+' },
                { value: '4', label: 'Nivel 4+' },
                { value: '5', label: 'Nivel 5' }
              ]"
              class="block w-full min-w-[200px]"
              @update:modelValue="applyFilters"
            />
          </div>
        </template>
      </VxvFilters>

      <!--
        Grid de tarjetas de habilidades
        - Diseño responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop, 4 en pantallas grandes
        - Cada tarjeta tiene altura fija para mantener consistencia visual
      -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        <!-- Tarjetas de habilidades -->
        <VxvSkillCard
          v-for="(skill, index) in filteredSkills"
          :key="skill.id"
          :skill="{
            id: skill.id,
            name: skill.name,
            category: getCategoryName(skill.skill_category_id),
            level: getPilotSkillLevel(skill.id),
            multiplier: skill.multiplier,
            currentXP: getSkillXP(skill.id),
            minXP: getMinXPForLevel(skill.id),
            maxXP: getNextLevelXP(getPilotSkillLevel(skill.id), skill.multiplier) + getMinXPForLevel(skill.id),
            description: getSkillDescription(skill),
            prerequisites: skill.prerequisites ? skill.prerequisites.map(prereq => ({
              id: prereq.prerequisite_id,
              name: getPrerequisiteName(prereq),
              level: prereq.prerequisite_level,
              fulfilled: isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
            })) : [],
            active: isSkillActive(skill.id)
          }"
          :status="getSkillStatus(skill.id)"
          :available="isSkillAvailable(skill)"
          :showDescription="true"
          :showPrerequisites="true"
          :showProgress="true"
          :compact="false"
          :loading="false"
          :animated="animationStarted"
          :animationDuration="1200"
          :index="index"
          class="skill-card"
          :style="{ '--index': index }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * PilotSkillsView.vue - Script
 *
 * Este componente gestiona la visualización y filtrado de habilidades de piloto.
 * Características principales:
 * - Carga y muestra habilidades del piloto desde la API
 * - Permite filtrar habilidades por múltiples criterios
 * - Implementa animaciones para barras de progreso y contadores
 * - Gestiona diferentes estados de habilidades (activas, inactivas, no aprendidas)
 * - Muestra información detallada de cada habilidad
 */

import { ref, onMounted } from 'vue';
import { usePilotSkills } from '@/composables/usePilotSkills';
import VxvFilters from '@/components/ui/filters/VxvFilters.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvGeneralProgressCard from '@/components/game/stats/VxvGeneralProgressCard.vue';
import VxvSkillDistributionCard from '@/components/game/stats/VxvSkillDistributionCard.vue';
import VxvDistributionCard from '@/components/game/stats/VxvDistributionCard.vue';
import VxvSkillCard from '@/components/game/skills/VxvSkillCard.vue';
// Estos componentes se utilizan internamente en VxvSkillCard
// import VxvCircularSkillLevel from '@/components/game/skills/VxvCircularSkillLevel.vue';
// import VxvDashedSkillLevel from '@/components/game/skills/VxvDashedSkillLevel.vue';
import { getNextLevelXP, calculateProgressionIndex } from '@/config/skillLevels';

// Obtener los métodos y estado del composable
const {
  pilotSkills,
  loading,
  error,
  fetchCurrentPilotSkills,
  fetchAllSkills,
  fetchSkillCategories
} = usePilotSkills();

// Estado local
const allSkills = ref([]);
const categories = ref([]);
const skillsWithPrerequisites = ref([]);

// Estado para filtros
const activeFilters = ref({});
const defaultFilters = {
  search: '',
  category: 'all',
  status: 'all',
  multiplier: 'all',
  level: 'all'
};
const filteredSkills = ref([]);

// Estado para animaciones
const animationStarted = ref(false);
const animationCompleted = ref(false);

/**
 * Estado reactivo para las estadísticas de habilidades
 */
const stats = ref({
  totalSkills: 0,
  learnedSkills: 0,
  remainingSkills: 0,
  activeSkills: 0,
  inactiveSkills: 0,
  skillsByLevel: [0, 0, 0, 0, 0, 0],
  totalXP: 0,
  maxPossibleXP: 0,
  progressPercentage: 0,
  highestLevel: 0,
  categoriesStats: {},
  multiplierStats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
  progressionIndex: 0,
  progressionComponents: {
    HS: 0, // Porcentaje de Habilidades Aprendidas
    AL: 0, // Nivel Promedio
    XP: 0, // Experiencia Total
    AS: 0, // Porcentaje de Habilidades Activas
    MP: 0  // Multiplicador Promedio
  }
});

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Cargar las habilidades del piloto
    await fetchCurrentPilotSkills();

    // Cargar todas las habilidades y categorías
    const [skillsData, categoriesData] = await Promise.all([
      fetchAllSkills(),
      fetchSkillCategories()
    ]);

    allSkills.value = skillsData;
    categories.value = categoriesData;

    // Procesar las habilidades para añadir información de prerrequisitos
    processSkillsWithPrerequisites();

    // Inicializar los filtros
    initializeFilters();

    // Aplicar filtros iniciales (mostrar todas las habilidades)
    applyFilters();

    // Actualizar estadísticas
    updateStats();

    // Iniciar animaciones después de cargar los datos
    // Primero asegurarse de que las animaciones estén detenidas
    animationStarted.value = false;
    animationCompleted.value = false;

    // Forzar un reflow del DOM para asegurar que los cambios se apliquen
    document.body.offsetHeight;

    // Usar requestAnimationFrame para asegurar que las animaciones se inicien en el próximo frame
    requestAnimationFrame(() => {
      // Activar las animaciones
      animationStarted.value = true;

      // Marcar como completado después de la duración de la animación
      setTimeout(() => {
        animationCompleted.value = true;
      }, 1500);
    });
  } catch (err) {
    console.error('Error al cargar los datos:', err);
  }
});

// Inicializar los filtros con valores por defecto
const initializeFilters = () => {
  activeFilters.value = { ...defaultFilters };
};

// Aplicar filtros a las habilidades
const applyFilters = () => {
  try {
    // Si no hay habilidades procesadas, no hacer nada
    if (!skillsWithPrerequisites.value.length) return;

    // Guardar la cantidad anterior de tarjetas (comentado porque no se usa actualmente)
    // const previousFilteredCount = filteredSkills.value.length;

    // Filtrar las habilidades según los filtros activos
    filteredSkills.value = skillsWithPrerequisites.value.filter(skill => {
      // Filtro por búsqueda
      if (activeFilters.value.search && activeFilters.value.search.trim() !== '') {
        const searchTerm = activeFilters.value.search.toLowerCase().trim();
        const skillName = skill.name.toLowerCase();
        const categoryName = getCategoryName(skill.skill_category_id).toLowerCase();

        // Buscar en nombre de habilidad y categoría
        if (!skillName.includes(searchTerm) && !categoryName.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por categoría
      if (activeFilters.value.category && activeFilters.value.category !== 'all' &&
          skill.skill_category_id !== parseInt(activeFilters.value.category)) {
        return false;
      }

      // Filtro por estado
      if (activeFilters.value.status && activeFilters.value.status !== 'all') {
        const isLearned = isPilotSkill(skill.id);
        const isActive = isLearned && isSkillActive(skill.id);

        if (activeFilters.value.status === 'active' && !isActive) {
          return false;
        }
        if (activeFilters.value.status === 'inactive' && (!isLearned || isActive)) {
          return false;
        }
        if (activeFilters.value.status === 'unlearned' && isLearned) {
          return false;
        }
      }

      // Filtro por multiplicador
      if (activeFilters.value.multiplier && activeFilters.value.multiplier !== 'all' &&
          skill.multiplier !== parseInt(activeFilters.value.multiplier)) {
        return false;
      }

      // Filtro por nivel mínimo
      if (activeFilters.value.level && activeFilters.value.level !== 'all') {
        const skillLevel = getPilotSkillLevel(skill.id);
        if (skillLevel < parseInt(activeFilters.value.level)) {
          return false;
        }
      }

      return true;
    });

    // Ordenar las habilidades por categoría y nombre
    filteredSkills.value.sort((a, b) => {
      // Primero por categoría
      if (a.skill_category_id !== b.skill_category_id) {
        return a.skill_category_id - b.skill_category_id;
      }

      // Luego por nombre
      return a.name.localeCompare(b.name);
    });

    // Actualizar las estadísticas después de aplicar los filtros
    updateStats();
  } catch (error) {
    console.error('Error en applyFilters:', error);
    filteredSkills.value = [];
  }
};

// Procesar las habilidades para añadir información de prerrequisitos
const processSkillsWithPrerequisites = () => {
  try {
    // Crear un mapa para acceder rápidamente a las habilidades por ID
    const skillsMap = new Map();
    allSkills.value.forEach(skill => {
      skillsMap.set(skill.id, { ...skill, prerequisites: [] });
    });

    // Simular prerrequisitos (en una implementación real, estos vendrían de la API)
    // Aquí estamos creando algunos prerrequisitos de ejemplo
    const prerequisites = [
      { skill_id: 3, prerequisite_id: 1, prerequisite_level: 2 }, // Defensa Básica requiere Armas Láser Básicas nivel 2
      { skill_id: 5, prerequisite_id: 4, prerequisite_level: 3 }, // Comercio Avanzado requiere Comercio Básico nivel 3
      { skill_id: 7, prerequisite_id: 6, prerequisite_level: 2 }, // Navegación Avanzada requiere Navegación Básica nivel 2
      { skill_id: 8, prerequisite_id: 7, prerequisite_level: 4 }, // Navegación Experta requiere Navegación Avanzada nivel 4
      { skill_id: 9, prerequisite_id: 2, prerequisite_level: 3 }, // Armas Avanzadas requiere Armas de Proyectil Básicas nivel 3
    ];

    // Añadir los prerrequisitos a las habilidades
    prerequisites.forEach(prereq => {
      const skill = skillsMap.get(prereq.skill_id);
      if (skill) {
        skill.prerequisites.push(prereq);
      }
    });

    // Actualizar el estado con las habilidades procesadas
    skillsWithPrerequisites.value = Array.from(skillsMap.values());
  } catch (error) {
    console.error('Error en processSkillsWithPrerequisites:', error);
  }
};

// Verificar si una habilidad pertenece al piloto
const isPilotSkill = (skillId) => {
  try {
    return pilotSkills.value.some(skill => skill.id === skillId);
  } catch (error) {
    console.error('Error en isPilotSkill:', error);
    return false;
  }
};

// Verificar si una habilidad está activa (aprendida)
const isSkillActive = (skillId) => {
  try {
    const skill = pilotSkills.value.find(skill => skill.id === skillId);
    return skill && skill.pivot ? skill.pivot.active : false;
  } catch (error) {
    console.error('Error en isSkillActive:', error);
    return false;
  }
};

// Obtener el nivel de una habilidad del piloto
const getPilotSkillLevel = (skillId) => {
  try {
    const skill = pilotSkills.value.find(skill => skill.id === skillId);
    return skill && skill.pivot ? skill.pivot.current_level : 0;
  } catch (error) {
    console.error('Error en getPilotSkillLevel:', error);
    return 0;
  }
};

// Obtener la experiencia actual de una habilidad
const getSkillXP = (skillId) => {
  try {
    const skill = pilotSkills.value.find(skill => skill.id === skillId);

    // Si la habilidad existe y tiene experiencia, devolverla
    if (skill && skill.pivot && typeof skill.pivot.xp === 'number') {
      return skill.pivot.xp;
    }

    return 0;
  } catch (error) {
    console.error('Error en getSkillXP:', error);
    return 0;
  }
};

// Obtener la experiencia mínima para el nivel actual
const getMinXPForLevel = (skillId) => {
  try {
    const level = getPilotSkillLevel(skillId);
    if (level <= 0) return 0;

    // Experiencia base para cada nivel
    const baseXP = {
      1: 0,      // Nivel 1 comienza en 0 XP
      2: 50,     // Nivel 2 comienza en 50 XP
      3: 150,    // Nivel 3 comienza en 150 XP
      4: 300,    // Nivel 4 comienza en 300 XP
      5: 600,    // Nivel 5 comienza en 600 XP
    };

    const skill = allSkills.value.find(s => s.id === skillId);
    const multiplier = skill ? skill.multiplier : 1;

    return baseXP[level] * multiplier;
  } catch (error) {
    console.error('Error en getMinXPForLevel:', error);
    return 0;
  }
};

// Obtener el estado de una habilidad (active, inactive, unlearned)
const getSkillStatus = (skillId) => {
  try {
    if (!isPilotSkill(skillId)) return 'unlearned';
    return isSkillActive(skillId) ? 'active' : 'inactive';
  } catch (error) {
    console.error('Error en getSkillStatus:', error);
    return 'unlearned';
  }
};

// Verificar si el piloto tiene una habilidad a un nivel específico
const isPilotSkillAtLevel = (skillId, level) => {
  try {
    const pilotLevel = getPilotSkillLevel(skillId);
    return pilotLevel >= level;
  } catch (error) {
    console.error('Error en isPilotSkillAtLevel:', error);
    return false;
  }
};

// Verificar si una habilidad está disponible para aprender
const isSkillAvailable = (skill) => {
  try {
    // Si no tiene prerrequisitos, está disponible
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;

    // Verificar que todos los prerrequisitos se cumplan
    return skill.prerequisites.every(prereq =>
      isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
    );
  } catch (error) {
    console.error('Error en isSkillAvailable:', error);
    return false;
  }
};

// Obtener el nombre de un prerrequisito
const getPrerequisiteName = (prereq) => {
  try {
    const skill = allSkills.value.find(s => s.id === prereq.prerequisite_id);
    return skill ? skill.name : 'Habilidad Desconocida';
  } catch (error) {
    console.error('Error en getPrerequisiteName:', error);
    return 'Habilidad Desconocida';
  }
};

// Generar una descripción estética para cada habilidad
const getSkillDescription = (skill) => {
  try {
    // Descripciones predefinidas para algunas habilidades comunes
    const descriptions = {
      // Habilidades de Combate
      'Armas Láser Básicas': 'Dominio fundamental de armas láser estándar, mejorando precisión y eficiencia energética.',
      'Armas de Proyectil Básicas': 'Conocimiento esencial sobre armas balísticas y munición, aumentando la precisión y reduciendo el tiempo de recarga.',
      'Defensa Básica': 'Técnicas fundamentales para mejorar la resistencia del escudo y la armadura de la nave.',
      'Armas Láser Intermedias': 'Conocimiento avanzado de sistemas láser, permitiendo mayor daño y eficiencia energética.',
      'Tácticas de Combate Básicas': 'Fundamentos de posicionamiento y maniobras evasivas durante el combate espacial.',
      'Tácticas de Combate Avanzadas': 'Estrategias complejas de combate, incluyendo flanqueo y coordinación de escuadrones.',
      'Maestría en Armas Láser': 'Dominio excepcional de sistemas láser avanzados, maximizando daño y minimizando consumo energético.',
      'Maestría en Combate': 'Dominio completo de todas las formas de combate espacial, convirtiendo al piloto en una fuerza letal.',

      // Habilidades de Minería
      'Minería Básica': 'Conocimientos fundamentales para la extracción eficiente de minerales comunes.',
      'Minería Avanzada': 'Técnicas especializadas para la extracción de minerales raros y procesamiento de alta eficiencia.',

      // Habilidades de Navegación
      'Navegación Básica': 'Fundamentos de pilotaje espacial, mejorando velocidad y maniobrabilidad.',
      'Navegación Avanzada': 'Técnicas avanzadas de navegación, permitiendo rutas más eficientes y maniobras complejas.',

      // Habilidades de Comercio
      'Comercio Básico': 'Conocimientos fundamentales de mercados y negociación para mejorar márgenes de beneficio.',
      'Negociación': 'Arte avanzado de negociación para obtener mejores precios tanto en compra como en venta.',

      // Habilidades de Electrónica
      'Electrónica Básica': 'Conocimientos fundamentales sobre sistemas electrónicos de naves, mejorando eficiencia y capacidad de reparación.',

      // Habilidades de Exploración
      'Exploración Espacial': 'Técnicas para descubrir y catalogar nuevos sistemas estelares y recursos.',

      // Habilidades de Ingeniería
      'Ingeniería Básica': 'Fundamentos de mantenimiento y optimización de sistemas de naves espaciales.',
      'Reparación de Naves': 'Técnicas especializadas para reparar daños estructurales y de sistemas en condiciones adversas.'
    };

    // Si existe una descripción predefinida, usarla
    if (descriptions[skill.name]) {
      return descriptions[skill.name];
    }

    // Si no existe, generar una descripción basada en el nombre y multiplicador
    const categoryName = getCategoryName(skill.skill_category_id);
    const multiplierText = skill.multiplier > 3 ? 'avanzadas' : 'básicas';

    return `Técnicas ${multiplierText} de ${categoryName.toLowerCase()} que mejoran las capacidades del piloto en este campo.`;
  } catch (error) {
    console.error('Error en getSkillDescription:', error);
    return 'Información no disponible';
  }
};

// Obtener el nombre de una categoría por su ID
const getCategoryName = (categoryId) => {
  try {
    const category = categories.value.find(cat => cat.id === categoryId);
    return category ? category.name : 'Desconocida';
  } catch (error) {
    console.error('Error en getCategoryName:', error);
    return 'Desconocida';
  }
};

// Función para actualizar las estadísticas
const updateStats = () => {
  try {
    // Actualizar las estadísticas utilizando la función getSkillStats
    const newStats = getSkillStats();

    // Actualizar el estado reactivo
    stats.value = newStats;
  } catch (error) {
    console.error('Error en updateStats:', error);
  }
};

// Función para calcular estadísticas de habilidades
const getSkillStats = () => {
  try {
    // Estadísticas básicas
    const totalSkills = allSkills.value.length;
    const learnedSkills = pilotSkills.value.length;
    const remainingSkills = totalSkills - learnedSkills;
    const activeSkills = pilotSkills.value.filter(skill => skill.pivot?.active).length;
    const inactiveSkills = learnedSkills - activeSkills;

    // Estadísticas de nivel
    const skillsByLevel = [0, 0, 0, 0, 0, 0]; // Índice 0 para nivel 0, 1 para nivel 1, etc.
    let totalXP = 0;
    let maxPossibleXP = 0;
    let highestLevel = 0;

    // Calcular estadísticas por nivel y XP
    pilotSkills.value.forEach(skill => {
      const level = skill.pivot?.current_level || 0;
      skillsByLevel[level]++;

      if (level > highestLevel) {
        highestLevel = level;
      }

      totalXP += skill.pivot?.xp || 0;
    });

    // Calcular XP máximo posible (todas las habilidades en nivel 5)
    allSkills.value.forEach(skill => {
      // Suponiendo que el XP para nivel 5 es 1000 * multiplicador
      maxPossibleXP += 1000 * (skill.multiplier || 1);
    });

    // Calcular porcentaje de progreso total
    const progressPercentage = Math.round((totalXP / maxPossibleXP) * 100);

    // Estadísticas por categoría
    const categoriesStats = {};
    categories.value.forEach(category => {
      const categorySkills = allSkills.value.filter(skill => skill.skill_category_id === category.id);
      const learnedCategorySkills = pilotSkills.value.filter(skill => skill.skill_category_id === category.id);

      categoriesStats[category.id] = {
        name: category.name,
        total: categorySkills.length,
        learned: learnedCategorySkills.length,
        percentage: categorySkills.length > 0
          ? Math.round((learnedCategorySkills.length / categorySkills.length) * 100)
          : 0
      };
    });

    // Estadísticas por multiplicador
    const multiplierStats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    pilotSkills.value.forEach(skill => {
      const multiplier = skill.multiplier || 1;
      if (multiplierStats[multiplier] !== undefined) {
        multiplierStats[multiplier]++;
      }
    });

    // Calcular el Índice de Progresión (I.P.) utilizando la función de skillLevels.js
    const statsForPI = {
      totalSkills,
      learnedSkills,
      activeSkills,
      totalXP,
      skillsByLevel,
      multiplierStats
    };

    const { progressionIndex, progressionComponents } = calculateProgressionIndex(statsForPI);

    return {
      totalSkills,
      learnedSkills,
      remainingSkills,
      activeSkills,
      inactiveSkills,
      skillsByLevel,
      totalXP,
      maxPossibleXP,
      progressPercentage,
      highestLevel,
      categoriesStats,
      multiplierStats,
      // Componentes del Índice de Progresión
      progressionIndex,
      progressionComponents
    };
  } catch (error) {
    console.error('Error en getSkillStats:', error);
    return {
      totalSkills: 0,
      learnedSkills: 0,
      remainingSkills: 0,
      activeSkills: 0,
      inactiveSkills: 0,
      skillsByLevel: [0, 0, 0, 0, 0, 0],
      totalXP: 0,
      maxPossibleXP: 0,
      progressPercentage: 0,
      highestLevel: 0,
      categoriesStats: {},
      multiplierStats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
      progressionIndex: 0,
      progressionComponents: {
        HS: 0,
        AL: 0,
        XP: 0,
        AS: 0,
        MP: 0
      }
    };
  }
};
</script>

<style scoped>
/**
 * Estilos CSS para PilotSkillsView
 *
 * Esta sección contiene todos los estilos específicos para esta vista,
 * incluyendo animaciones y efectos de hover para las tarjetas.
 */

/* Estilos base para las tarjetas de habilidades */
.skill-card {
  transition: all 0.3s ease; /* Transición suave para efectos hover */
  animation: fadeInUp 0.5s ease-out forwards; /* Animación con duración de 0.5s */
  animation-delay: calc(var(--index, 0) * 0.05s); /* Retraso escalonado basado en el índice */
}

/* Efecto hover para las tarjetas */
.skill-card:hover {
  transform: translateY(-5px);
}

/*
 * Animación para las tarjetas al cargar
 * Efecto de aparición desde abajo con desvanecimiento
 * Las tarjetas aparecen secuencialmente con un retraso basado en su índice
 */
@keyframes fadeInUp {
  from {
    opacity: 0; /* Inicialmente invisible */
    transform: translateY(20px); /* Desplazado hacia abajo */
  }
  to {
    opacity: 1; /* Completamente visible */
    transform: translateY(0); /* En su posición final */
  }
}
</style>