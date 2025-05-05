<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import VxvSidebar from './components/ui/navigation/VxvSidebar.vue'
import VxvSidebarGroup from './components/ui/navigation/VxvSidebarGroup.vue'
import VxvNavLink from './components/ui/navigation/VxvNavLink.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import VxvStatusBar from './components/ui/layout/VxvStatusBar.vue'
import VxvNotification from './components/ui/feedback/VxvNotification.vue'
import { useUserStore } from './stores/user'
import authService from './services/authService'

// Usar el store unificado en lugar de los stores individuales
const userStore = useUserStore()

// Estado para el menú móvil
const pilotMenuItems = [
  { to: '/pilot/overview', label: 'Vista General', exact: true },
  { to: '/pilot/skills', label: 'Habilidades', exact: false }
]
const universeMenuItems = [
  { to: '/universe/galaxy', label: 'Galaxia', exact: true },
  { to: '/universe/solar-system', label: 'Sistema Solar', exact: false }
]

// Estado para el menú móvil
const isMobileMenuOpen = ref(false)
const isMobileView = ref(false)

// Referencia al componente AdminLayout
const adminLayoutRef = ref<{ openMobileMenu: Function } | null>(null)

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
  return userStore.isModerator
})

// Verificar si el usuario está autenticado y tiene un piloto
const hasAuthenticatedPilot = computed(() => {
  return userStore.isLoggedIn && userStore.isEmailVerified && userStore.hasPilot
})



// Métodos para el menú móvil
const openMobileMenu = () => {
  // Verificar si estamos en una ruta de administración
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    // Si estamos en una ruta de administración, intentar abrir el sidebar del AdminLayout
    // Esto se hará a través de un evento global
    window.dispatchEvent(new CustomEvent('open-admin-sidebar'))
  } else {
    // Si no estamos en una ruta de administración, abrir el sidebar normal
    isMobileMenuOpen.value = true
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Métodos para el cronómetro de acción
const onTimerComplete = () => {
  console.log('Cronómetro completado')
  // Aquí puedes realizar acciones cuando el cronómetro llega a cero
}

const updateTimerRemainingTime = (time: number) => {
  timerRemainingTime.value = time
}
onMounted(async () => {
  // Inicializar el token desde localStorage
  const hasToken = authService.initToken()

  // Intentar cargar el usuario al iniciar la aplicación si hay token
  if (hasToken) {
    try {
      // Usar el store unificado para cargar todos los datos del usuario
      await userStore.loadUserData()
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error)
      // Si hay error, limpiamos el token
      localStorage.removeItem('auth_token')
    }
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <AppHeader @toggle-sidebar="openMobileMenu" />

    <main class="flex-grow">
      <RouterView />
    </main>

    <!-- Barra de estado con cronómetro de acción (solo visible con piloto autenticado) -->
    <VxvStatusBar
      v-if="hasAuthenticatedPilot"
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
      v-if="isMobileMenuOpen && hasAuthenticatedPilot"
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
          <VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/pilot">
            <VxvNavLink
              v-for="item in pilotMenuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :is-mobile="true"
              active-class="text-blue-400"
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
              active-class="text-blue-400"
            />
          </VxvSidebarGroup>
          <VxvNavLink
            to="/market"
            label="Mercado"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            active-class="text-blue-400"
          />
          <VxvNavLink
            to="/ships"
            label="Naves"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            active-class="text-blue-400"
          />
          <VxvNavLink
            v-if="isModerator"
            to="/admin"
            label="Administración"
            :is-sidebar-collapsed="false"
            :is-mobile="true"
            active-class="text-blue-400"
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