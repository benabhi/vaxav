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
| `adminAlert` | `Object` | Alerta estática para el panel de administración |

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
| `setAdminAlert` | `{ type, message }` | Establece una alerta estática en el panel de administración |
| `clearAdminAlert` | - | Elimina la alerta estática del panel de administración |
| `adminSuccess` | `message` | Establece una alerta estática de éxito en el panel de administración |
| `adminError` | `message` | Establece una alerta estática de error en el panel de administración |
| `adminWarning` | `message` | Establece una alerta estática de advertencia en el panel de administración |
| `adminInfo` | `message` | Establece una alerta estática de información en el panel de administración |

### Ejemplo de Uso

```javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Notificaciones temporales (esquina superior derecha)
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

// Alertas estáticas (debajo del breadcrumb en el panel de administración)
// Mostrar una alerta estática de éxito
notificationStore.adminSuccess('Usuario creado correctamente.');

// Mostrar una alerta estática de error
notificationStore.adminError('No se pudo crear el usuario.');

// Mostrar una alerta estática de advertencia
notificationStore.adminWarning('Esta acción no se puede deshacer.');

// Mostrar una alerta estática de información
notificationStore.adminInfo('Hay actualizaciones disponibles.');

// Limpiar la alerta estática
notificationStore.clearAdminAlert();
```

## Integración con Vistas

Las notificaciones y alertas estáticas se utilizan en varias vistas para proporcionar feedback sobre las acciones del usuario:

### UsersView y UserCreateView

En las vistas de usuarios, se utilizan:

- **Alertas estáticas** (BaseStaticAlert):
  - Se muestran debajo del breadcrumb en el panel de administración
  - Se utilizan para mostrar mensajes de éxito o error al crear, actualizar o eliminar usuarios
  - Permanecen visibles hasta que el usuario las cierra o navega a otra página

- **Notificaciones** (BaseNotification):
  - Se muestran en la esquina superior derecha
  - Se utilizan para mensajes menos importantes o temporales
  - Desaparecen automáticamente después de un tiempo

### RolesView y RoleCreateView

En las vistas de roles, se utilizan de manera similar:

- **Alertas estáticas** para mensajes importantes sobre la creación, actualización o eliminación de roles
- **Notificaciones** para mensajes menos importantes o temporales

### LoginView y RegisterView

En las vistas de autenticación, se utilizan:

- **Alertas estáticas** para mostrar errores de autenticación o registro
- No se utilizan notificaciones en estas vistas

## BaseStaticAlert

`BaseStaticAlert` es un componente que muestra mensajes de alerta estáticos con diferentes variantes visuales. A diferencia de BaseAlert, este componente está diseñado para mostrarse en una ubicación fija dentro del layout, como debajo del breadcrumb en el panel de administración.

**Archivo**: `/components/ui/feedback/BaseStaticAlert.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `variant` | `String` | `'error'` | Variante visual de la alerta (`'success'`, `'error'`, `'warning'`, `'info'`) |
| `message` | `String` | `''` | Mensaje de la alerta |
| `dismissible` | `Boolean` | `true` | Si la alerta puede ser cerrada por el usuario |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `dismiss` | Emitido cuando la alerta es cerrada |

### Ejemplo de Uso

```vue
<BaseStaticAlert
  variant="success"
  message="El usuario ha sido creado correctamente."
  :dismissible="true"
  @dismiss="handleDismiss"
/>
```

### Uso con el Store de Notificaciones

El componente `BaseStaticAlert` se utiliza junto con el store de notificaciones para mostrar alertas estáticas en el panel de administración:

```javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Mostrar una alerta estática de éxito
notificationStore.adminSuccess('El usuario ha sido creado correctamente.');

// Mostrar una alerta estática de error
notificationStore.adminError('No se pudo crear el usuario.');

// Mostrar una alerta estática de advertencia
notificationStore.adminWarning('Esta acción no se puede deshacer.');

// Mostrar una alerta estática de información
notificationStore.adminInfo('Hay actualizaciones disponibles.');
```

## VxvSpinner

`VxvSpinner` es un componente que muestra un indicador de carga animado, útil para indicar a los usuarios que una operación está en progreso.

**Archivo**: `/components/ui/feedback/VxvSpinner.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `size` | `String` | `'md'` | Tamaño del spinner. Valores posibles: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `color` | `String` | `'primary'` | Color del spinner. Valores posibles: `'primary'`, `'secondary'`, `'success'`, `'danger'`, `'warning'`, `'info'`, `'light'`, `'dark'`, `'white'` |
| `label` | `String` | `''` | Texto que se muestra junto al spinner |
| `hideText` | `Boolean` | `false` | Ocultar el texto para lectores de pantalla |

### Ejemplo de Uso

```vue
<!-- Spinner básico -->
<VxvSpinner />

<!-- Spinner con etiqueta -->
<VxvSpinner label="Cargando..." />

<!-- Spinner en un botón -->
<button class="bg-blue-600 text-white py-2 px-4 rounded inline-flex items-center">
  <VxvSpinner size="sm" color="white" class="mr-2" hideText />
  <span>Cargando...</span>
</button>

<!-- Spinner centrado en un contenedor -->
<div class="flex items-center justify-center h-64">
  <VxvSpinner size="xl" label="Cargando contenido..." />
</div>
```

## Mejores Prácticas

1. **Mensajes Claros**: Utiliza mensajes claros y concisos que expliquen exactamente qué ha ocurrido.
2. **Duración Adecuada**: Ajusta la duración de las notificaciones según su importancia (errores más tiempo, éxitos menos tiempo).
3. **Variantes Apropiadas**: Utiliza la variante adecuada para cada tipo de mensaje (success, error, warning, info).
4. **No Abrumar**: Evita mostrar demasiadas notificaciones a la vez.
5. **Consistencia**: Mantén un estilo y formato consistente en todas las notificaciones.
6. **Accesibilidad**: Asegúrate de que las notificaciones sean accesibles para todos los usuarios.
7. **Indicadores de Carga**: Utiliza el componente `VxvSpinner` para indicar claramente cuando una operación está en progreso.

## Personalización

El componente `BaseAlert` puede ser personalizado mediante las siguientes props:

- `className`: Clases CSS adicionales para personalizar el estilo.
- `icon`: Componente de icono personalizado.

El componente `VxvSpinner` puede ser personalizado mediante las props `size` y `color`.

Además, los componentes utilizan clases de Tailwind CSS que pueden ser sobrescritas en el archivo de configuración de Tailwind.
