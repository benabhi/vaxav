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
| `maxLevel` | `Number, String` | `5` | Nivel máximo de la habilidad |
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'` |
| `height` | `String` | `'sm'` | Altura de las líneas. Opciones: `'xs'`, `'sm'`, `'md'`, `'lg'` |
| `animated` | `Boolean` | `false` | Si las barras deben animarse al cargar |
| `animationDuration` | `Number, String` | `600` | Duración de la animación en milisegundos |
| `staggerDelay` | `Number, String` | `50` | Retraso adicional entre la animación de cada barra (en milisegundos) |

## Ejemplos de Uso

### Nivel de habilidad básico

```vue
<VxvDashedSkillLevel
  :level="3"
/>
```

### Nivel de habilidad con etiqueta

```vue
<VxvDashedSkillLevel
  :level="4"
  :showLabel="true"
/>
```

### Nivel de habilidad con estado personalizado

```vue
<VxvDashedSkillLevel
  :level="2"
  status="inactive"
/>
```

### Nivel de habilidad con altura personalizada

```vue
<VxvDashedSkillLevel
  :level="5"
  height="lg"
/>
```

### Nivel de habilidad con animación

```vue
<VxvDashedSkillLevel
  :level="3"
  :animated="true"
  :animationDuration="600"
  :staggerDelay="50"
/>
```

## Notas de Uso

- El componente muestra una serie de líneas horizontales, una por cada nivel posible.
- Las líneas correspondientes a niveles alcanzados se colorean según el estado de la habilidad.
- Para habilidades activas, las líneas son azules con diferentes tonalidades según el nivel.
- Para habilidades inactivas, las líneas son amarillas.
- Para habilidades no aprendidas, las líneas son grises.
- Las líneas correspondientes a niveles no alcanzados se muestran en gris oscuro.
- El componente es útil para mostrar el nivel de una habilidad de forma compacta, especialmente en listas o tablas.

### Animaciones

Cuando la propiedad `animated` está activada:

- Las barras están completamente ocultas al inicio cuando la animación está activada.
- Solo las barras hasta el nivel actual de la habilidad se animan, las demás permanecen ocultas.
- Cada barra aparece completamente antes de que comience la siguiente, creando una secuencia clara y ordenada.
- Las barras aparecen con un efecto de "pop" (ligero rebote) para dar más dinamismo visual.
- La duración de la animación de cada barra se controla con la propiedad `animationDuration`.
- El retraso entre el final de una animación y el inicio de la siguiente se calcula automáticamente basado en `animationDuration`, con un retraso adicional opcional controlado por `staggerDelay`.
- Las animaciones se sincronizan con otros componentes como `VxvCircularSkillLevel` cuando se usan juntos en `VxvSkillCard`.
- El efecto visual es similar a una "activación" secuencial de los niveles de habilidad alcanzados, donde cada nivel se "enciende" completamente antes de pasar al siguiente.
