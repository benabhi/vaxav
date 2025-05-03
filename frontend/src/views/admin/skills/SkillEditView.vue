<template>
  <AdminLayout title="Editar Habilidad">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Habilidades', to: '/admin/skills' },
          { text: 'Editar' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="!skill" class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <div class="text-red-400 text-xl mb-4">
        <i class="fas fa-exclamation-triangle mr-2"></i> Habilidad no encontrada
      </div>
      <p class="text-gray-300 mb-6">No se pudo encontrar la habilidad solicitada.</p>
      <VxvButton variant="primary" :to="{ name: 'admin-skills' }">
        Volver a Habilidades
      </VxvButton>
    </div>

    <VxvForm
      v-else
      title="Editar Habilidad"
      submitText="Guardar Cambios"
      :loading="saving"
      @submit="handleSubmit"
      @cancel="goBack"
    >
      <!-- Información básica -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <VxvInput
            id="name"
            v-model="formData.name"
            label="Nombre"
            placeholder="Nombre de la habilidad"
            required
            labelClass="text-lg font-bold text-white"
          />
        </div>
        <div>
          <label class="block text-lg font-bold text-white mb-2">Categoría</label>
          <VxvSelect
            id="category"
            v-model="formData.skill_category_id"
            :options="categoryOptions"
            placeholder="Selecciona una categoría"
            required
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-lg font-bold text-white mb-2">Multiplicador</label>
        <VxvSelect
          id="multiplier"
          v-model="formData.multiplier"
          :options="multiplierOptions"
          placeholder="Selecciona un multiplicador"
          required
        />
      </div>

      <!-- Descripción -->
      <div class="mb-6">
        <VxvTextarea
          id="description"
          v-model="formData.description"
          label="Descripción"
          placeholder="Descripción detallada de la habilidad"
          rows="4"
          required
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Prerrequisitos -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <div>
            <label class="block text-lg font-bold text-white">Prerrequisitos</label>
            <p class="text-sm text-gray-400">Define qué habilidades y niveles se requieren para aprender esta habilidad</p>
          </div>
          <VxvButton
            type="button"
            variant="secondary"
            size="sm"
            @click="addPrerequisite"
          >
            <i class="fas fa-plus mr-1"></i> Añadir prerrequisito
          </VxvButton>
        </div>

        <div v-if="formData.prerequisites.length === 0" class="bg-gray-700 rounded-lg p-4 text-gray-400 text-sm italic">
          No hay prerrequisitos definidos
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(prereq, index) in formData.prerequisites"
            :key="index"
            class="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
          >
            <div class="flex-grow">
              <label class="block text-sm font-medium text-gray-300 mb-1">Habilidad requerida</label>
              <VxvSelect
                v-model="prereq.skill_id"
                :options="getFilteredPrerequisiteOptions(prereq)"
                placeholder="Selecciona una habilidad"
                required
                @change="validatePrerequisites"
              />
              <p v-if="prereq.error" class="mt-1 text-sm text-red-500">{{ prereq.error }}</p>
            </div>
            <div class="w-40">
              <label class="block text-sm font-medium text-gray-300 mb-1">Nivel mínimo</label>
              <VxvSelect
                v-model="prereq.level"
                :options="levelOptions"
                placeholder="Nivel"
                required
              />
            </div>
            <div class="flex items-end pb-1">
              <button
                type="button"
                @click="removePrerequisite(index)"
                class="text-red-400 hover:text-red-300 p-2"
                title="Eliminar prerrequisito"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </VxvForm>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useSkills } from '@/composables/useSkills';
import { useSkillCategories } from '@/composables/useSkillCategories';

const router = useRouter();
const route = useRoute();

// Obtener el ID de la habilidad de la URL
const skillId = computed(() => route.params.id as string);

// Composables
const { getSkill, updateSkill, getSkillsForDropdown } = useSkills();
const { categories, fetchCategories } = useSkillCategories();

// Estado
const loading = ref(true);
const saving = ref(false);
const skill = ref(null);
const dropdownSkills = ref<Array<{
  id: number;
  name: string;
  multiplier: number;
}>>([]);

// Formulario
const formData = reactive({
  name: '',
  skill_category_id: '',
  description: '',
  multiplier: 1,
  prerequisites: [] as Array<{
    skill_id: string | number;
    level: number;
    error: string;
  }>
});

// Opciones para los selects
const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    value: category.id,
    label: category.name
  }));
});

const multiplierOptions = computed(() => {
  return [
    { value: 1, label: 'x1 (Básico)' },
    { value: 2, label: 'x2 (Intermedio)' },
    { value: 3, label: 'x3 (Avanzado)' },
    { value: 4, label: 'x4 (Experto)' },
    { value: 5, label: 'x5 (Maestro)' }
  ];
});

const levelOptions = computed(() => {
  return [
    { value: 1, label: 'Nivel 1' },
    { value: 2, label: 'Nivel 2' },
    { value: 3, label: 'Nivel 3' },
    { value: 4, label: 'Nivel 4' },
    { value: 5, label: 'Nivel 5' }
  ];
});

// Esta variable ya no se usa porque ahora usamos getFilteredPrerequisiteOptions

// Métodos
const loadSkill = async () => {
  loading.value = true;

  try {
    const result = await getSkill(skillId.value);

    if (result) {
      skill.value = result;

      // Llenar el formulario con los datos de la habilidad
      formData.name = result.name;
      formData.skill_category_id = result.skill_category_id;
      formData.description = result.description;
      formData.multiplier = result.multiplier;

      // Llenar prerrequisitos (verificando que existan y sean válidos)
      if (result.prerequisites && Array.isArray(result.prerequisites)) {
        formData.prerequisites = result.prerequisites.map(prereq => ({
          skill_id: prereq.prerequisite_id || '',
          level: prereq.prerequisite_level || 1,
          error: ''
        }));
      } else {
        formData.prerequisites = [];
      }
    } else {
      // Si no se encontró la habilidad, establecer skill.value a null explícitamente
      skill.value = null;
      notificationStore.adminError('No se pudo encontrar la habilidad solicitada');
    }
  } catch (error) {
    console.error('Error al cargar la habilidad:', error);
    skill.value = null; // Asegurarse de que skill.value sea null en caso de error
    notificationStore.adminError('Error al cargar la habilidad');
  } finally {
    loading.value = false;
  }
};

const addPrerequisite = () => {
  formData.prerequisites.push({
    skill_id: '',
    level: 1,
    error: ''
  });
};

const removePrerequisite = (index) => {
  formData.prerequisites.splice(index, 1);
  validatePrerequisites();
};

// Filtrar opciones de prerrequisitos para evitar duplicados y la propia habilidad
const getFilteredPrerequisiteOptions = (currentPrereq) => {
  // Obtener IDs de habilidades ya seleccionadas como prerrequisitos (excepto la actual)
  const selectedIds = formData.prerequisites
    .filter(p => p !== currentPrereq && p.skill_id)
    .map(p => p.skill_id);

  // Filtrar las opciones disponibles
  return dropdownSkills.value
    .filter(skill => skill.id !== parseInt(skillId.value) && !selectedIds.includes(skill.id))
    .map(skill => ({
      value: skill.id,
      label: `${skill.name} (x${skill.multiplier})`
    }));
};

// Validar prerrequisitos para evitar duplicados
const validatePrerequisites = () => {
  // Limpiar errores previos
  formData.prerequisites.forEach(prereq => {
    prereq.error = '';
  });

  // Verificar duplicados
  const skillIds = formData.prerequisites
    .filter(p => p.skill_id)
    .map(p => p.skill_id);

  const duplicates = skillIds.filter((id, index) => skillIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    // Marcar los duplicados con error
    formData.prerequisites.forEach(prereq => {
      if (duplicates.includes(prereq.skill_id)) {
        prereq.error = 'Esta habilidad ya está seleccionada como prerrequisito';
      }
    });
  }

  // Verificar si alguna habilidad es la misma que se está editando
  formData.prerequisites.forEach(prereq => {
    if (prereq.skill_id === parseInt(skillId.value)) {
      prereq.error = 'Una habilidad no puede ser prerrequisito de sí misma';
    }
  });
};

const handleSubmit = async () => {
  saving.value = true;

  try {
    const result = await updateSkill(skillId.value, formData);

    if (result) {
      // No mostramos notificación aquí porque ya se muestra en el composable
      router.push('/admin/skills');
    }
  } catch (error) {
    console.error('Error al actualizar la habilidad:', error);
    // No mostramos notificación aquí porque ya se muestra en el composable
  } finally {
    saving.value = false;
  }
};

// Volver a la lista de habilidades
const goBack = () => {
  router.push('/admin/skills');
};

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchCategories();

  // Cargar habilidades para el dropdown de prerrequisitos
  const skills = await getSkillsForDropdown();
  if (skills) {
    dropdownSkills.value = skills;
  }

  // Cargar la habilidad a editar
  await loadSkill();
});
</script>
