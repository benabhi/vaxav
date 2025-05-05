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
| `animated` | `Boolean` | `false` | Si las barras deben animarse al cargar |
| `showProgressionIndex` | `Boolean` | `false` | Si se debe mostrar el Índice de Progresión (I.P.) |
| `showProgressionDetails` | `Boolean` | `false` | Si se deben mostrar los detalles del Índice de Progresión |
| `progressionIndex` | `Number` | `0` | Valor del Índice de Progresión |
| `progressionComponents` | `Object` | `{ HS: 0, AL: 0, XP: 0, AS: 0, MP: 0 }` | Componentes del Índice de Progresión |

## Ejemplos de Uso

### Tarjeta de progreso básica

```vue
<VxvGeneralProgressCard
  title="Progreso de Habilidades"
  stat1Label="Activas"
  :stat1Value="15"
  :stat1Max="30"
  stat2Label="Inactivas"
  :stat2Value="5"
  :stat2Max="30"
  progressLabel="Total Aprendidas"
  :progressValue="20"
  :progressMax="30"
/>
```

### Tarjeta de progreso con formatos personalizados

```vue
<VxvGeneralProgressCard
  title="Experiencia de Habilidades"
  :total="25000"
  totalFormat="Total: {value} XP"
  stat1Label="Combate"
  :stat1Value="10000"
  :stat1Max="15000"
  stat1Format="{value} XP"
  stat2Label="Navegación"
  :stat2Value="5000"
  :stat2Max="10000"
  stat2Format="{value} XP"
  progressLabel="Progreso Total"
  :progressValue="15000"
  :progressMax="25000"
  progressFormat="{value} de {max} XP"
  :showProgressPercentage="true"
/>
```

### Tarjeta de progreso con animación

```vue
<VxvGeneralProgressCard
  title="Progreso de Misiones"
  stat1Label="Completadas"
  :stat1Value="8"
  :stat1Max="10"
  stat2Label="En Progreso"
  :stat2Value="2"
  :stat2Max="5"
  progressLabel="Progreso Total"
  :progressValue="10"
  :progressMax="15"
  :animated="true"
/>
```

### Tarjeta con Índice de Progresión (I.P.)

```vue
<VxvGeneralProgressCard
  title="Progreso de Habilidades"
  stat1Label="Activas"
  :stat1Value="15"
  :stat1Max="30"
  stat2Label="Inactivas"
  :stat2Value="5"
  :stat2Max="30"
  progressLabel="Total Aprendidas"
  :progressValue="20"
  :progressMax="30"
  :showProgressionIndex="true"
  :progressionIndex="425"
  :progressionComponents="{
    HS: 66.7,  // 20/30 habilidades aprendidas
    AL: 3.2,   // Nivel promedio
    XP: 12500, // Experiencia total
    AS: 75,    // 15/20 habilidades activas
    MP: 2.5    // Multiplicador promedio
  }"
  :showProgressionDetails="true"
/>
```

## Notas de Uso

- El componente utiliza `VxvProgressBar` para mostrar las barras de progreso.
- Los colores disponibles para las barras son: `'blue'`, `'green'`, `'red'`, `'yellow'`, `'purple'`, `'gray'`.
- Los formatos de valores permiten personalizar la visualización de los valores utilizando las variables `{value}` y `{max}`.
- La tarjeta tiene un efecto hover que resalta el borde con un color púrpura.
- Las animaciones son opcionales y están desactivadas por defecto.
- Para mostrar información adicional en la barra de progreso general, utiliza las propiedades `showProgressInfo` y `showProgressPercentage`.

### Índice de Progresión (I.P.)

El Índice de Progresión (I.P.) es una métrica que mide el avance general del piloto considerando múltiples factores:

- **HS**: Porcentaje de Habilidades Aprendidas (0-100%)
- **AL**: Nivel Promedio de las habilidades (0-5)
- **XP**: Experiencia Total acumulada
- **AS**: Porcentaje de Habilidades Activas (0-100%)
- **MP**: Multiplicador Promedio de las habilidades (1-5)

La fórmula para calcular el I.P. es:
```
I.P. = (HS × 10) + (AL × 25) + (XP ÷ 100) + (AS × 15) + (MP × 5)
```

Para mostrar el I.P. en la tarjeta, establece `showProgressionIndex` a `true`. Si además quieres mostrar los detalles de cómo se calcula, establece `showProgressionDetails` a `true`.

Para calcular el I.P. automáticamente, puedes utilizar la función `calculateProgressionIndex` del módulo `skillLevels.js`.
