/**
 * @file Store unificado de usuario
 * @description Store que combina información de usuario y piloto para facilitar el acceso centralizado
 * @module stores/user
 */

import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { usePilotStore } from './pilot';
import { watch } from 'vue';
import { userPersistOptions } from './plugins/persistence';

/**
 * Estado del store unificado de usuario
 */
interface UserState {
  /** Indica si los datos del usuario han sido cargados */
  isLoaded: boolean;
  /** Indica si se están cargando datos del usuario */
  isLoading: boolean;
  /** Error durante la carga de datos */
  error: string | null;
}

/**
 * Store unificado que proporciona acceso centralizado a la información del usuario y su piloto
 */
export const useUserStore = defineStore('user', {
  /**
   * Estado inicial del store
   */
  state: (): UserState => ({
    isLoaded: false,
    isLoading: false,
    error: null,
  }),

  /**
   * Getters que combinan información de auth y pilot
   */
  getters: {
    /**
     * Indica si el usuario está autenticado
     */
    isLoggedIn: () => {
      const authStore = useAuthStore();
      return authStore.isLoggedIn;
    },

    /**
     * Indica si el email del usuario está verificado
     */
    isEmailVerified: () => {
      const authStore = useAuthStore();
      return authStore.isEmailVerified;
    },

    /**
     * Indica si el usuario tiene un piloto
     */
    hasPilot: () => {
      const pilotStore = usePilotStore();
      return pilotStore.hasPilot;
    },

    /**
     * Nombre del piloto del usuario
     */
    pilotName: () => {
      const pilotStore = usePilotStore();
      return pilotStore.pilotName;
    },

    /**
     * Raza del piloto del usuario
     */
    pilotRace: () => {
      const pilotStore = usePilotStore();
      return pilotStore.pilotRace;
    },

    /**
     * Créditos del piloto del usuario
     */
    pilotCredits: () => {
      const pilotStore = usePilotStore();
      return pilotStore.pilotCredits;
    },

    /**
     * Indica si el usuario es moderador
     */
    isModerator: () => {
      const authStore = useAuthStore();
      return authStore.isModerator;
    },

    /**
     * Indica si el usuario es administrador
     */
    isAdmin: () => {
      const authStore = useAuthStore();
      return authStore.isAdmin;
    },

    /**
     * Datos completos del usuario
     */
    userData: () => {
      const authStore = useAuthStore();
      return authStore.user;
    },

    /**
     * Datos completos del piloto
     */
    pilotData: () => {
      const pilotStore = usePilotStore();
      return pilotStore.currentPilot;
    },

    /**
     * Indica si se están cargando datos del usuario o piloto
     */
    isUserDataLoading: () => {
      const authStore = useAuthStore();
      const pilotStore = usePilotStore();
      return authStore.loading || pilotStore.loading;
    },

    /**
     * Indica si el usuario está baneado
     */
    isBanned: () => {
      const authStore = useAuthStore();
      return authStore.isBanned;
    },

    /**
     * Información del baneo del usuario
     */
    banInfo: () => {
      const authStore = useAuthStore();
      return authStore.banInfo;
    }
  },

  /**
   * Acciones para cargar y actualizar datos del usuario
   */
  actions: {
    /**
     * Carga todos los datos del usuario (autenticación y piloto)
     */
    async loadUserData() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();

        // Primero cargar datos de autenticación
        if (!authStore.isAuthenticated && authStore.token) {
          await authStore.fetchUser();
        }

        // Si está autenticado, cargar datos del piloto y verificar estado de email
        if (authStore.isAuthenticated) {
          // Verificar explícitamente el estado de verificación del correo electrónico
          await authStore.checkEmailVerification();

          // Cargar datos del piloto
          const pilotStore = usePilotStore();
          await pilotStore.fetchCurrentPilot();
        }

        this.isLoaded = true;
      } catch (error: any) {
        this.error = error.message || 'Error al cargar datos del usuario';
        console.error('Error en loadUserData:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Registra un nuevo usuario
     * @param userData - Datos del usuario a registrar
     */
    async register(userData: {
      name: string;
      email: string;
      email_confirmation: string;
      password: string;
      password_confirmation: string;
    }) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();

        // Registrar usuario usando el store de autenticación
        await authStore.register(userData);

        // Si el registro fue exitoso, cargar datos del usuario
        if (authStore.isAuthenticated) {
          await this.loadUserData();
        }

        this.isLoaded = true;
      } catch (error: any) {
        this.error = error.message || 'Error al registrar usuario';
        console.error('Error en register:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el componente
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Inicia sesión con un usuario existente
     * @param credentials - Credenciales de inicio de sesión
     */
    async login(credentials: { email: string; password: string }) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();

        // Iniciar sesión usando el store de autenticación
        const loginResult = await authStore.login(credentials);

        // Verificar si el usuario está baneado
        if (loginResult && loginResult.banned) {
          // No lanzar error, permitir que el componente maneje la redirección
          this.isLoaded = true;
          return { banned: true, banInfo: loginResult.banInfo };
        }

        // Si el inicio de sesión fue exitoso, cargar datos del usuario
        if (authStore.isAuthenticated) {
          await this.loadUserData();

          // Verificar explícitamente el estado de verificación del correo electrónico
          await authStore.checkEmailVerification();
        }

        this.isLoaded = true;
      } catch (error: any) {
        this.error = error.message || 'Error al iniciar sesión';
        console.error('Error en login:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el componente
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Cierra la sesión del usuario actual
     */
    async logout() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();

        // Cerrar sesión usando el store de autenticación
        await authStore.logout();

        // Resetear el estado
        this.isLoaded = false;
      } catch (error: any) {
        this.error = error.message || 'Error al cerrar sesión';
        console.error('Error en logout:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza los datos del usuario después de cambios
     */
    async refreshUserData() {
      this.isLoaded = false;
      return this.loadUserData();
    },

    /**
     * Crea un nuevo piloto para el usuario actual
     * @param pilotData - Datos del piloto a crear
     */
    async createPilot(pilotData: { name: string; race: string }) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const pilotStore = usePilotStore();

        // Crear piloto usando el store de piloto
        await pilotStore.createPilot(pilotData);

        // Actualizar los datos del usuario
        await this.refreshUserData();
      } catch (error: any) {
        this.error = error.message || 'Error al crear piloto';
        console.error('Error en createPilot:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Limpia el error actual
     */
    clearError() {
      this.error = null;
    }
  },

  /**
   * Configuración de persistencia
   */
  ...userPersistOptions,
});

/**
 * Configura watchers para recargar datos cuando cambie el token
 */
export function setupUserStoreWatchers() {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  watch(() => authStore.token, (newToken) => {
    if (newToken) {
      userStore.loadUserData();
    } else {
      // Si el token se elimina (logout), resetear el estado
      userStore.isLoaded = false;
    }
  });
}
