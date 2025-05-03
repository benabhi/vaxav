# VxvActionTimer

El componente `VxvActionTimer` es un temporizador visual que muestra el progreso de una acción en curso, diseñado con una estética sci-fi que se integra con el tema de Vaxav.

## Índice

1. [Descripción](#descripción)
2. [Uso](#uso)
3. [Props](#props)
4. [Eventos](#eventos)
5. [Ejemplos](#ejemplos)
6. [Integración con VxvStatusBar](#integración-con-vxvstatusbar)

## Descripción

`VxvActionTimer` es un componente que muestra una acción en curso junto con un temporizador visual. El componente presenta una barra de progreso semicircular que se llena a medida que avanza la acción, proporcionando feedback visual al usuario sobre el tiempo restante.

El diseño del componente sigue la estética sci-fi retro de Vaxav, con líneas de neón y efectos de brillo que mejoran la experiencia visual del juego.

## Uso

```vue
<template>
  <VxvActionTimer 
    action="Minando Asteroides" 
    :duration="600" 
    :elapsed="120" 
  />
</template>

<script setup>
import VxvActionTimer from '@/components/ui/feedback/VxvActionTimer.vue';
</script>
```

## Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `action` | `String` | `''` | Nombre de la acción en curso |
| `duration` | `Number` | `0` | Duración total de la acción en segundos |
| `elapsed` | `Number` | `0` | Tiempo transcurrido en segundos |
| `color` | `String` | `'blue'` | Color principal del temporizador (blue, green, red, yellow) |
| `size` | `String` | `'md'` | Tamaño del temporizador (sm, md, lg) |
| `showText` | `Boolean` | `true` | Indica si se debe mostrar el texto de la acción |
| `showTime` | `Boolean` | `true` | Indica si se debe mostrar el tiempo restante |
| `autoStart` | `Boolean` | `false` | Indica si el temporizador debe iniciarse automáticamente |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `complete` | Ninguno | Se emite cuando la acción se completa |
| `update` | `{ elapsed: Number, remaining: Number, progress: Number }` | Se emite en cada actualización del temporizador |

## Ejemplos

### Temporizador Básico

```vue
<VxvActionTimer 
  action="Minando Asteroides" 
  :duration="600" 
  :elapsed="0" 
  auto-start
/>
```

### Temporizador con Color Personalizado

```vue
<VxvActionTimer 
  action="Escaneando Sistema" 
  :duration="30" 
  :elapsed="10" 
  color="green"
/>
```

### Temporizador sin Texto

```vue
<VxvActionTimer 
  :duration="120" 
  :elapsed="60" 
  :show-text="false"
/>
```

### Temporizador con Tiempo Personalizado

```vue
<template>
  <VxvActionTimer 
    :action="currentAction" 
    :duration="actionDuration" 
    :elapsed="actionElapsed" 
    @update="handleUpdate"
    @complete="handleComplete"
  />
</template>

<script setup>
import { ref } from 'vue';
import VxvActionTimer from '@/components/ui/feedback/VxvActionTimer.vue';

const currentAction = ref('Viajando a Jita');
const actionDuration = ref(300); // 5 minutos
const actionElapsed = ref(0);

const handleUpdate = ({ elapsed, remaining, progress }) => {
  actionElapsed.value = elapsed;
  console.log(`Progreso: ${progress}%, Tiempo restante: ${remaining}s`);
};

const handleComplete = () => {
  console.log('¡Viaje completado!');
};
</script>
```

## Integración con VxvStatusBar

El componente `VxvActionTimer` está diseñado para integrarse perfectamente con el componente `VxvStatusBar`, ocupando la sección central de la barra de estado:

```vue
<VxvStatusBar>
  <template #center>
    <VxvActionTimer 
      :action="currentAction" 
      :duration="actionDuration" 
      :elapsed="actionElapsed" 
    />
  </template>
</VxvStatusBar>
```

Esta integración proporciona a los jugadores una visualización clara de las acciones en curso y el tiempo restante, mejorando la experiencia de usuario en el juego.

### Ejemplo Completo con VxvStatusBar

```vue
<template>
  <div class="game-container">
    <!-- Contenido del juego -->
    
    <VxvStatusBar>
      <template #left>
        <div class="flex items-center space-x-2">
          <span class="text-blue-400">Sistema:</span>
          <span>{{ currentSystem }}</span>
        </div>
      </template>
      
      <template #center>
        <VxvActionTimer 
          v-if="isActionInProgress"
          :action="currentAction" 
          :duration="actionDuration" 
          :elapsed="actionElapsed" 
          @complete="handleActionComplete"
        />
        <span v-else>Esperando órdenes...</span>
      </template>
      
      <template #right>
        <div class="flex items-center space-x-2">
          <span class="text-blue-400">Créditos:</span>
          <span>{{ formatCredits(credits) }} ISK</span>
        </div>
      </template>
    </VxvStatusBar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VxvStatusBar from '@/components/ui/layout/VxvStatusBar.vue';
import VxvActionTimer from '@/components/ui/feedback/VxvActionTimer.vue';

const currentSystem = ref('Jita');
const credits = ref(10000);
const currentAction = ref('');
const actionDuration = ref(0);
const actionElapsed = ref(0);
const isActionInProgress = computed(() => currentAction.value !== '');

const formatCredits = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const handleActionComplete = () => {
  // Lógica para manejar la finalización de la acción
  currentAction.value = '';
  actionDuration.value = 0;
  actionElapsed.value = 0;
};
</script>
```
