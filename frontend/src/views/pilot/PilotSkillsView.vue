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
    <div v-else class="grid grid-cols-1 gap-6">
      <!-- Sección de categorías -->
      <div v-for="category in categorizedSkills" :key="category.id" class="bg-gray-800 rounded-lg overflow-hidden mb-4">
        <!-- Cabecera de categoría (colapsable) -->
        <div
          class="bg-gray-700 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-600 transition-colors duration-200"
          @click="toggleCategory(category.id)"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2 transition-transform duration-200"
              :class="{ 'transform rotate-90': !collapsedCategories[category.id] }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <h2 class="text-xl font-semibold text-white">{{ category.name }}</h2>
          </div>
          <span class="text-sm text-gray-300">{{ category.skills.length }} habilidades</span>
        </div>

        <!-- Lista de habilidades (colapsable) -->
        <div
          v-show="!collapsedCategories[category.id]"
          class="p-4 grid gap-4 transition-all duration-300"
        >
          <div
            v-for="skill in category.skills"
            :key="skill.id"
            class="border border-gray-700 rounded-md p-4 transition-all duration-200"
            :class="{
              'bg-gray-700/30 hover:bg-gray-700/50': isPilotSkill(skill.id),
              'bg-gray-800/30 opacity-60 cursor-not-allowed': !isPilotSkill(skill.id) && !isSkillAvailable(skill)
            }"
          >
            <!-- Cabecera de habilidad -->
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-medium text-lg text-white">{{ skill.name }}</h3>
                <p class="text-sm text-gray-400">
                  Multiplicador:
                  <span :class="getMultiplierClass(skill.multiplier)">x{{ skill.multiplier }}</span>
                </p>
              </div>

              <!-- Indicador de nivel -->
              <div class="flex space-x-1">
                <div
                  v-for="level in 5"
                  :key="level"
                  class="w-5 h-5 rounded-sm border"
                  :class="getSkillLevelClass(skill.id, level)"
                ></div>
              </div>
            </div>

            <!-- Descripción -->
            <p class="text-gray-300 text-sm mb-3">{{ skill.description }}</p>

            <!-- Prerrequisitos (si los tiene) -->
            <div v-if="skill.prerequisites && skill.prerequisites.length > 0" class="mt-2">
              <p class="text-xs text-gray-400 mb-1">Prerrequisitos:</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="prereq in skill.prerequisites"
                  :key="prereq.prerequisite_id"
                  class="text-xs px-2 py-1 rounded-md"
                  :class="isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'"
                >
                  {{ getPrerequisiteName(prereq) }} (Nivel {{ prereq.prerequisite_level }})
                </div>
              </div>
            </div>

            <!-- Botón de entrenamiento (solo para habilidades disponibles) -->
            <div v-if="isPilotSkill(skill.id) || isSkillAvailable(skill)" class="mt-3">
              <button
                class="px-3 py-1 text-sm rounded-md transition-colors duration-200"
                :class="isPilotSkill(skill.id)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'"
                :disabled="!isSkillAvailable(skill) && !isPilotSkill(skill.id)"
              >
                {{ isPilotSkill(skill.id) ? 'Entrenar' : 'Aprender' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePilotSkills } from '@/composables/usePilotSkills';

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
const collapsedCategories = ref({});

// Cargar datos al montar el componente
onMounted(async () => {
  // Cargar las habilidades del piloto
  await fetchCurrentPilotSkills();

  // Cargar todas las habilidades y categorías
  const [skillsData, categoriesData] = await Promise.all([
    fetchAllSkills(),
    fetchSkillCategories()
  ]);

  allSkills.value = skillsData;
  categories.value = categoriesData;

  // Inicializar las categorías como colapsadas por defecto
  initializeCollapsedCategories();

  // Procesar las habilidades para añadir información de prerrequisitos
  processSkillsWithPrerequisites();
});

// Método para alternar el estado de colapso de una categoría
const toggleCategory = (categoryId) => {
  collapsedCategories.value[categoryId] = !collapsedCategories.value[categoryId];
};

// Procesar las habilidades para añadir información de prerrequisitos
const processSkillsWithPrerequisites = () => {
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
};

// Inicializar las categorías como colapsadas por defecto
const initializeCollapsedCategories = () => {
  categories.value.forEach(category => {
    collapsedCategories.value[category.id] = true; // true = colapsado
  });
};

// Obtener las habilidades organizadas por categoría
const categorizedSkills = computed(() => {
  if (!categories.value.length || !skillsWithPrerequisites.value.length) return [];

  return categories.value.map(category => {
    const categorySkills = skillsWithPrerequisites.value.filter(
      skill => skill.skill_category_id === category.id
    );

    return {
      ...category,
      skills: categorySkills
    };
  }).filter(category => category.skills.length > 0);
});

// Verificar si una habilidad pertenece al piloto
const isPilotSkill = (skillId) => {
  return pilotSkills.value.some(skill => skill.id === skillId);
};

// Obtener el nivel de una habilidad del piloto
const getPilotSkillLevel = (skillId) => {
  const skill = pilotSkills.value.find(skill => skill.id === skillId);
  return skill ? skill.current_level : 0;
};

// Verificar si el piloto tiene una habilidad a un nivel específico
const isPilotSkillAtLevel = (skillId, level) => {
  const pilotLevel = getPilotSkillLevel(skillId);
  return pilotLevel >= level;
};

// Verificar si una habilidad está disponible para aprender
const isSkillAvailable = (skill) => {
  // Si no tiene prerrequisitos, está disponible
  if (!skill.prerequisites || skill.prerequisites.length === 0) return true;

  // Verificar que todos los prerrequisitos se cumplan
  return skill.prerequisites.every(prereq =>
    isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
  );
};

// Obtener el nombre de un prerrequisito
const getPrerequisiteName = (prereq) => {
  const skill = allSkills.value.find(s => s.id === prereq.prerequisite_id);
  return skill ? skill.name : 'Habilidad Desconocida';
};

// Obtener la clase CSS para el nivel de una habilidad
const getSkillLevelClass = (skillId, level) => {
  const pilotLevel = getPilotSkillLevel(skillId);

  if (pilotLevel >= level) {
    return 'border-blue-500 bg-blue-500';
  } else {
    return 'border-gray-600 bg-gray-800';
  }
};

// Obtener la clase CSS para el multiplicador de una habilidad
const getMultiplierClass = (multiplier) => {
  switch (multiplier) {
    case 1: return 'text-gray-300';
    case 2: return 'text-green-400';
    case 3: return 'text-blue-400';
    case 4: return 'text-purple-400';
    case 5: return 'text-red-400';
    default: return 'text-gray-300';
  }
};
</script>
