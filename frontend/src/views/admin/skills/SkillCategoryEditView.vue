<template>
  <AdminLayout title="Editar Categoría de Habilidad">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Categorías', to: '/admin/skill-categories' },
          { text: 'Editar' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="!category" class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <div class="text-red-400 text-xl mb-4">
        <i class="fas fa-exclamation-triangle mr-2"></i> Categoría no encontrada
      </div>
      <p class="text-gray-300 mb-6">No se pudo encontrar la categoría solicitada.</p>
      <VxvButton variant="primary" :to="{ name: 'admin-skill-categories' }">
        Volver a Categorías
      </VxvButton>
    </div>

    <VxvForm
      v-else
      title="Editar Categoría"
      submitText="Guardar Cambios"
      :loading="saving"
      @submit="handleSubmit"
      @cancel="goBack"
    >
      <!-- Información básica -->
      <div class="mb-4">
        <VxvInput
          id="name"
          v-model="formData.name"
          label="Nombre"
          placeholder="Nombre de la categoría"
          required
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Descripción -->
      <div class="mb-6">
        <VxvTextarea
          id="description"
          v-model="formData.description"
          label="Descripción"
          placeholder="Descripción detallada de la categoría"
          rows="4"
          required
          labelClass="text-lg font-bold text-white"
        />
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
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useSkillCategories } from '@/composables/useSkillCategories';

const router = useRouter();
const route = useRoute();

// Obtener el ID de la categoría de la URL
const categoryId = computed(() => route.params.id as string);

// Composables
const { getCategory, updateCategory } = useSkillCategories();

// Estado
const loading = ref(true);
const saving = ref(false);
const category = ref(null);

// Formulario
const formData = reactive({
  name: '',
  description: ''
});

// Métodos
const loadCategory = async () => {
  loading.value = true;

  try {
    const result = await getCategory(categoryId.value);

    if (result) {
      category.value = result;

      // Llenar el formulario con los datos de la categoría
      formData.name = result.name;
      formData.description = result.description;
    }
  } catch (error) {
    console.error('Error al cargar la categoría:', error);
    notificationStore.adminError('Error al cargar la categoría');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  saving.value = true;

  try {
    const result = await updateCategory(categoryId.value, formData);

    if (result) {
      // No mostramos notificación aquí porque ya se muestra en el composable
      router.push('/admin/skill-categories');
    }
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    // No mostramos notificación aquí porque ya se muestra en el composable
  } finally {
    saving.value = false;
  }
};

// Volver a la lista de categorías
const goBack = () => {
  router.push('/admin/skill-categories');
};

// Cargar datos al montar el componente
onMounted(() => {
  loadCategory();
});
</script>
