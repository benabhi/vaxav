# VxvProgressBar

El componente `VxvProgressBar` muestra una barra de progreso horizontal con opciones para mostrar etiquetas, valores, porcentajes y personalizar colores.

## Importación

```javascript
import VxvProgressBar from '@/components/ui/progress/VxvProgressBar.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `value` | `Number, String` | `0` | Valor actual de la barra de progreso |
| `min` | `Number, String` | `0` | Valor mínimo de la barra de progreso |
| `max` | `Number, String` | `100` | Valor máximo de la barra de progreso |
| `color` | `String` | `'blue'` | Color de la barra de progreso. Opciones: `'blue'`, `'green'`, `'red'`, `'yellow'`, `'purple'`, `'gray'` |
| `height` | `String` | `'sm'` | Altura de la barra de progreso. Opciones: `'xs'`, `'sm'`, `'md'`, `'lg'` |
| `label` | `String` | `''` | Etiqueta para mostrar junto a la barra de progreso |
| `showValue` | `Boolean` | `true` | Si se debe mostrar el valor actual |
| `showPercentage` | `Boolean` | `false` | Si se debe mostrar el porcentaje |
| `showMinMax` | `Boolean` | `false` | Si se debe mostrar el valor mínimo y máximo |
| `showInfo` | `Boolean` | `true` | Si se debe mostrar información adicional debajo de la barra |
| `showLabels` | `Boolean` | `true` | Si se debe mostrar etiquetas encima de la barra |
| `formatValue` | `Function` | `null` | Función para formatear el valor |
| `formatMax` | `Function` | `null` | Función para formatear el valor máximo |
| `suffix` | `String` | `''` | Sufijo para añadir al valor (ej: "XP", "%") |
| `animated` | `Boolean` | `false` | Si la barra debe animarse al cargar |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `info-left` | Contenido personalizado para la información izquierda debajo de la barra |
| `info-right` | Contenido personalizado para la información derecha debajo de la barra |

## Ejemplos de Uso

### Barra de progreso básica

```vue
<VxvProgressBar 
  value="40" 
  max="100" 
  label="Progreso" 
/>
```

### Barra de progreso con información adicional

```vue
<VxvProgressBar 
  value="750" 
  max="1000" 
  label="Experiencia Total" 
  showPercentage 
  showMinMax 
  suffix=" XP" 
/>
```

### Barra de progreso con formato personalizado

```vue
<VxvProgressBar 
  value="12500" 
  max="25000" 
  label="Experiencia Total" 
  :formatValue="(value) => `${value.toLocaleString()} XP`"
  :formatMax="(max) => `${max.toLocaleString()} XP`"
  showMinMax
/>
```

### Barra de progreso con color personalizado

```vue
<VxvProgressBar 
  value="60" 
  max="100" 
  color="purple" 
  label="Progreso" 
/>
```

### Barra de progreso con altura personalizada

```vue
<VxvProgressBar 
  value="60" 
  max="100" 
  height="lg" 
  label="Progreso" 
/>
```

## Notas de Uso

- Utiliza `formatValue` y `formatMax` para personalizar la visualización de los valores, especialmente para números grandes o con unidades específicas.
- El componente calcula automáticamente el porcentaje de progreso basado en los valores `min`, `max` y `value`.
- Para mostrar información personalizada debajo de la barra, utiliza los slots `info-left` e `info-right`.
- La propiedad `animated` añade una animación visual a la barra de progreso, útil para indicar procesos en curso.
