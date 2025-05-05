# VxvInput

El componente `VxvInput` proporciona un campo de entrada de texto personalizado con soporte para diferentes tamaños, estados, iconos y validación.

## Importación

```javascript
import VxvInput from '@/components/ui/forms/VxvInput.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `String, Number` | `''` | Valor del input (para v-model) |
| `label` | `String` | `''` | Etiqueta para el input |
| `placeholder` | `String` | `''` | Texto de placeholder |
| `type` | `String` | `'text'` | Tipo de input (text, password, email, etc.) |
| `id` | `String` | `null` | Atributo id (se genera automáticamente si no se proporciona) |
| `name` | `String` | `''` | Atributo name del input |
| `disabled` | `Boolean` | `false` | Si el input está deshabilitado |
| `readonly` | `Boolean` | `false` | Si el input es de solo lectura |
| `required` | `Boolean` | `false` | Si el input es obligatorio |
| `error` | `String` | `''` | Mensaje de error a mostrar |
| `hint` | `String` | `''` | Texto de ayuda a mostrar (no se muestra si hay error) |
| `autocomplete` | `String` | `'off'` | Valor para el atributo autocomplete |
| `size` | `String` | `'md'` | Tamaño del input. Opciones: `'sm'`, `'md'`, `'lg'` |
| `prefixIcon` | `Boolean` | `false` | Si se debe mostrar un icono al inicio del input |
| `suffixIcon` | `Boolean` | `false` | Si se debe mostrar un icono al final del input |
| `labelClass` | `String` | `''` | Clases adicionales para la etiqueta |
| `inputClass` | `String` | `''` | Clases adicionales para el input |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:modelValue` | `(value: String \| Number)` | Se emite cuando cambia el valor del input |
| `focus` | `(event: FocusEvent)` | Se emite cuando el input recibe el foco |
| `blur` | `(event: FocusEvent)` | Se emite cuando el input pierde el foco |
| `input` | `(event: InputEvent)` | Se emite cuando se introduce texto en el input |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `label` | Contenido personalizado para la etiqueta |
| `prefix` | Contenido personalizado para el prefijo (icono o texto al inicio) |
| `suffix` | Contenido personalizado para el sufijo (icono o texto al final) |
| `error` | Contenido personalizado para el mensaje de error |
| `hint` | Contenido personalizado para el texto de ayuda |

## Ejemplos de Uso

### Input básico

```vue
<VxvInput v-model="username" label="Nombre de usuario" placeholder="Introduce tu nombre de usuario" />
```

### Input con error

```vue
<VxvInput 
  v-model="email" 
  label="Correo electrónico" 
  type="email" 
  error="Por favor, introduce un correo electrónico válido" 
  required 
/>
```

### Input con texto de ayuda

```vue
<VxvInput 
  v-model="password" 
  label="Contraseña" 
  type="password" 
  hint="La contraseña debe tener al menos 8 caracteres" 
  required 
/>
```

### Input con icono prefijo

```vue
<VxvInput 
  v-model="search" 
  placeholder="Buscar..." 
  :prefixIcon="true"
>
  <template #prefix>
    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </template>
</VxvInput>
```

### Input con icono sufijo

```vue
<VxvInput 
  v-model="password" 
  type="password" 
  label="Contraseña" 
  :suffixIcon="true"
>
  <template #suffix>
    <svg class="h-5 w-5 text-gray-400 cursor-pointer" @click="togglePasswordVisibility" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  </template>
</VxvInput>
```

### Input con tamaño personalizado

```vue
<VxvInput 
  v-model="name" 
  label="Nombre" 
  size="lg" 
  placeholder="Introduce tu nombre completo" 
/>
```

## Notas de Uso

- El componente tiene una altura estándar para cada tamaño:
  - `sm`: ~32px de altura total con bordes
  - `md`: 38px de altura total con bordes (estándar, coincide con VxvButton)
  - `lg`: ~42px de altura total con bordes
- Si se establece `required` a `true`, se mostrará un asterisco rojo junto a la etiqueta.
- El componente aplica automáticamente estilos de error cuando se proporciona un mensaje de error.
- El texto de ayuda (`hint`) no se muestra si hay un mensaje de error.
- Se puede personalizar la apariencia del input y la etiqueta mediante las propiedades `inputClass` y `labelClass`.
- El componente genera automáticamente un ID único si no se proporciona uno, lo que garantiza que la etiqueta esté correctamente asociada al input.
- Los slots `prefix` y `suffix` permiten añadir iconos o texto adicional al inicio o final del input.
