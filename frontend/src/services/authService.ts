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

export interface User {
  id: number;
  name: string;
  email: string;
}

const authService = {
  /**
   * Iniciar sesión con credenciales
   */
  login: async (credentials: LoginCredentials) => {
    // Hacemos login directamente sin necesidad de CSRF token
    const response = await api.post('/login', credentials);

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
    const response = await api.post('/register', data);

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
      const response = await api.post('/logout');

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
    const response = await api.get('/user');
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
