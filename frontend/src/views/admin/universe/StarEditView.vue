<template>
  <AdminLayout title="Editar Estrella">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Estrellas', to: '/admin/universe/stars' },
          { text: 'Editar' }
        ]"
        home-link="/admin"
      />
    </template>

    <div class="py-6">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <VxvSpinner size="lg" />
      </div>

      <div v-else class="max-w-3xl mx-auto bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-semibold text-white">Información de la Estrella</h2>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-4 space-y-6">
          <!-- Nombre -->
          <div>
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Nombre de la estrella"
              :error="errors.name"
              required
            />
          </div>

          <!-- Sistema Solar -->
          <div>
            <VxvSelect
              v-model="form.solar_system_id"
              label="Sistema Solar"
              :options="solarSystemOptions"
              :error="errors.solar_system_id"
              required
            />
          </div>

          <!-- Tipo de Estrella -->
          <div>
            <VxvSelect
              v-model="form.type"
              label="Tipo de Estrella"
              :options="starTypeOptions"
              :error="errors.type"
            />
          </div>

          <!-- Descripción -->
          <div>
            <VxvTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Descripción de la estrella"
              :error="errors.description"
              rows="4"
            />
          </div>

          <!-- Planetas orbitando -->
          <div v-if="planets.length > 0">
            <h3 class="text-lg font-medium text-white mb-3">Planetas orbitando esta estrella</h3>
            <div class="bg-gray-700 rounded-lg p-4">
              <ul class="space-y-2">
                <li v-for="planet in planets" :key="planet.id" class="flex justify-between items-center">
                  <div>
                    <span class="text-gray-200">{{ planet.name }}</span>
                    <span class="text-gray-400 text-xs ml-2">Órbita: {{ planet.orbit_position }}</span>
                  </div>
                  <VxvButton
                    size="xs"
                    variant="secondary"
                    @click="router.push(`/admin/universe/planets/${planet.id}/edit`)"
                  >
                    Editar
                  </VxvButton>
                </li>
              </ul>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4">
            <VxvButton
              type="button"
              variant="secondary"
              @click="router.push('/admin/universe/stars')"
            >
              Cancelar
            </VxvButton>
            <VxvButton
              type="submit"
              variant="primary"
              :loading="saving"
            >
              Guardar Cambios
            </VxvButton>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvSpinner from '@/components/ui/feedback/VxvSpinner.vue';
import { useStars } from '@/composables/useStars';
import { usePlanets } from '@/composables/usePlanets';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const { getStar, updateStar, fetchAllSolarSystems } = useStars();
const { planets, fetchPlanets } = usePlanets();

// ID de la estrella
const starId = route.params.id;

// Estado del formulario
const form = reactive({
  name: '',
  solar_system_id: '',
  type: 'G',
  description: ''
});

// Estado de carga y errores
const loading = ref(true);
const saving = ref(false);
const errors = reactive({
  name: '',
  solar_system_id: '',
  type: '',
  description: ''
});

// Sistemas solares para el selector
const solarSystems = ref([]);
const solarSystemOptions = computed(() => {
  return solarSystems.value.map(solarSystem => ({
    value: solarSystem.id.toString(),
    label: solarSystem.name
  }));
});

// Opciones para el tipo de estrella
const starTypeOptions = [
  { value: 'O', label: 'Tipo O - Azul brillante' },
  { value: 'B', label: 'Tipo B - Azul-blanco' },
  { value: 'A', label: 'Tipo A - Blanco' },
  { value: 'F', label: 'Tipo F - Blanco-amarillo' },
  { value: 'G', label: 'Tipo G - Amarillo (como el Sol)' },
  { value: 'K', label: 'Tipo K - Naranja' },
  { value: 'M', label: 'Tipo M - Rojo' },
  { value: 'L', label: 'Tipo L - Rojo oscuro' },
  { value: 'T', label: 'Tipo T - Marrón' },
  { value: 'Y', label: 'Tipo Y - Marrón oscuro' },
  { value: 'WR', label: 'Wolf-Rayet' },
  { value: 'NS', label: 'Estrella de neutrones' },
  { value: 'BH', label: 'Agujero negro' },
  { value: 'WD', label: 'Enana blanca' }
];

// Cargar datos de la estrella y sistemas solares
const loadData = async () => {
  loading.value = true;
  
  try {
    // Cargar sistemas solares
    solarSystems.value = await fetchAllSolarSystems();
    
    // Cargar estrella
    const star = await getStar(starId);
    
    if (star) {
      form.name = star.name;
      form.solar_system_id = star.solar_system_id.toString();
      form.type = star.type || 'G';
      form.description = star.description || '';
      
      // Cargar planetas orbitando esta estrella
      await fetchPlanets({ star_id: starId });
    } else {
      notificationStore.adminError('No se pudo cargar la información de la estrella');
      router.push('/admin/universe/stars');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    notificationStore.adminError('Error al cargar los datos');
    router.push('/admin/universe/stars');
  } finally {
    loading.value = false;
  }
};

// Limpiar errores
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
};

// Validar formulario
const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!form.solar_system_id) {
    errors.solar_system_id = 'El sistema solar es obligatorio';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const submitForm = async () => {
  if (!validateForm()) return;

  saving.value = true;

  try {
    const result = await updateStar(starId, form);
    
    if (result) {
      notificationStore.adminSuccess('Estrella actualizada con éxito');
      router.push('/admin/universe/stars');
    }
  } catch (error) {
    console.error('Error updating star:', error);
    notificationStore.adminError('Error al actualizar la estrella');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadData();
});
</script>
