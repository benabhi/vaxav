<template>
  <AdminLayout title="Configuración del Sistema">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[{ text: 'Configuración' }]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="py-6 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- XP Requirements -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-bold text-white mb-4">Requisitos de XP para Habilidades</h2>
        <p class="text-gray-400 mb-4">
          Configura la cantidad de XP necesaria para subir de nivel las habilidades con multiplicador x1.
          Para otros multiplicadores, estos valores se multiplicarán automáticamente.
        </p>

        <form @submit.prevent="saveXpRequirements" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div v-for="(level, index) in xpRequirements" :key="index" class="space-y-2">
              <label :for="`level-${index}`" class="block text-sm font-medium text-gray-300">
                Nivel {{ index }} → {{ index + 1 }}
              </label>
              <input
                :id="`level-${index}`"
                v-model.number="xpRequirements[index]"
                type="number"
                min="1"
                class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div class="flex justify-end">
            <VxvButton
              type="submit"
              variant="primary"
              :loading="savingXp"
            >
              Guardar Cambios
            </VxvButton>
          </div>
        </form>
      </div>

      <!-- Other settings can be added here -->
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// State
const loading = ref(true);
const savingXp = ref(false);
const xpRequirements = ref<number[]>([50, 150, 300, 600, 1000]);

// Load settings
const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await api.get('/admin/settings/name/x1xp');
    if (response.data && response.data.value) {
      try {
        const xpData = JSON.parse(response.data.value);
        if (Array.isArray(xpData) && xpData.length === 5) {
          xpRequirements.value = xpData;
        }
      } catch (e) {
        console.error('Error parsing XP requirements:', e);
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    notificationStore.adminError('Error al cargar la configuración');
  } finally {
    loading.value = false;
  }
};

// Save XP requirements
const saveXpRequirements = async () => {
  savingXp.value = true;
  try {
    await api.put('/admin/settings/name/x1xp', {
      value: JSON.stringify(xpRequirements.value),
      type: 'json',
      description: 'Requisitos de XP para cada nivel de habilidad (multiplicador x1)'
    });
    
    notificationStore.adminSuccess('Requisitos de XP actualizados correctamente');
  } catch (error) {
    console.error('Error saving XP requirements:', error);
    notificationStore.adminError('Error al guardar los requisitos de XP');
  } finally {
    savingXp.value = false;
  }
};

// Load settings on mount
onMounted(() => {
  loadSettings();
});
</script>
