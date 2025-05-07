<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-red-900/30 p-6 text-center">
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-900/30 mb-4">
          <svg class="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Cuenta Suspendida</h1>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <div class="text-center mb-6">
          <p class="text-gray-300 text-lg mb-4">
            {{ banInfo.reason || 'Tu cuenta ha sido suspendida por violar los términos de servicio.' }}
          </p>
          
          <div v-if="!banInfo.is_permanent && banInfo.expires_at" class="bg-gray-700 p-4 rounded-lg mb-4">
            <p class="text-gray-300">
              Tu suspensión terminará el <span class="font-semibold text-white">{{ formatDate(banInfo.expires_at) }}</span>
            </p>
            <p class="text-gray-400 text-sm mt-1">
              Podrás volver a acceder a tu cuenta después de esa fecha.
            </p>
          </div>
          
          <div v-else-if="banInfo.is_permanent" class="bg-gray-700 p-4 rounded-lg mb-4">
            <p class="text-gray-300">
              Esta suspensión es <span class="font-semibold text-red-400">permanente</span>.
            </p>
          </div>
          
          <p class="text-gray-400 text-sm mb-6">
            Si crees que esto es un error, por favor contacta con el soporte.
          </p>
          
          <VxvButton variant="danger" @click="handleLogout" class="w-full">Cerrar Sesión</VxvButton>
          
          <div class="mt-4">
            <a href="mailto:support@example.com" class="text-blue-400 hover:text-blue-300 text-sm">
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';

const router = useRouter();
const authStore = useAuthStore();

// Get ban info from auth store
const banInfo = computed(() => authStore.banInfo || {
  reason: '',
  type: 'temporary',
  is_permanent: false,
  expires_at: null
});

// Format date for display
const formatDate = (dateString) => {
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

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Force logout even if API call fails
    authStore.$reset();
    localStorage.removeItem('auth_token');
    router.push('/login');
  }
};

// Check if user is banned on component mount
onMounted(() => {
  if (!authStore.isBanned) {
    // If not banned, redirect to login
    router.push('/login');
  }
});
</script>
