# VxvStatusBar

El componente `VxvStatusBar` es una barra de estado que se coloca encima del footer y es visible en todas las páginas de la aplicación. Proporciona un espacio para mostrar información de estado y un cronómetro de acción en el centro.

## Características

- Barra de estado visible en todas las páginas
- Tres secciones: izquierda, centro y derecha
- Sección central con un cronómetro de acción (`VxvActionTimer`)
- Secciones laterales personalizables para mostrar información de estado
- Diseño responsivo que se adapta a diferentes tamaños de pantalla

## Uso básico

```vue
<template>
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
</template>

<script setup>
import { ref } from 'vue';
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
</script>
```

## Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `showActionTimer` | `Boolean` | `true` | Si se debe mostrar el cronómetro de acción en el centro |
| `timerDuration` | `Number` | `60` | Duración total del cronómetro en segundos |
| `timerRemainingTime` | `Number` | `null` | Tiempo restante en segundos. Si es null, se usa `timerDuration` |
| `timerAction` | `String` | `'Cargando...'` | Texto que describe la acción en curso |
| `timerIsActive` | `Boolean` | `true` | Si el cronómetro está activo y contando |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `timer-complete` | - | Se emite cuando el cronómetro llega a cero |
| `update:timer-remaining-time` | `(time: number)` | Se emite cuando cambia el tiempo restante |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `left` | Contenido para la sección izquierda de la barra de estado |
| `center` | Contenido para la sección central (reemplaza el cronómetro de acción si se proporciona) |
| `right` | Contenido para la sección derecha de la barra de estado |

## Integración en la aplicación

El componente `VxvStatusBar` está diseñado para ser colocado justo encima del footer en el layout principal de la aplicación:

```vue
<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <AppHeader />
    
    <main class="flex-grow">
      <RouterView />
    </main>
    
    <VxvStatusBar
      :timer-duration="timerDuration"
      :timer-remaining-time="timerRemainingTime"
      :timer-action="timerAction"
      :timer-is-active="timerIsActive"
      @timer-complete="onTimerComplete"
      @update:timer-remaining-time="updateTimerRemainingTime"
    >
      <!-- Contenido personalizado para las secciones -->
    </VxvStatusBar>
    
    <AppFooter />
  </div>
</template>
```

## Personalización

El componente `VxvStatusBar` está diseñado para adaptarse al tema visual de la aplicación. Los colores principales son:

- Fondo de la barra: `#1f2937` (gray-800)
- Borde superior: `#374151` (gray-700)
- Etiquetas de estado: `#9ca3af` (gray-400)
- Valores de estado: `#e5e7eb` (gray-200)

Si necesitas personalizar estos colores, puedes hacerlo mediante CSS personalizado o modificando directamente el componente.

## Ejemplos de uso

### Mostrar información de créditos y ubicación

```vue
<VxvStatusBar>
  <template #left>
    <div class="status-item">
      <span class="status-label">Créditos:</span>
      <span class="status-value">1,250,000 ISK</span>
    </div>
  </template>
  
  <template #right>
    <div class="status-item">
      <span class="status-label">Sistema:</span>
      <span class="status-value">Alpha Centauri</span>
    </div>
  </template>
</VxvStatusBar>
```

### Mostrar información de nave y velocidad

```vue
<VxvStatusBar>
  <template #left>
    <div class="status-item">
      <span class="status-label">Nave:</span>
      <span class="status-value">Viper Mk II</span>
    </div>
  </template>
  
  <template #right>
    <div class="status-item">
      <span class="status-label">Velocidad:</span>
      <span class="status-value">1,200 m/s</span>
    </div>
  </template>
</VxvStatusBar>
```

### Personalizar el contenido central

```vue
<VxvStatusBar :show-action-timer="false">
  <template #center>
    <div class="custom-center">
      <span class="alert-text">¡Alerta de proximidad!</span>
    </div>
  </template>
</VxvStatusBar>
```

## Consideraciones de diseño

- El componente está diseñado para ser visible en todas las vistas de la aplicación
- En pantallas pequeñas, las etiquetas de estado se ocultan para ahorrar espacio
- El cronómetro de acción en el centro es el elemento principal de la barra
- Las secciones laterales son flexibles y pueden contener múltiples elementos
- El componente tiene una altura fija de 3rem (48px) para mantener la consistencia visual
