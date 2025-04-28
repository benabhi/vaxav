<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto card p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Crear Piloto</h1>

      <div v-if="pilotStore.error" class="bg-red-900/50 text-red-200 p-3 rounded-md mb-4">
        {{ pilotStore.error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <BaseInput
            id="name"
            v-model="form.name"
            label="Nombre del Piloto"
            type="text"
            required
          />
        </div>

        <div class="mb-6">
          <BaseSelect
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

        <BaseButton
          type="submit"
          variant="primary"
          :full-width="true"
          :loading="pilotStore.loading"
          :disabled="!form.race"
        >
          Crear Piloto
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { usePilotStore } from '@/stores/pilot';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseSelect from '@/components/ui/forms/BaseSelect.vue';

const router = useRouter();
const pilotStore = usePilotStore();

const form = reactive({
  name: '',
  race: '',
});

const handleSubmit = async () => {
  await pilotStore.createPilot(form);

  if (pilotStore.currentPilot) {
    router.push('/');
  }
};
</script>
