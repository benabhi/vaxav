# VxvCheckbox

El componente `VxvCheckbox` proporciona un control de casilla de verificación personalizado con soporte para validación, estados de error y uso en grupos.

## Importación

```javascript
import VxvCheckbox from '@/components/ui/forms/VxvCheckbox.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `Boolean, Array` | `false` | Valor del checkbox (para v-model) |
| `value` | `String, Number, Boolean, Object` | `true` | Valor cuando se usa en un grupo |
| `label` | `String` | `''` | Etiqueta para el checkbox |
| `name` | `String` | `''` | Atributo name del checkbox |
| `id` | `String` | `null` | Atributo id (se genera automáticamente si no se proporciona) |
| `disabled` | `Boolean` | `false` | Si el checkbox está deshabilitado |
| `required` | `Boolean` | `false` | Si el checkbox es obligatorio |
| `error` | `String` | `''` | Mensaje de error a mostrar |
| `checkboxClass` | `String` | `''` | Clases adicionales para el checkbox |
| `labelClass` | `String` | `''` | Clases adicionales para la etiqueta |
| `indeterminate` | `Boolean` | `false` | Si el checkbox está en estado indeterminado |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:modelValue` | `(value: Boolean \| Array)` | Se emite cuando cambia el valor del checkbox |
| `change` | `(checked: Boolean)` | Se emite cuando el usuario cambia el estado del checkbox |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido personalizado para la etiqueta |
| `error` | Contenido personalizado para el mensaje de error |

## Ejemplos de Uso

### Checkbox básico

```vue
<VxvCheckbox v-model="isChecked" label="Acepto los términos y condiciones" />
```

### Checkbox con estado de error

```vue
<VxvCheckbox 
  v-model="isChecked" 
  label="Acepto los términos y condiciones" 
  error="Debes aceptar los términos para continuar" 
  required 
/>
```

### Checkbox deshabilitado

```vue
<VxvCheckbox 
  v-model="isChecked" 
  label="Opción no disponible" 
  disabled 
/>
```

### Grupo de checkboxes

```vue
<VxvCheckbox 
  v-model="selectedOptions" 
  value="option1" 
  label="Opción 1" 
/>
<VxvCheckbox 
  v-model="selectedOptions" 
  value="option2" 
  label="Opción 2" 
/>
<VxvCheckbox 
  v-model="selectedOptions" 
  value="option3" 
  label="Opción 3" 
/>
```

```javascript
// En el script
const selectedOptions = ref([]);
```

### Checkbox con contenido personalizado

```vue
<VxvCheckbox v-model="isChecked">
  Acepto los <a href="/terms" class="text-blue-400 hover:underline">términos y condiciones</a>
</VxvCheckbox>
```

### Checkbox con mensaje de error personalizado

```vue
<VxvCheckbox v-model="isChecked" label="Acepto los términos" required>
  <template #error>
    <span class="flex items-center">
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <!-- SVG path -->
      </svg>
      Por favor, acepta los términos para continuar
    </span>
  </template>
</VxvCheckbox>
```

## Notas de Uso

- El componente soporta tanto checkboxes individuales (con `modelValue` como booleano) como grupos de checkboxes (con `modelValue` como array).
- Para grupos de checkboxes, el valor de cada checkbox se añade o elimina del array `modelValue` según se seleccione o deseleccione.
- Si se establece `required` a `true`, se mostrará un asterisco rojo junto a la etiqueta.
- El componente aplica automáticamente estilos de error cuando se proporciona un mensaje de error.
- Se puede personalizar la apariencia del checkbox y la etiqueta mediante las propiedades `checkboxClass` y `labelClass`.
- El componente genera automáticamente un ID único si no se proporciona uno, lo que garantiza que la etiqueta esté correctamente asociada al checkbox.
- El estado indeterminado (`indeterminate`) es útil para representar un estado "parcialmente seleccionado" en jerarquías de checkboxes.
