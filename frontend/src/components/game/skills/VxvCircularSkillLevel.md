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
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'` o un valor hexadecimal (`'#RRGGBB'`) |
| `backgroundColor` | `String` | `'#1f2937'` | Color de fondo del círculo |
| `levelLabel` | `String` | `'Nivel'` | Etiqueta para el nivel |
| `xpSuffix` | `String` | `'/100 XP'` | Sufijo para la experiencia |
| `animated` | `Boolean` | `true` | Si los contadores deben animarse al cargar |
| `animationDuration` | `Number, String` | `1500` | Duración de la animación en milisegundos |

## Ejemplos de Uso

### Nivel de habilidad básico

```vue
<VxvCircularSkillLevel 
  level="2" 
  currentXP="250" 
  minXP="200" 
  maxXP="500" 
  xpSuffix="/300 XP" 
/>
```

### Nivel de habilidad con estado inactivo

```vue
<VxvCircularSkillLevel 
  level="3" 
  currentXP="700" 
  minXP="500" 
  maxXP="1100" 
  status="inactive" 
  xpSuffix="/600 XP" 
/>
```

### Nivel de habilidad no aprendida

```vue
<VxvCircularSkillLevel 
  level="0" 
  currentXP="0" 
  minXP="0" 
  maxXP="50" 
  status="unlearned" 
  xpSuffix="/50 XP" 
/>
```

### Nivel de habilidad con tamaño personalizado

```vue
<VxvCircularSkillLevel 
  level="3" 
  currentXP="700" 
  minXP="500" 
  maxXP="1100" 
  size="150" 
  thickness="12" 
  xpSuffix="/600 XP" 
/>
```

### Nivel de habilidad con multiplicador

```vue
<VxvCircularSkillLevel 
  level="2" 
  currentXP="250" 
  minXP="200" 
  maxXP="800" 
  multiplier="2" 
  xpSuffix="/600 XP" 
/>
```

## Notas de Uso

- El componente utiliza `VxvProgressCircular` para mostrar el progreso circular y `VxvAnimatedCounter` para animar los valores numéricos.
- El color del progreso se determina automáticamente según el estado de la habilidad y el nivel actual.
- Para habilidades activas, el color varía según el nivel (tonalidades de azul, más oscuro a mayor nivel).
- Para habilidades inactivas, se utiliza un color amarillo.
- Para habilidades no aprendidas, se utiliza un color gris.
- El componente calcula automáticamente el porcentaje de progreso basado en los valores `minXP`, `maxXP` y `currentXP`.
- Utiliza la configuración de niveles de habilidades definida en `@/config/skillLevels.js`.
