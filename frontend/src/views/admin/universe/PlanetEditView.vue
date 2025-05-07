<template>
  <AdminLayout title="Editar Planeta">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Planetas', to: '/admin/universe/planets' },
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
          <h2 class="text-xl font-semibold text-white">Información del Planeta</h2>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-4 space-y-6">
          <!-- Nombre -->
          <div>
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Nombre del planeta"
              :error="errors.name"
              required
            />
          </div>

          <!-- Estrella -->
          <div>
            <VxvSelect
              v-model="form.star_id"
              label="Estrella"
              :options="starOptions"
              :error="errors.star_id"
              required
            />
          </div>

          <!-- Posición orbital -->
          <div>
            <VxvInput
              v-model.number="form.orbit_position"
              label="Posición Orbital"
              type="number"
              min="1"
              max="20"
              placeholder="1"
              :error="errors.orbit_position"
              required
            />
            <p class="text-xs text-gray-400 mt-1">
              Número del 1 al 20 que indica la posición del planeta en órbita alrededor de la estrella (1 es el más cercano).
            </p>
          </div>

          <!-- Tipo de Planeta -->
          <div>
            <VxvSelect
              v-model="form.type"
              label="Tipo de Planeta"
              :options="planetTypeOptions"
              :error="errors.type"
            />
          </div>

          <!-- Descripción -->
          <div>
            <VxvTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Descripción del planeta"
              :error="errors.description"
              rows="4"
            />
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4">
            <VxvButton
              type="button"
              variant="secondary"
              @click="router.push('/admin/universe/planets')"
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
import { usePlanets } from '@/composables/usePlanets';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const { getPlanet, updatePlanet, fetchAllStars } = usePlanets();

// ID del planeta
const planetId = route.params.id;

// Estado del formulario
const form = reactive({
  name: '',
  star_id: '',
  orbit_position: 1,
  type: 'terrestrial',
  description: ''
});

// Estado de carga y errores
const loading = ref(true);
const saving = ref(false);
const errors = reactive({
  name: '',
  star_id: '',
  orbit_position: '',
  type: '',
  description: ''
});

// Estrellas para el selector
const stars = ref([]);
const starOptions = computed(() => {
  return stars.value.map(star => ({
    value: star.id.toString(),
    label: star.name
  }));
});

// Opciones para el tipo de planeta
const planetTypeOptions = [
  { value: 'terrestrial', label: 'Terrestre' },
  { value: 'gas_giant', label: 'Gigante Gaseoso' },
  { value: 'ice_giant', label: 'Gigante Helado' },
  { value: 'dwarf', label: 'Planeta Enano' },
  { value: 'super_earth', label: 'Super-Tierra' },
  { value: 'sub_neptune', label: 'Sub-Neptuniano' },
  { value: 'hot_jupiter', label: 'Júpiter Caliente' },
  { value: 'ocean', label: 'Planeta Oceánico' },
  { value: 'desert', label: 'Planeta Desértico' },
  { value: 'lava', label: 'Planeta de Lava' },
  { value: 'ice', label: 'Planeta Helado' }
];

// Cargar datos del planeta y estrellas
const loadData = async () => {
  loading.value = true;
  
  try {
    // Cargar estrellas
    stars.value = await fetchAllStars();
    
    // Cargar planeta
    const planet = await getPlanet(planetId);
    
    if (planet) {
      form.name = planet.name;
      form.star_id = planet.star_id.toString();
      form.orbit_position = planet.orbit_position || 1;
      form.type = planet.type || 'terrestrial';
      form.description = planet.description || '';
    } else {
      notificationStore.adminError('No se pudo cargar la información del planeta');
      router.push('/admin/universe/planets');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    notificationStore.adminError('Error al cargar los datos');
    router.push('/admin/universe/planets');
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

  if (!form.star_id) {
    errors.star_id = 'La estrella es obligatoria';
    isValid = false;
  }

  if (!form.orbit_position || form.orbit_position < 1 || form.orbit_position > 20) {
    errors.orbit_position = 'La posición orbital debe ser un número entre 1 y 20';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const submitForm = async () => {
  if (!validateForm()) return;

  saving.value = true;

  try {
    const result = await updatePlanet(planetId, form);
    
    if (result) {
      notificationStore.adminSuccess('Planeta actualizado con éxito');
      router.push('/admin/universe/planets');
    }
  } catch (error) {
    console.error('Error updating planet:', error);
    notificationStore.adminError('Error al actualizar el planeta');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadData();
});
</script>
