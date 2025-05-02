# Componentes de Timers

Los componentes de timers son utilizados para mostrar el tiempo restante para completar una acción o proceso.

## VxvActionTimer

El componente `VxvActionTimer` es un cronómetro con barra de progreso horizontal que muestra una acción en curso y el tiempo restante para completarla. Está diseñado para ser utilizado dentro del componente `VxvStatusBar`.

### Características

- Barra de progreso horizontal que se va llenando a medida que pasa el tiempo
- Cambia de color gradualmente, tornándose más azul a medida que se acerca a completarse
- Muestra la acción actual y el tiempo restante
- Personalizable en términos de duración, acción y estado activo/inactivo
- Emite eventos cuando se completa el cronómetro o cuando cambia el tiempo restante

### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `duration` | `Number` | `60` | Duración total del cronómetro en segundos |
| `remainingTime` | `Number` | `null` | Tiempo restante en segundos. Si es null, se usa `duration` |
| `action` | `String` | `'Cargando...'` | Texto que describe la acción en curso |
| `isActive` | `Boolean` | `true` | Si el cronómetro está activo y contando |
| `autoStart` | `Boolean` | `true` | Si el cronómetro debe iniciar automáticamente al montar el componente |

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `complete` | - | Se emite cuando el cronómetro llega a cero |
| `update:remaining-time` | `(time: number)` | Se emite cuando cambia el tiempo restante |

### Métodos expuestos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `startTimer` | - | Inicia el cronómetro |
| `stopTimer` | - | Detiene el cronómetro |
| `resetTimer` | - | Reinicia el cronómetro a la duración inicial |

### Ejemplo de uso

```vue
<template>
  <VxvActionTimer
    :duration="120"
    :remaining-time="remainingTime"
    :action="'Cargando datos'"
    :is-active="true"
    @complete="onTimerComplete"
    @update:remaining-time="updateRemainingTime"
  />
</template>

<script setup>
import { ref } from 'vue';
import VxvActionTimer from '@/components/ui/timers/VxvActionTimer.vue';

const remainingTime = ref(120);

const onTimerComplete = () => {
  console.log('Cronómetro completado');
  // Realizar acciones cuando el cronómetro llega a cero
};

const updateRemainingTime = (time) => {
  remainingTime.value = time;
};
</script>
```

### Documentación detallada

Para una documentación más detallada, consulta [VxvActionTimer](../../frontend/docs/components/VxvActionTimer.md).
