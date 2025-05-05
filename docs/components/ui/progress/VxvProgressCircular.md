# VxvProgressCircular

El componente `VxvProgressCircular` muestra una barra de progreso circular con opciones para personalizar el tamaño, grosor, colores y animación.

## Importación

```javascript
import VxvProgressCircular from '@/components/ui/progress/VxvProgressCircular.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `value` | `Number, String` | `0` | Valor actual de la barra de progreso |
| `min` | `Number, String` | `0` | Valor mínimo de la barra de progreso |
| `max` | `Number, String` | `100` | Valor máximo de la barra de progreso |
| `size` | `Number, String` | `100` | Tamaño del círculo en píxeles |
| `thickness` | `Number, String` | `8` | Grosor de la línea del círculo |
| `color` | `String` | `'blue'` | Color de la barra de progreso. Opciones: `'blue'`, `'green'`, `'red'`, `'yellow'`, `'purple'`, `'gray'` o un valor hexadecimal (`'#RRGGBB'`) |
| `backgroundColor` | `String` | `'#374151'` | Color de fondo de la barra de progreso (gray-700, igual que en VxvProgressBar) |
| `showPercentage` | `Boolean` | `false` | Si se debe mostrar el porcentaje en el centro |
| `animated` | `Boolean` | `true` | Si la barra debe animarse al cargar |
| `animationDuration` | `Number, String` | `1500` | Duración de la animación en milisegundos |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido personalizado para mostrar en el centro del círculo |

## Ejemplos de Uso

### Barra de progreso circular básica

```vue
<VxvProgressCircular
  value="40"
  max="100"
/>
```

### Barra de progreso circular con porcentaje

```vue
<VxvProgressCircular
  value="40"
  max="100"
  showPercentage
/>
```

### Barra de progreso circular con tamaño y grosor personalizados

```vue
<VxvProgressCircular
  value="60"
  max="100"
  size="150"
  thickness="12"
/>
```

### Barra de progreso circular con color personalizado

```vue
<VxvProgressCircular
  value="75"
  max="100"
  color="green"
/>
```

### Barra de progreso circular con contenido personalizado

```vue
<VxvProgressCircular value="40" size="100">
  <div class="text-center">
    <div class="text-xl font-bold text-blue-500">4</div>
    <div class="text-xs text-gray-400">Nivel</div>
  </div>
</VxvProgressCircular>
```

### Barra de progreso circular sin animación

```vue
<VxvProgressCircular
  value="40"
  max="100"
  :animated="false"
/>
```

## Notas de Uso

- Utiliza el slot `default` para personalizar el contenido que se muestra en el centro del círculo.
- El componente calcula automáticamente el porcentaje de progreso basado en los valores `min`, `max` y `value`.
- Para mostrar un valor hexadecimal personalizado como color, utiliza la sintaxis `color="#3b82f6"`.
- La animación se activa automáticamente cuando el componente se monta, a menos que `animated` sea `false`.
- Ajusta `animationDuration` para controlar la velocidad de la animación.
