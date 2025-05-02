<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import VxvNotification from './components/ui/feedback/VxvNotification.vue'
import VxvPageTitle from './components/ui/layout/VxvPageTitle.vue'
import VxvSidebar from './components/ui/navigation/VxvSidebar.vue'
import VxvNavLink from './components/ui/navigation/VxvNavLink.vue'
import { useAuthStore } from './stores/auth'
import authService from './services/authService'

const authStore = useAuthStore()
const route = useRoute()

// Estado para el título de la página
const pageTitle = ref('Dashboard')
const showPageTitle = ref(true)

// Estado para el menú móvil
const isMobileMenuOpen = ref(false)

// Verificar si el usuario es moderador
const isModerator = computed(() => {
  return authStore.isModerator || authStore.isAdmin || authStore.isSuperAdmin
})

// Actualizar el título de la página basado en la ruta
watch(() => route.name, (newRouteName) => {
  if (newRouteName) {
    // Convertir el nombre de la ruta a un título legible
    const routeNameStr = String(newRouteName)

    // Ocultar el título en ciertas páginas o en rutas de admin
    if (routeNameStr === 'login' ||
        routeNameStr === 'register' ||
        routeNameStr === 'verification.notice' ||
        route.path.startsWith('/admin')) {
      showPageTitle.value = false
    } else {
      showPageTitle.value = true

      // Asignar título según la ruta
      switch (routeNameStr) {
        case 'home':
          pageTitle.value = 'Dashboard'
          break
        case 'universe':
          pageTitle.value = 'Universo'
          break
        case 'market':
          pageTitle.value = 'Mercado'
          break
        case 'ships':
          pageTitle.value = 'Naves'
          break
        case 'create-pilot':
          pageTitle.value = 'Crear Piloto'
          break
        default:
          // Capitalizar el nombre de la ruta
          pageTitle.value = routeNameStr.charAt(0).toUpperCase() + routeNameStr.slice(1).replace(/\./g, ' ')
      }
    }
  }
}, { immediate: true })

// Métodos para el menú móvil
const openMobileMenu = () => {
  isMobileMenuOpen.value = true
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

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

    <!-- Título de página con botón hamburger -->
    <VxvPageTitle
      v-if="showPageTitle"
      :title="pageTitle"
      @mobile-menu-click="openMobileMenu"
    ></VxvPageTitle>

    <main class="flex-grow">
      <RouterView />
    </main>

    <AppFooter />

    <!-- Sistema de notificaciones -->
    <VxvNotification />

    <!-- Mobile sidebar con overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 lg:hidden mobile-sidebar-container"
      @click="closeMobileMenu"
    >
      <!-- Sidebar container with animation -->
      <div
        class="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out border-r border-gray-700 z-10"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <!-- Mobile sidebar content -->
        <VxvSidebar
          title="VAXAV"
          :collapsible="false"
          :is-mobile="true"
          @close="closeMobileMenu"
        >
          <VxvNavLink
            to="/"
            label="Dashboard"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
          <VxvNavLink
            to="/universe"
            label="Universo"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
          <VxvNavLink
            to="/market"
            label="Mercado"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
          <VxvNavLink
            to="/ships"
            label="Naves"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
          <VxvNavLink
            v-if="isModerator"
            to="/admin"
            label="Administración"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
          />
        </VxvSidebar>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilo para el overlay del sidebar móvil */
.mobile-sidebar-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.25); /* bg-gray-900 con opacidad media */
  backdrop-filter: blur(1px); /* Ligero desenfoque para mejorar el contraste */
  pointer-events: none; /* Permite que los clics pasen a través del overlay */
}
</style>