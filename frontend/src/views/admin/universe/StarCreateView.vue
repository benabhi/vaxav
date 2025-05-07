<template>
  <AdminLayout title="Crear Nueva Estrella">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Estrellas', to: '/admin/universe/stars' },
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
              Crear Estrella
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
import { useStars } from '@/composables/useStars';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();
const { createStar, fetchAllSolarSystems } = useStars();

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

// Cargar sistemas solares
const loadSolarSystems = async () => {
  try {
    solarSystems.value = await fetchAllSolarSystems();
    
    // Si hay sistemas solares, seleccionar el primero por defecto
    if (solarSystems.value.length > 0) {
      form.solar_system_id = solarSystems.value[0].id.toString();
    }
  } catch (error) {
    console.error('Error loading solar systems:', error);
    notificationStore.adminError('Error al cargar los sistemas solares');
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
    const result = await createStar(form);
    
    if (result) {
      notificationStore.adminSuccess('Estrella creada con éxito');
      router.push('/admin/universe/stars');
    }
  } catch (error) {
    console.error('Error creating star:', error);
    notificationStore.adminError('Error al crear la estrella');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadSolarSystems();
});
</script>
