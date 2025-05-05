# Matemáticas de Habilidades

Este documento detalla los cálculos matemáticos utilizados para las habilidades de los pilotos en el juego, incluyendo la experiencia necesaria para cada nivel, multiplicadores, y cómo se calculan los niveles y el progreso.

## Tabla de Contenidos

1. [Niveles de Habilidad](#niveles-de-habilidad)
2. [Experiencia y Multiplicadores](#experiencia-y-multiplicadores)
3. [Cálculo de Nivel](#cálculo-de-nivel)
4. [Progreso de Nivel](#progreso-de-nivel)
5. [Índice de Progresión](#índice-de-progresión)
6. [Implementación en el Código](#implementación-en-el-código)

## Niveles de Habilidad

Las habilidades tienen 6 niveles posibles (0-5):

- **Nivel 0**: Habilidad no aprendida
- **Nivel 1**: Principiante
- **Nivel 2**: Aprendiz
- **Nivel 3**: Competente
- **Nivel 4**: Experto
- **Nivel 5**: Maestro (nivel máximo)

## Experiencia y Multiplicadores

### Valores de Experiencia Acumulada

La siguiente tabla muestra la experiencia acumulada necesaria para alcanzar cada nivel:

| Nivel | XP Acumulada | Incremento |
|-------|--------------|------------|
| 0     | 0            | -          |
| 1     | 50           | 50         |
| 2     | 200          | 150        |
| 3     | 500          | 300        |
| 4     | 1,100        | 600        |
| 5     | 2,100        | 1,000      |

### Multiplicadores

Cada habilidad tiene un multiplicador (1-5) que afecta la cantidad de experiencia necesaria para subir de nivel. Los multiplicadores representan la dificultad de aprendizaje de la habilidad:

| Multiplicador | Dificultad   | Descripción                                |
|---------------|--------------|-------------------------------------------|
| 1             | Muy fácil    | Habilidades básicas, fáciles de aprender  |
| 2             | Fácil        | Habilidades comunes                       |
| 3             | Media        | Habilidades que requieren más dedicación  |
| 4             | Difícil      | Habilidades avanzadas                     |
| 5             | Muy difícil  | Habilidades especializadas o raras        |

### Experiencia Requerida con Multiplicadores

La experiencia necesaria para cada nivel se multiplica por el multiplicador de la habilidad:

| Nivel | XP Base | Mult. x1 | Mult. x2 | Mult. x3 | Mult. x4 | Mult. x5 |
|-------|---------|----------|----------|----------|----------|----------|
| 1     | 50      | 50       | 100      | 150      | 200      | 250      |
| 2     | 200     | 200      | 400      | 600      | 800      | 1,000    |
| 3     | 500     | 500      | 1,000    | 1,500    | 2,000    | 2,500    |
| 4     | 1,100   | 1,100    | 2,200    | 3,300    | 4,400    | 5,500    |
| 5     | 2,100   | 2,100    | 4,200    | 6,300    | 8,400    | 10,500   |

## Cálculo de Nivel

El nivel de una habilidad se calcula comparando la experiencia actual con los umbrales de experiencia acumulada para cada nivel, teniendo en cuenta el multiplicador.

### Algoritmo

```
función calcularNivel(xp, multiplicador):
    nivel = 0
    
    para cada i desde 1 hasta 5:
        si xp >= xpAcumulada[i] * multiplicador:
            nivel = i
        sino:
            romper bucle
            
    devolver nivel
```

### Ejemplo

Para una habilidad con multiplicador 2 y 850 XP:

1. Nivel 1 requiere 50 * 2 = 100 XP ✓ (850 >= 100)
2. Nivel 2 requiere 200 * 2 = 400 XP ✓ (850 >= 400)
3. Nivel 3 requiere 500 * 2 = 1,000 XP ✗ (850 < 1,000)

Por lo tanto, el nivel de la habilidad es 2.

## Progreso de Nivel

El progreso hacia el siguiente nivel se calcula como un porcentaje del XP actual dentro del rango entre el nivel actual y el siguiente.

### Algoritmo

```
función calcularProgreso(xp, nivel, multiplicador):
    si nivel >= 5:
        devolver 100%  // Ya está en nivel máximo
        
    xpNivelActual = xpAcumulada[nivel] * multiplicador
    xpSiguienteNivel = xpAcumulada[nivel + 1] * multiplicador
    
    xpNecesario = xpSiguienteNivel - xpNivelActual
    xpProgreso = xp - xpNivelActual
    
    porcentaje = min(100, max(0, (xpProgreso / xpNecesario) * 100))
    devolver porcentaje
```

### Ejemplo

Para una habilidad con multiplicador 2, nivel 2 y 850 XP:

1. XP para nivel 2: 200 * 2 = 400 XP
2. XP para nivel 3: 500 * 2 = 1,000 XP
3. XP necesario para nivel 3: 1,000 - 400 = 600 XP
4. Progreso actual: 850 - 400 = 450 XP
5. Porcentaje: (450 / 600) * 100 = 75%

Por lo tanto, el progreso hacia el nivel 3 es del 75%.

## Índice de Progresión

El Índice de Progresión (I.P.) es una métrica que mide el desarrollo general del piloto basado en sus habilidades.

### Fórmula

```
I.P. = (HS × 10) + (AL × 25) + (XP ÷ 100) + (AS × 15) + (MP × 5)
```

Donde:
- **HS** = Porcentaje de Habilidades Aprendidas (0-100%)
- **AL** = Nivel Promedio (0-5)
- **XP** = Experiencia Total Acumulada
- **AS** = Porcentaje de Habilidades Activas (0-100%)
- **MP** = Multiplicador Promedio (1-5)

## Implementación en el Código

### Backend (PHP)

La lógica principal para el cálculo de niveles y progreso se encuentra en `SkillService.php`:

```php
// Calcular el nivel basado en XP
public function calculateLevelFromXp(int $xp, float $multiplier = 1.0): int
{
    // Valores acumulados de XP para cada nivel
    $cumulativeXp = [
        0 => 0,     // Nivel 0 (no aprendida)
        1 => 50,    // Para nivel 1
        2 => 200,   // Para nivel 2 (50 + 150)
        3 => 500,   // Para nivel 3 (50 + 150 + 300)
        4 => 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
        5 => 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
    ];

    $level = 0;
    
    // Iterar a través de los niveles y verificar si tenemos suficiente XP
    for ($i = 1; $i <= 5; $i++) {
        if ($xp >= $cumulativeXp[$i] * $multiplier) {
            $level = $i;
        } else {
            break;
        }
    }
    
    return $level;
}
```

### Frontend (TypeScript/Vue)

En el frontend, la lógica se implementa en varios componentes:

```typescript
// Calcular el nivel basado en XP
const calculateSkillLevel = (skillId: number): number => {
  try {
    // Obtener la experiencia actual
    const xp = getSkillXP(skillId);
    const multiplier = skill.multiplier || 1;
    
    // Valores acumulados de XP para cada nivel
    const cumulativeXp: Record<number, number> = {
      0: 0,     // Nivel 0 (no aprendida)
      1: 50,    // Para nivel 1
      2: 200,   // Para nivel 2 (50 + 150)
      3: 500,   // Para nivel 3 (50 + 150 + 300)
      4: 1100,  // Para nivel 4 (50 + 150 + 300 + 600)
      5: 2100   // Para nivel 5 (50 + 150 + 300 + 600 + 1000)
    };
    
    // Determinar el nivel basado en la experiencia acumulada
    let calculatedLevel = 0;
    for (let i = 1; i <= 5; i++) {
      if (xp >= cumulativeXp[i] * multiplier) {
        calculatedLevel = i;
      } else {
        break;
      }
    }
    
    return calculatedLevel;
  } catch (error) {
    console.error('Error en calculateSkillLevel:', error);
    return 0;
  }
};
```

## Notas Importantes

1. **Consistencia**: Es crucial mantener estos valores consistentes entre el backend y el frontend para evitar discrepancias en la visualización.

2. **Visualización**: En la interfaz de usuario, se muestra:
   - El nivel actual (1-5)
   - La experiencia total acumulada
   - La experiencia necesaria para el siguiente nivel
   - Un indicador visual del progreso hacia el siguiente nivel

3. **Ejemplo de Visualización**:
   - Para una habilidad con multiplicador 2 y 2,824 XP (nivel 4):
   - Se muestra: "2,824/4,200 XP" (donde 4,200 es el XP necesario para nivel 5)
   - El progreso visual muestra un 31% (calculado como (2,824 - 2,200) / (4,200 - 2,200) = 624 / 2,000 = 31%)
