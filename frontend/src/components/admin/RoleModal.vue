<template>
  <Modal :show="show" :title="title" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <BaseInput 
          v-model="form.name" 
          label="Nombre" 
          required 
          :error="errors.name"
          labelClass="text-white" 
          inputClass="bg-gray-700 border-gray-600 text-white" 
        />

        <BaseInput 
          v-model="form.slug" 
          label="Slug" 
          required 
          :error="errors.slug"
          :disabled="isEditingDefaultRole"
          labelClass="text-white" 
          inputClass="bg-gray-700 border-gray-600 text-white" 
        />

        <div>
          <label for="description" class="block text-sm font-medium text-white">Descripción</label>
          <div class="mt-1">
            <textarea 
              id="description" 
              v-model="form.description" 
              rows="3"
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-700 text-white"
            ></textarea>
          </div>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-2">Permisos</label>
          <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-60 overflow-y-auto">
            <div class="space-y-2">
              <div v-for="permission in permissions" :key="permission.id" class="flex items-center">
                <input 
                  :id="`permission-${permission.id}`" 
                  type="checkbox" 
                  :value="permission.id"
                  v-model="form.permissions"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded" 
                />
                <label :for="`permission-${permission.id}`" class="ml-2 block text-sm text-gray-200">
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>
          <p v-if="errors.permissions" class="mt-1 text-sm text-red-600">{{ errors.permissions }}</p>
        </div>
      </div>

      <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <BaseButton type="submit" :loading="loading">
          {{ submitButtonText }}
        </BaseButton>
        <BaseButton type="button" variant="secondary" @click="$emit('close')">
          Cancelar
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: null
  },
  permissions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'submit']);

// Computed properties
const isEditing = computed(() => !!props.role);
const isEditingDefaultRole = computed(() => {
  return isEditing.value && ['superadmin', 'admin', 'moderator', 'user'].includes(props.role.slug);
});

const title = computed(() => isEditing.value ? 'Editar Rol' : 'Crear Rol');
const submitButtonText = computed(() => isEditing.value ? 'Guardar cambios' : 'Crear rol');

// Form data
const form = reactive({
  name: '',
  slug: '',
  description: '',
  permissions: []
});

// Generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Watch for name changes to auto-generate slug
watch(() => form.name, (newName) => {
  if (!isEditing.value) {
    form.slug = generateSlug(newName);
  }
});

// Watch for role changes to update form
watch(() => props.role, (newRole) => {
  if (newRole) {
    form.name = newRole.name || '';
    form.slug = newRole.slug || '';
    form.description = newRole.description || '';
    form.permissions = newRole.permissions ? newRole.permissions.map(p => p.id) : [];
  } else {
    form.name = '';
    form.slug = '';
    form.description = '';
    form.permissions = [];
  }
}, { immediate: true });

// Handle form submission
const handleSubmit = () => {
  emit('submit', { ...form });
};
</script>
