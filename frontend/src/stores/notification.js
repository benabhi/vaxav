import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    nextId: 1
  }),

  actions: {
    // Toast notifications (temporary)
    addNotification({ type = 'info', title = '', message = '', duration = 5000 }) {
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

    removeNotification(id) {
      const index = this.notifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearNotifications() {
      this.notifications = [];
    },

    // Métodos de conveniencia para diferentes tipos de notificaciones
    success(message, title = 'Éxito', duration = 5000) {
      return this.addNotification({ type: 'success', title, message, duration });
    },

    error(message, title = 'Error', duration = 8000) {
      return this.addNotification({ type: 'error', title, message, duration });
    },

    warning(message, title = 'Advertencia', duration = 7000) {
      return this.addNotification({ type: 'warning', title, message, duration });
    },

    info(message, title = 'Información', duration = 5000) {
      return this.addNotification({ type: 'info', title, message, duration });
    },

    // Métodos de conveniencia para notificaciones administrativas
    adminSuccess(message, title = 'Éxito') {
      return this.addNotification({ type: 'success', title, message, duration: 5000 });
    },

    adminError(message, title = 'Error') {
      return this.addNotification({ type: 'error', title, message, duration: 8000 });
    },

    adminWarning(message, title = 'Advertencia') {
      return this.addNotification({ type: 'warning', title, message, duration: 7000 });
    },

    adminInfo(message, title = 'Información') {
      return this.addNotification({ type: 'info', title, message, duration: 5000 });
    }
  }
});
