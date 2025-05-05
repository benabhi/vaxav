<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto">
      <!-- Modal de bienvenida -->
      <VxvModal
        :show="showWelcomeModal"
        title="¡Bienvenido a VAXAV!"
        color="blue"
        :close-on-click-outside="false"
        @close="closeWelcomeModal"
      >
        <div class="text-white space-y-4">
          <p class="text-lg">
            ¡Saludos, Piloto <span class="text-blue-400 font-bold">{{ createdPilot?.name }}</span>!
          </p>

          <p>
            Tu aventura en la vasta galaxia de VAXAV comienza ahora. Como piloto
            <span class="text-blue-400">{{ createdPilot?.race }}</span>,
            tienes acceso a bonificaciones únicas que te ayudarán en tu viaje.
          </p>

          <p>
            Has sido asignado a un sistema estelar seguro para comenzar tu exploración.
            Tu cuenta ha sido acreditada con <span class="text-green-400 font-bold">10,000 ISK</span>
            para que puedas adquirir tu primera nave y equipamiento básico.
          </p>

          <p>
            La galaxia está llena de oportunidades: comercio, minería, exploración y combate.
            Tu destino está en tus manos, piloto.
          </p>

          <div class="bg-blue-900/30 p-4 rounded-md border border-blue-800 mt-4">
            <p class="text-blue-300 font-semibold">Consejo para nuevos pilotos:</p>
            <p class="text-gray-300">
              Comienza explorando tu sistema estelar actual y familiarizándote con los controles de tu nave.
              Visita el mercado para adquirir tu primera nave y equipo esencial.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-center">
            <VxvButton variant="primary" @click="closeWelcomeModal">
              Iniciar Aventura
            </VxvButton>
          </div>
        </template>
      </VxvModal>

      <VxvForm
        title="Crear Piloto"
        :has-border="false"
        submitText="Crear Piloto"
        :show-cancel="false"
        :full-width-submit="true"
        :loading="userStore.isUserDataLoading"
        :disabled="!form.race"
        @submit="handleSubmit"
      >
        <template #alert>
          <VxvAlert
            v-if="userStore.error"
            variant="error"
            :message="userStore.error"
            :dismissible="false"
            class="mb-6"
          />
        </template>
        <div class="mb-4">
          <VxvInput
            id="name"
            v-model="form.name"
            label="Nombre del Piloto"
            type="text"
            required
          />
        </div>

        <div class="mb-6">
          <VxvSelect
            id="race"
            v-model="form.race"
            label="Raza"
            required
            placeholder="Selecciona una raza"
            :options="[
              { value: 'Humano', label: 'Humano' },
              { value: 'Cyborg', label: 'Cyborg' },
              { value: 'Alienígena', label: 'Alienígena' },
              { value: 'Sintético', label: 'Sintético' }
            ]"
          />
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Bonificaciones de Raza</h3>
          <div v-if="form.race" class="bg-gray-700/50 p-3 rounded-md">
            <div v-if="form.race === 'Humano'">
              <p class="text-blue-400">+10% a habilidades de comercio</p>
              <p class="text-blue-400">+5% a habilidades diplomáticas</p>
            </div>
            <div v-else-if="form.race === 'Cyborg'">
              <p class="text-blue-400">+10% a habilidades de ingeniería</p>
              <p class="text-blue-400">+5% a resistencia de armadura</p>
            </div>
            <div v-else-if="form.race === 'Alienígena'">
              <p class="text-blue-400">+10% a velocidad de nave</p>
              <p class="text-blue-400">+5% a capacidad de escudos</p>
            </div>
            <div v-else-if="form.race === 'Sintético'">
              <p class="text-blue-400">+10% a eficiencia de minería</p>
              <p class="text-blue-400">+5% a capacidad de carga</p>
            </div>
          </div>
          <div v-else class="text-gray-400 italic">
            Selecciona una raza para ver sus bonificaciones
          </div>
        </div>
      </VxvForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvModal from '@/components/ui/modals/VxvModal.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';

const router = useRouter();
const userStore = useUserStore();

// Estado para el modal de bienvenida
const showWelcomeModal = ref(false);
const createdPilot = ref(null);

const form = reactive({
  name: '',
  race: '',
});

// Método para cerrar el modal y navegar a la página principal
const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  router.push('/pilot/overview');
};

const handleSubmit = async () => {
  try {
    // Crear el piloto usando el store unificado
    await userStore.createPilot(form);

    // Obtener el piloto creado del store unificado
    const pilot = userStore.pilotData;

    if (pilot) {
      // Guardar el piloto creado para mostrar información en el modal
      createdPilot.value = pilot;

      // Mostrar el modal de bienvenida
      showWelcomeModal.value = true;

      // No redirigir inmediatamente, esperar a que el usuario cierre el modal
    }
  } catch (error) {
    console.error('Error al crear piloto:', error);
  }
};
</script>
