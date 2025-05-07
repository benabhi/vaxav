<template>
  <AdminLayout title="Crear Nueva Constelación">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Constelaciones', to: '/admin/universe/constellations' },
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
          <h2 class="text-xl font-semibold text-white">Información de la Constelación</h2>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-4 space-y-6">
          <!-- Nombre -->
          <div>
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Nombre de la constelación"
              :error="errors.name"
              required
            />
          </div>

          <!-- Región -->
          <div>
            <VxvSelect
              v-model="form.region_id"
              label="Región"
              :options="regionOptions"
              :error="errors.region_id"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <VxvTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Descripción de la constelación"
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
              @click="router.push('/admin/universe/constellations')"
            >
              Cancelar
            </VxvButton>
            <VxvButton
              type="submit"
              variant="primary"
              :loading="saving"
            >
              Crear Constelación
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
import { useConstellations } from '@/composables/useConstellations';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();
const { createConstellation, fetchAllRegions } = useConstellations();

// Estado del formulario
const form = reactive({
  name: '',
  region_id: '',
  description: '',
  x_coord: 0,
  y_coord: 0
});

// Estado de carga y errores
const loading = ref(true);
const saving = ref(false);
const errors = reactive({
  name: '',
  region_id: '',
  description: '',
  x_coord: '',
  y_coord: ''
});

// Regiones para el selector
const regions = ref([]);
const regionOptions = computed(() => {
  return regions.value.map(region => ({
    value: region.id.toString(),
    label: region.name
  }));
});

// Cargar regiones
const loadRegions = async () => {
  try {
    regions.value = await fetchAllRegions();
    
    // Si hay regiones, seleccionar la primera por defecto
    if (regions.value.length > 0) {
      form.region_id = regions.value[0].id.toString();
    }
  } catch (error) {
    console.error('Error loading regions:', error);
    notificationStore.adminError('Error al cargar las regiones');
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

  if (!form.region_id) {
    errors.region_id = 'La región es obligatoria';
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
    const result = await createConstellation(form);
    
    if (result) {
      notificationStore.adminSuccess('Constelación creada con éxito');
      router.push('/admin/universe/constellations');
    }
  } catch (error) {
    console.error('Error creating constellation:', error);
    notificationStore.adminError('Error al crear la constelación');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadRegions();
});
</script>
