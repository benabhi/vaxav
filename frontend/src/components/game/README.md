# Componentes de Juego

Este directorio contiene componentes específicos para el juego Vaxav, organizados en categorías según su funcionalidad.

## Estructura

```
game/
├── skills/             # Componentes relacionados con habilidades
├── stats/              # Componentes de estadísticas y distribución
└── index.js            # Exportación de todos los componentes
```

## Componentes de Habilidades

Componentes específicos para mostrar información de habilidades.

- **VxvCircularSkillLevel**: Muestra el nivel de una habilidad con un círculo de progreso y el nivel en el centro.
- **VxvDashedSkillLevel**: Muestra el nivel de una habilidad con líneas horizontales.
- **VxvSkillCard**: Tarjeta completa con información detallada de una habilidad.

## Componentes de Estadísticas

Componentes para mostrar estadísticas y distribuciones.

- **VxvGeneralProgressCard**: Tarjeta con estadísticas de progreso general.
- **VxvSkillDistributionCard**: Tarjeta con la distribución de habilidades por estado.
- **VxvDistributionCard**: Tarjeta genérica para mostrar distribuciones con barras de progreso.

## Uso

Puedes importar los componentes individualmente:

```javascript
import VxvSkillCard from '@/components/game/skills/VxvSkillCard.vue';
import VxvDistributionCard from '@/components/game/stats/VxvDistributionCard.vue';
```

O utilizar el archivo de índice para importar varios componentes:

```javascript
import { VxvSkillCard, VxvDistributionCard } from '@/components/game';
```

## Componentes de Progreso

Los componentes de progreso (VxvProgressBar, VxvAnimatedCounter, VxvProgressCircular) se han movido a `@/components/ui/progress` ya que son componentes de UI generales que pueden usarse en toda la aplicación.

```javascript
import { VxvProgressBar, VxvAnimatedCounter, VxvProgressCircular } from '@/components/ui/progress';
```

## Configuración de Niveles de Habilidades

La configuración de los niveles de habilidades y multiplicadores se encuentra en `@/config/skillLevels.js`. Este archivo contiene constantes y funciones para calcular la experiencia necesaria para cada nivel y multiplicador.

También puedes importarlo desde el índice:

```javascript
import { skillLevels } from '@/components/game';
```

## Documentación

La documentación de los componentes se encuentra en `frontend/docs/components/`.

Para más información, consulta la [documentación de componentes de juego](../../../../docs/game-components.md).
