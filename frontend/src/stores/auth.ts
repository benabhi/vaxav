/**
 * @file Store de autenticación
 * @description Gestión del estado de autenticación y usuario
 * @module stores/auth
 */

import { defineStore } from 'pinia';
import authService from '@/services/authService';
import type { User, LoginCredentials, RegisterData, PasswordResetData } from '@/services/authService';
import { authPersistOptions } from './plugins/persistence';

interface BanInfo {
  reason: string;
  type: 'permanent' | 'temporary';
  is_permanent: boolean;
  expires_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailVerified: boolean;
  isBanned: boolean;
  banInfo: BanInfo | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    emailVerified: false,
    isBanned: false,
    banInfo: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isEmailVerified: (state) => state.emailVerified,
    hasRole: (state) => (role: string) => {
      if (!state.user) return false;

      // Check roles array
      if (state.user.roles) {
        return state.user.roles.some(r => r.slug === role);
      }

      return false;
    },
    hasAnyRole: (state) => (roles: string[]) => {
      if (!state.user) return false;

      // Check roles array
      if (state.user.roles) {
        return state.user.roles.some(r => roles.includes(r.slug));
      }

      return false;
    },
    isSuperAdmin: (state) => {
      if (!state.user) return false;
      return state.user.roles && state.user.roles.some(r => r.slug === 'superadmin');
    },
    isAdmin: (state) => {
      if (!state.user) return false;
      return state.user.roles && (
        state.user.roles.some(r => r.slug === 'admin') ||
        state.user.roles.some(r => r.slug === 'superadmin')
      );
    },
    isModerator: (state) => {
      if (!state.user) return false;
      return state.user.roles && (
        state.user.roles.some(r => r.slug === 'moderator') ||
        state.user.roles.some(r => r.slug === 'admin') ||
        state.user.roles.some(r => r.slug === 'superadmin')
      );
    },
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);

        // Verificar si el usuario está baneado
        if (response.banned) {
          this.isBanned = true;
          this.banInfo = response.ban_info;
          this.isAuthenticated = false;
          this.error = response.message || 'Tu cuenta ha sido suspendida.';

          // No lanzar error, permitir que el flujo continúe para manejar la redirección
          return { banned: true, banInfo: response.ban_info };
        }

        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
        this.isBanned = false;
        this.banInfo = null;

        // Verificar explícitamente si el email está verificado
        if (this.user && this.user.email_verified_at) {
          this.emailVerified = true;
        }

        // Verificar el estado de verificación del email con el backend
        await this.checkEmailVerification();
      } catch (error: any) {
        // Manejar diferentes tipos de errores
        if (error.response?.status === 422) {
          // Error de validación (credenciales incorrectas)
          if (error.response?.data?.errors?.email) {
            const emailErrors = error.response.data.errors.email;
            this.error = Array.isArray(emailErrors) ? emailErrors[0] : emailErrors;
          } else if (error.response?.data?.errors?.password) {
            const passwordErrors = error.response.data.errors.password;
            this.error = Array.isArray(passwordErrors) ? passwordErrors[0] : passwordErrors;
          } else {
            this.error = 'El usuario no existe o la contraseña es incorrecta';
          }
        } else if (error.response?.status === 429) {
          // Error de límite de intentos
          this.error = 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.';
        } else {
          // Otros errores
          this.error = error.response?.data?.message || 'Error al iniciar sesión';
        }

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
        // Manejar errores de validación
        if (error.response?.data?.errors) {
          // Si hay errores de validación específicos, mostrar el primero
          const errorMessages = Object.values(error.response.data.errors);
          if (errorMessages.length > 0) {
            // Tomar el primer mensaje de error
            this.error = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : errorMessages[0];
          } else {
            this.error = 'Error al registrarse';
          }
        } else {
          this.error = error.response?.data?.message || 'Error al registrarse';
        }
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
        const response = await authService.getUser();

        // Verificar si la respuesta indica que el usuario está baneado
        if (response.banned) {
          this.isBanned = true;
          this.banInfo = response.ban_info;
          this.isAuthenticated = false;
          this.error = response.message || 'Tu cuenta ha sido suspendida.';
          throw new Error('Usuario baneado');
        }

        const user = response;
        // Usuario obtenido del servidor

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

          // No necesitamos procesar los roles aquí, ya que usamos directamente el array de roles
        }

        this.user = user;
        this.isAuthenticated = true;
        this.isBanned = false;
        this.banInfo = null;

        // Verificar explícitamente si el email está verificado basado en la respuesta del backend
        this.emailVerified = user.email_verified_at !== null;
        // Email verificado y usuario establecido en el store
      } catch (error: any) {
        this.user = null;
        this.isAuthenticated = false;
        this.emailVerified = false;
        // Error al obtener usuario
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
      } finally {
        this.loading = false;
      }
    },

    async checkEmailVerification() {
      try {
        // Primero, obtener el estado actual del usuario
        await this.fetchUser();

        // Luego, verificar específicamente el estado de verificación
        const status = await authService.getEmailVerificationStatus();
        // Estado de verificación desde API

        // Actualizar el estado en el store
        this.emailVerified = status.verified;

        // Si hay discrepancia entre el estado del usuario y la API, confiar en la API
        if (this.user && this.user.email_verified_at && !status.verified) {
          // Discrepancia en el estado de verificación
        } else if (this.user && !this.user.email_verified_at && status.verified) {
          // Discrepancia en el estado de verificación
          // Forzar una actualización del usuario
          await this.fetchUser();
        }

        return status;
      } catch (error) {
        // Error al verificar estado del email
        return { verified: false, message: 'Error al verificar estado del email' };
      }
    },

    async resendVerificationEmail() {
      try {
        return await authService.resendVerificationEmail();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al reenviar el email de verificación';
        throw error;
      }
    },

    async verifyEmailWithCode(code: string) {
      try {
        const result = await authService.verifyEmailWithCode(code);
        if (result.verified) {
          // Actualizar el usuario para reflejar la verificación desde el backend
          await this.fetchUser();
        }
        return result;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al verificar el código';
        throw error;
      }
    },

    async generateVerificationCode() {
      try {
        return await authService.generateVerificationCode();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al generar el código de verificación';
        throw error;
      }
    },

    /**
     * Solicitar enlace de restablecimiento de contraseña
     */
    async forgotPassword(email: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.forgotPassword(email);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al solicitar el restablecimiento de contraseña';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Restablecer contraseña con token
     */
    async resetPassword(data: PasswordResetData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.resetPassword(data);
        return response;
      } catch (error: any) {
        if (error.response?.data?.errors) {
          const errorMessages = Object.values(error.response.data.errors);
          if (errorMessages.length > 0) {
            this.error = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : errorMessages[0];
          } else {
            this.error = 'Error al restablecer la contraseña';
          }
        } else {
          this.error = error.response?.data?.message || 'Error al restablecer la contraseña';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Verificar manualmente el email (solo para desarrollo)
     */


    async fetchCurrentUser() {
      return this.fetchUser();
    },

    clearError() {
      this.error = null;
    },
  },

  /**
   * Configuración de persistencia
   */
  ...authPersistOptions
});
