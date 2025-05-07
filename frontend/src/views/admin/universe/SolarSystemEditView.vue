<template>
  <AdminLayout title="Editar Sistema Solar">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Sistemas Solares', to: '/admin/universe/solar-systems' },
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
          <h2 class="text-xl font-semibold text-white">Información del Sistema Solar</h2>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-4 space-y-6">
          <!-- Nombre -->
          <div>
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Nombre del sistema solar"
              :error="errors.name"
              required
            />
          </div>

          <!-- Constelación -->
          <div>
            <VxvSelect
              v-model="form.constellation_id"
              label="Constelación"
              :options="constellationOptions"
              :error="errors.constellation_id"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <VxvTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Descripción del sistema solar"
              :error="errors.description"
              rows="4"
            />
          </div>

          <!-- Coordenadas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <VxvInput
                v-model.number="form.x_coord"
                label="Coordenada X"
                type="number"
                placeholder="0"
                :error="errors.x_coord"
                required
              />
            </div>
            <div>
              <VxvInput
                v-model.number="form.y_coord"
                label="Coordenada Y"
                type="number"
                placeholder="0"
                :error="errors.y_coord"
                required
              />
            </div>
          </div>

          <!-- Estrellas del sistema -->
          <div v-if="stars.length > 0">
            <h3 class="text-lg font-medium text-white mb-3">Estrellas en este Sistema Solar</h3>
            <div class="bg-gray-700 rounded-lg p-4">
              <ul class="space-y-2">
                <li v-for="star in stars" :key="star.id" class="flex justify-between items-center">
                  <span class="text-gray-200">{{ star.name }}</span>
                  <VxvButton
                    size="xs"
                    variant="secondary"
                    @click="router.push(`/admin/universe/stars/${star.id}/edit`)"
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
              @click="router.push('/admin/universe/solar-systems')"
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
import { useSolarSystems } from '@/composables/useSolarSystems';
import { useStars } from '@/composables/useStars';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const { getSolarSystem, updateSolarSystem, fetchAllConstellations } = useSolarSystems();
const { stars, fetchStars } = useStars();

// ID del sistema solar
const solarSystemId = route.params.id;

// Estado del formulario
const form = reactive({
  name: '',
  constellation_id: '',
  description: '',
  x_coord: 0,
  y_coord: 0
});

// Estado de carga y errores
const loading = ref(true);
const saving = ref(false);
const errors = reactive({
  name: '',
  constellation_id: '',
  description: '',
  x_coord: '',
  y_coord: ''
});

// Constelaciones para el selector
const constellations = ref([]);
const constellationOptions = computed(() => {
  return constellations.value.map(constellation => ({
    value: constellation.id.toString(),
    label: constellation.name
  }));
});

// Cargar datos del sistema solar y constelaciones
const loadData = async () => {
  loading.value = true;
  
  try {
    // Cargar constelaciones
    constellations.value = await fetchAllConstellations();
    
    // Cargar sistema solar
    const solarSystem = await getSolarSystem(solarSystemId);
    
    if (solarSystem) {
      form.name = solarSystem.name;
      form.constellation_id = solarSystem.constellation_id.toString();
      form.description = solarSystem.description || '';
      form.x_coord = solarSystem.x_coord;
      form.y_coord = solarSystem.y_coord;
      
      // Cargar estrellas del sistema solar
      await fetchStars({ solar_system_id: solarSystemId });
    } else {
      notificationStore.adminError('No se pudo cargar la información del sistema solar');
      router.push('/admin/universe/solar-systems');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    notificationStore.adminError('Error al cargar los datos');
    router.push('/admin/universe/solar-systems');
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

  if (!form.constellation_id) {
    errors.constellation_id = 'La constelación es obligatoria';
    isValid = false;
  }

  if (form.x_coord === null || form.x_coord === undefined) {
    errors.x_coord = 'La coordenada X es obligatoria';
    isValid = false;
  }

  if (form.y_coord === null || form.y_coord === undefined) {
    errors.y_coord = 'La coordenada Y es obligatoria';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const submitForm = async () => {
  if (!validateForm()) return;

  saving.value = true;

  try {
    const result = await updateSolarSystem(solarSystemId, form);
    
    if (result) {
      notificationStore.adminSuccess('Sistema solar actualizado con éxito');
      router.push('/admin/universe/solar-systems');
    }
  } catch (error) {
    console.error('Error updating solar system:', error);
    notificationStore.adminError('Error al actualizar el sistema solar');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadData();
});
</script>
