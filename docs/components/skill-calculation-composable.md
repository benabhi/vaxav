# Composable de Cálculos de Habilidades

Este documento detalla el composable `useSkillCalculations`, que centraliza todos los cálculos relacionados con niveles, progreso y experiencia de habilidades.

## Propósito

El composable `useSkillCalculations` sigue el principio de "separación de responsabilidades" y proporciona una ubicación centralizada para todos los cálculos matemáticos relacionados con las habilidades. Esto garantiza que los mismos cálculos se utilicen de manera consistente en toda la aplicación.

## Ubicación

```
frontend/src/composables/useSkillCalculations.ts
```

## Funcionalidades

El composable proporciona las siguientes constantes y funciones:

### Constantes

#### `cumulativeXp`

Valores acumulados de XP para cada nivel:

```typescript
const cumulativeXp = {
  0: 0,     // Nivel 0 (no aprendida)
  1: 50,    // Para nivel 1
  2: 200,   // Para nivel 2 (50 + 150)
  3: 500,   // Para nivel 3 (50 + 150 + 300)
  4: 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
  5: 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
};
```

#### `levelRequirements`

Requisitos de XP para cada nivel individual (no acumulado):

```typescript
const levelRequirements = {
  0: 50,    // Para nivel 1
  1: 150,   // Para nivel 2
  2: 300,   // Para nivel 3
  3: 600,   // Para nivel 4
  4: 1000,  // Para nivel 5
};
```

### Funciones

#### `calculateLevel(xp: number, multiplier: number = 1): number`

Calcula el nivel basado en la experiencia acumulada y el multiplicador.

**Parámetros:**
- `xp`: Experiencia acumulada
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Nivel calculado (0-5)

**Ejemplo:**
```typescript
const { calculateLevel } = useSkillCalculations();
const level = calculateLevel(850, 2); // Devuelve 2
```

#### `calculateProgressPercentage(xp: number, level: number, multiplier: number = 1): number`

Calcula el porcentaje de progreso hacia el siguiente nivel.

**Parámetros:**
- `xp`: Experiencia acumulada
- `level`: Nivel actual (0-5)
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Porcentaje de progreso (0-100)

**Ejemplo:**
```typescript
const { calculateProgressPercentage } = useSkillCalculations();
const progress = calculateProgressPercentage(850, 2, 2); // Devuelve 75
```

#### `calculateCurrentLevelXP(xp: number, level: number, multiplier: number = 1): number`

Calcula la experiencia acumulada en el nivel actual.

**Parámetros:**
- `xp`: Experiencia acumulada
- `level`: Nivel actual (0-5)
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Experiencia acumulada en el nivel actual

**Ejemplo:**
```typescript
const { calculateCurrentLevelXP } = useSkillCalculations();
const currentLevelXP = calculateCurrentLevelXP(850, 2, 2); // Devuelve 450
```

#### `calculateXPNeededForNextLevel(level: number, multiplier: number = 1): number`

Calcula la experiencia necesaria para el siguiente nivel.

**Parámetros:**
- `level`: Nivel actual (0-5)
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Experiencia necesaria para el siguiente nivel

**Ejemplo:**
```typescript
const { calculateXPNeededForNextLevel } = useSkillCalculations();
const xpNeeded = calculateXPNeededForNextLevel(2, 2); // Devuelve 600
```

#### `getMinXPForLevel(level: number, multiplier: number = 1): number`

Obtiene la experiencia mínima para un nivel específico.

**Parámetros:**
- `level`: Nivel objetivo (0-5)
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Experiencia mínima para el nivel

**Ejemplo:**
```typescript
const { getMinXPForLevel } = useSkillCalculations();
const minXP = getMinXPForLevel(3, 2); // Devuelve 1000
```

#### `getXPSuffix(level: number, multiplier: number = 1): string`

Genera el sufijo de experiencia para mostrar.

**Parámetros:**
- `level`: Nivel actual (0-5)
- `multiplier`: Multiplicador de la habilidad (1-5)

**Retorna:**
- Sufijo de experiencia (ej: "/150 XP" o "MAX")

**Ejemplo:**
```typescript
const { getXPSuffix } = useSkillCalculations();
const suffix = getXPSuffix(2, 2); // Devuelve "/600 XP"
```

## Uso en Componentes

### En Componentes de Visualización

Los componentes de visualización como `VxvCircularSkillLevel` y `VxvDashedSkillLevel` son puramente presentacionales y no realizan cálculos internos. Reciben todos los datos necesarios a través de props.

### En Componentes Contenedores

Los componentes contenedores como `VxvSkillCard` pueden utilizar el composable para calcular valores que no se hayan pasado como props:

```typescript
import { useSkillCalculations } from '@/composables/useSkillCalculations';

// En el setup del componente
const {
  calculateProgressPercentage,
  calculateCurrentLevelXP,
  getXPSuffix
} = useSkillCalculations();

// Luego puedes usar estas funciones para calcular valores
const getProgressPercentage = () => {
  if (!props.skill) return 0;
  
  return props.skill.progressPercentage || 
         calculateProgressPercentage(
           props.skill.currentXP, 
           props.skill.level, 
           props.skill.multiplier
         );
};
```

### En Vistas

Las vistas como `PilotSkillsView` pueden utilizar el composable para preparar los datos para los componentes:

```typescript
import { useSkillCalculations } from '@/composables/useSkillCalculations';

// En el setup de la vista
const {
  calculateLevel,
  calculateProgressPercentage,
  calculateCurrentLevelXP,
  calculateXPNeededForNextLevel,
  getMinXPForLevel
} = useSkillCalculations();

// Luego puedes usar estas funciones para preparar los datos
const prepareSkillData = (skill) => {
  const level = calculateLevel(skill.pivot.xp, skill.multiplier);
  const multiplier = skill.multiplier;
  
  return {
    // ... otras propiedades
    level,
    progressPercentage: calculateProgressPercentage(skill.pivot.xp, level, multiplier),
    currentLevelXP: calculateCurrentLevelXP(skill.pivot.xp, level, multiplier),
    // ... otras propiedades
  };
};
```

## Ventajas

1. **Centralización**: Todos los cálculos relacionados con habilidades están en un solo lugar.
2. **Reutilización**: Las funciones se pueden reutilizar en toda la aplicación.
3. **Mantenibilidad**: Si cambian las fórmulas de cálculo, solo hay que modificar un archivo.
4. **Testabilidad**: Es más fácil escribir pruebas unitarias para funciones puras.
5. **Consistencia**: Garantiza que los mismos cálculos se utilicen en toda la aplicación.

## Relación con Otros Composables

- **useSkillExperience**: Proporciona métodos para obtener requisitos de XP desde la API y calcular el índice de progresión.
- **usePilotSkills**: Proporciona métodos para obtener las habilidades del piloto desde la API.
- **useSkillCalculations**: Proporciona funciones para calcular niveles, progreso y experiencia de habilidades.
