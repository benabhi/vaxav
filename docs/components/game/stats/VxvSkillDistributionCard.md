# VxvSkillDistributionCard

El componente `VxvSkillDistributionCard` muestra una tarjeta con la distribución de habilidades por estado (activas, inactivas, no aprendidas, no disponibles) y opcionalmente un gráfico.

## Importación

```javascript
import VxvSkillDistributionCard from '@/components/game/stats/VxvSkillDistributionCard.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Distribución de Habilidades'` | Título de la tarjeta |
| `total` | `Number, String` | `0` | Valor total de habilidades |
| `totalFormat` | `String` | `'{value} habilidades'` | Formato para el valor total |
| `showTotal` | `Boolean` | `true` | Si se debe mostrar el valor total |
| `activeLabel` | `String` | `'Activas'` | Etiqueta para habilidades activas |
| `activeValue` | `Number, String` | `0` | Valor de habilidades activas |
| `activeFormat` | `String` | `'{value}'` | Formato para el valor de habilidades activas |
| `inactiveLabel` | `String` | `'Inactivas'` | Etiqueta para habilidades inactivas |
| `inactiveValue` | `Number, String` | `0` | Valor de habilidades inactivas |
| `inactiveFormat` | `String` | `'{value}'` | Formato para el valor de habilidades inactivas |
| `unlearnedLabel` | `String` | `'No aprendidas'` | Etiqueta para habilidades no aprendidas |
| `unlearnedValue` | `Number, String` | `0` | Valor de habilidades no aprendidas |
| `unlearnedFormat` | `String` | `'{value}'` | Formato para el valor de habilidades no aprendidas |
| `unavailableLabel` | `String` | `'No disponibles'` | Etiqueta para habilidades no disponibles |
| `unavailableValue` | `Number, String` | `0` | Valor de habilidades no disponibles |
| `unavailableFormat` | `String` | `'{value}'` | Formato para el valor de habilidades no disponibles |
| `showChart` | `Boolean` | `true` | Si se debe mostrar el gráfico de distribución |
| `showChartLegend` | `Boolean` | `true` | Si se debe mostrar la leyenda del gráfico |

## Ejemplos de Uso

### Distribución de habilidades básica

```vue
<VxvSkillDistributionCard 
  title="Distribución de Habilidades" 
  :total="100" 
  :activeValue="25" 
  :inactiveValue="15" 
  :unlearnedValue="40" 
  :unavailableValue="20" 
/>
```

### Distribución de habilidades con porcentajes

```vue
<VxvSkillDistributionCard 
  title="Distribución de Habilidades" 
  :total="100" 
  :activeValue="25" 
  activeFormat="{value} (25%)" 
  :inactiveValue="15" 
  inactiveFormat="{value} (15%)" 
  :unlearnedValue="40" 
  unlearnedFormat="{value} (40%)" 
  :unavailableValue="20" 
  unavailableFormat="{value} (20%)" 
/>
```

### Distribución de habilidades sin gráfico

```vue
<VxvSkillDistributionCard 
  title="Distribución de Habilidades" 
  :total="100" 
  :activeValue="25" 
  :inactiveValue="15" 
  :unlearnedValue="40" 
  :unavailableValue="20" 
  :showChart="false" 
/>
```

### Distribución de habilidades con etiquetas personalizadas

```vue
<VxvSkillDistributionCard 
  title="Estado de Conocimientos" 
  :total="100" 
  totalFormat="{value} técnicas" 
  activeLabel="Dominadas" 
  :activeValue="25" 
  inactiveLabel="En práctica" 
  :inactiveValue="15" 
  unlearnedLabel="Por aprender" 
  :unlearnedValue="40" 
  unavailableLabel="Bloqueadas" 
  :unavailableValue="20" 
/>
```

## Notas de Uso

- El componente muestra la distribución de habilidades en cuatro categorías: activas, inactivas, no aprendidas y no disponibles.
- Cada categoría tiene un color distintivo: verde para activas, amarillo para inactivas, rojo para no aprendidas y gris para no disponibles.
- El gráfico de distribución muestra visualmente la proporción de cada categoría respecto al total.
- Los formatos de texto (`totalFormat`, `activeFormat`, etc.) utilizan la sintaxis `{value}` para reemplazar los valores correspondientes.
- La tarjeta tiene un efecto hover que resalta ligeramente el borde con el color púrpura.
