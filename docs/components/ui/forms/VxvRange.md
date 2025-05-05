# VxvRange

El componente `VxvRange` proporciona un control deslizante (slider) personalizado con soporte para mostrar valores mínimos, máximos y actuales, así como tooltips y formateo personalizado.

## Importación

```javascript
import VxvRange from '@/components/ui/forms/VxvRange.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `Number, String` | `0` | Valor del control deslizante (para v-model) |
| `label` | `String` | `''` | Etiqueta para el control deslizante |
| `min` | `Number, String` | `0` | Valor mínimo |
| `max` | `Number, String` | `100` | Valor máximo |
| `step` | `Number, String` | `1` | Incremento del control deslizante |
| `id` | `String` | `null` | Atributo id (se genera automáticamente si no se proporciona) |
| `disabled` | `Boolean` | `false` | Si el control deslizante está deshabilitado |
| `required` | `Boolean` | `false` | Si el control deslizante es obligatorio |
| `error` | `String` | `''` | Mensaje de error a mostrar |
| `hint` | `String` | `''` | Texto de ayuda a mostrar (no se muestra si hay error) |
| `rangeClass` | `String` | `''` | Clases adicionales para el control deslizante |
| `labelClass` | `String` | `''` | Clases adicionales para la etiqueta |
| `showMinMax` | `Boolean` | `false` | Si se deben mostrar los valores mínimo y máximo |
| `showValue` | `Boolean` | `true` | Si se debe mostrar el valor actual |
| `showTooltip` | `Boolean` | `false` | Si se debe mostrar un tooltip con el valor actual |
| `formatValue` | `Function` | `null` | Función para formatear el valor actual |
| `formatMin` | `Function` | `null` | Función para formatear el valor mínimo |
| `formatMax` | `Function` | `null` | Función para formatear el valor máximo |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:modelValue` | `(value: Number)` | Se emite cuando cambia el valor del control deslizante |
| `change` | `(value: String)` | Se emite cuando se completa un cambio en el control deslizante |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `label` | Contenido personalizado para la etiqueta |
| `error` | Contenido personalizado para el mensaje de error |
| `hint` | Contenido personalizado para el texto de ayuda |

## Ejemplos de Uso

### Control deslizante básico

```vue
<VxvRange v-model="value" label="Volumen" />
```

### Control deslizante con valores mínimo y máximo

```vue
<VxvRange 
  v-model="price" 
  label="Precio" 
  :min="10" 
  :max="1000" 
  :step="10" 
  :showMinMax="true" 
/>
```

### Control deslizante con tooltip

```vue
<VxvRange 
  v-model="opacity" 
  label="Opacidad" 
  :min="0" 
  :max="1" 
  :step="0.01" 
  :showTooltip="true" 
/>
```

### Control deslizante con formateo personalizado

```vue
<VxvRange 
  v-model="price" 
  label="Precio" 
  :min="0" 
  :max="1000" 
  :step="10" 
  :showMinMax="true" 
  :formatValue="value => `$${value}`"
  :formatMin="min => `$${min}`"
  :formatMax="max => `$${max}`"
/>
```

### Control deslizante deshabilitado

```vue
<VxvRange 
  v-model="value" 
  label="Valor bloqueado" 
  :disabled="true" 
/>
```

### Control deslizante con mensaje de error

```vue
<VxvRange 
  v-model="value" 
  label="Valor" 
  error="Por favor, selecciona un valor mayor" 
/>
```

## Notas de Uso

- El componente tiene un estilo personalizado para el control deslizante que es consistente con el tema oscuro de la aplicación.
- El control deslizante tiene un efecto de brillo azul cuando está enfocado.
- Si se establece `required` a `true`, se mostrará un asterisco rojo junto a la etiqueta.
- El componente aplica automáticamente estilos de error cuando se proporciona un mensaje de error.
- El texto de ayuda (`hint`) no se muestra si hay un mensaje de error.
- El tooltip se posiciona automáticamente según el valor actual del control deslizante.
- Las funciones de formateo permiten personalizar cómo se muestran los valores (por ejemplo, añadir símbolos de moneda o unidades).
- El componente genera automáticamente un ID único si no se proporciona uno, lo que garantiza que la etiqueta esté correctamente asociada al control deslizante.
- El valor se emite como número, incluso si se proporciona como cadena.
