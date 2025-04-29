<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import VxvNotification from './components/ui/feedback/VxvNotification.vue'
import { useAuthStore } from './stores/auth'
import authService from './services/authService'

const authStore = useAuthStore()

onMounted(async () => {
  // Inicializar el token desde localStorage
  const hasToken = authService.initToken()

  // Intentar cargar el usuario al iniciar la aplicación si hay token
  if (hasToken) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Error al cargar el usuario:', error)
      // Si hay error, limpiamos el token
      localStorage.removeItem('auth_token')
    }
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <AppHeader />

    <main class="flex-grow">
      <RouterView />
    </main>

    <AppFooter />

    <!-- Sistema de notificaciones -->
    <VxvNotification />
  </div>
</template>
