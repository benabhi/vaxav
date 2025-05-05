# VxvSelect

El componente `VxvSelect` proporciona un control de selección desplegable personalizado con soporte para opciones simples y complejas, validación y estados de error.

## Importación

```javascript
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `String, Number, Array` | `''` | Valor del select (para v-model) |
| `label` | `String` | `''` | Etiqueta para el select |
| `placeholder` | `String` | `''` | Texto de placeholder (crea una opción deshabilitada) |
| `name` | `String` | `''` | Atributo name del select |
| `id` | `String` | `null` | Atributo id (se genera automáticamente si no se proporciona) |
| `disabled` | `Boolean` | `false` | Si el select está deshabilitado |
| `required` | `Boolean` | `false` | Si el select es obligatorio |
| `multiple` | `Boolean` | `false` | Si se pueden seleccionar múltiples opciones |
| `error` | `String` | `''` | Mensaje de error a mostrar |
| `hint` | `String` | `''` | Texto de ayuda a mostrar (no se muestra si hay error) |
| `size` | `String` | `'md'` | Tamaño del select. Opciones: `'sm'`, `'md'`, `'lg'` |
| `selectClass` | `String` | `''` | Clases adicionales para el select |
| `labelClass` | `String` | `''` | Clases adicionales para la etiqueta |
| `options` | `Array` | `[]` | Array de opciones para el select |
| `valueKey` | `String` | `'value'` | Clave a usar para los valores de las opciones cuando son objetos |
| `labelKey` | `String` | `'label'` | Clave a usar para las etiquetas de las opciones cuando son objetos |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:modelValue` | `(value: String \| Number \| Array)` | Se emite cuando cambia el valor del select |
| `focus` | `(event: FocusEvent)` | Se emite cuando el select recibe el foco |
| `blur` | `(event: FocusEvent)` | Se emite cuando el select pierde el foco |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido personalizado para las opciones del select |
| `label` | Contenido personalizado para la etiqueta |
| `error` | Contenido personalizado para el mensaje de error |
| `hint` | Contenido personalizado para el texto de ayuda |

## Ejemplos de Uso

### Select básico

```vue
<VxvSelect 
  v-model="selectedOption" 
  label="Selecciona una opción" 
  placeholder="Selecciona..." 
  :options="['Opción 1', 'Opción 2', 'Opción 3']" 
/>
```

### Select con opciones como objetos

```vue
<VxvSelect 
  v-model="selectedCountry" 
  label="País" 
  placeholder="Selecciona un país" 
  :options="countries" 
  valueKey="code" 
  labelKey="name" 
/>
```

```javascript
// En el script
const countries = ref([
  { code: 'es', name: 'España' },
  { code: 'fr', name: 'Francia' },
  { code: 'de', name: 'Alemania' }
]);
```

### Select con error

```vue
<VxvSelect 
  v-model="selectedOption" 
  label="Selecciona una opción" 
  :options="options" 
  error="Por favor, selecciona una opción válida" 
  required 
/>
```

### Select con opciones personalizadas

```vue
<VxvSelect 
  v-model="selectedOption" 
  label="Selecciona una opción"
>
  <option value="" disabled>Selecciona una opción...</option>
  <option value="option1" class="text-green-400">Opción 1 (Recomendada)</option>
  <option value="option2">Opción 2</option>
  <option value="option3" class="text-yellow-400">Opción 3 (Beta)</option>
</VxvSelect>
```

### Select múltiple

```vue
<VxvSelect 
  v-model="selectedOptions" 
  label="Selecciona varias opciones" 
  :options="options" 
  :multiple="true" 
  size="lg" 
/>
```

### Select con tamaño personalizado

```vue
<VxvSelect 
  v-model="selectedOption" 
  label="Selecciona una opción" 
  :options="options" 
  size="lg" 
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
- Se puede personalizar la apariencia del select y la etiqueta mediante las propiedades `selectClass` y `labelClass`.
- El componente genera automáticamente un ID único si no se proporciona uno, lo que garantiza que la etiqueta esté correctamente asociada al select.
- El componente oculta la flecha nativa del select y proporciona su propia flecha personalizada.
- Para opciones simples, se puede proporcionar un array de strings o números.
- Para opciones complejas, se puede proporcionar un array de objetos y especificar las claves para los valores y etiquetas.
- Si se proporciona un `placeholder`, se creará una opción deshabilitada con ese texto.
