import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    nextId: 1,
    // Static alert for admin panel
    adminAlert: {
      type: '',
      title: '',
      message: '',
      show: false
    }
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

    // Static admin alert (persistent)
    setAdminAlert({ type = 'info', title = '', message = '' }) {
      this.adminAlert = {
        type,
        title,
        message,
        show: true
      };
    },

    clearAdminAlert() {
      this.adminAlert.show = false;
      this.adminAlert.message = '';
      this.adminAlert.title = '';
      this.adminAlert.type = '';
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

    // Métodos de conveniencia para alertas estáticas
    adminSuccess(message, title = 'Éxito') {
      this.setAdminAlert({ type: 'success', title, message });
    },

    adminError(message, title = 'Error') {
      this.setAdminAlert({ type: 'error', title, message });
    },

    adminWarning(message, title = 'Advertencia') {
      this.setAdminAlert({ type: 'warning', title, message });
    },

    adminInfo(message, title = 'Información') {
      this.setAdminAlert({ type: 'info', title, message });
    }
  }
});
