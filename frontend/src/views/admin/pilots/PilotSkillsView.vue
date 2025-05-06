<template>
  <AdminLayout title="Habilidades del Piloto">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Pilotos', to: '/admin/pilots' },
          { text: pilot?.name || 'Piloto', to: `/admin/pilots/${pilotId}/edit` },
          { text: 'Habilidades' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="py-6 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <!-- Información del piloto -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 class="text-xl font-bold text-white mb-2">{{ pilot?.name }}</h2>
        <div class="flex flex-wrap gap-4">
          <div>
            <span class="text-gray-400">Raza:</span>
            <span class="ml-2 text-white">{{ pilot?.race }}</span>
          </div>
          <div>
            <span class="text-gray-400">Créditos:</span>
            <span class="ml-2 text-white">{{ formatCredits(pilot?.credits) }}</span>
          </div>
          <div>
            <span class="text-gray-400">Usuario:</span>
            <span class="ml-2 text-white">{{ pilot?.user?.name }}</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <!-- Búsqueda -->
          <div class="w-full md:w-64">
            <label class="block text-sm font-medium text-gray-400 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar habilidades..."
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="applyFilters"
            />
          </div>

          <!-- Categoría -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
            <VxvSelect
              v-model="filters.category"
              :options="[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
              ]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Estado -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-400 mb-1">Estado</label>
            <VxvSelect
              v-model="filters.status"
              :options="[
                { value: '', label: 'Todos los estados' },
                { value: 'active', label: 'Activas' },
                { value: 'inactive', label: 'Inactivas' },
                { value: 'available', label: 'Disponibles' },
                { value: 'unavailable', label: 'No disponibles' }
              ]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Nivel -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nivel mínimo</label>
            <VxvSelect
              v-model="filters.minLevel"
              :options="[
                { value: '', label: 'Cualquier nivel' },
                { value: '1', label: 'Nivel 1+' },
                { value: '2', label: 'Nivel 2+' },
                { value: '3', label: 'Nivel 3+' },
                { value: '4', label: 'Nivel 4+' },
                { value: '5', label: 'Nivel 5' }
              ]"
              @update:modelValue="applyFilters"
            />
          </div>
        </div>
      </div>

      <!-- Lista de habilidades -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoría</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prerrequisitos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-if="filteredSkills.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-400">
                  No se encontraron habilidades que coincidan con los filtros.
                </td>
              </tr>
              <tr v-for="skill in filteredSkills" :key="skill.id" class="hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ skill.name }}</div>
                  <div class="text-xs text-gray-400">{{ truncateDescription(skill.description) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-300">{{ skill.category?.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <VxvSelect
                    v-model="skill.current_level"
                    :options="getLevelOptions(skill)"
                    size="sm"
                    class="w-20"
                    :disabled="isUpdating === skill.id"
                    @update:modelValue="(value) => updateSkillLevel(skill, value)"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <button
                      @click="toggleSkillActive(skill)"
                      :disabled="!canToggleActive(skill) || isUpdating === skill.id"
                      :class="[
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        skill.active ? 'bg-green-500' : 'bg-gray-600',
                        (!canToggleActive(skill) || isUpdating === skill.id) ? 'opacity-50 cursor-not-allowed' : ''
                      ]"
                    >
                      <span
                        :class="[
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          skill.active ? 'translate-x-5' : 'translate-x-0'
                        ]"
                      ></span>
                    </button>
                    <span class="ml-2 text-sm" :class="skill.active ? 'text-green-400' : 'text-gray-400'">
                      {{ skill.active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div v-if="skill.prerequisites && skill.prerequisites.length > 0" class="flex flex-wrap gap-1">
                    <VxvBadge
                      v-for="prereq in skill.prerequisites"
                      :key="prereq.id"
                      :variant="getPrerequisiteBadgeVariant(skill, prereq)"
                      size="sm"
                      class="whitespace-nowrap"
                    >
                      {{ prereq.name }} (Nivel {{ prereq.pivot.prerequisite_level }})
                    </VxvBadge>
                  </div>
                  <div v-else class="text-sm text-gray-500 italic">Sin prerrequisitos</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <VxvButton
                      v-if="!skill.active && skill.can_activate"
                      variant="success"
                      size="xs"
                      :loading="isUpdating === skill.id"
                      @click="activateSkill(skill)"
                    >
                      Activar
                    </VxvButton>
                    <VxvButton
                      v-if="skill.active && skill.can_deactivate"
                      variant="warning"
                      size="xs"
                      :loading="isUpdating === skill.id"
                      @click="deactivateSkill(skill)"
                    >
                      Desactivar
                    </VxvButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="mt-6 flex justify-end">
        <VxvButton
          variant="secondary"
          @click="goBack"
        >
          Volver
        </VxvButton>
      </div>
    </div>

    <!-- Modal de error -->
    <VxvModal
      v-model="showErrorModal"
      title="No se puede realizar la acción"
    >
      <div class="text-gray-300">
        <p class="mb-4">{{ errorMessage }}</p>
        
        <div v-if="errorDetails.length > 0" class="mt-4">
          <h4 class="font-bold text-white mb-2">Detalles:</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="(detail, index) in errorDetails" :key="index" class="text-gray-300">
              {{ detail }}
            </li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <VxvButton
            variant="primary"
            @click="showErrorModal = false"
          >
            Entendido
          </VxvButton>
        </div>
      </template>
    </VxvModal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import { useAdminPilots } from '@/composables/useAdminPilots';
import type { Pilot, PilotSkill } from '@/composables/useAdminPilots';

const router = useRouter();
const route = useRoute();
const pilotId = route.params.id as string;

// Estado
const loading = ref(true);
const pilot = ref<Pilot | null>(null);
const skills = ref<PilotSkill[]>([]);
const isUpdating = ref<number | null>(null);
const showErrorModal = ref(false);
const errorMessage = ref('');
const errorDetails = ref<string[]>([]);

// Filtros
const filters = reactive({
  search: '',
  category: '',
  status: '',
  minLevel: ''
});

// Categorías únicas
const categories = computed(() => {
  const uniqueCategories = new Map();
  skills.value.forEach(skill => {
    if (skill.category) {
      uniqueCategories.set(skill.category.id, skill.category);
    }
  });
  return Array.from(uniqueCategories.values());
});

// Habilidades filtradas
const filteredSkills = computed(() => {
  return skills.value.filter(skill => {
    // Filtro por búsqueda
    if (filters.search && !skill.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filtro por categoría
    if (filters.category && skill.skill_category_id.toString() !== filters.category) {
      return false;
    }
    
    // Filtro por estado
    if (filters.status) {
      if (filters.status === 'active' && !skill.active) return false;
      if (filters.status === 'inactive' && skill.active) return false;
      if (filters.status === 'available' && !skill.can_activate) return false;
      if (filters.status === 'unavailable' && skill.can_activate) return false;
    }
    
    // Filtro por nivel mínimo
    if (filters.minLevel && skill.current_level < parseInt(filters.minLevel)) {
      return false;
    }
    
    return true;
  });
});

// Usar el composable de pilotos
const { getPilot, getPilotSkills, updatePilotSkill } = useAdminPilots();

// Cargar datos del piloto y sus habilidades
const loadPilotData = async () => {
  loading.value = true;
  try {
    const pilotData = await getPilot(pilotId);
    if (pilotData) {
      pilot.value = pilotData;
    }
    
    const skillsData = await getPilotSkills(pilotId);
    skills.value = skillsData;
  } finally {
    loading.value = false;
  }
};

// Formatear créditos
const formatCredits = (credits) => {
  return new Intl.NumberFormat('es-ES').format(credits || 0);
};

// Truncar descripción
const truncateDescription = (description) => {
  if (!description) return '';
  return description.length > 50 ? description.substring(0, 50) + '...' : description;
};

// Obtener opciones de nivel
const getLevelOptions = (skill) => {
  const options = [];
  for (let i = 0; i <= 5; i++) {
    options.push({ value: i, label: i.toString() });
  }
  return options;
};

// Verificar si se puede cambiar el estado activo
const canToggleActive = (skill) => {
  if (skill.active) {
    return skill.can_deactivate;
  } else {
    return skill.can_activate;
  }
};

// Obtener variante de badge para prerrequisito
const getPrerequisiteBadgeVariant = (skill, prereq) => {
  // Buscar el prerrequisito en la lista de habilidades
  const prerequisiteSkill = skills.value.find(s => s.id === prereq.id);
  
  if (!prerequisiteSkill) return 'gray';
  
  // Verificar si cumple con el nivel requerido
  if (prerequisiteSkill.current_level >= prereq.pivot.prerequisite_level && prerequisiteSkill.active) {
    return 'success';
  } else {
    return 'danger';
  }
};

// Actualizar nivel de habilidad
const updateSkillLevel = async (skill, newLevel) => {
  if (isUpdating.value) return;
  
  isUpdating.value = skill.id;
  try {
    const result = await updatePilotSkill(pilotId, skill.id, {
      current_level: newLevel,
      active: skill.active
    });
    
    if (result) {
      // Recargar habilidades para actualizar estado
      await loadPilotData();
    }
  } catch (error: any) {
    // Mostrar error
    errorMessage.value = error.response?.data?.message || 'Ha ocurrido un error al actualizar la habilidad';
    
    // Preparar detalles del error
    errorDetails.value = [];
    if (error.response?.data?.dependent_skills) {
      error.response.data.dependent_skills.forEach(dep => {
        errorDetails.value.push(`${dep.skill.name} (Nivel ${dep.level}) requiere esta habilidad en nivel ${dep.required_level}`);
      });
    }
    
    if (error.response?.data?.missing_prerequisites) {
      error.response.data.missing_prerequisites.forEach(prereq => {
        errorDetails.value.push(`Falta prerrequisito: ${prereq.skill.name} (Nivel ${prereq.required_level})`);
      });
    }
    
    showErrorModal.value = true;
    
    // Recargar para restaurar el valor anterior
    await loadPilotData();
  } finally {
    isUpdating.value = null;
  }
};

// Activar habilidad
const activateSkill = async (skill) => {
  if (isUpdating.value) return;
  
  isUpdating.value = skill.id;
  try {
    const result = await updatePilotSkill(pilotId, skill.id, {
      current_level: skill.current_level,
      active: true
    });
    
    if (result) {
      // Recargar habilidades para actualizar estado
      await loadPilotData();
    }
  } catch (error: any) {
    // Mostrar error
    errorMessage.value = error.response?.data?.message || 'Ha ocurrido un error al activar la habilidad';
    
    // Preparar detalles del error
    errorDetails.value = [];
    if (error.response?.data?.missing_prerequisites) {
      error.response.data.missing_prerequisites.forEach(prereq => {
        errorDetails.value.push(`Falta prerrequisito: ${prereq.skill.name} (Nivel ${prereq.required_level})`);
      });
    }
    
    showErrorModal.value = true;
  } finally {
    isUpdating.value = null;
  }
};

// Desactivar habilidad
const deactivateSkill = async (skill) => {
  if (isUpdating.value) return;
  
  isUpdating.value = skill.id;
  try {
    const result = await updatePilotSkill(pilotId, skill.id, {
      current_level: skill.current_level,
      active: false
    });
    
    if (result) {
      // Recargar habilidades para actualizar estado
      await loadPilotData();
    }
  } catch (error: any) {
    // Mostrar error
    errorMessage.value = error.response?.data?.message || 'Ha ocurrido un error al desactivar la habilidad';
    
    // Preparar detalles del error
    errorDetails.value = [];
    if (error.response?.data?.dependent_skills) {
      error.response.data.dependent_skills.forEach(dep => {
        errorDetails.value.push(`${dep.skill.name} (Nivel ${dep.level}) depende de esta habilidad`);
      });
    }
    
    showErrorModal.value = true;
  } finally {
    isUpdating.value = null;
  }
};

// Alternar estado activo
const toggleSkillActive = (skill) => {
  if (skill.active) {
    deactivateSkill(skill);
  } else {
    activateSkill(skill);
  }
};

// Aplicar filtros
const applyFilters = () => {
  // No es necesario hacer nada aquí, ya que los filtros se aplican automáticamente
  // a través del computed filteredSkills
};

// Volver a la página de edición de piloto
const goBack = () => {
  router.push(`/admin/pilots/${pilotId}/edit`);
};

// Cargar datos al montar el componente
onMounted(() => {
  loadPilotData();
});
</script>
