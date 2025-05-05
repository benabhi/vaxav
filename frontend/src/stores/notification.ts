/**
 * @file Store de notificaciones
 * @description Gestión de notificaciones y mensajes para el usuario
 * @module stores/notification
 */

import { defineStore } from 'pinia';
import { notificationPersistOptions } from './plugins/persistence';

/**
 * Tipo de notificación
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interfaz para una notificación
 */
export interface Notification {
  /** ID único de la notificación */
  id: number;
  /** Tipo de notificación */
  type: NotificationType;
  /** Título de la notificación */
  title: string;
  /** Mensaje de la notificación */
  message: string;
  /** Duración en milisegundos */
  duration: number;
}

/**
 * Interfaz para los parámetros de una nueva notificación
 */
export interface NotificationParams {
  /** Tipo de notificación */
  type?: NotificationType;
  /** Título de la notificación */
  title?: string;
  /** Mensaje de la notificación */
  message: string;
  /** Duración en milisegundos */
  duration?: number;
}

/**
 * Estado del store de notificaciones
 */
interface NotificationState {
  /** Lista de notificaciones activas */
  notifications: Notification[];
  /** ID para la próxima notificación */
  nextId: number;
}

/**
 * Store para gestionar notificaciones
 */
export const useNotificationStore = defineStore('notification', {
  /**
   * Estado inicial
   */
  state: (): NotificationState => ({
    notifications: [],
    nextId: 1
  }),

  /**
   * Acciones para gestionar notificaciones
   */
  actions: {
    /**
     * Añade una nueva notificación
     * @param params Parámetros de la notificación
     * @returns ID de la notificación creada
     */
    addNotification({ type = 'info', title = '', message = '', duration = 5000 }: NotificationParams): number {
      const id = this.nextId++;

      this.notifications.push({
        id,
        type,
        title,
        message,
        duration
      });

      return id;
    },

    /**
     * Elimina una notificación por su ID
     * @param id ID de la notificación a eliminar
     */
    removeNotification(id: number): void {
      const index = this.notifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    /**
     * Elimina todas las notificaciones
     */
    clearNotifications(): void {
      this.notifications = [];
    },

    /**
     * Crea una notificación de éxito
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @param duration Duración en milisegundos
     * @returns ID de la notificación creada
     */
    success(message: string, title: string = 'Éxito', duration: number = 5000): number {
      return this.addNotification({ type: 'success', title, message, duration });
    },

    /**
     * Crea una notificación de error
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @param duration Duración en milisegundos
     * @returns ID de la notificación creada
     */
    error(message: string, title: string = 'Error', duration: number = 8000): number {
      return this.addNotification({ type: 'error', title, message, duration });
    },

    /**
     * Crea una notificación de advertencia
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @param duration Duración en milisegundos
     * @returns ID de la notificación creada
     */
    warning(message: string, title: string = 'Advertencia', duration: number = 7000): number {
      return this.addNotification({ type: 'warning', title, message, duration });
    },

    /**
     * Crea una notificación informativa
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @param duration Duración en milisegundos
     * @returns ID de la notificación creada
     */
    info(message: string, title: string = 'Información', duration: number = 5000): number {
      return this.addNotification({ type: 'info', title, message, duration });
    },

    /**
     * Crea una notificación de éxito para administradores
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @returns ID de la notificación creada
     */
    adminSuccess(message: string, title: string = 'Éxito'): number {
      return this.addNotification({ type: 'success', title, message, duration: 5000 });
    },

    /**
     * Crea una notificación de error para administradores
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @returns ID de la notificación creada
     */
    adminError(message: string, title: string = 'Error'): number {
      return this.addNotification({ type: 'error', title, message, duration: 8000 });
    },

    /**
     * Crea una notificación de advertencia para administradores
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @returns ID de la notificación creada
     */
    adminWarning(message: string, title: string = 'Advertencia'): number {
      return this.addNotification({ type: 'warning', title, message, duration: 7000 });
    },

    /**
     * Crea una notificación informativa para administradores
     * @param message Mensaje de la notificación
     * @param title Título de la notificación
     * @returns ID de la notificación creada
     */
    adminInfo(message: string, title: string = 'Información'): number {
      return this.addNotification({ type: 'info', title, message, duration: 5000 });
    }
  },

  /**
   * Configuración de persistencia
   */
  ...notificationPersistOptions
});
