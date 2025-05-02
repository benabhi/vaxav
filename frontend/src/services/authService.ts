import axios from 'axios';
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  roles?: Role[];
  is_superadmin?: boolean;
  is_admin?: boolean;
  is_moderator?: boolean;
}

export interface EmailVerificationStatus {
  verified: boolean;
  message: string;
}

export interface PasswordResetData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

const authService = {
  /**
   * Iniciar sesión con credenciales
   */
  login: async (credentials: LoginCredentials) => {
    // Hacemos login directamente sin necesidad de CSRF token
    const response = await api.post('/auth/login', credentials);

    // Guardamos el token en localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      // Configuramos el token en los headers para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  /**
   * Registrar un nuevo usuario
   */
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);

    // Guardamos el token en localStorage si se devuelve
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      // Configuramos el token en los headers para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      const response = await api.delete('/auth/logout');

      // Eliminamos el token del localStorage
      localStorage.removeItem('auth_token');
      // Eliminamos el token de los headers
      delete api.defaults.headers.common['Authorization'];

      return response.data;
    } catch (error) {
      // Si hay un error, aseguramos que el token se elimine de todas formas
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  },

  /**
   * Obtener el usuario autenticado
   */
  getUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  /**
   * Obtener el perfil del usuario
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Actualizar el perfil del usuario
   */
  updateProfile: async (profileData: Partial<User> & { password?: string, password_confirmation?: string }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Verificar el estado de verificación del email
   */
  getEmailVerificationStatus: async () => {
    const response = await api.get('/auth/email/verify');
    return response.data;
  },

  /**
   * Reenviar el email de verificación
   */
  resendVerificationEmail: async () => {
    const response = await api.post('/auth/email/verification-notification');
    return response.data;
  },

  /**
   * Verificar email con código
   */
  verifyEmailWithCode: async (code: string) => {
    const response = await api.post('/auth/email/verify-code', { code });
    return response.data;
  },

  /**
   * Generar un nuevo código de verificación
   */
  generateVerificationCode: async () => {
    const response = await api.post('/auth/email/generate-code');
    return response.data;
  },



  /**
   * Solicitar enlace de restablecimiento de contraseña
   */
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Restablecer contraseña con token
   */
  resetPassword: async (data: PasswordResetData) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Inicializar el token desde localStorage (llamar al inicio de la app)
   */
  initToken: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  },
};

export default authService;
