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
      <!-- Información sobre configuraciones -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 class="text-xl font-bold text-white mb-4">Configuraciones del Sistema</h2>
        <p class="text-gray-400 mb-4">
          Esta sección permite gestionar las configuraciones globales del sistema.
        </p>

        <div class="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <p class="text-gray-300">
            <span class="text-blue-400 font-medium">Nota:</span> Los requisitos de XP para habilidades ahora están configurados directamente en el servidor para mayor eficiencia y no son editables desde esta interfaz.
          </p>
        </div>
      </div>

      <!-- Other settings can be added here -->
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// State
const loading = ref(true);

// Load settings
const loadSettings = async () => {
  loading.value = true;
  try {
    // Aquí se pueden cargar otras configuraciones en el futuro
    // Por ahora, simplemente establecemos loading a false
    setTimeout(() => {
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('Error loading settings:', error);
    notificationStore.adminError('Error al cargar la configuración');
    loading.value = false;
  }
};

// Load settings on mount
onMounted(() => {
  loadSettings();
});
</script>
