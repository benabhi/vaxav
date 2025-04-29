# Componentes de Feedback

Los componentes de feedback proporcionan retroalimentación visual a los usuarios sobre el resultado de sus acciones o sobre el estado del sistema.

## BaseAlert

`BaseAlert` es un componente que muestra mensajes de alerta con diferentes variantes visuales.

**Archivo**: `/components/ui/feedback/BaseAlert.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `variant` | `String` | `'default'` | Variante visual de la alerta (`'default'`, `'success'`, `'error'`, `'warning'`, `'info'`) |
| `title` | `String` | `''` | Título de la alerta |
| `message` | `String` | `''` | Mensaje de la alerta |
| `dismissible` | `Boolean` | `true` | Si la alerta puede ser cerrada por el usuario |
| `duration` | `Number` | `0` | Duración en milisegundos antes de que la alerta se cierre automáticamente (0 = no se cierra automáticamente) |
| `icon` | `Object/Function` | `null` | Componente de icono personalizado |
| `className` | `String` | `''` | Clases CSS adicionales |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `dismiss` | Emitido cuando la alerta es cerrada |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal de la alerta (reemplaza la prop `message`) |

### Ejemplo de Uso

```vue
<Alert
  variant="success"
  title="Operación exitosa"
  message="Los cambios se han guardado correctamente."
  :dismissible="true"
  :duration="5000"
/>
```

## BaseNotification

`BaseNotification` es un componente que gestiona múltiples alertas en forma de notificaciones.

**Archivo**: `/components/ui/feedback/BaseNotification.vue`

### Descripción

Este componente muestra notificaciones en la esquina superior derecha de la pantalla. Utiliza el componente `BaseAlert` para mostrar cada notificación y el store `notification` para gestionar el estado de las notificaciones.

### Ejemplo de Uso

```vue
<!-- En App.vue -->
<template>
  <div>
    <!-- Contenido de la aplicación -->
    <BaseNotification />
  </div>
</template>
```

```javascript
// En cualquier componente
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Mostrar una notificación de éxito
notificationStore.success('Los cambios se han guardado correctamente.', 'Operación exitosa');

// Mostrar una notificación de error
notificationStore.error('No se pudieron guardar los cambios.', 'Error');

// Mostrar una notificación de advertencia
notificationStore.warning('Esta acción no se puede deshacer.', 'Advertencia');

// Mostrar una notificación de información
notificationStore.info('Hay actualizaciones disponibles.', 'Información');
```

## Store de Notificaciones

El store de notificaciones (`notification.js`) gestiona el estado de las notificaciones en toda la aplicación.

### Estado

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `notifications` | `Array` | Lista de notificaciones activas |
| `nextId` | `Number` | ID para la próxima notificación |

### Acciones

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `addNotification` | `{ type, title, message, duration }` | Añade una nueva notificación |
| `removeNotification` | `id` | Elimina una notificación por su ID |
| `clearNotifications` | - | Elimina todas las notificaciones |
| `success` | `message, title, duration` | Añade una notificación de éxito |
| `error` | `message, title, duration` | Añade una notificación de error |
| `warning` | `message, title, duration` | Añade una notificación de advertencia |
| `info` | `message, title, duration` | Añade una notificación de información |

### Ejemplo de Uso

```javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Mostrar una notificación de éxito
notificationStore.success('Usuario creado correctamente.', 'Éxito', 5000);

// Mostrar una notificación de error
notificationStore.error('No se pudo crear el usuario.', 'Error', 8000);

// Mostrar una notificación personalizada
notificationStore.addNotification({
  type: 'info',
  title: 'Información',
  message: 'El sistema se reiniciará en 5 minutos.',
  duration: 10000
});
```

## Integración con Vistas

Las notificaciones se utilizan en varias vistas para proporcionar feedback sobre las acciones del usuario:

### UsersView

En la vista de usuarios, las notificaciones se muestran cuando:

- Se crea un usuario correctamente
- Se actualiza un usuario correctamente
- Se elimina un usuario correctamente
- Ocurre un error al realizar alguna de estas acciones

### RolesView

En la vista de roles, las notificaciones se muestran cuando:

- Se crea un rol correctamente
- Se actualiza un rol correctamente
- Se elimina un rol correctamente
- Ocurre un error al realizar alguna de estas acciones

## Mejores Prácticas

1. **Mensajes Claros**: Utiliza mensajes claros y concisos que expliquen exactamente qué ha ocurrido.
2. **Duración Adecuada**: Ajusta la duración de las notificaciones según su importancia (errores más tiempo, éxitos menos tiempo).
3. **Variantes Apropiadas**: Utiliza la variante adecuada para cada tipo de mensaje (success, error, warning, info).
4. **No Abrumar**: Evita mostrar demasiadas notificaciones a la vez.
5. **Consistencia**: Mantén un estilo y formato consistente en todas las notificaciones.
6. **Accesibilidad**: Asegúrate de que las notificaciones sean accesibles para todos los usuarios.

## Personalización

El componente `BaseAlert` puede ser personalizado mediante las siguientes props:

- `className`: Clases CSS adicionales para personalizar el estilo.
- `icon`: Componente de icono personalizado.

Además, el componente utiliza clases de Tailwind CSS que pueden ser sobrescritas en el archivo de configuración de Tailwind.
