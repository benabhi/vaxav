# Sistema de Notificaciones en Vaxav

Este documento describe el sistema de notificaciones utilizado en Vaxav para proporcionar feedback a los usuarios sobre las acciones realizadas.

## Índice

1. [Visión General](#visión-general)
2. [Componentes](#componentes)
3. [Store de Notificaciones](#store-de-notificaciones)
4. [Tipos de Notificaciones](#tipos-de-notificaciones)
5. [Casos de Uso](#casos-de-uso)
6. [Ejemplos de Implementación](#ejemplos-de-implementación)

## Visión General

El sistema de notificaciones de Vaxav proporciona una forma consistente de mostrar mensajes de feedback a los usuarios. Las notificaciones aparecen en la esquina inferior derecha de la pantalla y desaparecen automáticamente después de un tiempo determinado.

## Componentes

### VxvNotification

El componente `VxvNotification` es el encargado de mostrar las notificaciones en la interfaz de usuario. Este componente se incluye en el layout principal de la aplicación (`App.vue`) para que esté disponible en todas las vistas.

```vue
<!-- En App.vue -->
<template>
  <div>
    <!-- Contenido de la aplicación -->
    <VxvNotification />
  </div>
</template>
```

### VxvAlert

El componente `VxvAlert` se utiliza para mostrar cada notificación individual. Este componente es utilizado internamente por `VxvNotification` y no necesita ser incluido manualmente en las vistas.

## Store de Notificaciones

El store de notificaciones (`notification.js`) gestiona el estado de las notificaciones y proporciona métodos para añadir, eliminar y limpiar notificaciones.

```javascript
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    nextId: 1
  }),

  actions: {
    // Añadir una notificación
    addNotification({ type = 'info', title = '', message = '', duration = 5000 }) {
      const id = this.nextId++;
      this.notifications.push({ id, type, title, message, duration });
      return id;
    },

    // Eliminar una notificación
    removeNotification(id) {
      const index = this.notifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    // Limpiar todas las notificaciones
    clearNotifications() {
      this.notifications = [];
    },

    // Métodos de conveniencia
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
    }
  }
});
```

## Tipos de Notificaciones

El sistema de notificaciones soporta cuatro tipos de notificaciones:

1. **Éxito (success)**: Para informar sobre acciones completadas correctamente.
2. **Error (error)**: Para informar sobre errores o problemas.
3. **Advertencia (warning)**: Para informar sobre situaciones que requieren atención.
4. **Información (info)**: Para proporcionar información general.

## Casos de Uso

El sistema de notificaciones se utiliza en los siguientes casos:

1. **Verificación de Email**: Cuando un usuario verifica su dirección de email, se muestra una notificación de éxito.
2. **Restablecimiento de Contraseña**: Cuando un usuario restablece su contraseña, se muestra una notificación de éxito.
3. **Creación de Recursos**: Cuando se crea un recurso (usuario, piloto, etc.), se muestra una notificación de éxito.
4. **Actualización de Recursos**: Cuando se actualiza un recurso, se muestra una notificación de éxito.
5. **Eliminación de Recursos**: Cuando se elimina un recurso, se muestra una notificación de éxito.
6. **Errores**: Cuando ocurre un error, se muestra una notificación de error.

## Ejemplos de Implementación

### Verificación de Email

Cuando un usuario verifica su dirección de email, se muestra una notificación de éxito:

```javascript
// En HomeView.vue
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await pilotStore.fetchCurrentPilot();

    // Verificar si el usuario acaba de verificar su email
    if (route.query.verified === 'true') {
      // Mostrar una notificación de éxito
      notificationStore.success(
        '¡Tu dirección de correo electrónico ha sido verificada correctamente!',
        'Verificación completada',
        7000
      );
    }
  }
});
```

### Restablecimiento de Contraseña

Cuando un usuario restablece su contraseña, se muestra una notificación de éxito:

```javascript
// En ResetPasswordView.vue
const handleSubmit = async () => {
  try {
    const response = await authStore.resetPassword(form);

    // Mostrar notificación de éxito
    notificationStore.success(
      'Tu contraseña ha sido restablecida correctamente.',
      'Contraseña actualizada',
      7000
    );

    // Redirigir al login después de un breve retraso
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    // Manejar error
  }
};
```

### Creación de Recursos

Cuando se crea un recurso, se muestra una notificación de éxito:

```javascript
// En CreateUserView.vue
const handleSubmit = async () => {
  try {
    await userStore.createUser(form);

    // Mostrar notificación de éxito
    notificationStore.success(
      'El usuario ha sido creado correctamente.',
      'Usuario creado',
      5000
    );

    // Redirigir a la lista de usuarios
    router.push('/admin/users');
  } catch (error) {
    // Manejar error
  }
};
```
