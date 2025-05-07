import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Necesario para CORS con credenciales
});

// Configurar el token de autenticación si existe en localStorage
const token = localStorage.getItem('auth_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.status, error.response.data);

      // Manejar errores de autenticación
      if (error.response.status === 401) {
        // Redirigir a la página de inicio de sesión o mostrar mensaje
        console.error('No autenticado');
        // Limpiar el token si no es válido
        localStorage.removeItem('auth_token');
      }

      // Manejar errores de usuario baneado (403 con banned=true)
      if (error.response.status === 403 && error.response.data.banned) {
        // Modificar el error para que sea manejado como una respuesta normal
        // en lugar de un error, para que el flujo de autenticación pueda continuar
        return Promise.resolve({
          data: error.response.data
        });
      }
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('Error de solicitud:', error.request);
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
