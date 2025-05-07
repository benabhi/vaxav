<template>
  <AdminLayout title="Crear Nuevo Sistema Solar">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Sistemas Solares', to: '/admin/universe/solar-systems' },
          { text: 'Crear' }
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
              Crear Sistema Solar
            </VxvButton>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvSpinner from '@/components/ui/feedback/VxvSpinner.vue';
import { useSolarSystems } from '@/composables/useSolarSystems';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();
const { createSolarSystem, fetchAllConstellations } = useSolarSystems();

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

// Cargar constelaciones
const loadConstellations = async () => {
  try {
    constellations.value = await fetchAllConstellations();
    
    // Si hay constelaciones, seleccionar la primera por defecto
    if (constellations.value.length > 0) {
      form.constellation_id = constellations.value[0].id.toString();
    }
  } catch (error) {
    console.error('Error loading constellations:', error);
    notificationStore.adminError('Error al cargar las constelaciones');
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
    const result = await createSolarSystem(form);
    
    if (result) {
      notificationStore.adminSuccess('Sistema solar creado con éxito');
      router.push('/admin/universe/solar-systems');
    }
  } catch (error) {
    console.error('Error creating solar system:', error);
    notificationStore.adminError('Error al crear el sistema solar');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadConstellations();
});
</script>
