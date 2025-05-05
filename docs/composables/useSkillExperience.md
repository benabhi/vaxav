# Composable useSkillExperience

El composable `useSkillExperience` proporciona funcionalidad para gestionar la experiencia de habilidades en el frontend de VAXAV.

## Importación

```javascript
import { useSkillExperience } from '@/composables/useSkillExperience';
```

## Estado

El composable proporciona el siguiente estado:

- `xpRequirements`: Requisitos de XP para cada nivel de habilidad.
- `loading`: Indica si se está cargando información.
- `error`: Mensaje de error si ocurre algún problema.

## Métodos

### fetchXPRequirements

Obtiene los requisitos de XP desde la API.

```javascript
const { fetchXPRequirements } = useSkillExperience();

// Obtener requisitos de XP
const xpRequirements = await fetchXPRequirements();
console.log(xpRequirements);
// Ejemplo de salida: { 0: 50, 1: 150, 2: 300, 3: 600, 4: 1000 }
```

### calculateCumulativeXP

Calcula la experiencia acumulada para cada nivel.

```javascript
const { calculateCumulativeXP } = useSkillExperience();

// Calcular XP acumulado
const cumulativeXP = calculateCumulativeXP({
  0: 50, 1: 150, 2: 300, 3: 600, 4: 1000
});
console.log(cumulativeXP);
// Ejemplo de salida: { 0: 0, 1: 50, 2: 200, 3: 500, 4: 1100, 5: 2100 }
```

### getNextLevelXP

Calcula la experiencia necesaria para subir del nivel actual al siguiente.

```javascript
const { getNextLevelXP } = useSkillExperience();

// Calcular XP para el siguiente nivel
const xpNeeded = getNextLevelXP(2, 3);
console.log(xpNeeded);
// Ejemplo de salida: 900 (300 * 3)
```

### calculateProgressionIndex

Calcula el Índice de Progresión (I.P.) para un piloto.

```javascript
const { calculateProgressionIndex } = useSkillExperience();

// Estadísticas del piloto
const stats = {
  totalSkills: 100,
  learnedSkills: 50,
  activeSkills: 30,
  totalXP: 15000,
  skillsByLevel: [10, 20, 15, 5, 0, 0],
  multiplierStats: { 1: 20, 2: 15, 3: 10, 4: 5, 5: 0 }
};

// Calcular índice de progresión
const result = await calculateProgressionIndex(stats);
console.log(result.progressionIndex);
// Ejemplo de salida: 425
```

## Ejemplo de Uso Completo

```javascript
<script setup>
import { onMounted, ref } from 'vue';
import { useSkillExperience } from '@/composables/useSkillExperience';

// Obtener estado y métodos del composable
const {
  xpRequirements,
  loading,
  error,
  fetchXPRequirements,
  calculateProgressionIndex
} = useSkillExperience();

// Estado local
const stats = ref({
  totalSkills: 0,
  learnedSkills: 0,
  activeSkills: 0,
  totalXP: 0,
  skillsByLevel: [0, 0, 0, 0, 0, 0],
  multiplierStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
});
const progressionIndex = ref(0);

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Cargar requisitos de XP
    await fetchXPRequirements();
    
    // Calcular índice de progresión
    const result = await calculateProgressionIndex(stats.value);
    progressionIndex.value = result.progressionIndex;
  } catch (err) {
    console.error('Error:', err);
  }
});
</script>

<template>
  <div>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <h2>Requisitos de XP</h2>
      <pre>{{ xpRequirements }}</pre>
      
      <h2>Índice de Progresión</h2>
      <p>IP: {{ progressionIndex }}</p>
    </div>
  </div>
</template>
```

## Implementación Técnica

Este composable se comunica con el backend a través de dos endpoints principales:

- `GET /skill-config/xp-requirements`: Obtiene los requisitos de XP para cada nivel.
- `POST /skill-config/progression-index`: Calcula el Índice de Progresión basado en las estadísticas proporcionadas.

Los valores de experiencia están hardcodeados en el servidor en la clase `SkillService` y se exponen a través de estos endpoints.

## Migración desde skillLevels.ts

Este composable reemplaza la funcionalidad relacionada con la experiencia y el índice de progresión que anteriormente estaba en el archivo `config/skillLevels.ts`. Se recomienda utilizar este composable en lugar de las funciones del archivo mencionado, que están marcadas como obsoletas.
