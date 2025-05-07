<template>
  <AdminLayout title="Editar Región">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Universo' },
          { text: 'Regiones', to: '/admin/universe/regions' },
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
          <h2 class="text-xl font-semibold text-white">Información de la Región</h2>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-4 space-y-6">
          <!-- Nombre -->
          <div>
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Nombre de la región"
              :error="errors.name"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <VxvTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Descripción de la región"
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
              @click="router.push('/admin/universe/regions')"
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvSpinner from '@/components/ui/feedback/VxvSpinner.vue';
import { useRegions } from '@/composables/useRegions';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const { getRegion, updateRegion } = useRegions();

// ID de la región
const regionId = route.params.id;

// Estado del formulario
const form = reactive({
  name: '',
  description: '',
  x_coord: 0,
  y_coord: 0
});

// Estado de carga y errores
const loading = ref(true);
const saving = ref(false);
const errors = reactive({
  name: '',
  description: '',
  x_coord: '',
  y_coord: ''
});

// Cargar datos de la región
const loadRegion = async () => {
  loading.value = true;
  
  try {
    const region = await getRegion(regionId);
    
    if (region) {
      form.name = region.name;
      form.description = region.description || '';
      form.x_coord = region.x_coord;
      form.y_coord = region.y_coord;
    } else {
      notificationStore.adminError('No se pudo cargar la información de la región');
      router.push('/admin/universe/regions');
    }
  } catch (error) {
    console.error('Error loading region:', error);
    notificationStore.adminError('Error al cargar la región');
    router.push('/admin/universe/regions');
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
    const result = await updateRegion(regionId, form);
    
    if (result) {
      notificationStore.adminSuccess('Región actualizada con éxito');
      router.push('/admin/universe/regions');
    }
  } catch (error) {
    console.error('Error updating region:', error);
    notificationStore.adminError('Error al actualizar la región');
  } finally {
    saving.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadRegion();
});
</script>
