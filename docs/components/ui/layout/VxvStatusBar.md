# VxvStatusBar

El componente `VxvStatusBar` proporciona una barra de estado flotante en la parte inferior de la pantalla, que muestra información del sistema y un temporizador de acción. La barra se adapta inteligentemente a la posición del footer.

## Importación

```javascript
import VxvStatusBar from '@/components/ui/layout/VxvStatusBar.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `showActionTimer` | `Boolean` | `true` | Si se debe mostrar el temporizador de acción |
| `timerDuration` | `Number` | `60` | Duración del temporizador en segundos |
| `timerRemainingTime` | `Number` | `null` | Tiempo restante del temporizador (si es null, se usa timerDuration) |
| `timerAction` | `String` | `'Cargando...'` | Texto que describe la acción actual del temporizador |
| `timerIsActive` | `Boolean` | `true` | Si el temporizador está activo |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `timer-complete` | - | Se emite cuando el temporizador llega a cero |
| `update:timer-remaining-time` | `(time: Number)` | Se emite cuando cambia el tiempo restante del temporizador |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `left` | Contenido para la sección izquierda de la barra |
| `center` | Contenido para la sección central de la barra (reemplaza el temporizador) |
| `right` | Contenido para la sección derecha de la barra |

## Ejemplos de Uso

### Barra de estado básica

```vue
<VxvStatusBar />
```

### Barra de estado con temporizador personalizado

```vue
<VxvStatusBar 
  :timerDuration="120" 
  timerAction="Sincronizando datos..." 
  :timerIsActive="isSyncing" 
  @timer-complete="onSyncComplete" 
/>
```

### Barra de estado con contenido personalizado

```vue
<VxvStatusBar :showActionTimer="false">
  <template #left>
    <div class="status-item">
      <span class="status-label">Servidor:</span>
      <span class="status-value">Alpha-1</span>
    </div>
  </template>
  
  <template #center>
    <div class="flex items-center space-x-2">
      <div class="w-3 h-3 rounded-full bg-green-500"></div>
      <span class="text-sm text-white">Sistema operativo</span>
    </div>
  </template>
  
  <template #right>
    <div class="status-item">
      <span class="status-label">Jugadores:</span>
      <span class="status-value">1,245</span>
    </div>
  </template>
</VxvStatusBar>
```

### Barra de estado con temporizador y contenido adicional

```vue
<VxvStatusBar 
  :timerDuration="30" 
  timerAction="Próximo salto en" 
  @timer-complete="onJumpComplete"
>
  <template #left>
    <div class="status-item">
      <span class="status-label">Sistema:</span>
      <span class="status-value">Orión Prime</span>
    </div>
  </template>
  
  <template #right>
    <div class="status-item">
      <span class="status-label">Destino:</span>
      <span class="status-value">Sirio Alpha</span>
    </div>
  </template>
</VxvStatusBar>
```

## Comportamiento

El componente `VxvStatusBar` tiene un comportamiento inteligente para adaptarse a diferentes situaciones:

1. **Modo Flotante**: Por defecto, la barra se mantiene fija en la parte inferior de la ventana, flotando sobre el contenido.

2. **Acoplamiento al Footer**: Cuando el usuario hace scroll y el footer de la página se vuelve visible, la barra se "acopla" justo encima del footer para evitar superponerse a él.

3. **Páginas Cortas**: En páginas donde todo el contenido cabe en la ventana sin scroll, la barra se posiciona automáticamente encima del footer.

## Notas de Uso

- La barra de estado está diseñada para mostrar información importante del sistema y acciones en curso.
- El componente utiliza `VxvActionTimer` para mostrar un temporizador de cuenta regresiva en la sección central.
- La barra se adapta automáticamente a diferentes tamaños de pantalla, ocultando las etiquetas en pantallas pequeñas.
- El componente detecta automáticamente la posición del footer para evitar superponerse a él.
- Para un funcionamiento óptimo, asegúrate de que tu aplicación tenga un elemento `<footer>` o un elemento con la clase `.footer` o `.app-footer`.
- La barra tiene un z-index alto (50) para asegurarse de que esté por encima de otros elementos.
- El componente utiliza varios observadores (ResizeObserver, MutationObserver) para detectar cambios en el layout y ajustar su posición en consecuencia.
- En dispositivos móviles, la barra se simplifica para mostrar solo la información esencial.
