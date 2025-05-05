# VxvAlert

El componente `VxvAlert` muestra mensajes de alerta con diferentes variantes visuales, opciones de personalización y funcionalidad de descarte.

## Importación

```javascript
import VxvAlert from '@/components/ui/feedback/VxvAlert.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `variant` | `String` | `'default'` | Variante visual de la alerta. Opciones: `'default'`, `'success'`, `'error'`, `'warning'`, `'info'` |
| `title` | `String` | `''` | Título de la alerta (opcional) |
| `message` | `String` | `''` | Mensaje de la alerta (opcional si se usa el slot por defecto) |
| `dismissible` | `Boolean` | `true` | Si la alerta puede ser descartada por el usuario |
| `duration` | `Number` | `0` | Duración en milisegundos antes de que la alerta se descarte automáticamente. `0` significa que no se descartará automáticamente |
| `icon` | `Object, Function` | `null` | Componente de icono personalizado. Si no se proporciona, se usará un icono predeterminado según la variante |
| `className` | `String` | `''` | Clases CSS adicionales para el contenedor de la alerta |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `dismiss` | - | Se emite cuando la alerta es descartada, ya sea por el usuario o automáticamente |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal de la alerta. Reemplaza la propiedad `message` |

## Ejemplos de Uso

### Alerta básica

```vue
<VxvAlert 
  variant="info" 
  message="Esta es una alerta informativa" 
/>
```

### Alerta con título

```vue
<VxvAlert 
  variant="warning" 
  title="Advertencia" 
  message="Esta acción no se puede deshacer" 
/>
```

### Alerta con contenido personalizado

```vue
<VxvAlert variant="success" title="Operación completada">
  <p>La operación se ha completado correctamente.</p>
  <p class="mt-2">Puedes continuar con el siguiente paso.</p>
</VxvAlert>
```

### Alerta con auto-descarte

```vue
<VxvAlert 
  variant="error" 
  title="Error" 
  message="Ha ocurrido un error al procesar la solicitud" 
  :duration="5000" 
/>
```

### Alerta no descartable

```vue
<VxvAlert 
  variant="warning" 
  message="Esta alerta no puede ser descartada" 
  :dismissible="false" 
/>
```

### Alerta con icono personalizado

```vue
<VxvAlert 
  variant="info" 
  message="Información personalizada" 
  :icon="CustomIcon" 
/>
```

## Notas de Uso

- Las alertas tienen una animación de entrada y salida suave.
- Todas las variantes tienen un fondo oscuro con texto blanco, adaptado al tema de la aplicación.
- Si se proporciona un `title`, el mensaje se mostrará debajo con un pequeño margen.
- El componente es responsive y se adapta a diferentes tamaños de pantalla.
- Para alertas temporales, utiliza la propiedad `duration` con el tiempo en milisegundos.
- Para alertas que requieren una acción del usuario, establece `dismissible` a `true` y `duration` a `0`.
- Puedes escuchar el evento `dismiss` para realizar acciones adicionales cuando la alerta es descartada.
