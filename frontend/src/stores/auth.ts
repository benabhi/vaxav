import { defineStore } from 'pinia';
import authService from '@/services/authService';
import type { User, LoginCredentials, RegisterData } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;

      try {
        await authService.login(credentials);
        await this.fetchUser();
        this.isAuthenticated = true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    },

    async register(data: RegisterData) {
      this.loading = true;
      this.error = null;

      try {
        await authService.register(data);
        await this.fetchUser();
        this.isAuthenticated = true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al registrarse';
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;

      try {
        await authService.logout();
        this.user = null;
        this.isAuthenticated = false;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cerrar sesión';
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      this.loading = true;

      try {
        const user = await authService.getUser();
        this.user = user;
        this.isAuthenticated = true;
      } catch (error: any) {
        this.user = null;
        this.isAuthenticated = false;
        // No establecemos un mensaje de error cuando no hay usuario autenticado
        // Solo registramos el error en la consola para depuración
        console.log('No hay usuario autenticado:', error);
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
