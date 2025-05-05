/**
 * @file Guardias de navegación para Vue Router
 * @description Configuración de guardias de navegación para proteger rutas y cargar datos automáticamente
 * @module router/guards
 */

import type { Router } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification.ts';

/**
 * Configura el guardia de autenticación para el router
 * @param router Instancia de Vue Router
 */
export async function setupAuthGuard(router: Router): Promise<void> {
  // No inicializar los stores aquí, sino dentro del guardia
  // para asegurarnos de que Pinia ya está inicializada

  router.beforeEach(async (to, from, next) => {
    // Inicializar los stores dentro del guardia
    const userStore = useUserStore();
    const notificationStore = useNotificationStore();

    // Si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
      // Cargar datos del usuario si no están cargados
      if (!userStore.isLoaded) {
        try {
          await userStore.loadUserData();
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          notificationStore.error('Error al cargar datos del usuario. Por favor, inténtalo de nuevo.');
        }
      }

      // Verificar autenticación
      if (!userStore.isLoggedIn) {
        notificationStore.warning('Debes iniciar sesión para acceder a esta página.');
        return next({
          name: 'login',
          query: { redirect: to.fullPath }
        });
      }

      // Verificar verificación de email si es necesario
      if (to.meta.requiresEmailVerification && !userStore.isEmailVerified) {
        notificationStore.warning('Debes verificar tu email para acceder a esta página.');
        return next({ name: 'verify-email' });
      }

      // Verificar si tiene piloto si es necesario
      if (to.meta.requiresPilot && !userStore.hasPilot) {
        notificationStore.info('Debes crear un piloto para acceder a esta página.');
        return next({ name: 'create-pilot' });
      }

      // Verificar roles si es necesario
      if (to.meta.requiredRole) {
        const roleMethod = `is${to.meta.requiredRole}` as keyof typeof userStore;

        // Verificar si el método existe y es una función o getter
        if (!(roleMethod in userStore) || !userStore[roleMethod]) {
          notificationStore.error('No tienes permisos para acceder a esta página.');
          return next({ name: 'unauthorized' });
        }
      }
    }

    // Si la ruta es para usuarios no autenticados (login, register, etc.)
    if (to.meta.requiresGuest && userStore.isLoggedIn) {
      return next({ name: 'pilot-overview' });
    }

    next();
  });
}

/**
 * Configura el guardia de título para el router
 * @param router Instancia de Vue Router
 * @param appName Nombre de la aplicación para incluir en el título
 */
export function setupTitleGuard(router: Router, appName: string = 'Vaxav'): void {
  router.afterEach((to) => {
    // Actualizar el título de la página
    const pageTitle = to.meta.title as string || 'Página';
    document.title = `${pageTitle} | ${appName}`;
  });
}

/**
 * Configura todos los guardias de navegación
 * @param router Instancia de Vue Router
 */
export async function setupRouterGuards(router: Router): Promise<void> {
  await setupAuthGuard(router);
  setupTitleGuard(router);
}
