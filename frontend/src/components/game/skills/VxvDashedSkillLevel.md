# VxvDashedSkillLevel

El componente `VxvDashedSkillLevel` muestra el nivel actual de una habilidad con líneas horizontales, donde cada línea representa un nivel y se colorea según el estado de la habilidad.

## Importación

```javascript
import VxvDashedSkillLevel from '@/components/game/skills/VxvDashedSkillLevel.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `level` | `Number, String` | `0` | Nivel actual de la habilidad (0-5) |
| `maxLevel` | `Number, String` | `5` | Nivel máximo posible |
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'` |
| `height` | `String` | `'sm'` | Altura de las líneas. Opciones: `'xs'`, `'sm'`, `'md'`, `'lg'` |

## Ejemplos de Uso

### Indicador de nivel básico

```vue
<VxvDashedSkillLevel 
  level="3" 
  maxLevel="5" 
  status="active" 
/>
```

### Indicador de nivel inactivo

```vue
<VxvDashedSkillLevel 
  level="3" 
  maxLevel="5" 
  status="inactive" 
/>
```

### Indicador de nivel no aprendido

```vue
<VxvDashedSkillLevel 
  level="0" 
  maxLevel="5" 
  status="unlearned" 
/>
```

### Indicador de nivel con altura personalizada

```vue
<VxvDashedSkillLevel 
  level="3" 
  maxLevel="5" 
  height="lg" 
/>
```

### Indicador de nivel con nivel máximo personalizado

```vue
<VxvDashedSkillLevel 
  level="2" 
  maxLevel="3" 
/>
```

## Notas de Uso

- El componente muestra una serie de líneas horizontales, una para cada nivel hasta el nivel máximo.
- Las líneas se colorean según el nivel actual y el estado de la habilidad:
  - Para habilidades activas, las líneas se colorean en tonalidades de azul, más oscuro a mayor nivel.
  - Para habilidades inactivas, las líneas se colorean en azul claro semitransparente.
  - Para habilidades no aprendidas, las líneas se colorean en gris.
- El componente utiliza la configuración de niveles de habilidades definida en `@/config/skillLevels.js`.
- La altura de las líneas se puede personalizar con la prop `height`.
