<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold text-blue-400 mb-6">Habilidades de Piloto</h1>

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
      <!-- Barra de filtros -->
      <div class="bg-gray-800 p-3 mb-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div class="flex-grow w-full">
            <VxvFilters
              v-model:filters="activeFilters"
              :show-search="true"
              search-label="Buscar"
              search-placeholder="Buscar habilidades..."
              @filter-change="applyFilters"
            >
              <template #filters>
                <!-- Filtro por categoría -->
                <div class="w-full md:w-[180px]">
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
                    class="block w-full"
                    @update:modelValue="applyFilters"
                  />
                </div>

                <!-- Filtro por estado -->
                <div class="w-full md:w-[180px]">
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
                    class="block w-full"
                    @update:modelValue="applyFilters"
                  />
                </div>

                <!-- Filtro por multiplicador -->
                <div class="w-full md:w-[150px]">
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
                    class="block w-full"
                    @update:modelValue="applyFilters"
                  />
                </div>

                <!-- Filtro por nivel mínimo -->
                <div class="w-full md:w-[150px]">
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
                    class="block w-full"
                    @update:modelValue="applyFilters"
                  />
                </div>
              </template>
            </VxvFilters>
          </div>
        </div>
      </div>


      <!-- Lista de habilidades -->
      <div class="space-y-1">
        <!-- Fila de habilidad -->
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          class="flex flex-col py-2 px-3 rounded-md transition-all duration-200"
          :class="{
            'bg-gray-700/30 hover:bg-gray-700/50': isPilotSkill(skill.id) && isSkillActive(skill.id),
            'bg-gray-800/30 hover:bg-gray-700/20': isPilotSkill(skill.id) && !isSkillActive(skill.id),
            'bg-gray-800/30 opacity-60 hover:opacity-80': !isPilotSkill(skill.id) && !isSkillAvailable(skill),
            'hover:bg-gray-800/50': true
          }"
        >
          <!-- Fila principal con información de la habilidad -->
          <div class="flex items-center space-x-3 w-full">
            <!-- Multiplicador -->
            <div class="flex-shrink-0 w-8">
              <span
                class="text-xs px-1.5 py-0.5 rounded-md border"
                :class="[
                  getMultiplierClass(skill.multiplier),
                  getMultiplierBorderClass(skill.multiplier)
                ]"
              >
                x{{ skill.multiplier }}
              </span>
            </div>

            <!-- Nombre de la habilidad -->
            <div class="min-w-[150px] max-w-[150px]">
              <div class="flex items-center">
                <div
                  class="w-2.5 h-2.5 rounded-full mr-1.5"
                  :class="{
                    'bg-green-500 border border-green-400': isPilotSkill(skill.id) && isSkillActive(skill.id),
                    'bg-yellow-500 border border-yellow-400': isPilotSkill(skill.id) && !isSkillActive(skill.id),
                    'bg-red-500 border border-red-400': !isPilotSkill(skill.id)
                  }"
                ></div>
                <h3
                  class="font-medium text-sm"
                  :class="{
                    'text-white': isPilotSkill(skill.id) && isSkillActive(skill.id),
                    'text-yellow-400': isPilotSkill(skill.id) && !isSkillActive(skill.id),
                    'text-gray-400': !isPilotSkill(skill.id)
                  }"
                >
                  {{ skill.name }}
                </h3>
              </div>
              <div class="text-xs text-gray-500">
                {{ getCategoryName(skill.skill_category_id) }}
              </div>
            </div>

            <!-- Progreso de experiencia -->
            <div class="flex-grow max-w-md">
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP: {{ getFormattedXP(skill.id) }}/{{ getNextLevelXP(skill) }}</span>
                <span class="font-medium" :class="getPilotSkillLevel(skill.id) > 0 ? 'text-blue-400' : 'text-gray-400'">
                  Nivel {{ isPilotSkill(skill.id) ? getPilotSkillLevel(skill.id) : 0 }}/5
                </span>
              </div>
              <div class="w-full bg-gray-700/50 rounded-full h-2 border border-gray-600">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="getProgressBarClass(skill.id)"
                  :style="{ width: `${getXPPercentage(skill)}%` }"
                ></div>
              </div>
            </div>

            <!-- Indicador de nivel -->
            <div class="flex space-x-0.5 ml-3">
              <div
                v-for="level in 5"
                :key="level"
                class="w-3 h-3 rounded-sm border"
                :class="getSkillLevelClass(skill.id, level)"
              ></div>
            </div>

            <!-- Descripción de la habilidad -->
            <div class="ml-4 hidden lg:block max-w-xs">
              <p
                class="text-xs italic"
                :class="{
                  'text-gray-300': isPilotSkill(skill.id) && isSkillActive(skill.id),
                  'text-gray-400': isPilotSkill(skill.id) && !isSkillActive(skill.id),
                  'text-gray-500': !isPilotSkill(skill.id)
                }"
              >
                {{ getSkillDescription(skill) }}
              </p>
            </div>
          </div>

          <!-- Prerrequisitos (si los tiene y no está aprendida) -->
          <div
            v-if="skill.prerequisites && skill.prerequisites.length > 0 && (!isPilotSkill(skill.id) || !isSkillActive(skill.id))"
            class="mt-1.5 ml-11"
          >
            <div class="flex items-center">
              <span class="text-xs text-gray-400 mr-1">Requisitos:</span>
              <div class="flex space-x-1">
                <div
                  v-for="prereq in skill.prerequisites"
                  :key="prereq.prerequisite_id"
                  class="text-xs px-1.5 py-0.5 rounded"
                  :class="isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'"
                  :title="getPrerequisiteName(prereq) + ' (Nivel ' + prereq.prerequisite_level + ')'"
                >
                  {{ getPrerequisiteShortName(prereq) }} L{{ prereq.prerequisite_level }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePilotSkills } from '@/composables/usePilotSkills';
import VxvFilters from '@/components/ui/filters/VxvFilters.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';

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
const filteredSkills = ref([]);

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

    console.log('Datos cargados correctamente:');
    console.log('Categorías:', categories.value);
    console.log('Habilidades:', allSkills.value);
    console.log('Habilidades del piloto:', pilotSkills.value);

    // Depuración detallada de las habilidades del piloto
    console.log('Detalle de habilidades del piloto:');
    pilotSkills.value.forEach(skill => {
      console.log(`ID: ${skill.id}, Nivel: ${skill.pivot?.current_level}, XP: ${skill.pivot?.xp}, Activa: ${skill.pivot?.active}`);
    });

    // Verificar si hay habilidades con nivel > 0
    const skillsWithLevel = pilotSkills.value.filter(skill => skill.pivot?.current_level > 0);
    console.log('Habilidades con nivel > 0:', skillsWithLevel.length);

    // Verificar si hay habilidades activas
    const activeSkills = pilotSkills.value.filter(skill => skill.pivot?.active);
    console.log('Habilidades activas:', activeSkills.length);
  } catch (err) {
    console.error('Error al cargar los datos:', err);
  }
});

// Inicializar los filtros con valores por defecto
const initializeFilters = () => {
  activeFilters.value = {
    category: 'all',
    status: 'all',
    multiplier: 'all',
    level: 'all'
  };
};

// Aplicar filtros a las habilidades
const applyFilters = () => {
  try {
    // Si no hay habilidades procesadas, no hacer nada
    if (!skillsWithPrerequisites.value.length) return;

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

    console.log('Filtros aplicados:', activeFilters.value);
    console.log('Habilidades filtradas:', filteredSkills.value.length);
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
    return skill && skill.pivot ? skill.pivot.xp : 0;
  } catch (error) {
    console.error('Error en getSkillXP:', error);
    return 0;
  }
};

// Obtener la experiencia formateada para mostrar
const getFormattedXP = (skillId) => {
  try {
    if (!isPilotSkill(skillId)) return '0';
    return getSkillXP(skillId).toString();
  } catch (error) {
    console.error('Error en getFormattedXP:', error);
    return '0';
  }
};

// Calcular la experiencia necesaria para el siguiente nivel
const getNextLevelXP = (skill) => {
  try {
    // Verificar que skill sea un objeto válido
    if (!skill || typeof skill !== 'object' || !skill.id) {
      return '0';
    }

    // Obtener el nivel actual de la habilidad
    const pilotSkill = pilotSkills.value.find(s => s.id === skill.id);
    const currentLevel = pilotSkill && pilotSkill.pivot ? pilotSkill.pivot.current_level : 0;

    // Verificar que el multiplicador sea un número válido
    const multiplier = skill.multiplier || 1;
    if (isNaN(multiplier) || multiplier <= 0) {
      return '0';
    }

    // Si ya está en nivel 5, no hay siguiente nivel
    if (currentLevel >= 5) return '-';

    // Experiencia base para cada nivel
    const baseXP = {
      0: 50,    // Para nivel 1
      1: 150,   // Para nivel 2
      2: 300,   // Para nivel 3
      3: 600,   // Para nivel 4
      4: 1000,  // Para nivel 5
    };

    // Verificar que el nivel actual sea válido
    if (currentLevel < 0 || currentLevel > 4 || !baseXP.hasOwnProperty(currentLevel)) {
      return '0';
    }

    // Multiplicar por el multiplicador de la habilidad
    return (baseXP[currentLevel] * multiplier).toString();
  } catch (error) {
    console.error('Error en getNextLevelXP:', error);
    return '0';
  }
};

// Calcular el porcentaje de experiencia para la barra de progreso
const getXPPercentage = (skill) => {
  try {
    // Verificar que skill sea un objeto válido
    if (!skill || typeof skill !== 'object' || !skill.id) {
      return 0;
    }

    // Si no es una habilidad del piloto, la barra está vacía
    if (!isPilotSkill(skill.id)) {
      return 0;
    }

    // Obtener datos de la habilidad del piloto
    const pilotSkill = pilotSkills.value.find(s => s.id === skill.id);
    if (!pilotSkill || !pilotSkill.pivot) {
      return 0;
    }

    const currentLevel = pilotSkill.pivot.current_level;
    const currentXP = pilotSkill.pivot.xp;

    // Si ya está en nivel máximo, la barra está llena
    if (currentLevel >= 5) {
      return 100;
    }

    // Verificar que el multiplicador sea un número válido
    const multiplier = skill.multiplier || 1;
    if (isNaN(multiplier) || multiplier <= 0) {
      return 0;
    }

    // Experiencia base para cada nivel
    const baseXP = {
      0: 0,      // Nivel 0
      1: 50,     // Para nivel 1
      2: 150,    // Para nivel 2
      3: 300,    // Para nivel 3
      4: 600,    // Para nivel 4
      5: 1000,   // Para nivel 5
    };

    // Verificar que el nivel actual sea válido
    if (currentLevel < 0 || currentLevel > 5 || !baseXP.hasOwnProperty(currentLevel)) {
      return 0;
    }

    // Verificar que haya un siguiente nivel
    if (currentLevel >= 5 || !baseXP.hasOwnProperty(currentLevel + 1)) {
      return 100;
    }

    // Calcular la experiencia mínima para el nivel actual
    const minXPForCurrentLevel = baseXP[currentLevel] * multiplier;

    // Calcular la experiencia necesaria para el siguiente nivel
    const xpForNextLevel = baseXP[currentLevel + 1] * multiplier;

    // Calcular cuánta experiencia ha ganado desde el nivel actual
    const xpGainedSinceCurrentLevel = currentXP - minXPForCurrentLevel;

    // Calcular cuánta experiencia necesita para el siguiente nivel desde el nivel actual
    const xpNeededForNextLevel = xpForNextLevel - minXPForCurrentLevel;

    // Evitar división por cero
    if (xpNeededForNextLevel <= 0) {
      return 0;
    }

    // Calcular el porcentaje
    const percentage = Math.min(100, Math.round((xpGainedSinceCurrentLevel / xpNeededForNextLevel) * 100));

    // Asegurarse de que el porcentaje sea un número válido
    return isNaN(percentage) ? 0 : percentage;
  } catch (error) {
    console.error('Error en getXPPercentage:', error);
    return 0;
  }
};

// Obtener la clase de color para la barra de progreso según el nivel
const getProgressBarClass = (skillId) => {
  try {
    // Verificar que skillId sea válido
    if (!skillId) {
      return 'bg-gray-600';
    }

    // Si no es una habilidad del piloto, usar color gris
    if (!isPilotSkill(skillId)) {
      return 'bg-gray-600';
    }

    // Obtener el nivel actual de la habilidad
    const level = getPilotSkillLevel(skillId);

    // Asignar color según el nivel (tonalidades de azul, más oscuro a mayor nivel)
    switch (level) {
      case 0: return 'bg-blue-300/50';
      case 1: return 'bg-blue-400';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-blue-600';
      case 4: return 'bg-blue-700';
      case 5: return 'bg-blue-800';
      default: return 'bg-blue-300/50';
    }
  } catch (error) {
    console.error('Error en getProgressBarClass:', error);
    return 'bg-gray-600';
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

// Obtener la clase CSS para el nivel de una habilidad
const getSkillLevelClass = (skillId, level) => {
  try {
    // Verificar que skillId sea válido
    if (!skillId || isNaN(level)) {
      return 'border-gray-600 bg-gray-800';
    }

    // Obtener el nivel actual de la habilidad
    const pilotSkill = pilotSkills.value.find(skill => skill.id === skillId);
    const pilotLevel = pilotSkill && pilotSkill.pivot ? pilotSkill.pivot.current_level : 0;

    // Si la habilidad no está activa, mostrarla como "apagada"
    const isActive = pilotSkill && pilotSkill.pivot ? pilotSkill.pivot.active : false;

    // Verificar si el nivel actual es mayor o igual al nivel que estamos evaluando
    if (pilotLevel >= level) {
      // Si la habilidad está activa, usar tonalidades de azul según el nivel
      if (isActive) {
        switch (level) {
          case 1: return 'border-blue-400 bg-blue-400';
          case 2: return 'border-blue-500 bg-blue-500';
          case 3: return 'border-blue-600 bg-blue-600';
          case 4: return 'border-blue-700 bg-blue-700';
          case 5: return 'border-blue-800 bg-blue-800';
          default: return 'border-blue-400 bg-blue-400';
        }
      } else {
        // Si la habilidad no está activa, mostrarla como "apagada" (tonos más claros y semitransparentes)
        return 'border-blue-300/40 bg-blue-300/40';
      }
    } else {
      return 'border-gray-600 bg-gray-800';
    }
  } catch (error) {
    console.error('Error en getSkillLevelClass:', error);
    return 'border-gray-600 bg-gray-800';
  }
};

// Obtener la clase CSS para el texto del multiplicador de una habilidad
const getMultiplierClass = (multiplier) => {
  try {
    // Verificar que el multiplicador sea un número válido
    if (isNaN(multiplier)) {
      return 'text-gray-300';
    }

    // Convertir a número para asegurar la comparación correcta
    switch (Number(multiplier)) {
      case 1: return 'text-gray-300 bg-gray-800/50';
      case 2: return 'text-green-400 bg-green-900/30';
      case 3: return 'text-blue-400 bg-blue-900/30';
      case 4: return 'text-purple-400 bg-purple-900/30';
      case 5: return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-300 bg-gray-800/50';
    }
  } catch (error) {
    console.error('Error en getMultiplierClass:', error);
    return 'text-gray-300 bg-gray-800/50';
  }
};

// Obtener la clase CSS para el borde del multiplicador de una habilidad
const getMultiplierBorderClass = (multiplier) => {
  try {
    // Verificar que el multiplicador sea un número válido
    if (isNaN(multiplier)) {
      return 'border-gray-600';
    }

    // Convertir a número para asegurar la comparación correcta
    switch (Number(multiplier)) {
      case 1: return 'border-gray-600';
      case 2: return 'border-green-700';
      case 3: return 'border-blue-700';
      case 4: return 'border-purple-700';
      case 5: return 'border-red-700';
      default: return 'border-gray-600';
    }
  } catch (error) {
    console.error('Error en getMultiplierBorderClass:', error);
    return 'border-gray-600';
  }
};

// Obtener una versión corta del nombre de un prerrequisito
const getPrerequisiteShortName = (prereq) => {
  try {
    // Verificar que prereq sea un objeto válido
    if (!prereq || typeof prereq !== 'object' || !prereq.prerequisite_id) {
      return 'N/A';
    }

    const fullName = getPrerequisiteName(prereq);
    if (!fullName || fullName === 'Habilidad Desconocida') {
      return 'N/A';
    }

    // Obtener las iniciales o primeras letras
    const words = fullName.split(' ');
    if (words.length > 1) {
      // Si tiene más de una palabra, usar iniciales
      return words.map(word => word.length > 0 ? word[0] : '').join('');
    } else {
      // Si es una sola palabra, usar las primeras 3 letras o menos si la palabra es más corta
      return fullName.substring(0, Math.min(3, fullName.length));
    }
  } catch (error) {
    console.error('Error en getPrerequisiteShortName:', error);
    return 'N/A';
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
</script>
