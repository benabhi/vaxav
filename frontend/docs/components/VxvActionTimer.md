# VxvActionTimer

El componente `VxvActionTimer` es un cronómetro con barra de progreso horizontal que muestra una acción en curso y el tiempo restante para completarla. Está diseñado para ser utilizado dentro del componente `VxvStatusBar`.

## Características

- Barra de progreso horizontal que se va llenando a medida que pasa el tiempo
- Cambia de color gradualmente, tornándose más azul a medida que se acerca a completarse
- Muestra la acción actual y el tiempo restante
- Personalizable en términos de duración, acción y estado activo/inactivo
- Emite eventos cuando se completa el cronómetro o cuando cambia el tiempo restante

## Uso básico

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

## Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `duration` | `Number` | `60` | Duración total del cronómetro en segundos |
| `remainingTime` | `Number` | `null` | Tiempo restante en segundos. Si es null, se usa `duration` |
| `action` | `String` | `'Cargando...'` | Texto que describe la acción en curso |
| `isActive` | `Boolean` | `true` | Si el cronómetro está activo y contando |
| `autoStart` | `Boolean` | `true` | Si el cronómetro debe iniciar automáticamente al montar el componente |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `complete` | - | Se emite cuando el cronómetro llega a cero |
| `update:remaining-time` | `(time: number)` | Se emite cuando cambia el tiempo restante |

## Métodos expuestos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `startTimer` | - | Inicia el cronómetro |
| `stopTimer` | - | Detiene el cronómetro |
| `resetTimer` | - | Reinicia el cronómetro a la duración inicial |

## Uso con VxvStatusBar

El componente `VxvActionTimer` está diseñado para ser utilizado dentro del componente `VxvStatusBar`, que proporciona un contenedor para mostrar información de estado en la aplicación:

```vue
<template>
  <div class="app-container">
    <AppHeader />
    <main>
      <!-- Contenido principal -->
    </main>

    <VxvStatusBar
      :timer-duration="timerDuration"
      :timer-remaining-time="timerRemainingTime"
      :timer-action="timerAction"
      :timer-is-active="timerIsActive"
      @timer-complete="onTimerComplete"
      @update:timer-remaining-time="updateTimerRemainingTime"
    >
      <!-- Contenido personalizado para la sección izquierda -->
      <template #left>
        <div class="status-item">
          <span class="status-label">Créditos:</span>
          <span class="status-value">1,250,000 ISK</span>
        </div>
      </template>

      <!-- Contenido personalizado para la sección derecha -->
      <template #right>
        <div class="status-item">
          <span class="status-label">Sistema:</span>
          <span class="status-value">Alpha Centauri</span>
        </div>
      </template>
    </VxvStatusBar>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import VxvStatusBar from '@/components/ui/layout/VxvStatusBar.vue';

const timerDuration = ref(300); // 5 minutos
const timerRemainingTime = ref(300);
const timerAction = ref('Navegando');
const timerIsActive = ref(true);

const onTimerComplete = () => {
  console.log('Cronómetro completado');
};

const updateTimerRemainingTime = (time) => {
  timerRemainingTime.value = time;
};

// Método para iniciar un nuevo cronómetro con una acción específica
const startActionTimer = (action, duration = 300) => {
  timerAction.value = action;
  timerDuration.value = duration;
  timerRemainingTime.value = duration;
  timerIsActive.value = true;
};
</script>
```

## Personalización

El componente `VxvActionTimer` está diseñado para adaptarse al tema visual de la aplicación. Los colores principales son:

- Fondo del contenedor: `#111827` (gray-900)
- Fondo de la barra: `#1f2937` (gray-800)
- Barra de progreso (< 25%): `#93c5fd` (blue-300)
- Barra de progreso (25-50%): `#60a5fa` (blue-400)
- Barra de progreso (50-75%): `#3b82f6` (blue-500)
- Barra de progreso (75-90%): `#2563eb` (blue-600)
- Barra de progreso (> 90%): `#1d4ed8` (blue-700)
- Barra de progreso inactiva: `#4b5563` (gray-600)
- Texto de acción: `#f3f4f6` (gray-100)
- Texto de tiempo: `#ffffff` (white)

La barra de progreso cambia de color gradualmente, tornándose más azul a medida que se acerca a completarse. Esto proporciona una indicación visual adicional del progreso.

Si necesitas personalizar estos colores, puedes hacerlo mediante CSS personalizado o modificando la función `getProgressColor` en el componente.

## Ejemplo de uso en diferentes contextos

### Carga de datos

```javascript
// Al iniciar una carga de datos
startActionTimer('Cargando datos', 30);

// Al completar la carga
timerIsActive.value = false;
```

### Procesamiento de transacciones

```javascript
// Al iniciar una transacción
startActionTimer('Procesando transacción', 60);

// Al completar la transacción
timerIsActive.value = false;
```

### Navegación entre sistemas

```javascript
// Al iniciar un viaje entre sistemas
startActionTimer('Viajando a Alpha Centauri', 180);

// Al llegar al destino
timerIsActive.value = false;
```

## Consideraciones de diseño

- El componente está diseñado para ser utilizado dentro del `VxvStatusBar`
- La barra de progreso se va llenando de izquierda a derecha y cambia de color gradualmente
- El texto de la acción se trunca automáticamente si es demasiado largo
- El texto tiene sombras para mejorar la legibilidad sobre la barra de progreso
- El componente se adapta a diferentes tamaños de pantalla, reduciendo el tamaño del texto en pantallas pequeñas
