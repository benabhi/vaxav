# Componentes de Visualización de Habilidades

Este documento detalla los componentes utilizados para visualizar las habilidades de los pilotos en la interfaz de usuario, incluyendo sus propiedades, comportamiento y animaciones.

## Tabla de Contenidos

1. [VxvSkillCard](#vxvskillcard)
2. [VxvCircularSkillLevel](#vxvcircularskillevel)
3. [VxvDashedSkillLevel](#vxvdashedskillevel)
4. [Animaciones](#animaciones)
5. [Integración con la Vista de Habilidades](#integración-con-la-vista-de-habilidades)

## VxvSkillCard

`VxvSkillCard` es el componente principal para mostrar información detallada de una habilidad.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `skill` | `Object` | Datos de la habilidad (nombre, nivel, XP, etc.) |
| `status` | `String` | Estado de la habilidad ('active', 'inactive', 'unlearned') |
| `available` | `Boolean` | Si la habilidad está disponible para aprender |
| `animated` | `Boolean` | Si los elementos deben animarse al cargar |
| `animationDuration` | `Number` | Duración de la animación en milisegundos |
| `index` | `Number` | Índice de la tarjeta (para animaciones escalonadas) |

### Estructura

La tarjeta de habilidad tiene una altura fija de 329px y está dividida en secciones:

1. **Encabezado (72px)**: Muestra el nombre, categoría y multiplicador de la habilidad
2. **Barra de progreso circular (132px)**: Muestra el nivel y progreso de experiencia
3. **Descripción (40px)**: Muestra la descripción de la habilidad (con scroll al hacer hover)
4. **Indicadores de nivel (20px)**: Muestra visualmente los 5 niveles posibles
5. **Prerrequisitos (65px)**: Muestra los prerrequisitos necesarios para aprender la habilidad

### Comportamiento

- La tarjeta muestra diferentes colores según el estado de la habilidad
- Al hacer hover, la tarjeta se eleva ligeramente y la descripción se expande
- Los prerrequisitos se muestran como badges, con colores que indican si están cumplidos

## VxvCircularSkillLevel

`VxvCircularSkillLevel` es un componente puramente presentacional que muestra el nivel de una habilidad con un círculo de progreso.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `level` | `Number` | Nivel actual de la habilidad (0-5) |
| `progressPercentage` | `Number` | Porcentaje de progreso hacia el siguiente nivel (0-100) |
| `currentXP` | `Number` | Experiencia total acumulada |
| `currentLevelXP` | `Number` | Experiencia acumulada en el nivel actual |
| `xpSuffix` | `String` | Sufijo para la experiencia (ej: "/150 XP") |
| `status` | `String` | Estado de la habilidad ('active', 'inactive', 'unlearned') |
| `size` | `Number` | Tamaño del círculo en píxeles |
| `thickness` | `Number` | Grosor de la línea del círculo |
| `animated` | `Boolean` | Si los contadores deben animarse al cargar |
| `animationDuration` | `Number` | Duración de la animación en milisegundos |

### Visualización

- Muestra un círculo de progreso con el porcentaje completado hacia el siguiente nivel
- En el centro muestra el nivel actual y la experiencia acumulada
- Si la habilidad está en nivel 5, muestra "NIVEL MÁXIMO" en lugar de la experiencia
- El color del círculo varía según el nivel y estado de la habilidad

### Importante

Este componente **no realiza cálculos internos**. Todos los valores (nivel, porcentaje de progreso, experiencia) deben ser calculados externamente y pasados como props. Esto asegura que el componente sea puramente presentacional y que los cálculos sean consistentes en toda la aplicación.

## VxvDashedSkillLevel

`VxvDashedSkillLevel` es un componente puramente presentacional que muestra el nivel de una habilidad con líneas horizontales.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `level` | `Number` | Nivel actual de la habilidad (0-5) |
| `maxLevel` | `Number` | Nivel máximo posible (por defecto: 5) |
| `status` | `String` | Estado de la habilidad ('active', 'inactive', 'unlearned') |
| `height` | `String` | Altura de las líneas ('xs', 'sm', 'md', 'lg') |
| `animated` | `Boolean` | Si las barras deben animarse al cargar |
| `animationDuration` | `Number` | Duración de la animación en milisegundos |
| `staggerDelay` | `Number` | Retraso adicional entre la animación de cada barra |

### Visualización

- Muestra una serie de líneas horizontales, una para cada nivel posible
- Las líneas correspondientes a niveles alcanzados se muestran en tonos de azul
- Las líneas correspondientes a niveles no alcanzados se muestran en gris
- Si la habilidad está inactiva, las líneas se muestran en un tono más claro

### Importante

Al igual que `VxvCircularSkillLevel`, este componente **no realiza cálculos internos**. El nivel debe ser calculado externamente y pasado como prop.

## Animaciones

Ambos componentes (`VxvCircularSkillLevel` y `VxvDashedSkillLevel`) tienen animaciones sincronizadas para proporcionar una experiencia visual coherente.

### Duración de Animaciones

- La duración predeterminada de las animaciones es de 1000ms (1 segundo)
- Esta duración se puede configurar a través de la prop `animationDuration`
- Es importante que ambos componentes tengan la misma duración para mantener la sincronización

### Animación de VxvCircularSkillLevel

- El círculo de progreso se llena gradualmente
- El contador de nivel se incrementa desde 0 hasta el nivel actual
- El contador de experiencia se incrementa desde 0 hasta la experiencia actual

### Animación de VxvDashedSkillLevel

- Las barras aparecen secuencialmente de izquierda a derecha
- Cada barra tiene un retraso adicional basado en su posición y el valor de `staggerDelay`
- La animación de cada barra incluye un efecto de escala y opacidad

## Integración con la Vista de Habilidades

La vista principal de habilidades (`PilotSkillsView`) es responsable de:

1. Cargar los datos de habilidades desde la API
2. Calcular el nivel, porcentaje de progreso y experiencia para cada habilidad
3. Pasar estos valores a los componentes de visualización

### Cálculos en PilotSkillsView

```typescript
// Calcular el nivel de una habilidad
const calculateSkillLevel = (skillId: number): number => {
  // ... (implementación)
};

// Calcular el porcentaje de progreso hacia el siguiente nivel
const calculateProgressPercentage = (skillId: number): number => {
  // ... (implementación)
};

// Calcular la experiencia acumulada en el nivel actual
const calculateCurrentLevelXP = (skillId: number): number => {
  // ... (implementación)
};

// Calcular la experiencia necesaria para el siguiente nivel
const calculateXPNeededForNextLevel = (skillId: number): number => {
  // ... (implementación)
};
```

### Paso de Datos a los Componentes

```html
<VxvSkillCard
  :skill="{
    id: skill.id,
    name: skill.name,
    category: getCategoryName(skill.skill_category_id),
    level: calculateSkillLevel(skill.id),
    multiplier: skill.multiplier,
    currentXP: getSkillXP(skill.id),
    minXP: getMinXPForLevel(skill.id),
    maxXP: getMinXPForLevel(skill.id) + calculateXPNeededForNextLevel(skill.id),
    progressPercentage: calculateProgressPercentage(skill.id),
    currentLevelXP: calculateCurrentLevelXP(skill.id),
    description: getSkillDescription(skill),
    prerequisites: skill.prerequisites ? skill.prerequisites.map(prereq => ({
      id: prereq.prerequisite_id,
      name: getPrerequisiteName(prereq),
      level: prereq.prerequisite_level,
      fulfilled: isPilotSkillAtLevel(prereq.prerequisite_id, prereq.prerequisite_level)
    })) : []
  }"
  :status="getSkillStatus(skill.id)"
  :animated="true"
  :animationDuration="1000"
/>
```

## Notas Importantes

1. **Componentes Presentacionales**: Tanto `VxvCircularSkillLevel` como `VxvDashedSkillLevel` son componentes puramente presentacionales. No realizan cálculos internos, solo muestran los datos que reciben.

2. **Sincronización de Animaciones**: Es importante que todas las animaciones tengan la misma duración para proporcionar una experiencia visual coherente.

3. **Consistencia Visual**: Los componentes utilizan un esquema de colores coherente para representar los diferentes estados y niveles de las habilidades.

4. **Responsividad**: Los componentes están diseñados para ser responsivos y funcionar correctamente en diferentes tamaños de pantalla.
