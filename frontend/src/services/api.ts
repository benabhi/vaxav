import axios from 'axios';

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // No necesitamos cookies para autenticación con tokens
});

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
