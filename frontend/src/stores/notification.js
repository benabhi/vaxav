/**
 * @file Archivo de compatibilidad para notification.ts
 * @description Este archivo existe solo para mantener compatibilidad con importaciones existentes
 * @deprecated Use notification.ts en su lugar
 */

// Importar desde la versión TypeScript
import { useNotificationStore } from './notification.ts';

// Re-exportar para mantener compatibilidad
export { useNotificationStore };

// Exportar por defecto para mantener compatibilidad
export default { useNotificationStore };

console.warn('DEPRECATED: Importing from notification.js is deprecated. Please update your imports to use notification.ts instead.');
