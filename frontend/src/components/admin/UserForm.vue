<template>
  <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Modal backdrop -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"
        @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal panel -->
      <div
        class="inline-block align-middle bg-gray-700 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6 border-4 border-blue-500">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-2xl leading-6 font-bold text-white mb-6" id="modal-title">
              <span class="border-b-4 border-blue-500 pb-2">{{ isEditing ? 'Editar Usuario' : 'Crear Usuario' }}</span>
            </h3>

            <div class="mt-4">
              <form @submit.prevent="$emit('save')">
                <div class="space-y-4">
                  <BaseInput v-model="form.name" label="Nombre" required :error="errors.name"
                    labelClass="text-blue-300 font-semibold" inputClass="bg-gray-700 border-gray-600 text-white" />

                  <BaseInput v-model="form.email" label="Correo electrónico" type="email" required :error="errors.email"
                    labelClass="text-blue-300 font-semibold" inputClass="bg-gray-700 border-gray-600 text-white" />

                  <div v-if="!isEditing">
                    <BaseInput v-model="form.password" label="Contraseña" type="password" required
                      :error="errors.password" labelClass="text-blue-300 font-semibold"
                      inputClass="bg-gray-700 border-gray-600 text-white" />

                    <BaseInput v-model="form.password_confirmation" label="Confirmar contraseña" type="password"
                      required labelClass="text-blue-300 font-semibold"
                      inputClass="bg-gray-700 border-gray-600 text-white" />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-blue-300">Roles</label>
                    <div class="mt-2 space-y-2 bg-gray-700 border border-gray-600 rounded-md p-4">
                      <div v-for="role in roles" :key="role.id" class="flex items-center">
                        <input :id="`role-${role.id}`" type="checkbox" :value="role.id" v-model="form.roles"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded" />
                        <label :for="`role-${role.id}`" class="ml-2 block text-sm text-gray-200">
                          {{ role.name }}
                        </label>
                      </div>
                    </div>
                    <p v-if="errors.roles" class="mt-1 text-sm text-red-600">{{ errors.roles }}</p>
                  </div>
                </div>

                <div class="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <BaseButton type="submit" :loading="loading" :full-width="true">
                    {{ isEditing ? 'Guardar cambios' : 'Crear usuario' }}
                  </BaseButton>
                  <BaseButton type="button" variant="ghost" @click="$emit('close')" :full-width="true">
                    Cancelar
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';

defineProps({
  form: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  roles: {
    type: Array,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['save', 'close']);
</script>
