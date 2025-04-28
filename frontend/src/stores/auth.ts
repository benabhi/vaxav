import { defineStore } from 'pinia';
import authService from '@/services/authService';
import type { User, LoginCredentials, RegisterData } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    hasRole: (state) => (role: string) => {
      if (!state.user) return false;

      // Check direct role properties first
      if (role === 'superadmin' && state.user.is_superadmin) return true;
      if (role === 'admin' && state.user.is_admin) return true;
      if (role === 'moderator' && state.user.is_moderator) return true;

      // Fallback to checking roles array
      if (state.user.roles) {
        return state.user.roles.some(r => r.slug === role);
      }

      return false;
    },
    hasAnyRole: (state) => (roles: string[]) => {
      if (!state.user) return false;

      // Check direct role properties first
      if (roles.includes('superadmin') && state.user.is_superadmin) return true;
      if (roles.includes('admin') && state.user.is_admin) return true;
      if (roles.includes('moderator') && state.user.is_moderator) return true;

      // Fallback to checking roles array
      if (state.user.roles) {
        return state.user.roles.some(r => roles.includes(r.slug));
      }

      return false;
    },
    isSuperAdmin: (state) => {
      if (!state.user) return false;
      return state.user.is_superadmin === true;
    },
    isAdmin: (state) => {
      if (!state.user) return false;
      return state.user.is_admin === true;
    },
    isModerator: (state) => {
      if (!state.user) return false;
      return state.user.is_moderator === true;
    },
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(data: RegisterData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.register(data);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al registrarse';
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;

      try {
        await authService.logout();
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cerrar sesión';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      this.loading = true;

      try {
        const user = await authService.getUser();
        console.log('Usuario obtenido del servidor:', user);

        // Asegurarnos de que las propiedades de roles estén correctamente establecidas
        if (user) {
          // Convertir valores string a boolean si es necesario
          if (typeof user.is_superadmin === 'string') {
            user.is_superadmin = user.is_superadmin === 'true' || user.is_superadmin === '1';
          }
          if (typeof user.is_admin === 'string') {
            user.is_admin = user.is_admin === 'true' || user.is_admin === '1';
          }
          if (typeof user.is_moderator === 'string') {
            user.is_moderator = user.is_moderator === 'true' || user.is_moderator === '1';
          }

          // Si el usuario tiene el rol superadmin en el array de roles, asegurarnos de que is_superadmin sea true
          if (user.roles && Array.isArray(user.roles)) {
            const hasSuperadminRole = user.roles.some((role: any) => role.slug === 'superadmin');
            if (hasSuperadminRole) {
              user.is_superadmin = true;
              user.is_admin = true;
              user.is_moderator = true;
            }

            const hasAdminRole = user.roles.some((role: any) => role.slug === 'admin');
            if (hasAdminRole) {
              user.is_admin = true;
              user.is_moderator = true;
            }

            const hasModeratorRole = user.roles.some((role: any) => role.slug === 'moderator');
            if (hasModeratorRole) {
              user.is_moderator = true;
            }
          }
        }

        this.user = user;
        this.isAuthenticated = true;
        console.log('Usuario establecido en el store:', this.user);
      } catch (error: any) {
        this.user = null;
        this.isAuthenticated = false;
        console.error('Error al obtener usuario:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      return this.fetchUser();
    },

    clearError() {
      this.error = null;
    },
  },
});
