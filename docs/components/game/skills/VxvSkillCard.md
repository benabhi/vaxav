# VxvSkillCard

El componente `VxvSkillCard` muestra una tarjeta con información detallada de una habilidad, incluyendo nombre, categoría, nivel, experiencia, descripción y prerrequisitos.

## Importación

```javascript
import VxvSkillCard from '@/components/game/skills/VxvSkillCard.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `skill` | `Object` | `{}` | Objeto con la información de la habilidad |
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'`, `'unavailable'` |
| `showDescription` | `Boolean` | `true` | Si se debe mostrar la descripción de la habilidad |
| `showPrerequisites` | `Boolean` | `true` | Si se deben mostrar los prerrequisitos de la habilidad |
| `showActions` | `Boolean` | `true` | Si se deben mostrar las acciones disponibles para la habilidad |
| `showProgress` | `Boolean` | `true` | Si se debe mostrar el progreso de la habilidad |
| `compact` | `Boolean` | `false` | Si la tarjeta debe mostrarse en modo compacto |
| `loading` | `Boolean` | `false` | Si la tarjeta está en estado de carga |
| `animated` | `Boolean` | `false` | Si los componentes de progreso deben animarse al cargar |
| `animationDuration` | `Number, String` | `1200` | Duración de la animación en milisegundos |
| `index` | `Number, String` | `0` | Índice de la tarjeta para animaciones escalonadas |

## Estructura del objeto `skill`

El objeto `skill` debe tener la siguiente estructura:

```javascript
{
  id: Number,                // ID único de la habilidad
  name: String,              // Nombre de la habilidad
  category: String,          // Categoría de la habilidad
  level: Number,             // Nivel actual de la habilidad (0-5)
  multiplier: Number,        // Multiplicador de la habilidad (1-5)
  currentXP: Number,         // Experiencia actual de la habilidad
  minXP: Number,             // Experiencia mínima para el nivel actual
  maxXP: Number,             // Experiencia necesaria para el siguiente nivel
  description: String,       // Descripción de la habilidad
  prerequisites: Array,      // Array de prerrequisitos
  active: Boolean            // Si la habilidad está activa
}
```

## Ejemplos de Uso

### Tarjeta de habilidad básica

```vue
<VxvSkillCard
  :skill="{
    id: 1,
    name: 'Navegación Espacial',
    category: 'Pilotaje',
    level: 3,
    multiplier: 2,
    currentXP: 400,
    minXP: 300,
    maxXP: 600,
    description: 'Habilidad para navegar en el espacio.',
    prerequisites: [],
    active: true
  }"
  status="active"
/>
```

### Tarjeta de habilidad en modo compacto

```vue
<VxvSkillCard
  :skill="skill"
  status="active"
  :compact="true"
  :showDescription="false"
  :showPrerequisites="false"
/>
```

### Tarjeta de habilidad inactiva

```vue
<VxvSkillCard
  :skill="skill"
  status="inactive"
/>
```

### Tarjeta de habilidad no aprendida

```vue
<VxvSkillCard
  :skill="skill"
  status="unlearned"
/>
```

### Tarjeta de habilidad no disponible

```vue
<VxvSkillCard
  :skill="skill"
  status="unavailable"
/>
```

## Notas de Uso

- El componente utiliza `VxvCircularSkillLevel` para mostrar el nivel de la habilidad.
- El color de la tarjeta y los elementos se determina automáticamente según el estado de la habilidad.
- Para habilidades activas, el color principal es azul.
- Para habilidades inactivas, el color principal es amarillo.
- Para habilidades no aprendidas, el color principal es rojo.
- Para habilidades no disponibles, el color principal es gris.
- El componente muestra un badge con el multiplicador de la habilidad.
- Si la habilidad tiene prerrequisitos, se muestran en una lista.
- Las acciones disponibles dependen del estado de la habilidad.

### Animaciones

Cuando la propiedad `animated` está activada:

- El círculo de progreso se anima llenándose hasta el nivel actual.
- Las barras de nivel aparecen secuencialmente, una tras otra, pero solo hasta el nivel actual.
- Cada barra aparece completa con un efecto de "pop" que da más dinamismo.
- La duración de las animaciones se controla con la propiedad `animationDuration`.
- El índice de la tarjeta (`index`) se puede utilizar para crear animaciones escalonadas cuando se muestran múltiples tarjetas.
- Todas las animaciones son opcionales y están desactivadas por defecto.
