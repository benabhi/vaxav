# VxvSkillCard

El componente `VxvSkillCard` muestra una tarjeta con información detallada de una habilidad, incluyendo nombre, categoría, nivel, experiencia, descripción y prerrequisitos.

## Importación

```javascript
import VxvSkillCard from '@/components/game/skills/VxvSkillCard.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `skill` | `Object` | - | Datos de la habilidad (requerido) |
| `status` | `String` | `'active'` | Estado de la habilidad. Opciones: `'active'`, `'inactive'`, `'unlearned'` |
| `available` | `Boolean` | `true` | Si la habilidad está disponible para aprender |
| `animated` | `Boolean` | `true` | Si los elementos deben animarse al cargar |
| `animationDuration` | `Number, String` | `1500` | Duración de la animación en milisegundos |
| `index` | `Number, String` | `0` | Índice de la tarjeta (para animaciones escalonadas) |

## Estructura del objeto `skill`

El objeto `skill` debe tener la siguiente estructura:

```javascript
{
  id: Number,                // ID único de la habilidad
  name: String,              // Nombre de la habilidad
  category: String,          // Categoría de la habilidad
  description: String,       // Descripción detallada de la habilidad
  level: Number,             // Nivel actual de la habilidad (0-5)
  multiplier: Number,        // Multiplicador de la habilidad (1-5)
  currentXP: Number,         // Experiencia actual
  minXP: Number,             // Experiencia mínima para el nivel actual
  maxXP: Number,             // Experiencia necesaria para el siguiente nivel
  prerequisites: [           // Lista de prerrequisitos (opcional)
    {
      id: Number,            // ID de la habilidad prerrequisito
      name: String,          // Nombre de la habilidad prerrequisito
      level: Number,         // Nivel requerido
      fulfilled: Boolean     // Si se cumple el prerrequisito
    }
  ]
}
```

## Ejemplos de Uso

### Tarjeta de habilidad básica

```vue
<VxvSkillCard 
  :skill="skill" 
  status="active" 
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
  status="unlearned" 
  :available="false" 
/>
```

### Tarjeta de habilidad sin animación

```vue
<VxvSkillCard 
  :skill="skill" 
  status="active" 
  :animated="false" 
/>
```

## Notas de Uso

- El componente utiliza `VxvCircularSkillLevel` para mostrar el progreso circular y `VxvDashedSkillLevel` para mostrar los niveles.
- La tarjeta tiene una altura fija de 329px para mantener la consistencia en la interfaz.
- La descripción de la habilidad tiene una altura fija pero se expande al hacer hover, mostrando un scroll si es necesario.
- Los prerrequisitos se muestran como badges, con colores diferentes según si están cumplidos o no.
- Si la habilidad no tiene prerrequisitos, se muestra un mensaje indicándolo.
- El color de la tarjeta y sus elementos varía según el estado de la habilidad:
  - Activa: Azul
  - Inactiva: Amarillo
  - No aprendida: Gris
- El multiplicador se muestra con colores diferentes según su valor:
  - x1: Gris
  - x2: Verde
  - x3: Azul
  - x4: Púrpura
  - x5: Rojo
