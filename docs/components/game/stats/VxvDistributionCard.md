# VxvDistributionCard

El componente `VxvDistributionCard` muestra una tarjeta con distribución de items utilizando barras de progreso para visualizar la proporción de cada item. Puede usarse para mostrar distribuciones por nivel, multiplicador, estado, etc.

## Importación

```javascript
import VxvDistributionCard from '@/components/game/stats/VxvDistributionCard.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Distribución'` | Título de la tarjeta |
| `total` | `Number, String` | `0` | Valor total |
| `totalFormat` | `String` | `'{value}'` | Formato para el valor total |
| `showTotal` | `Boolean` | `true` | Si se debe mostrar el valor total |
| `items` | `Array` | `[]` | Array de items para mostrar. Cada item debe tener: `label`, `value`, `color` (opcional), `format` (opcional) |
| `barHeight` | `String` | `'sm'` | Altura de las barras. Opciones: `'xs'`, `'sm'`, `'md'`, `'lg'` |
| `animated` | `Boolean` | `true` | Si las barras deben animarse al cargar |
| `showFooter` | `Boolean` | `false` | Si se debe mostrar el footer |
| `footerInfo` | `Array` | `[]` | Información adicional para el footer. Array de objetos con `label` y `value` |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `footer` | Contenido personalizado para el footer de la tarjeta |

## Estructura del objeto `item`

Cada item en el array `items` debe tener la siguiente estructura:

```javascript
{
  label: String,       // Etiqueta para el item (ej: "Nivel 1" o "x1 (Básico)")
  value: Number,       // Valor numérico
  color: String,       // Color de la barra (opcional, por defecto 'gray')
  format: String       // Formato para el valor (opcional, por defecto '{value}')
}
```

## Ejemplos de Uso

### Distribución básica

```vue
<VxvDistributionCard 
  title="Distribución" 
  :total="100" 
  totalFormat="{value} items" 
  :items="[
    { label: 'Item 1', value: 40, color: 'blue' },
    { label: 'Item 2', value: 30, color: 'green' },
    { label: 'Item 3', value: 20, color: 'red' },
    { label: 'Item 4', value: 10, color: 'purple' }
  ]" 
/>
```

### Distribución por nivel

```vue
<VxvDistributionCard 
  title="Distribución por Nivel" 
  :total="100" 
  totalFormat="{value} habilidades" 
  :items="[
    { label: 'Nivel 0', value: 40, color: 'gray', format: '{value}' },
    { label: 'Nivel 1', value: 25, color: 'blue', format: '{value}' },
    { label: 'Nivel 2', value: 15, color: 'blue', format: '{value}' },
    { label: 'Nivel 3', value: 10, color: 'blue', format: '{value}' },
    { label: 'Nivel 4', value: 7, color: 'blue', format: '{value}' },
    { label: 'Nivel 5', value: 3, color: 'blue', format: '{value}' }
  ]" 
  :showFooter="true" 
  :footerInfo="[
    { label: 'Nivel más alto', value: '5' },
    { label: 'Nivel promedio', value: '2.3' }
  ]" 
/>
```

### Distribución por multiplicador

```vue
<VxvDistributionCard 
  title="Distribución por Multiplicador" 
  :total="100" 
  totalFormat="{value} habilidades" 
  :items="[
    { label: 'x1 (Básico)', value: 40, color: 'gray', format: '{value}' },
    { label: 'x2 (Intermedio)', value: 25, color: 'green', format: '{value}' },
    { label: 'x3 (Avanzado)', value: 20, color: 'blue', format: '{value}' },
    { label: 'x4 (Experto)', value: 10, color: 'purple', format: '{value}' },
    { label: 'x5 (Maestro)', value: 5, color: 'red', format: '{value}' }
  ]" 
/>
```

### Distribución con porcentajes

```vue
<VxvDistributionCard 
  title="Distribución con Porcentajes" 
  :total="100" 
  totalFormat="{value} items" 
  :items="[
    { label: 'Categoría A', value: 40, color: 'blue', format: '{value} (40%)' },
    { label: 'Categoría B', value: 30, color: 'green', format: '{value} (30%)' },
    { label: 'Categoría C', value: 20, color: 'red', format: '{value} (20%)' },
    { label: 'Categoría D', value: 10, color: 'purple', format: '{value} (10%)' }
  ]" 
/>
```

## Notas de Uso

- El componente utiliza `VxvProgressBar` para mostrar las barras de progreso.
- Los colores disponibles para las barras son: `'blue'`, `'green'`, `'red'`, `'yellow'`, `'purple'`, `'gray'`.
- Los formatos de texto (`totalFormat`, `format` en cada item) utilizan la sintaxis `{value}` para reemplazar los valores correspondientes.
- La tarjeta tiene un efecto hover que resalta ligeramente el borde con el color púrpura.
- Puedes personalizar el footer utilizando el slot `footer` o proporcionando un array de objetos `footerInfo`.
