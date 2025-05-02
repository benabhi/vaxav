import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

// Helper function to check if user has required role
const hasRole = (user: any, requiredRoles: string[]): boolean => {
  if (!user) return false;

  // Check direct role properties first (is_superadmin, is_admin, is_moderator)
  if (requiredRoles.includes('superadmin') && user.is_superadmin === true) {
    return true;
  }

  if (requiredRoles.includes('admin') && user.is_admin === true) {
    return true;
  }

  if (requiredRoles.includes('moderator') && user.is_moderator === true) {
    return true;
  }

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
      meta: { requiresAuth: true }
    },
    // Ruta para manejar la verificación de email desde el enlace
    {
      path: '/email/verify',
      name: 'verification.verify',
      component: () => import('../views/auth/VerifyEmailView.vue'),
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
  if (authStore.user &&
    !authStore.isEmailVerified &&
    to.name !== 'verification.notice' &&
    to.name !== 'login' &&
    to.name !== 'register' &&
    to.name !== 'password.request' &&
    to.name !== 'password.reset') {
    // Redirigir a la página de verificación de email para cualquier ruta
    return next({ name: 'verification.notice' });
  }

  next();
});

export default router
