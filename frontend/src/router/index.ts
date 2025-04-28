import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // Rutas de autenticación
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    // Rutas de piloto
    {
      path: '/create-pilot',
      name: 'create-pilot',
      component: () => import('../views/pilot/CreatePilotView.vue'),
      meta: { requiresAuth: true }
    },
    // Rutas del universo
    {
      path: '/universe',
      name: 'universe',
      component: () => import('../views/universe/UniverseView.vue'),
      meta: { requiresAuth: true }
    },
    // Rutas de mercado
    {
      path: '/market',
      name: 'market',
      component: () => import('../views/market/MarketView.vue'),
      meta: { requiresAuth: true }
    },
    // Rutas de naves
    {
      path: '/ships',
      name: 'ships',
      component: () => import('../views/ships/ShipsView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Navegación de protección de rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'login' });
  }

  // Si la ruta es solo para invitados y el usuario está autenticado
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'home' });
  }

  next();
});

export default router
