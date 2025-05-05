# VxvCircularSkillLevel

El componente `VxvCircularSkillLevel` muestra el nivel actual de una habilidad con un círculo de progreso, el nivel en el centro y la experiencia actual/necesaria para el siguiente nivel.

## Importación

```javascript
import VxvCircularSkillLevel from '@/components/game/skills/VxvCircularSkillLevel.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `level` | `Number, String` | `0` | Nivel actual de la habilidad (0-5) |
| `currentXP` | `Number, String` | `0` | Experiencia actual de la habilidad |
| `minXP` | `Number, String` | `0` | Experiencia mínima para el nivel actual |
| `maxXP` | `Number, String` | `0` | Experiencia necesaria para el siguiente nivel |
| `multiplier` | `Number, String` | `1` | Multiplicador de la habilidad (1-5) |
| `size` | `Number, String` | `100` | Tamaño del círculo en píxeles |
| `thickness` | `Number, String` | `8` | Grosor de la línea del círculo |
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'` |
| `backgroundColor` | `String` | `'#1f2937'` | Color de fondo del círculo |
| `levelLabel` | `String` | `'Nivel'` | Etiqueta para el nivel |
| `xpSuffix` | `String` | `'/100 XP'` | Sufijo para la experiencia |
| `animated` | `Boolean` | `false` | Si los contadores deben animarse al cargar |
| `animationDuration` | `Number, String` | `1500` | Duración de la animación en milisegundos |

## Ejemplos de Uso

### Nivel de habilidad básico

```vue
<VxvCircularSkillLevel
  :level="2"
  :currentXP="250"
  :minXP="200"
  :maxXP="500"
/>
```

### Nivel de habilidad con multiplicador

```vue
<VxvCircularSkillLevel
  :level="3"
  :currentXP="400"
  :minXP="300"
  :maxXP="600"
  :multiplier="2"
/>
```

### Nivel de habilidad con estado personalizado

```vue
<VxvCircularSkillLevel
  :level="4"
  :currentXP="800"
  :minXP="600"
  :maxXP="1000"
  status="inactive"
/>
```

### Nivel de habilidad con tamaño personalizado

```vue
<VxvCircularSkillLevel
  :level="5"
  :currentXP="1000"
  :minXP="1000"
  :maxXP="1000"
  :size="150"
  :thickness="12"
/>
```

## Notas de Uso

- El componente utiliza `VxvProgressCircular` para mostrar el círculo de progreso y `VxvAnimatedCounter` para animar los valores.
- El color del progreso se determina automáticamente según el nivel y el estado de la habilidad.
- Para habilidades activas, el color varía según el nivel (tonalidades de azul, más oscuro a mayor nivel).
- Para habilidades inactivas, el color es amarillo.
- Para habilidades no aprendidas, el color es gris.
- El componente calcula automáticamente el porcentaje de progreso basado en los valores `minXP`, `maxXP` y `currentXP`.
- Las animaciones son opcionales y están desactivadas por defecto (propiedad `animated`).
- Cuando la propiedad `animated` está activada, tanto el círculo de progreso como los contadores se animan al cargar el componente.
- Para habilidades en nivel 5 (nivel máximo), el círculo de progreso siempre se muestra completamente lleno.
