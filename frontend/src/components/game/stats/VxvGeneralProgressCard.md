# VxvGeneralProgressCard

El componente `VxvGeneralProgressCard` muestra una tarjeta con estadísticas de progreso general, incluyendo dos estadísticas específicas y una barra de progreso general.

## Importación

```javascript
import VxvGeneralProgressCard from '@/components/game/stats/VxvGeneralProgressCard.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Progreso General'` | Título de la tarjeta |
| `total` | `Number, String` | `null` | Valor total (opcional) |
| `totalFormat` | `String` | `'{value}'` | Formato para el valor total |
| `showTotal` | `Boolean` | `true` | Si se debe mostrar el valor total |
| `stat1Label` | `String` | `'Estadística 1'` | Etiqueta para la primera estadística |
| `stat1Value` | `Number, String` | `0` | Valor de la primera estadística |
| `stat1Max` | `Number, String` | `100` | Valor máximo de la primera estadística |
| `stat1Color` | `String` | `'blue'` | Color de la primera estadística |
| `stat1Format` | `String` | `'{value}'` | Formato para el valor de la primera estadística |
| `stat2Label` | `String` | `'Estadística 2'` | Etiqueta para la segunda estadística |
| `stat2Value` | `Number, String` | `0` | Valor de la segunda estadística |
| `stat2Max` | `Number, String` | `100` | Valor máximo de la segunda estadística |
| `stat2Color` | `String` | `'green'` | Color de la segunda estadística |
| `stat2Format` | `String` | `'{value}'` | Formato para el valor de la segunda estadística |
| `progressLabel` | `String` | `'Progreso Total'` | Etiqueta para la barra de progreso general |
| `progressValue` | `Number, String` | `0` | Valor de la barra de progreso general |
| `progressMax` | `Number, String` | `100` | Valor máximo de la barra de progreso general |
| `progressColor` | `String` | `'purple'` | Color de la barra de progreso general |
| `progressFormat` | `String` | `'{value}/{max}'` | Formato para el valor de la barra de progreso general |
| `barHeight` | `String` | `'sm'` | Altura de las barras de estadísticas |
| `progressBarHeight` | `String` | `'md'` | Altura de la barra de progreso general |
| `showProgressInfo` | `Boolean` | `false` | Si se debe mostrar información adicional en la barra de progreso general |
| `showProgressPercentage` | `Boolean` | `false` | Si se debe mostrar el porcentaje en la barra de progreso general |
| `animated` | `Boolean` | `true` | Si las barras deben animarse al cargar |

## Ejemplos de Uso

### Tarjeta de progreso básica

```vue
<VxvGeneralProgressCard 
  title="Progreso General" 
  :total="45" 
  totalFormat="{value} habilidades" 
  stat1Label="Activas" 
  :stat1Value="25" 
  :stat1Max="45" 
  stat2Label="Inactivas" 
  :stat2Value="15" 
  :stat2Max="45" 
  progressLabel="Progreso Total" 
  :progressValue="40" 
  :progressMax="45" 
/>
```

### Tarjeta de progreso de experiencia

```vue
<VxvGeneralProgressCard 
  title="Progreso de Experiencia" 
  :total="25000" 
  totalFormat="{value} XP" 
  stat1Label="Combate" 
  :stat1Value="12500" 
  :stat1Max="25000" 
  stat1Format="{value} XP" 
  stat1Color="red" 
  stat2Label="Exploración" 
  :stat2Value="8500" 
  :stat2Max="25000" 
  stat2Format="{value} XP" 
  stat2Color="green" 
  progressLabel="Experiencia Total" 
  :progressValue="21000" 
  :progressMax="25000" 
  progressFormat="{value}/{max} XP" 
  progressColor="blue" 
  :showProgressInfo="true" 
  :showProgressPercentage="true" 
/>
```

### Tarjeta de progreso de misiones

```vue
<VxvGeneralProgressCard 
  title="Progreso de Misiones" 
  :total="120" 
  totalFormat="{value} misiones" 
  stat1Label="Completadas" 
  :stat1Value="85" 
  :stat1Max="120" 
  stat1Color="green" 
  stat2Label="En progreso" 
  :stat2Value="15" 
  :stat2Max="120" 
  stat2Color="yellow" 
  progressLabel="Progreso Total" 
  :progressValue="100" 
  :progressMax="120" 
  :showProgressPercentage="true" 
/>
```

## Notas de Uso

- El componente utiliza `VxvProgressBar` para mostrar las barras de progreso.
- Los formatos de texto (`totalFormat`, `stat1Format`, `stat2Format`, `progressFormat`) utilizan la sintaxis `{value}` y `{max}` para reemplazar los valores correspondientes.
- Los colores disponibles para las barras son: `'blue'`, `'green'`, `'red'`, `'yellow'`, `'purple'`, `'gray'`.
- Las alturas disponibles para las barras son: `'xs'`, `'sm'`, `'md'`, `'lg'`.
- La tarjeta tiene un efecto hover que resalta ligeramente el borde con el color púrpura.
