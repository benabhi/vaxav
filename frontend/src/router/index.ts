/**
 * @file Configuración del router de Vue
 * @description Configuración de rutas y guardias de navegación
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import PilotOverviewView from '../views/pilot/PilotOverviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/pilot/overview',
      meta: { requiresAuth: true }
    },
    // Rutas de piloto
    {
      path: '/pilot',
      redirect: '/pilot/overview',
      meta: { requiresAuth: true }
    },
    {
      path: '/pilot/overview',
      name: 'pilot-overview',
      component: PilotOverviewView,
      meta: {
        requiresAuth: true,
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
      name: 'verification.notice',
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
      meta: { requiresAuth: true }
    },
    {
      path: '/pilot/skills',
      name: 'pilot-skills',
      component: () => import('../views/pilot/PilotSkillsView.vue'),
      meta: { requiresAuth: true }
    },
    // Rutas del universo
    {
      path: '/universe',
      redirect: '/universe/galaxy',
      meta: { requiresAuth: true }
    },
    {
      path: '/universe/galaxy',
      name: 'universe-galaxy',
      component: () => import('../views/universe/UniverseView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/universe/solar-system',
      name: 'universe-solar-system',
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
    // Ruta de perfil
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    // Rutas de administración
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/users',
      meta: {
        requiresAuth: true,
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
  ],
})

// Configurar los guardias de navegación
setupRouterGuards(router).then(() => {
  console.log('Router guards configured successfully');
}).catch(error => {
  console.error('Error configuring router guards:', error);
});

export default router
