<template>
  <AdminLayout title="Editar Piloto">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Pilotos', to: '/admin/pilots' },
          { text: 'Editar' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div v-if="loading" class="py-6 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <VxvForm
      v-else
      title="Editar Piloto"
      submitText="Guardar cambios"
      :loading="submitting"
      @submit="handleSubmit"
      @cancel="goBack"
    >
      <!-- Nombre -->
      <div class="mb-4">
        <VxvInput
          id="name"
          v-model="formData.name"
          label="Nombre"
          type="text"
          required
          :error="errors.name"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Raza -->
      <div class="mb-4">
        <label class="block text-lg font-bold text-white mb-2">Raza</label>
        <VxvSelect
          id="race"
          v-model="formData.race"
          :options="[
            { value: 'Humano', label: 'Humano' },
            { value: 'Cyborg', label: 'Cyborg' },
            { value: 'Alienígena', label: 'Alienígena' },
            { value: 'Sintético', label: 'Sintético' }
          ]"
          required
          :error="errors.race"
        />
      </div>

      <!-- Créditos -->
      <div class="mb-4">
        <VxvInput
          id="credits"
          v-model.number="formData.credits"
          label="Créditos"
          type="number"
          min="0"
          required
          :error="errors.credits"
          labelClass="text-lg font-bold text-white"
        />
      </div>

      <!-- Usuario -->
      <div class="mb-4">
        <label class="block text-lg font-bold text-white mb-2">Usuario</label>
        <div class="bg-gray-700 border border-gray-600 rounded-md p-4">
          <p class="text-gray-300">{{ pilot?.user?.name }} ({{ pilot?.user?.email }})</p>
        </div>
      </div>

      <!-- Botones de acción adicionales -->
      <div class="mt-6 border-t border-gray-700 pt-4">
        <div class="flex flex-wrap gap-3">
          <VxvButton
            variant="secondary"
            @click="goToSkills"
            type="button"
          >
            Editar Habilidades
          </VxvButton>
        </div>
      </div>
    </VxvForm>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import { useAdminPilots } from '@/composables/useAdminPilots';
import type { Pilot } from '@/composables/useAdminPilots';

const router = useRouter();
const route = useRoute();
const pilotId = route.params.id as string;

// Estado
const loading = ref(true);
const submitting = ref(false);
const pilot = ref<Pilot | null>(null);
const errors = reactive({
  name: '',
  race: '',
  credits: ''
});

// Datos del formulario
const formData = reactive({
  name: '',
  race: '',
  credits: 0
});

// Usar el composable de pilotos
const { getPilot, updatePilot } = useAdminPilots();

// Cargar datos del piloto
const loadPilot = async () => {
  loading.value = true;
  try {
    const data = await getPilot(pilotId);
    if (data) {
      pilot.value = data;
      formData.name = data.name;
      formData.race = data.race;
      formData.credits = data.credits;
    }
  } finally {
    loading.value = false;
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  // Resetear errores
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  // Validar formulario
  let isValid = true;

  if (!formData.name.trim()) {
    errors.name = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!formData.race) {
    errors.race = 'La raza es obligatoria';
    isValid = false;
  }

  if (formData.credits < 0) {
    errors.credits = 'Los créditos no pueden ser negativos';
    isValid = false;
  }

  if (!isValid) return;

  // Enviar formulario
  submitting.value = true;
  try {
    await updatePilot(pilotId, formData);
    router.push('/admin/pilots');
  } finally {
    submitting.value = false;
  }
};

// Volver a la lista de pilotos
const goBack = () => {
  router.push('/admin/pilots');
};

// Ir a la página de edición de habilidades
const goToSkills = () => {
  router.push(`/admin/pilots/${pilotId}/skills`);
};

// Cargar datos al montar el componente
onMounted(() => {
  loadPilot();
});
</script>
