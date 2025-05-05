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
      <VxvFilters
        v-model:filters="filters"
        searchLabel="Buscar"
        searchPlaceholder="Buscar habilidades..."
        :showApply="false"
        @filter-change="applyFilters"
        @reset="resetFilters"
      >
        <template #filters>
          <!-- Categoría -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
            <VxvSelect
              v-model="filters.category"
              size="sm"
              :options="[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
              ]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Estado -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <VxvSelect
              v-model="filters.status"
              size="sm"
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

          <!-- Multiplicador -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-300 mb-1">Multiplicador</label>
            <VxvSelect
              v-model="filters.multiplier"
              size="sm"
              :options="[
                { value: '', label: 'Todos' },
                { value: '1', label: 'x1' },
                { value: '2', label: 'x2' },
                { value: '3', label: 'x3' },
                { value: '4', label: 'x4' },
                { value: '5', label: 'x5' }
              ]"
              @update:modelValue="applyFilters"
            />
          </div>

          <!-- Nivel -->
          <div class="w-full md:w-48">
            <label class="block text-sm font-medium text-gray-300 mb-1">Nivel mínimo</label>
            <VxvSelect
              v-model="filters.minLevel"
              size="sm"
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
        </template>
      </VxvFilters>

      <!-- Lista de habilidades -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden overflow-x-auto">
        <VxvTable
          :columns="columns"
          :items="filteredSkills"
          :loading="loading"
          row-key="id"
          :sort-key="filters.sort_field"
          :sort-order="filters.sort_direction"
          class="min-w-[1200px]"
          @sort="handleSort"
        >
          <!-- Slot para estado de carga -->
          <template #loading>
            <div class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span class="ml-2 text-gray-300">Cargando habilidades...</span>
            </div>
          </template>

          <!-- Slot para estado vacío -->
          <template #empty>
            <VxvClearState
              message="No se encontraron habilidades que coincidan con los filtros"
              variant="secondary"
              :icon="SearchIcon"
            >
              <template #action>
                <VxvButton
                  variant="secondary"
                  size="sm"
                  @click="resetFilters(); loadPilotData();"
                >
                  Limpiar filtros
                </VxvButton>
              </template>
            </VxvClearState>
          </template>

          <!-- Slot para columna de nombre -->
          <template #cell(name)="{ item }">
            <div class="text-sm font-medium text-white">{{ item.name }}</div>
            <div class="text-xs text-gray-400">{{ truncateDescription(item.description) }}</div>
          </template>

          <!-- Slot para columna de categoría -->
          <template #cell(category)="{ item }">
            <div class="text-sm text-gray-300">{{ item.category?.name }}</div>
          </template>

          <!-- Slot para columna de multiplicador -->
          <template #cell(multiplier)="{ item }">
            <VxvBadge
              :variant="getMultiplierBadgeVariant(item.multiplier)"
              size="md"
              class="font-mono"
            >
              x{{ item.multiplier }}
            </VxvBadge>
          </template>

          <!-- Slot para columna de nivel -->
          <template #cell(level)="{ item }">
            <div class="flex flex-col space-y-2" style="min-width: 350px; width: 100%;">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-300">Nivel:</span>
                <span class="text-sm font-bold text-white">{{ calculateSkillLevel(item.xp, item.multiplier) }}</span>
              </div>
              <VxvRange
                v-model="item.xp"
                :min="0"
                :max="getMaxXPForSkill(item)"
                :step="10"
                :disabled="isUpdating === item.id"
                :showValue="true"
                :showMinMax="true"
                :formatValue="(val) => `${val} XP`"
                class="w-full min-w-[350px]"
                style="width: 100%; min-width: 350px;"
                @change="(value) => updateSkillXP(item, Number(value))"
              />
            </div>
          </template>

          <!-- Slot para columna de estado -->
          <template #cell(status)="{ item }">
            <VxvToggleSwitch
              :model-value="Boolean(item.active)"
              :disabled="!canToggleActive(item) || isUpdating === item.id"
              @update:model-value="toggleSkillActive(item)"
            />
          </template>

          <!-- Slot para columna de prerrequisitos -->
          <template #cell(prerequisites)="{ item }">
            <div v-if="item.prerequisites && item.prerequisites.length > 0" class="flex flex-wrap gap-1">
              <VxvBadge
                v-for="prereq in item.prerequisites"
                :key="prereq.id"
                :variant="getPrerequisiteBadgeVariant(item, prereq)"
                size="sm"
                class="whitespace-nowrap"
              >
                {{ prereq.name }} (Nivel {{ prereq.pivot.prerequisite_level }})
              </VxvBadge>
            </div>
            <div v-else class="text-sm text-gray-500 italic">Sin prerrequisitos</div>
          </template>
        </VxvTable>
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
      :show="showErrorModal"
      title="No se puede realizar la acción"
      @close="showErrorModal = false"
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
import VxvClearState from '@/components/ui/feedback/VxvClearState.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvToggleSwitch from '@/components/ui/forms/VxvToggleSwitch.vue';
import VxvFilters from '@/components/ui/filters/VxvFilters.vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';
import VxvRange from '@/components/ui/forms/VxvRange.vue';
import { useAdminPilots } from '@/composables/useAdminPilots';
import { useSkillCalculations } from '@/composables/useSkillCalculations';
import type { Pilot, PilotSkill } from '@/composables/useAdminPilots';

// Icono para el estado vacío
const SearchIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  `
};

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
  multiplier: '',
  minLevel: '',
  sort_field: 'name',
  sort_direction: 'asc'
});

// Estado de ordenamiento
const sortKey = ref('name');
const sortOrder = ref('asc');

// Definición de columnas para la tabla
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'category', label: 'Categoría', sortable: true },
  { key: 'multiplier', label: 'Mul.', sortable: true },
  { key: 'level', label: 'Nivel', width: '350px' },
  { key: 'status', label: 'Estado' },
  { key: 'prerequisites', label: 'Prerrequisitos' }
];

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
  // Primero filtramos las habilidades
  const filtered = skills.value.filter(skill => {
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

    // Filtro por multiplicador
    if (filters.multiplier && skill.multiplier !== parseInt(filters.multiplier)) {
      return false;
    }

    // Filtro por nivel mínimo
    if (filters.minLevel && skill.current_level < parseInt(filters.minLevel)) {
      return false;
    }

    return true;
  });

  // Luego ordenamos las habilidades filtradas
  return [...filtered].sort((a, b) => {
    const sortField = filters.sort_field;
    const sortDirection = filters.sort_direction;

    // Manejar campos especiales
    let aValue: any, bValue: any;

    if (sortField === 'category') {
      // Caso especial para categoría
      aValue = a.category?.name || '';
      bValue = b.category?.name || '';
    } else if (sortField === 'multiplier') {
      // Caso especial para multiplicador
      aValue = a.multiplier || 1;
      bValue = b.multiplier || 1;
    } else if (sortField === 'level') {
      // Caso especial para nivel
      aValue = a.current_level;
      bValue = b.current_level;
    } else if (sortField === 'status') {
      // Caso especial para estado
      aValue = a.active ? 1 : 0;
      bValue = b.active ? 1 : 0;
    } else if (sortField === 'prerequisites') {
      // Caso especial para prerrequisitos
      aValue = a.prerequisites?.length || 0;
      bValue = b.prerequisites?.length || 0;
    } else {
      // Caso general (name, description, etc.)
      aValue = a.name;
      bValue = b.name;

      // Si el campo existe en el objeto, usarlo
      if (sortField in a) {
        aValue = a[sortField as keyof typeof a];
      }
      if (sortField in b) {
        bValue = b[sortField as keyof typeof b];
      }
    }

    // Comparar valores
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
});

// Usar el composable de pilotos
const { getPilot, getPilotSkills, updatePilotSkill } = useAdminPilots();

// Usar el composable de cálculos de habilidades
const { calculateLevel, getMinXPForLevel } = useSkillCalculations();

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

// Calcular el nivel de una habilidad basado en XP y multiplicador
const calculateSkillLevel = (xp: number, multiplier: number): number => {
  return calculateLevel(xp, multiplier);
};

// Obtener el máximo de XP para una habilidad (para el rango)
const getMaxXPForSkill = (skill): number => {
  // Establecer un máximo razonable para el rango (nivel 5 + un poco más)
  return Math.max(2500 * skill.multiplier, skill.xp + 500);
};

// Actualizar la experiencia de una habilidad
const updateSkillXP = async (skill, newXP: number) => {
  if (isUpdating.value) return;

  isUpdating.value = skill.id;
  try {
    // Calcular el nivel basado en la nueva experiencia
    const newLevel = calculateSkillLevel(newXP, skill.multiplier);

    const result = await updatePilotSkill(pilotId, skill.id, {
      current_level: newLevel,
      xp: newXP,
      active: skill.active
    });

    if (result) {
      // Recargar habilidades para actualizar estado
      await loadPilotData();
    }
  } catch (error: any) {
    // Mostrar error
    errorMessage.value = error.response?.data?.message || 'Ha ocurrido un error al actualizar la experiencia de la habilidad';

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

// Verificar si se puede cambiar el estado activo
const canToggleActive = (skill) => {
  if (skill.active) {
    return skill.can_deactivate;
  } else {
    return skill.can_activate;
  }
};

// Obtener variante de badge para el multiplicador
const getMultiplierBadgeVariant = (multiplier) => {
  switch (multiplier) {
    case 1: return 'gray';    // Básico
    case 2: return 'success'; // Fácil
    case 3: return 'info';    // Medio
    case 4: return 'warning'; // Difícil
    case 5: return 'danger';  // Muy difícil
    default: return 'gray';
  }
};

// Obtener etiqueta descriptiva para el multiplicador
const getMultiplierLabel = (multiplier) => {
  switch (multiplier) {
    case 1: return 'Básico';
    case 2: return 'Fácil';
    case 3: return 'Medio';
    case 4: return 'Difícil';
    case 5: return 'Muy difícil';
    default: return '';
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
    // Calcular la experiencia mínima necesaria para el nivel seleccionado
    const minXP = getMinXPForLevel(newLevel, skill.multiplier);

    const result = await updatePilotSkill(pilotId, skill.id, {
      current_level: newLevel,
      xp: minXP,
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
      xp: skill.xp,
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
      xp: skill.xp,
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
  // Ignorar el evento si ya se está actualizando
  if (isUpdating.value) return;

  // Restaurar el valor original (el v-model se actualiza antes de que podamos verificar)
  // pero queremos que la API controle el estado real
  const currentActive = skill.active;

  if (currentActive) {
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

// Restablecer filtros
const resetFilters = () => {
  // Restablecer todos los filtros a sus valores iniciales
  filters.search = '';
  filters.category = '';
  filters.status = '';
  filters.multiplier = '';
  filters.minLevel = '';
  // Mantener el ordenamiento
  filters.sort_field = 'name';
  filters.sort_direction = 'asc';
};

// Manejar el ordenamiento
const handleSort = (sortData: { key: string, order: string }) => {
  filters.sort_field = sortData.key;
  filters.sort_direction = sortData.order;
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
