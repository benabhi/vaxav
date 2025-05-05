# Sistema de Experiencia para Habilidades

## Descripción General

El sistema de experiencia para habilidades en Vaxav determina cuánta experiencia (XP) necesita un piloto para avanzar de un nivel a otro en cada habilidad. Este sistema es fundamental para la progresión del personaje en el juego.

## Implementación Técnica

### Requisitos de XP

Los requisitos de XP para cada nivel están definidos directamente en el servidor, específicamente en la clase `SkillService`. Estos valores son constantes y no se pueden modificar desde la interfaz de administración.

```php
// backend/app/Services/SkillService.php
public function getXpRequirements(): array
{
    // Valores hardcodeados para los requisitos de XP
    return [
        0 => 50,   // Nivel 0 -> 1
        1 => 150,  // Nivel 1 -> 2
        2 => 300,  // Nivel 2 -> 3
        3 => 600,  // Nivel 3 -> 4
        4 => 1000, // Nivel 4 -> 5
    ];
}
```

Estos valores representan la cantidad de XP necesaria para pasar de un nivel al siguiente:
- 50 XP para pasar de nivel 0 a nivel 1
- 150 XP para pasar de nivel 1 a nivel 2
- 300 XP para pasar de nivel 2 a nivel 3
- 600 XP para pasar de nivel 3 a nivel 4
- 1000 XP para pasar de nivel 4 a nivel 5

### Multiplicadores

Cada habilidad tiene un multiplicador (de 1 a 5) que afecta la cantidad de XP necesaria para subir de nivel. El XP requerido se multiplica por este valor:

- x1: Habilidades básicas (50, 150, 300, 600, 1000)
- x2: Habilidades intermedias (100, 300, 600, 1200, 2000)
- x3: Habilidades avanzadas (150, 450, 900, 1800, 3000)
- x4: Habilidades expertas (200, 600, 1200, 2400, 4000)
- x5: Habilidades maestras (250, 750, 1500, 3000, 5000)

### API

El sistema expone dos endpoints para que el cliente pueda obtener esta información:

```
GET /api/skill-config/xp-requirements
```
Devuelve los requisitos de XP para cada nivel.

```
POST /api/skill-config/progression-index
```
Calcula el Índice de Progresión (I.P.) basado en las estadísticas proporcionadas.

## Índice de Progresión (I.P.)

El Índice de Progresión es una métrica que mide el avance general de un piloto, considerando múltiples factores:

### Fórmula

```
I.P. = (HS × 10) + (AL × 25) + (XP ÷ 100) + (AS × 15) + (MP × 5)
```

Donde:
- **HS**: Porcentaje de Habilidades Aprendidas (0-100%)
- **AL**: Nivel Promedio (0-5)
- **XP**: Experiencia Total Acumulada
- **AS**: Porcentaje de Habilidades Activas (0-100%)
- **MP**: Multiplicador Promedio (1-5)

### Implementación

El cálculo del I.P. se realiza en el servidor en la clase `SkillService`:

```php
public function calculateProgressionIndex(array $stats): array
{
    // HS = Porcentaje de Habilidades Aprendidas (0-100%)
    $HS = $stats['totalSkills'] > 0 ? ($stats['learnedSkills'] / $stats['totalSkills']) * 100 : 0;

    // AL = Nivel Promedio (0-5)
    $AL = 0;
    if ($stats['learnedSkills'] > 0) {
        $totalLevels = 0;
        foreach ($stats['skillsByLevel'] as $level => $count) {
            $totalLevels += $level * $count;
        }
        $AL = $totalLevels / $stats['learnedSkills'];
    }

    // XP = Experiencia Total Acumulada
    $XP = $stats['totalXP'];

    // AS = Porcentaje de Habilidades Activas (0-100%)
    $AS = $stats['learnedSkills'] > 0 ? ($stats['activeSkills'] / $stats['learnedSkills']) * 100 : 0;

    // MP = Multiplicador Promedio (1-5)
    $MP = 0;
    if ($stats['learnedSkills'] > 0) {
        $totalMultipliers = 0;
        foreach ($stats['multiplierStats'] as $mult => $count) {
            $totalMultipliers += (int)$mult * $count;
        }
        $MP = $totalMultipliers / $stats['learnedSkills'];
    }

    // Calcular el Índice de Progresión
    $progressionIndex = round(($HS * 10) + ($AL * 25) + ($XP / 100) + ($AS * 15) + ($MP * 5));

    return [
        'progressionIndex' => $progressionIndex,
        'progressionComponents' => [
            'HS' => $HS,
            'AL' => $AL,
            'XP' => $XP,
            'AS' => $AS,
            'MP' => $MP
        ]
    ];
}
```

## Uso en el Cliente

El cliente obtiene estos valores a través de la API y los utiliza para mostrar el progreso del piloto y calcular cuánta experiencia se necesita para subir de nivel en cada habilidad.

### Composable useSkillExperience

Para facilitar el acceso a estos valores y cálculos, se ha creado un composable específico que encapsula toda la lógica relacionada con la experiencia de habilidades:

```typescript
import { useSkillExperience } from '@/composables/useSkillExperience';

// Obtener los métodos del composable
const {
  fetchXPRequirements,
  calculateProgressionIndex
} = useSkillExperience();

// Obtener los requisitos de XP
const xpRequirements = await fetchXPRequirements();

// Calcular el Índice de Progresión
const progressionResult = await calculateProgressionIndex(statsData);
```

Para más detalles sobre el composable, consulte la [documentación del composable useSkillExperience](../composables/useSkillExperience.md).

## Notas de Diseño

- Los valores de XP están hardcodeados en el servidor para mejorar el rendimiento y simplificar la implementación.
- El sistema está diseñado para ser escalable, permitiendo ajustar los valores en el código si es necesario.
- El Índice de Progresión proporciona una métrica clara para que los jugadores entiendan su avance general.
