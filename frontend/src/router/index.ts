import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePilotStore } from '@/stores/pilot'
import HomeView from '../views/HomeView.vue'

// Helper function to check if user has required role
const hasRole = (user: any, requiredRoles: string[]): boolean => {
  if (!user) return false;

  // Check roles array
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const hasRequiredRole = user.roles.some((role: any) => {
      return requiredRoles.includes(role.slug);
    });

    if (hasRequiredRole) {
      return true;
    }
  }

  return false;
}

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

// Navegación de protección de rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Verificar si hay un token en localStorage
  const token = localStorage.getItem('auth_token');

  // Si hay un token pero el usuario no está cargado, intentar cargarlo
  if (token && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      // Si la ruta requiere autenticación, redirigir al login
      if (to.meta.requiresAuth) {
        localStorage.removeItem('auth_token'); // Token inválido o expirado
        return next({ name: 'login' });
      }
    }
  }

  // Si la ruta requiere autenticación y no hay token o usuario
  if (to.meta.requiresAuth && (!token || !authStore.user)) {
    return next({ name: 'login' });
  }

  // Si la ruta es solo para invitados y el usuario está autenticado
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'home' });
  }

  // Si la ruta requiere roles específicos
  if (to.meta.requiresRoles && Array.isArray(to.meta.requiresRoles) && authStore.user) {
    // Verificar si el usuario tiene alguno de los roles requeridos
    const userHasRole = hasRole(authStore.user, to.meta.requiresRoles as string[]);

    if (!userHasRole) {
      // Redirigir a la página principal
      return next({ name: 'home' });
    }
  }

  // Si el usuario está autenticado pero no ha verificado su email
  if (authStore.user && !authStore.isEmailVerified) {
    // Permitir solo acceso a la página de verificación y rutas de autenticación
    if (to.name !== 'verification.notice' &&
      to.name !== 'login' &&
      to.name !== 'register' &&
      to.name !== 'password.request' &&
      to.name !== 'password.reset') {
      // Redirigir a la página de verificación de email para cualquier otra ruta
      return next({ name: 'verification.notice' });
    }
  }

  // Si el usuario está autenticado, ha verificado su email, pero no tiene un piloto
  if (authStore.user &&
    authStore.isEmailVerified &&
    to.name !== 'create-pilot' &&
    to.name !== 'login' &&
    to.name !== 'register' &&
    to.name !== 'password.request' &&
    to.name !== 'password.reset') {

    // Cargar el piloto del usuario si no se ha cargado aún
    const pilotStore = usePilotStore();
    if (!pilotStore.hasPilot && !pilotStore.loading) {
      try {
        await pilotStore.fetchCurrentPilot();
      } catch (error) {
        console.error('Error fetching pilot:', error);
      }
    }

    // Si después de intentar cargar, el usuario no tiene un piloto, redirigir a la página de creación de piloto
    if (!pilotStore.hasPilot && to.name !== 'home') {
      return next({ name: 'create-pilot' });
    }
  }

  next();
});

export default router
