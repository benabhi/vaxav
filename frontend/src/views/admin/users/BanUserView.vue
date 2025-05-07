<template>
  <AdminLayout :title="user && user.is_banned ? 'Usuario Baneado' : 'Banear Usuario'">
    <template #breadcrumbs>
      <VxvBreadcrumb
        :items="[
          { text: 'Usuarios', to: '/admin/users' },
          { text: 'Usuario', to: `/admin/users/${userId}` },
          { text: user && user.is_banned ? 'Detalles del Ban' : 'Banear' }
        ]"
        homeLink="/admin"
      />
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-12">
      <VxvSpinner size="lg" />
    </div>

    <!-- Error State -->
    <VxvAlert
      v-if="error"
      variant="error"
      :message="error"
      class="mb-6"
      dismissible
      @dismiss="error = null"
    />

      <!-- Ban Info or Ban Form -->
      <div v-if="!loading && user">
        <!-- User Info -->
        <div class="bg-gray-800 p-4 rounded-lg mb-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="ml-4">
              <h2 class="text-xl font-bold text-white">{{ user.name }}</h2>
              <p class="text-gray-400">{{ user.email }}</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <VxvBadge
                  v-for="role in user.roles"
                  :key="role.id"
                  :variant="roleBadgeVariants[role.slug] || 'gray'"
                >
                  {{ role.name }}
                </VxvBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- Ban Info (if user is banned) -->
        <div v-if="user.is_banned && user.ban_info" class="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 class="text-xl font-bold text-white mb-4">Información del Baneo</h3>

          <div class="mb-4">
            <div class="text-gray-400 mb-1">Estado:</div>
            <VxvBadge variant="danger" class="text-base">Baneado</VxvBadge>
          </div>

          <div class="mb-4">
            <div class="text-gray-400 mb-1">Tipo:</div>
            <div class="text-white">
              {{ user.ban_info.is_permanent ? 'Permanente' : 'Temporal' }}
            </div>
          </div>

          <div v-if="!user.ban_info.is_permanent && user.ban_info.expires_at" class="mb-4">
            <div class="text-gray-400 mb-1">Expira el:</div>
            <div class="text-white">
              {{ formatDateTime(user.ban_info.expires_at) }}
            </div>
          </div>

          <div class="mb-4">
            <div class="text-gray-400 mb-1">Razón:</div>
            <div class="text-white">
              {{ user.ban_info.reason }}
            </div>
          </div>

          <div class="mt-6 flex space-x-4">
            <VxvButton
              variant="danger"
              @click="liftBan"
              :loading="submitting"
            >
              Quitar Ban
            </VxvButton>
            <VxvButton
              variant="secondary"
              @click="goBack"
            >
              Volver
            </VxvButton>
          </div>
        </div>

        <!-- Ban Form (if user is not banned) -->
        <VxvForm
          v-else
          title="Formulario de Suspensión"
          submitText="Banear Usuario"
          cancelText="Cancelar"
          :loading="submitting"
          @submit="handleSubmit"
          @cancel="goBack"
        >
          <!-- Ban Type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-1">Tipo de Suspensión</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  v-model="form.type"
                  value="temporary"
                  class="form-radio text-blue-600 h-5 w-5"
                />
                <span class="ml-2 text-gray-300">Temporal</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  v-model="form.type"
                  value="permanent"
                  class="form-radio text-red-600 h-5 w-5"
                />
                <span class="ml-2 text-gray-300">Permanente</span>
              </label>
            </div>
            <div v-if="errors.type" class="text-red-500 text-sm mt-1">{{ errors.type }}</div>
            <p class="text-gray-400 text-sm mt-1">
              Las suspensiones temporales tienen una fecha de expiración, mientras que las permanentes no.
            </p>
          </div>

          <!-- Expiration Date (only for temporary bans) -->
          <div v-if="form.type === 'temporary'" class="mb-6">
            <VxvInput
              v-model="form.expires_at"
              label="Fecha de Expiración"
              type="datetime-local"
              :min="minExpirationDate"
              required
              :error="errors.expires_at"
            />
            <p class="text-gray-400 text-sm mt-1">
              Selecciona cuándo terminará la suspensión. Debe ser una fecha futura.
            </p>
          </div>

          <!-- Reason (visible to user) -->
          <div class="mb-6">
            <VxvInput
              v-model="form.reason"
              label="Razón de la Suspensión"
              placeholder="Explica brevemente por qué se suspende al usuario"
              required
              :error="errors.reason"
            />
            <p class="text-gray-400 text-sm mt-1">
              Esta razón será visible para el usuario cuando intente iniciar sesión.
            </p>
          </div>

          <!-- Notes (admin only) -->
          <div class="mb-6">
            <VxvTextarea
              v-model="form.notes"
              label="Notas Internas"
              placeholder="Detalles adicionales sobre la suspensión (solo visible para administradores)"
              rows="4"
              :error="errors.notes"
            />
            <p class="text-gray-400 text-sm mt-1">
              Estas notas solo serán visibles para los administradores.
            </p>
          </div>
        </VxvForm>
      </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import api from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
import VxvForm from '@/components/ui/forms/VxvForm.vue';
import VxvInput from '@/components/ui/forms/VxvInput.vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';
import VxvBadge from '@/components/ui/feedback/VxvBadge.vue';
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
import VxvSpinner from '@/components/ui/feedback/VxvSpinner.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

// User ID from route params
const userId = computed(() => route.params.id);

// Form state
const form = ref({
  user_id: null,
  type: 'temporary',
  expires_at: '',
  reason: '',
  notes: '',
  is_active: true
});

// UI state
const user = ref(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const errors = ref({});

// Role badge variants
const roleBadgeVariants = {
  superadmin: 'purple',
  admin: 'blue',
  moderator: 'green',
  user: 'gray'
};

// Computed minimum expiration date (now + 1 hour)
const minExpirationDate = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16);
});

// Load user data
const loadUser = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/admin/users/${userId.value}`);
    user.value = response.data;
    form.value.user_id = user.value.id;

    // Set default expiration date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.value.expires_at = tomorrow.toISOString().slice(0, 16);
  } catch (err) {
    error.value = 'Error al cargar los datos del usuario';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Handle form submission
const handleSubmit = async () => {
  try {
    errors.value = {};
    submitting.value = true;

    // Validate form
    if (!form.value.reason) {
      errors.value.reason = 'La razón es obligatoria';
      return;
    }

    if (form.value.type === 'temporary' && !form.value.expires_at) {
      errors.value.expires_at = 'La fecha de expiración es obligatoria para suspensiones temporales';
      return;
    }

    // Submit form
    await api.post('/admin/banned-users', form.value);

    notificationStore.adminSuccess('Usuario baneado correctamente');
    router.push('/admin/users');
  } catch (err) {
    console.error(err);

    if (err.response?.status === 422 && err.response.data.errors) {
      // Validation errors
      errors.value = err.response.data.errors;
    } else {
      error.value = err.response?.data?.message || 'Error al banear al usuario';
    }
  } finally {
    submitting.value = false;
  }
};

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Lift ban
const liftBan = async () => {
  try {
    submitting.value = true;

    if (!user.value.is_banned || !user.value.ban_info) {
      error.value = 'No se encontró información del baneo';
      return;
    }

    await api.put(`/admin/banned-users/${user.value.ban_info.id}/lift`);
    notificationStore.adminSuccess(`El baneo de ${user.value.name} ha sido levantado correctamente`);

    // Redirect to users list
    router.push('/admin/users');
  } catch (err) {
    console.error('Error al levantar el baneo:', err);
    error.value = err.response?.data?.message || 'Error al levantar el baneo';
  } finally {
    submitting.value = false;
  }
};

// Go back to users list
const goBack = () => {
  router.push('/admin/users');
};

// Load data on component mount
onMounted(() => {
  loadUser();
});
</script>
