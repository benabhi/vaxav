/**
 * @file Configuración del router de Vue
 * @description Configuración de rutas y guardias de navegación
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import PilotOverviewView from '../views/pilot/PilotOverviewView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        // Verificar si el usuario está autenticado
        const userStore = useUserStore();

        // Si el usuario no está autenticado, redirigir al login
        if (!userStore.isLoggedIn) {
          return { name: 'login' };
        }

        // Si el usuario está autenticado pero no ha verificado su email, redirigir a la verificación
        if (userStore.isLoggedIn && !userStore.isEmailVerified) {
          return { name: 'verify-email' };
        }

        // Si el usuario está autenticado y ha verificado su email, redirigir a la página principal
        return { path: '/pilot/overview' };
      }
    },
    // Rutas de piloto
    {
      path: '/pilot',
      redirect: to => {
        // Verificar si el usuario está autenticado
        const userStore = useUserStore();

        // Si el usuario no está autenticado, redirigir al login
        if (!userStore.isLoggedIn) {
          return { name: 'login' };
        }

        // Si el usuario está autenticado pero no ha verificado su email, redirigir a la verificación
        if (userStore.isLoggedIn && !userStore.isEmailVerified) {
          return { name: 'verify-email' };
        }

        // Si el usuario está autenticado y ha verificado su email, redirigir a la página principal
        return { path: '/pilot/overview' };
      }
    },
    {
      path: '/pilot/overview',
      name: 'pilot-overview',
      component: PilotOverviewView,
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true,
        requiresPilot: true
      }
    },
    // Rutas de autenticación
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/banned',
      name: 'banned-user',
      component: () => import('../views/auth/BannedUserView.vue'),
      meta: { requiresGuest: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'password.request',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password/:token',
      name: 'password.reset',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      props: true,
      meta: { requiresGuest: true }
    },
    {
      path: '/email/verify',
      name: 'verify-email',
      component: () => import('../views/auth/VerifyEmailView.vue'),
      meta: { requiresAuth: true },
      // Pasar los parámetros de verificación si están presentes en la URL
      props: route => ({
        id: route.query.id,
        hash: route.query.hash,
        expires: route.query.expires,
        signature: route.query.signature
      })
    },
    // Rutas de creación de piloto
    {
      path: '/create-pilot',
      name: 'create-pilot',
      component: () => import('../views/pilot/CreatePilotView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    {
      path: '/pilot/skills',
      name: 'pilot-skills',
      component: () => import('../views/pilot/PilotSkillsView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    // Rutas del universo
    {
      path: '/universe',
      redirect: '/universe/galaxy',
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    {
      path: '/universe/galaxy',
      name: 'universe-galaxy',
      component: () => import('../views/universe/UniverseView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    {
      path: '/universe/solar-system',
      name: 'universe-solar-system',
      component: () => import('../views/universe/UniverseView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    // Rutas de mercado
    {
      path: '/market',
      name: 'market',
      component: () => import('../views/market/MarketView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    // Rutas de naves
    {
      path: '/ships',
      name: 'ships',
      component: () => import('../views/ships/ShipsView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    // Ruta de perfil
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true
      }
    },
    // Rutas de administración
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/users',
      meta: {
        requiresAuth: true,
        requiresEmailVerification: true,
        requiresRoles: ['superadmin', 'admin', 'moderator']
      }
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin', 'moderator']
      }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/UsersView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/users/create',
      name: 'admin-users-create',
      component: () => import('../views/admin/UserCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/users/:id/edit',
      name: 'admin-users-edit',
      component: () => import('../views/admin/UserEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/users/:id/ban',
      name: 'admin-users-ban',
      component: () => import('../views/admin/users/BanUserView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/roles',
      name: 'admin-roles',
      component: () => import('../views/admin/RolesView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/roles/create',
      name: 'admin-roles-create',
      component: () => import('../views/admin/RoleCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/roles/:id/edit',
      name: 'admin-roles-edit',
      component: () => import('../views/admin/RoleEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    // Rutas de habilidades
    {
      path: '/admin/skills',
      name: 'admin-skills',
      component: () => import('../views/admin/skills/SkillsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/skills/create',
      name: 'admin-skills-create',
      component: () => import('../views/admin/skills/SkillCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/skills/:id/edit',
      name: 'admin-skills-edit',
      component: () => import('../views/admin/skills/SkillEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/skill-categories',
      name: 'admin-skill-categories',
      component: () => import('../views/admin/skills/SkillCategoriesView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/skill-categories/create',
      name: 'admin-skill-categories-create',
      component: () => import('../views/admin/skills/SkillCategoryCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/skill-categories/:id/edit',
      name: 'admin-skill-categories-edit',
      component: () => import('../views/admin/skills/SkillCategoryEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    // Rutas de pilotos
    {
      path: '/admin/pilots',
      name: 'admin-pilots',
      component: () => import('../views/admin/pilots/PilotsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/pilots/:id/edit',
      name: 'admin-pilots-edit',
      component: () => import('../views/admin/pilots/PilotEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/pilots/:id/skills',
      name: 'admin-pilots-skills',
      component: () => import('../views/admin/pilots/PilotSkillsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    // Rutas de configuración
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('../views/admin/settings/SettingsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },

    // Rutas de gestión del universo
    {
      path: '/admin/universe/regions',
      name: 'admin-universe-regions',
      component: () => import('../views/admin/universe/RegionsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/regions/create',
      name: 'admin-universe-regions-create',
      component: () => import('../views/admin/universe/RegionCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/regions/:id/edit',
      name: 'admin-universe-regions-edit',
      component: () => import('../views/admin/universe/RegionEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/constellations',
      name: 'admin-universe-constellations',
      component: () => import('../views/admin/universe/ConstellationsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/constellations/create',
      name: 'admin-universe-constellations-create',
      component: () => import('../views/admin/universe/ConstellationCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/constellations/:id/edit',
      name: 'admin-universe-constellations-edit',
      component: () => import('../views/admin/universe/ConstellationEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/solar-systems',
      name: 'admin-universe-solar-systems',
      component: () => import('../views/admin/universe/SolarSystemsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/solar-systems/create',
      name: 'admin-universe-solar-systems-create',
      component: () => import('../views/admin/universe/SolarSystemCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/solar-systems/:id/edit',
      name: 'admin-universe-solar-systems-edit',
      component: () => import('../views/admin/universe/SolarSystemEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/stars',
      name: 'admin-universe-stars',
      component: () => import('../views/admin/universe/StarsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/stars/create',
      name: 'admin-universe-stars-create',
      component: () => import('../views/admin/universe/StarCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/stars/:id/edit',
      name: 'admin-universe-stars-edit',
      component: () => import('../views/admin/universe/StarEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/planets',
      name: 'admin-universe-planets',
      component: () => import('../views/admin/universe/PlanetsView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/planets/create',
      name: 'admin-universe-planets-create',
      component: () => import('../views/admin/universe/PlanetCreateView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/universe/planets/:id/edit',
      name: 'admin-universe-planets-edit',
      component: () => import('../views/admin/universe/PlanetEditView.vue'),
      meta: {
        requiresAuth: true,
        requiresRoles: ['superadmin', 'admin']
      }
    },
  ],
})

// Configurar los guardias de navegación
setupRouterGuards(router).catch(error => {
  console.error('Error configuring router guards:', error);
});

export default router
