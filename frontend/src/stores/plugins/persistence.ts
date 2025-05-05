/**
 * @file Configuración de persistencia para stores de Pinia
 * @description Configuración del plugin pinia-plugin-persistedstate para persistir el estado entre recargas de página
 * @module stores/plugins/persistence
 */

import { createPersistedState } from 'pinia-plugin-persistedstate';

/**
 * Configuración global del plugin de persistencia
 */
export const piniaPersistedState = createPersistedState({
  // Usar localStorage como almacenamiento
  storage: localStorage,
  // Prefijo para las claves en localStorage
  key: (id) => `vaxav_${id}`,
});

/**
 * Opciones de persistencia para el store de autenticación
 */
export const authPersistOptions = {
  persist: {
    // Propiedades a persistir
    paths: ['token', 'user.id', 'user.email', 'isAuthenticated', 'emailVerified'],
  },
};

/**
 * Opciones de persistencia para el store de piloto
 */
export const pilotPersistOptions = {
  persist: {
    // Propiedades a persistir
    paths: ['currentPilot'],
  },
};

/**
 * Opciones de persistencia para el store unificado de usuario
 */
export const userPersistOptions = {
  persist: {
    // Propiedades a persistir
    paths: ['isLoaded'],
  },
};

/**
 * Opciones de persistencia para el store de notificaciones
 */
export const notificationPersistOptions = {
  persist: false, // No persistir notificaciones
};
