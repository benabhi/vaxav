<template>
  <AdminLayout title="Crear Categoría de Habilidad">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Categorías', to: '/admin/skill-categories' },
          { text: 'Crear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <VxvForm
      title="Crear Nueva Categoría"
      submitText="Crear Categoría"
      :loading="loading"
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useSkillCategories } from '@/composables/useSkillCategories';

const router = useRouter();

// Composables
const { createCategory } = useSkillCategories();

// Estado
const loading = ref(false);

// Formulario
const formData = reactive({
  name: '',
  description: ''
});

// Métodos
const handleSubmit = async () => {
  loading.value = true;

  try {
    const result = await createCategory(formData);

    if (result) {
      // No mostramos notificación aquí porque ya se muestra en el composable
      router.push('/admin/skill-categories');
    }
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    // No mostramos notificación aquí porque ya se muestra en el composable
  } finally {
    loading.value = false;
  }
};

// Volver a la lista de categorías
const goBack = () => {
  router.push('/admin/skill-categories');
};
</script>
