# VxvTextarea

El componente `VxvTextarea` es un componente de formulario para áreas de texto con soporte para etiquetas, mensajes de error y texto de ayuda.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| id | String | *Requerido* | ID único del textarea |
| modelValue | String | `''` | Valor del textarea (para v-model) |
| label | String | `''` | Etiqueta del textarea |
| labelClass | String | `'text-white font-medium'` | Clases CSS adicionales para la etiqueta |
| helpText | String | `''` | Texto de ayuda que se muestra debajo del textarea |
| error | String | `''` | Mensaje de error que se muestra debajo del textarea |
| placeholder | String | `''` | Texto de placeholder |
| rows | Number | `3` | Número de filas del textarea |
| disabled | Boolean | `false` | Si el textarea está deshabilitado |
| required | Boolean | `false` | Si el textarea es requerido |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| update:modelValue | `value: string` | Se emite cuando el valor del textarea cambia |
| blur | - | Se emite cuando el textarea pierde el foco |

## Uso básico

```vue
<template>
  <VxvTextarea
    id="description"
    v-model="description"
    label="Descripción"
    placeholder="Ingrese una descripción"
    :error="errors.description"
    @blur="validateDescription"
  />
</template>

<script setup>
import { ref } from 'vue';
import VxvTextarea from '@/components/ui/forms/VxvTextarea.vue';

const description = ref('');
const errors = ref({
  description: ''
});

const validateDescription = () => {
  if (!description.value) {
    errors.value.description = 'La descripción es requerida';
  } else if (description.value.length < 10) {
    errors.value.description = 'La descripción debe tener al menos 10 caracteres';
  } else {
    errors.value.description = '';
  }
};
</script>
```

## Con texto de ayuda

```vue
<VxvTextarea
  id="description"
  v-model="description"
  label="Descripción"
  helpText="Máximo 500 caracteres"
  :error="errors.description"
/>
```

## Con número de filas personalizado

```vue
<VxvTextarea
  id="description"
  v-model="description"
  label="Descripción"
  :rows="5"
/>
```

## Deshabilitado

```vue
<VxvTextarea
  id="description"
  v-model="description"
  label="Descripción"
  disabled
/>
```

## Con clases personalizadas para la etiqueta

```vue
<VxvTextarea
  id="description"
  v-model="description"
  label="Descripción"
  labelClass="text-lg font-bold text-white"
/>
```
