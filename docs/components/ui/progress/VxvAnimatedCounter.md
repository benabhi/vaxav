# VxvAnimatedCounter

El componente `VxvAnimatedCounter` muestra un número que se anima desde un valor inicial hasta un valor final, con opciones para personalizar la duración, el formato y otros aspectos de la animación.

## Importación

```javascript
import VxvAnimatedCounter from '@/components/ui/progress/VxvAnimatedCounter.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `initialValue` | `Number, String` | `0` | Valor inicial del contador |
| `finalValue` | `Number, String` | `0` | Valor final del contador |
| `duration` | `Number` | `1500` | Duración de la animación en milisegundos |
| `steps` | `Number` | `20` | Número de pasos para la animación |
| `prefix` | `String` | `''` | Prefijo para añadir antes del valor (ej: "$", "€") |
| `suffix` | `String` | `''` | Sufijo para añadir después del valor (ej: "XP", "%") |
| `inline` | `Boolean` | `true` | Si el contador debe ser un elemento en línea |
| `formatValue` | `Function` | `null` | Función para formatear el valor |
| `autoStart` | `Boolean` | `true` | Si la animación debe comenzar automáticamente |
| `isDecrement` | `Boolean` | `false` | Si la animación debe ser de incremento o decremento |
| `decimals` | `Number` | `0` | Número de decimales a mostrar |
| `thousandsSeparator` | `String` | `','` | Separador de miles |
| `decimalSeparator` | `String` | `'.'` | Separador decimal |
| `easing` | `String` | `'easeInOut'` | Tipo de curva de animación. Opciones: `'linear'`, `'easeIn'`, `'easeOut'`, `'easeInOut'` |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `complete` | - | Se emite cuando la animación se completa |
| `update:value` | `(value: number)` | Se emite cuando el valor del contador cambia durante la animación |

## Métodos Expuestos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `startAnimation` | - | Inicia la animación |
| `stopAnimation` | - | Detiene la animación |
| `resetAnimation` | - | Reinicia la animación |
| `isAnimating` | - | Devuelve si la animación está en curso |

## Ejemplos de Uso

### Contador básico

```vue
<VxvAnimatedCounter 
  :initialValue="0" 
  :finalValue="1000" 
/>
```

### Contador con prefijo y sufijo

```vue
<VxvAnimatedCounter 
  :initialValue="0" 
  :finalValue="1000" 
  prefix="$" 
  suffix=" XP" 
/>
```

### Contador con formato personalizado

```vue
<VxvAnimatedCounter 
  :initialValue="0" 
  :finalValue="1000000" 
  :formatValue="(value) => `${(value / 1000).toFixed(1)}K`" 
/>
```

### Contador con control manual

```vue
<template>
  <div>
    <VxvAnimatedCounter 
      ref="counter"
      :initialValue="0"
      :finalValue="1000"
      :autoStart="false"
    />
    <button @click="startCounter">Iniciar</button>
    <button @click="stopCounter">Detener</button>
    <button @click="resetCounter">Reiniciar</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const counter = ref(null);

function startCounter() {
  counter.value.startAnimation();
}

function stopCounter() {
  counter.value.stopAnimation();
}

function resetCounter() {
  counter.value.resetAnimation();
}
</script>
```

### Contador con diferentes curvas de animación

```vue
<VxvAnimatedCounter 
  :initialValue="0" 
  :finalValue="1000" 
  easing="easeOut" 
/>
```

## Notas de Uso

- Utiliza `formatValue` para personalizar la visualización de los valores, especialmente para números grandes o con unidades específicas.
- El componente observa cambios en `finalValue` y reinicia la animación automáticamente cuando cambia.
- Para controlar manualmente la animación, establece `autoStart` a `false` y utiliza los métodos expuestos.
- Las diferentes curvas de animación (`easing`) proporcionan diferentes efectos visuales para la animación.
