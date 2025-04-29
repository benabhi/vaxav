<template>
  <AdminLayout>
    <template #breadcrumbs>
      <BaseBreadcrumb
        :items="[
          { text: 'Usuarios', to: '/admin/users' },
          { text: 'Crear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <div class="py-6">
      <!-- Form Card -->
      <div class="max-w-3xl mx-auto bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Crear Nuevo Usuario</h2>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveUser">
            <!-- Name -->
            <div class="mb-4">
              <BaseInput
                id="name"
                v-model="userForm.name"
                label="Nombre"
                type="text"
                required
                :error="formErrors.name"
                labelClass="text-lg font-bold text-white"
              />
            </div>

            <!-- Email -->
            <div class="mb-4">
              <BaseInput
                id="email"
                v-model="userForm.email"
                label="Correo electrónico"
                type="email"
                required
                :error="formErrors.email"
                labelClass="text-lg font-bold text-white"
              />
            </div>

            <!-- Password -->
            <div class="mb-4">
              <BaseInput
                id="password"
                v-model="userForm.password"
                label="Contraseña"
                type="password"
                required
                :error="formErrors.password"
                labelClass="text-lg font-bold text-white"
              />
            </div>

            <!-- Password Confirmation -->
            <div class="mb-4">
              <BaseInput
                id="password_confirmation"
                v-model="userForm.password_confirmation"
                label="Confirmar contraseña"
                type="password"
                required
                labelClass="text-lg font-bold text-white"
              />
            </div>

            <!-- Roles -->
            <div class="mb-6">
              <label class="block text-lg font-bold text-white mb-2">Roles</label>
              <div class="bg-gray-700 border border-gray-600 rounded-md p-4 max-h-40 overflow-y-auto">
                <div v-for="role in availableRoles" :key="role.id" class="mb-2 last:mb-0">
                  <BaseCheckbox
                    :id="`role-${role.id}`"
                    :value="role.id"
                    v-model="userForm.roles"
                    :label="role.name"
                  />
                </div>
              </div>
              <p v-if="formErrors.roles" class="mt-1 text-sm text-red-500">{{ formErrors.roles }}</p>
            </div>

            <div class="flex space-x-3">
              <BaseButton type="submit" variant="primary" :full-width="false" :loading="saving">
                Crear usuario
              </BaseButton>
              <BaseButton type="button" variant="secondary" :full-width="false" @click="goBack">
                Cancelar
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseCheckbox from '@/components/ui/forms/BaseCheckbox.vue';
import BaseBreadcrumb from '@/components/ui/navigation/BaseBreadcrumb.vue';
import { useNotificationStore } from '@/stores/notification';
import api from '@/services/api';

const router = useRouter();
const notificationStore = useNotificationStore();

// User form
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [4] // Default to 'user' role
});

const formErrors = reactive({
  name: '',
  email: '',
  password: '',
  roles: ''
});

const saving = ref(false);

// Available roles
const availableRoles = ref([
  { id: 1, name: 'Super Admin', slug: 'superadmin' },
  { id: 2, name: 'Administrador', slug: 'admin' },
  { id: 3, name: 'Moderador', slug: 'moderator' },
  { id: 4, name: 'Usuario', slug: 'user' }
]);

// Clear form errors
const clearFormErrors = () => {
  formErrors.name = '';
  formErrors.email = '';
  formErrors.password = '';
  formErrors.roles = '';
};

// Save user
const saveUser = async () => {
  saving.value = true;
  clearFormErrors();

  try {
    // Create new user
    const response = await api.post('/admin/users', userForm);
    console.log('User created successfully:', response.data);

    // Show success notification
    notificationStore.adminSuccess(
      `El usuario ${userForm.name} ha sido creado correctamente.`
    );

    // Redirect to users list
    router.push('/admin/users');
  } catch (error) {
    console.error('Error saving user:', error);

    // Handle validation errors
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      if (errors.name) formErrors.name = errors.name[0];
      if (errors.email) formErrors.email = errors.email[0];
      if (errors.password) formErrors.password = errors.password[0];
      if (errors.roles) formErrors.roles = errors.roles[0];
    }
  } finally {
    saving.value = false;
  }
};

// Go back to users list
const goBack = () => {
  router.push('/admin/users');
};
</script>
