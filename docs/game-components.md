# Componentes de Juego

Este documento describe los componentes específicos del juego Vaxav, sus propósitos y cómo utilizarlos.

## Configuración de Habilidades

La configuración de los niveles de habilidades y multiplicadores se encuentra en el archivo `frontend/src/config/skillLevels.js`. Este archivo contiene constantes y funciones para calcular la experiencia necesaria para cada nivel y multiplicador.

### Valores de Experiencia

- **Nivel 0 -> 1**: 50 XP
- **Nivel 1 -> 2**: 150 XP
- **Nivel 2 -> 3**: 300 XP
- **Nivel 3 -> 4**: 600 XP
- **Nivel 4 -> 5**: 1000 XP

Estos valores base se multiplican por el multiplicador de la habilidad (x1 a x5) para obtener la experiencia real necesaria.

### Multiplicadores

- **x1 (Básico)**: Color gris
- **x2 (Intermedio)**: Color verde
- **x3 (Avanzado)**: Color azul
- **x4 (Experto)**: Color púrpura
- **x5 (Maestro)**: Color rojo

## Componentes de Progreso

Los componentes de progreso se encuentran en `frontend/src/components/ui/progress` ya que son componentes de UI generales que pueden usarse en toda la aplicación.

### VxvProgressBar

Barra de progreso horizontal con opciones para mostrar etiquetas, valores, porcentajes y personalizar colores.

```vue
<VxvProgressBar
  value="40"
  max="100"
  color="blue"
  label="Progreso"
/>
```

### VxvAnimatedCounter

Contador numérico que se anima desde un valor inicial hasta un valor final, con opciones para personalizar la duración, el formato y otros aspectos de la animación.

```vue
<VxvAnimatedCounter
  :initialValue="0"
  :finalValue="1000"
  :duration="1500"
  suffix=" XP"
/>
```

### VxvProgressCircular

Barra de progreso circular con opciones para personalizar el tamaño, grosor, colores y animación.

```vue
<VxvProgressCircular
  value="40"
  max="100"
  size="100"
  thickness="8"
  color="blue"
  showPercentage
/>
```

## Componentes de Habilidades

### VxvCircularSkillLevel

Muestra el nivel actual de una habilidad con un círculo de progreso, el nivel en el centro y la experiencia actual/necesaria para el siguiente nivel.

```vue
<VxvCircularSkillLevel
  :level="2"
  :currentXP="250"
  :minXP="200"
  :maxXP="500"
  :multiplier="1"
  status="active"
/>
```

### VxvDashedSkillLevel

Muestra el nivel actual de una habilidad con líneas horizontales, donde cada línea representa un nivel y se colorea según el estado de la habilidad.

```vue
<VxvDashedSkillLevel
  :level="3"
  :maxLevel="5"
  status="active"
/>
```

### VxvSkillCard

Muestra una tarjeta con información detallada de una habilidad, incluyendo nombre, categoría, nivel, experiencia, descripción y prerrequisitos.

```vue
<VxvSkillCard
  :skill="skill"
  status="active"
/>
```

## Componentes de Estadísticas

### VxvGeneralProgressCard

Muestra una tarjeta con estadísticas de progreso general, incluyendo dos estadísticas específicas y una barra de progreso general.

```vue
<VxvGeneralProgressCard
  title="Progreso General"
  :total="45"
  totalFormat="{value} habilidades"
  stat1Label="Activas"
  :stat1Value="25"
  :stat1Max="45"
  stat2Label="Inactivas"
  :stat2Value="15"
  :stat2Max="45"
  progressLabel="Progreso Total"
  :progressValue="40"
  :progressMax="45"
/>
```

### VxvSkillDistributionCard

Muestra una tarjeta con la distribución de habilidades por estado (activas, inactivas, no aprendidas, no disponibles) y opcionalmente un gráfico.

```vue
<VxvSkillDistributionCard
  title="Distribución de Habilidades"
  :total="100"
  :activeValue="25"
  :inactiveValue="15"
  :unlearnedValue="40"
  :unavailableValue="20"
/>
```

### VxvDistributionCard

Componente genérico para mostrar distribuciones con barras de progreso. Puede usarse para mostrar distribuciones por nivel, multiplicador, estado, etc.

```vue
<VxvDistributionCard
  title="Distribución por Nivel"
  :total="100"
  totalFormat="{value} habilidades"
  :items="[
    { label: 'Nivel 0', value: 40, color: 'gray' },
    { label: 'Nivel 1', value: 25, color: 'blue' },
    { label: 'Nivel 2', value: 15, color: 'blue' },
    { label: 'Nivel 3', value: 10, color: 'blue' },
    { label: 'Nivel 4', value: 7, color: 'blue' },
    { label: 'Nivel 5', value: 3, color: 'blue' }
  ]"
/>
```

## Uso en PilotSkillsView

La vista `PilotSkillsView.vue` utiliza estos componentes para mostrar la información de habilidades del piloto. La vista está organizada en secciones:

1. **Filtros**: Utiliza el componente `VxvFilters` para filtrar las habilidades por categoría, estado, nivel, etc.
2. **Estadísticas**: Muestra tarjetas con estadísticas generales, distribución por estado, nivel y multiplicador.
3. **Lista de Habilidades**: Muestra las habilidades filtradas como tarjetas.

Ejemplo de uso:

```vue
<template>
  <div class="pilot-skills-view">
    <!-- Filtros -->
    <VxvFilters ... />

    <!-- Estadísticas -->
    <div class="grid grid-cols-4 gap-4">
      <VxvGeneralProgressCard ... />
      <VxvSkillDistributionCard ... />
      <VxvDistributionCard
        title="Distribución por Nivel"
        :items="levelDistributionItems"
        ...
      />
      <VxvDistributionCard
        title="Distribución por Multiplicador"
        :items="multiplierDistributionItems"
        ...
      />
    </div>

    <!-- Lista de Habilidades -->
    <div class="grid grid-cols-4 gap-4">
      <VxvSkillCard
        v-for="skill in filteredSkills"
        :key="skill.id"
        :skill="skill"
        :status="getSkillStatus(skill)"
      />
    </div>
  </div>
</template>
```

## Notas Adicionales

- Todos los componentes están diseñados para ser responsivos y adaptarse a diferentes tamaños de pantalla.
- Los colores utilizados en los componentes siguen la paleta de colores del juego.
- Los componentes utilizan Tailwind CSS para los estilos.
- Los componentes están documentados con JSDoc para facilitar su uso.
- Todos los componentes tienen historias en Storybook para visualizar sus diferentes estados y configuraciones.
- La documentación de los componentes se encuentra en `frontend/docs/components/`.
