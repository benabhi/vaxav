# VxvNotification

El componente `VxvNotification` muestra notificaciones temporales en la parte superior derecha de la pantalla, utilizando el componente `VxvAlert` y el store de notificaciones.

## Importación

```javascript
import VxvNotification from '@/components/ui/feedback/VxvNotification.vue';
```

## Descripción

Este componente actúa como un contenedor para mostrar múltiples notificaciones. No recibe props directamente, sino que obtiene las notificaciones del store `useNotificationStore`. Cada notificación se muestra como un componente `VxvAlert` con las propiedades correspondientes.

## Uso con el Store de Notificaciones

Para mostrar notificaciones, debes utilizar el store de notificaciones:

```javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Mostrar una notificación de éxito
notificationStore.addNotification({
  type: 'success',
  title: 'Operación completada',
  message: 'La operación se ha completado correctamente',
  duration: 5000 // 5 segundos
});

// Mostrar una notificación de error
notificationStore.addNotification({
  type: 'error',
  title: 'Error',
  message: 'Ha ocurrido un error al procesar la solicitud',
  duration: 8000 // 8 segundos
});
```

## Estructura de una Notificación

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `String` | Identificador único de la notificación (generado automáticamente) |
| `type` | `String` | Tipo de notificación. Opciones: `'default'`, `'success'`, `'error'`, `'warning'`, `'info'` |
| `title` | `String` | Título de la notificación |
| `message` | `String` | Mensaje de la notificación |
| `duration` | `Number` | Duración en milisegundos antes de que la notificación se descarte automáticamente |

## Ejemplos de Uso

### Notificación de éxito

```javascript
notificationStore.addNotification({
  type: 'success',
  title: 'Guardado',
  message: 'Los cambios se han guardado correctamente',
  duration: 3000
});
```

### Notificación de error

```javascript
notificationStore.addNotification({
  type: 'error',
  title: 'Error de conexión',
  message: 'No se ha podido conectar con el servidor',
  duration: 5000
});
```

### Notificación de advertencia

```javascript
notificationStore.addNotification({
  type: 'warning',
  title: 'Advertencia',
  message: 'Esta acción no se puede deshacer',
  duration: 4000
});
```

### Notificación informativa

```javascript
notificationStore.addNotification({
  type: 'info',
  title: 'Información',
  message: 'Hay actualizaciones disponibles',
  duration: 3000
});
```

## Notas de Uso

- Las notificaciones se muestran en la parte superior derecha de la pantalla.
- Cada notificación se puede descartar manualmente haciendo clic en el botón de cierre.
- Las notificaciones se descartan automáticamente después de la duración especificada.
- Las notificaciones más recientes aparecen en la parte superior de la pila.
- El componente es responsive y se adapta a diferentes tamaños de pantalla.
- En pantallas pequeñas, las notificaciones ocupan todo el ancho disponible.
- El componente utiliza un z-index alto (50) para asegurarse de que las notificaciones se muestren por encima de otros elementos.
- Las notificaciones utilizan el mismo estilo visual que el componente `VxvAlert`.
