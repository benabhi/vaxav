# VxvStatusBar

El componente `VxvStatusBar` es una barra de estado que se muestra en la parte inferior de la pantalla y proporciona información contextual sobre el estado actual del juego.

## Índice

1. [Descripción](#descripción)
2. [Uso](#uso)
3. [Props](#props)
4. [Eventos](#eventos)
5. [Slots](#slots)
6. [Ejemplos](#ejemplos)
7. [Integración con VxvActionTimer](#integración-con-vxvactiontimer)

## Descripción

`VxvStatusBar` es un componente que flota en la parte inferior de la pantalla y muestra información de estado relevante para el jugador. Se adhiere automáticamente al footer cuando este se vuelve visible, proporcionando una experiencia de usuario fluida.

El componente está diseñado para mostrar:
- Información de ubicación actual
- Estado de la nave
- Recursos disponibles
- Acciones en curso
- Mensajes del sistema

## Uso

```vue
<template>
  <VxvStatusBar>
    <template #left>
      <div class="flex items-center space-x-2">
        <span class="text-blue-400">Sistema:</span>
        <span>Jita</span>
      </div>
    </template>
    
    <template #center>
      <VxvActionTimer 
        :action="currentAction" 
        :duration="actionDuration" 
        :elapsed="actionElapsed" 
      />
    </template>
    
    <template #right>
      <div class="flex items-center space-x-2">
        <span class="text-blue-400">Créditos:</span>
        <span>10,000 ISK</span>
      </div>
    </template>
  </VxvStatusBar>
</template>

<script setup>
import { ref } from 'vue';
import VxvStatusBar from '@/components/ui/layout/VxvStatusBar.vue';
import VxvActionTimer from '@/components/ui/feedback/VxvActionTimer.vue';

const currentAction = ref('Minando Asteroides');
const actionDuration = ref(600); // 10 minutos en segundos
const actionElapsed = ref(120); // 2 minutos transcurridos
</script>
```

## Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `docked` | `Boolean` | `false` | Indica si la barra de estado está acoplada al footer |
| `height` | `Number` | `40` | Altura de la barra de estado en píxeles |
| `bgColor` | `String` | `'bg-gray-900'` | Clase de color de fondo |
| `textColor` | `String` | `'text-gray-200'` | Clase de color de texto |
| `borderColor` | `String` | `'border-gray-700'` | Clase de color de borde |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `dock` | `{ docked: Boolean }` | Se emite cuando la barra de estado se acopla o desacopla del footer |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `left` | Contenido que se muestra en la parte izquierda de la barra de estado |
| `center` | Contenido que se muestra en el centro de la barra de estado |
| `right` | Contenido que se muestra en la parte derecha de la barra de estado |
| `default` | Contenido principal (si no se utilizan los slots específicos) |

## Ejemplos

### Barra de Estado Básica

```vue
<VxvStatusBar>
  <div class="flex justify-between w-full px-4">
    <div>Ubicación: Jita</div>
    <div>Nave: Viper</div>
    <div>Créditos: 10,000 ISK</div>
  </div>
</VxvStatusBar>
```

### Barra de Estado con Secciones

```vue
<VxvStatusBar>
  <template #left>
    <div class="flex items-center space-x-2">
      <span class="text-blue-400">Sistema:</span>
      <span>Jita</span>
    </div>
  </template>
  
  <template #center>
    <div class="flex items-center space-x-2">
      <span class="text-blue-400">Nave:</span>
      <span>Viper</span>
      <span class="text-green-400">100%</span>
    </div>
  </template>
  
  <template #right>
    <div class="flex items-center space-x-2">
      <span class="text-blue-400">Créditos:</span>
      <span>10,000 ISK</span>
    </div>
  </template>
</VxvStatusBar>
```

### Barra de Estado con Colores Personalizados

```vue
<VxvStatusBar
  bg-color="bg-blue-900"
  text-color="text-blue-100"
  border-color="border-blue-700"
>
  <div class="flex justify-between w-full px-4">
    <div>Ubicación: Jita</div>
    <div>Nave: Viper</div>
    <div>Créditos: 10,000 ISK</div>
  </div>
</VxvStatusBar>
```

## Integración con VxvActionTimer

El componente `VxvStatusBar` está diseñado para integrarse perfectamente con el componente `VxvActionTimer`, que muestra una acción en curso con un temporizador visual:

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

Esta integración proporciona a los jugadores información visual sobre las acciones en curso y el tiempo restante, mejorando la experiencia de usuario en el juego.
