<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import VxvStatusBar from './components/ui/layout/VxvStatusBar.vue'
import VxvNotification from './components/ui/feedback/VxvNotification.vue'
import VxvPageTitle from './components/ui/layout/VxvPageTitle.vue'
import VxvSidebar from './components/ui/navigation/VxvSidebar.vue'
import VxvSidebarGroup from './components/ui/navigation/VxvSidebarGroup.vue'
import VxvNavLink from './components/ui/navigation/VxvNavLink.vue'
import { useAuthStore } from './stores/auth'
import authService from './services/authService'

const authStore = useAuthStore()
const route = useRoute()

// Estado para el título de la página
const pageTitle = ref('Dashboard')
const showPageTitle = ref(true)

// Estado para los menús secundarios
const currentSection = ref('')
const pilotMenuItems = [
  { to: '/', label: 'Vista General', exact: true }, // Mantener exact: true para la vista general
  { to: '/skills', label: 'Habilidades', exact: false }
]
const universeMenuItems = [
  { to: '/universe', label: 'Galaxia', exact: true }, // Mantener exact: true para la vista de galaxia
  { to: '/universe/solar-system', label: 'Sistema Solar', exact: false }
]

// Estado para el menú móvil
const isMobileMenuOpen = ref(false)
const isMobileView = ref(false)

// Estado para el cronómetro de acción
const timerDuration = ref(300) // 5 minutos para prueba
const timerRemainingTime = ref(300)
const timerAction = ref('Prueba de 5 minutos')
const timerIsActive = ref(true)

// Detectar si estamos en vista móvil
onMounted(() => {
  const checkMobileView = () => {
    isMobileView.value = window.innerWidth < 768 // md breakpoint en Tailwind
  }

  // Comprobar inicialmente
  checkMobileView()

  // Añadir listener para cambios de tamaño
  window.addEventListener('resize', checkMobileView)

  // Limpiar listener al desmontar
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobileView)
  })
})

// Verificar si el usuario es moderador
const isModerator = computed(() => {
  return authStore.isModerator || authStore.isAdmin || authStore.isSuperAdmin
})

// Actualizar el título de la página y la sección actual basado en la ruta
watch(() => route.path, (newPath) => {
  // Convertir el nombre de la ruta a un título legible
  const routeNameStr = String(route.name || '')

  // Ocultar el título en ciertas páginas o en rutas de admin
  if (routeNameStr === 'login' ||
      routeNameStr === 'register' ||
      routeNameStr === 'verification.notice' ||
      newPath.startsWith('/admin')) {
    showPageTitle.value = false
    currentSection.value = ''
  } else {
    showPageTitle.value = true

    // Determinar la sección actual basada en la ruta
    if (newPath === '/' || newPath.startsWith('/skills')) {
      currentSection.value = 'pilot'
      pageTitle.value = 'Piloto'
    } else if (newPath.startsWith('/universe')) {
      currentSection.value = 'universe'
      pageTitle.value = 'Universo'
    } else if (newPath.startsWith('/market')) {
      currentSection.value = 'market'
      pageTitle.value = 'Mercado'
    } else if (newPath.startsWith('/ships')) {
      currentSection.value = 'ships'
      pageTitle.value = 'Naves'
    } else if (routeNameStr === 'create-pilot') {
      currentSection.value = ''
      pageTitle.value = 'Crear Piloto'
    } else {
      currentSection.value = ''
      // Capitalizar el nombre de la ruta
      pageTitle.value = routeNameStr.charAt(0).toUpperCase() + routeNameStr.slice(1).replace(/\./g, ' ')
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

// Métodos para el cronómetro de acción
const onTimerComplete = () => {
  console.log('Cronómetro completado')
  // Aquí puedes realizar acciones cuando el cronómetro llega a cero
}

const updateTimerRemainingTime = (time) => {
  timerRemainingTime.value = time
}

// Método para iniciar un nuevo cronómetro con una acción específica
const startActionTimer = (action, duration = 120) => {
  timerAction.value = action
  timerDuration.value = duration
  timerRemainingTime.value = duration
  timerIsActive.value = true
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

    <!-- Título de página con botón hamburger y menús secundarios -->
    <VxvPageTitle
      v-if="showPageTitle"
      :title="pageTitle"
      :is-mobile="isMobileView"
      @mobile-menu-click="openMobileMenu"
    >
      <!-- Menú secundario para la sección de Piloto -->
      <template v-if="currentSection === 'pilot'" #menu>
        <VxvNavLink
          v-for="item in pilotMenuItems"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :exact="item.exact"
          simple
          horizontal
        />
      </template>

      <!-- Menú secundario para la sección de Universo -->
      <template v-if="currentSection === 'universe'" #menu>
        <VxvNavLink
          v-for="item in universeMenuItems"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :exact="item.exact"
          simple
          horizontal
        />
      </template>
    </VxvPageTitle>

    <main class="flex-grow">
      <RouterView />
    </main>

    <!-- Barra de estado con cronómetro de acción -->
    <VxvStatusBar
      :timer-duration="timerDuration"
      :timer-remaining-time="timerRemainingTime"
      :timer-action="timerAction"
      :timer-is-active="timerIsActive"
      @timer-complete="onTimerComplete"
      @update:timer-remaining-time="updateTimerRemainingTime"
    >
      <!-- Contenido personalizado para la sección izquierda -->
      <template #left>
        <div class="status-item">
          <span class="status-label">Créditos:</span>
          <span class="status-value">1,250,000 ISK</span>
        </div>
      </template>

      <!-- Contenido personalizado para la sección derecha -->
      <template #right>
        <div class="status-item">
          <span class="status-label">Sistema:</span>
          <span class="status-value">Alpha Centauri</span>
        </div>
      </template>
    </VxvStatusBar>

    <AppFooter />

    <!-- Sistema de notificaciones -->
    <VxvNotification />

    <!-- Mobile sidebar con overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 md:hidden mobile-sidebar-container"
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
          <!-- Piloto y sus submenús -->
          <VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/" :additional-paths="['/skills']">
            <VxvNavLink
              v-for="item in pilotMenuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :is-mobile="true"
            />
          </VxvSidebarGroup>
          <!-- Universo y sus submenús -->
          <VxvSidebarGroup title="Universo" :is-mobile="true" basePath="/universe">
            <VxvNavLink
              v-for="item in universeMenuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :is-mobile="true"
            />
          </VxvSidebarGroup>
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

/* Estilos para los elementos de estado */
.status-item {
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
}

.status-label {
  font-size: 0.75rem;
  color: #9ca3af; /* text-gray-400 */
  margin-right: 0.25rem;
}

.status-value {
  font-size: 0.875rem;
  color: #e5e7eb; /* text-gray-200 */
  font-weight: 500;
}
</style>