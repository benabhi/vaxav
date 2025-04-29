import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

// Helper function to check if user has required role
const hasRole = (user: any, requiredRoles: string[]): boolean => {
  if (!user) return false;

  console.log('Checking roles for user:', user);
  console.log('Required roles:', requiredRoles);

  // Check direct role properties first (is_superadmin, is_admin, is_moderator)
  if (requiredRoles.includes('superadmin') && user.is_superadmin === true) {
    console.log('User has superadmin role via is_superadmin property');
    return true;
  }

  if (requiredRoles.includes('admin') && user.is_admin === true) {
    console.log('User has admin role via is_admin property');
    return true;
  }

  if (requiredRoles.includes('moderator') && user.is_moderator === true) {
    console.log('User has moderator role via is_moderator property');
    return true;
  }

  // Check roles array
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const hasRequiredRole = user.roles.some((role: any) => {
      return requiredRoles.includes(role.slug);
    });

    if (hasRequiredRole) {
      console.log('User has required role via roles array');
      return true;
    }
  }

  console.log('User does not have any of the required roles');
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
      console.log('Usuario cargado en router guard:', authStore.user);
    } catch (error) {
      console.error('Error al cargar usuario en router guard:', error);
      // Si la ruta requiere autenticación, redirigir al login
      if (to.meta.requiresAuth) {
        localStorage.removeItem('auth_token'); // Token inválido o expirado
        return next({ name: 'login' });
      }
    }
  }

  // Si la ruta requiere autenticación y no hay token o usuario
  if (to.meta.requiresAuth && (!token || !authStore.user)) {
    console.log('Ruta requiere autenticación y no hay token o usuario');
    return next({ name: 'login' });
  }

  // Si la ruta es solo para invitados y el usuario está autenticado
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'home' });
  }

  // Si la ruta requiere roles específicos
  if (to.meta.requiresRoles && Array.isArray(to.meta.requiresRoles) && authStore.user) {
    console.log('Ruta requiere roles:', to.path, to.meta.requiresRoles);
    console.log('Estado de autenticación:', authStore.isLoggedIn);
    console.log('Usuario actual:', authStore.user);

    // Verificar si el usuario tiene alguno de los roles requeridos
    const userHasRole = hasRole(authStore.user, to.meta.requiresRoles as string[]);
    console.log('¿Usuario tiene rol requerido?', userHasRole);

    if (!userHasRole) {
      console.log('Usuario no tiene los roles requeridos:', to.meta.requiresRoles);
      console.log('Roles del usuario:', authStore.user?.roles);
      console.log('is_superadmin:', authStore.user?.is_superadmin);
      console.log('is_admin:', authStore.user?.is_admin);
      console.log('is_moderator:', authStore.user?.is_moderator);

      // Redirigir a la página principal
      return next({ name: 'home' });
    } else {
      console.log('Usuario tiene los roles requeridos:', to.meta.requiresRoles);
    }
  }

  next();
});

export default router
