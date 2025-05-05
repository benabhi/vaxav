# Componentes de Formulario

Los componentes de formulario permiten a los usuarios ingresar, editar y enviar datos. Vaxav proporciona un conjunto completo de componentes de formulario que son accesibles, validables y fáciles de usar.

## Componentes Disponibles

### VxvInput

`VxvInput` es el componente base para campos de entrada de texto, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/VxvInput.vue`

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `[String, Number]` | `''` | Valor del campo (v-model) |
| `label` | `String` | `''` | Etiqueta del campo |
| `placeholder` | `String` | `''` | Texto de placeholder |
| `type` | `String` | `'text'` | Tipo de input HTML |
| `id` | `String` | Generado automáticamente | ID del campo |
| `name` | `String` | `''` | Nombre del campo para formularios |
| `disabled` | `Boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `Boolean` | `false` | Si el campo es de solo lectura |
| `required` | `Boolean` | `false` | Si el campo es requerido |
| `error` | `String` | `''` | Mensaje de error |
| `hint` | `String` | `''` | Texto de ayuda |
| `autocomplete` | `String` | `'off'` | Valor de autocompletado |
| `size` | `String` | `'md'` | Tamaño del campo (`'sm'`, `'md'`, `'lg'`) |
| `prefixIcon` | `Boolean` | `false` | Si tiene un icono de prefijo |
| `suffixIcon` | `Boolean` | `false` | Si tiene un icono de sufijo |
| `inputClass` | `String` | `''` | Clases CSS adicionales para el input |
| `labelClass` | `String` | `''` | Clases CSS adicionales para la etiqueta |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `prefix` | Contenido antes del campo (dentro) |
| `suffix` | Contenido después del campo (dentro) |
| `label` | Personalización de la etiqueta |
| `error` | Personalización del mensaje de error |
| `hint` | Personalización del texto de ayuda |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambia el valor |
| `focus` | Se emite cuando el campo recibe el foco |
| `blur` | Se emite cuando el campo pierde el foco |

#### Estilo

El componente `VxvInput` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro (`bg-gray-700`)
- Texto blanco (`text-white`)
- Bordes sutiles (`border-gray-600`)
- Enfoque azul (`focus:border-blue-500`)
- Mensajes de error en rojo (`text-red-500`)
- Textos de ayuda en gris claro (`text-gray-400`)

#### Ejemplos de Uso

**Input Básico**:
```vue
<vxv-input
  v-model="username"
  label="Nombre de usuario"
  placeholder="Ingrese su nombre de usuario"
/>
```

**Input con Error**:
```vue
<vxv-input
  v-model="email"
  label="Correo electrónico"
  type="email"
  :error="errors.email"
  required
/>
```

**Input con Icono**:
```vue
<vxv-input v-model="search" placeholder="Buscar...">
  <template #prefix>
    <SearchIcon class="w-5 h-5 text-gray-400" />
  </template>
</vxv-input>
```

**Input con Etiqueta Personalizada**:
```vue
<vxv-input v-model="form.name" labelClass="text-lg font-bold text-white">
  <template #label>
    Nombre <span class="text-blue-400">*</span>
  </template>
</vxv-input>
```

### VxvTextarea

`VxvTextarea` es un componente para campos de texto multilínea.

**Archivo**: `/components/ui/forms/VxvTextarea.vue`

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

#### Props

Hereda la mayoría de las props de `BaseInput` y añade:

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `rows` | `Number` | `3` | Número de filas |
| `maxRows` | `Number` | `null` | Número máximo de filas (para autoexpansión) |
| `resize` | `String` | `'vertical'` | Tipo de redimensionamiento (`'none'`, `'vertical'`, `'horizontal'`, `'both'`) |
| `autoExpand` | `Boolean` | `false` | Si el textarea debe expandirse automáticamente |

#### Ejemplos de Uso

```vue
<BaseTextarea
  v-model="description"
  label="Descripción"
  placeholder="Escribe una descripción..."
  :rows="5"
/>
```

### VxvSelect

`VxvSelect` es un componente para seleccionar opciones de una lista, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/VxvSelect.vue`

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `[String, Number, Array]` | `''` | Valor del select (v-model) |
| `label` | `String` | `''` | Etiqueta del select |
| `placeholder` | `String` | `''` | Texto de placeholder |
| `name` | `String` | `''` | Nombre del select para formularios |
| `id` | `String` | Generado automáticamente | ID del select |
| `disabled` | `Boolean` | `false` | Si el select está deshabilitado |
| `required` | `Boolean` | `false` | Si el select es requerido |
| `multiple` | `Boolean` | `false` | Si permite selección múltiple |
| `error` | `String` | `''` | Mensaje de error |
| `hint` | `String` | `''` | Texto de ayuda |
| `size` | `String` | `'md'` | Tamaño del select (`'sm'`, `'md'`, `'lg'`) |
| `selectClass` | `String` | `''` | Clases CSS adicionales para el select |
| `labelClass` | `String` | `''` | Clases CSS adicionales para la etiqueta |
| `options` | `Array` | `[]` | Array de opciones |
| `valueKey` | `String` | `'value'` | Clave para el valor en las opciones |
| `labelKey` | `String` | `'label'` | Clave para la etiqueta en las opciones |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido personalizado para las opciones |
| `label` | Personalización de la etiqueta |
| `error` | Personalización del mensaje de error |
| `hint` | Personalización del texto de ayuda |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambia el valor |
| `focus` | Se emite cuando el select recibe el foco |
| `blur` | Se emite cuando el select pierde el foco |

#### Estilo

El componente `VxvSelect` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro (`bg-gray-700`)
- Texto blanco (`text-white`)
- Bordes sutiles (`border-gray-600`)
- Enfoque azul (`focus:border-blue-500`)
- Mensajes de error en rojo (`text-red-500`)
- Textos de ayuda en gris claro (`text-gray-400`)
- Icono de flecha en el lado derecho

#### Ejemplos de Uso

**Select Básico**:
```vue
<BaseSelect
  v-model="country"
  label="País"
  :options="countries"
/>
```

**Select con Opciones Simples**:
```vue
<BaseSelect
  v-model="size"
  label="Tamaño"
  :options="['Pequeño', 'Mediano', 'Grande']"
/>
```

**Select con Opciones de Objeto**:
```vue
<BaseSelect
  v-model="country"
  label="País"
  :options="[
    { value: 'es', label: 'España' },
    { value: 'fr', label: 'Francia' },
    { value: 'de', label: 'Alemania' }
  ]"
/>
```

**Select con Placeholder**:
```vue
<BaseSelect
  v-model="category"
  label="Categoría"
  placeholder="Selecciona una categoría"
  :options="categories"
/>
```

**Select Deshabilitado**:
```vue
<BaseSelect
  v-model="region"
  label="Región"
  :options="regions"
  disabled
/>
```

### VxvCheckbox

`VxvCheckbox` es un componente para casillas de verificación, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/VxvCheckbox.vue`

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `[Boolean, Array]` | `false` | Valor del checkbox (v-model) |
| `value` | `[String, Number, Boolean, Object]` | `true` | Valor cuando se usa en grupo |
| `label` | `String` | `''` | Etiqueta del checkbox |
| `name` | `String` | `''` | Nombre del checkbox para formularios |
| `id` | `String` | Generado automáticamente | ID del checkbox |
| `disabled` | `Boolean` | `false` | Si el checkbox está deshabilitado |
| `required` | `Boolean` | `false` | Si el checkbox es requerido |
| `error` | `String` | `''` | Mensaje de error |
| `checkboxClass` | `String` | `''` | Clases CSS adicionales para el checkbox |
| `labelClass` | `String` | `''` | Clases CSS adicionales para la etiqueta |
| `indeterminate` | `Boolean` | `false` | Si el checkbox está en estado indeterminado |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Personalización de la etiqueta |
| `error` | Personalización del mensaje de error |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambia el valor |
| `change` | Se emite cuando cambia el estado |

#### Estilo

El componente `VxvCheckbox` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Checkbox con bordes redondeados
- Texto blanco para las etiquetas
- Mensajes de error en rojo
- Estilo deshabilitado con opacidad reducida

#### Ejemplos de Uso

**Checkbox Básico**:
```vue
<BaseCheckbox v-model="rememberMe" label="Recordarme" />
```

**Checkbox en Grupo**:
```vue
<BaseCheckbox
  v-model="selectedOptions"
  :value="option.id"
  v-for="option in options"
  :key="option.id"
  :label="option.name"
/>
```

**Checkbox con Estilo Personalizado**:
```vue
<BaseCheckbox
  v-model="acceptTerms"
  labelClass="text-blue-300 font-bold"
>
  Acepto los <a href="#" class="text-blue-400 underline">términos y condiciones</a>
</BaseCheckbox>
```

**Checkbox con Error**:
```vue
<BaseCheckbox
  v-model="acceptTerms"
  :error="!acceptTerms ? 'Debes aceptar los términos para continuar' : ''"
  label="Acepto los términos y condiciones"
/>
```

### VxvRadio

`VxvRadio` es un componente para selecciones únicas dentro de un grupo.

**Archivo**: `/components/ui/forms/VxvRadio.vue`

#### Props

Similar a `BaseCheckbox` pero para selecciones de radio.

#### Ejemplos de Uso

```vue
<BaseRadio v-model="gender" value="male" label="Masculino" name="gender" />
<BaseRadio v-model="gender" value="female" label="Femenino" name="gender" />
<BaseRadio v-model="gender" value="other" label="Otro" name="gender" />
```

### VxvToggleSwitch

`VxvToggleSwitch` es un componente de interruptor de palanca (toggle switch) que permite al usuario alternar entre dos estados: activo e inactivo.

**Archivo**: `/components/ui/forms/VxvToggleSwitch.vue`

**Documentación detallada**: [VxvToggleSwitch](./forms/VxvToggleSwitch.md)

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `Boolean` | - | Estado actual del toggle (true = activo, false = inactivo) |
| `activeText` | `String` | `'Activo'` | Texto para el estado activo |
| `inactiveText` | `String` | `'Inactivo'` | Texto para el estado inactivo |
| `activeColor` | `String` | `'bg-green-500'` | Color de fondo para el estado activo |
| `inactiveColor` | `String` | `'bg-gray-600'` | Color de fondo para el estado inactivo |
| `disabled` | `Boolean` | `false` | Si el toggle está deshabilitado |
| `showLabel` | `Boolean` | `true` | Si se debe mostrar la etiqueta de texto |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambia el valor |
| `change` | Se emite cuando cambia el estado |

#### Ejemplos de Uso

```vue
<VxvToggleSwitch v-model="isActive" />
```

```vue
<VxvToggleSwitch
  v-model="isEnabled"
  activeText="Habilitado"
  inactiveText="Deshabilitado"
  activeColor="bg-blue-500"
  inactiveColor="bg-red-500"
/>
```

### VxvSwitch

`VxvSwitch` es un componente para alternar entre dos estados.

**Archivo**: `/components/ui/forms/VxvSwitch.vue`

#### Props

Similar a `BaseCheckbox` pero con estilo de interruptor.

#### Ejemplos de Uso

```vue
<BaseSwitch v-model="darkMode" label="Modo oscuro" />
```

### VxvForm

`VxvForm` es un contenedor para agrupar campos de formulario relacionados.

**Archivo**: `/components/ui/forms/VxvForm.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `label` | `String` | `''` | Etiqueta del grupo |
| `description` | `String` | `''` | Descripción del grupo |
| `error` | `String` | `''` | Error del grupo |
| `inline` | `Boolean` | `false` | Si los campos deben mostrarse en línea |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Campos del formulario |
| `label` | Personalización de la etiqueta |
| `description` | Personalización de la descripción |

#### Ejemplos de Uso

```vue
<FormGroup label="Información personal" description="Ingresa tus datos personales">
  <BaseInput v-model="firstName" label="Nombre" />
  <BaseInput v-model="lastName" label="Apellido" />
  <BaseInput v-model="email" label="Correo electrónico" type="email" />
</FormGroup>
```

## Validación de Formularios

Vaxav utiliza [Vee-Validate](https://vee-validate.logaretm.com/) para la validación de formularios. Todos los componentes de formulario están diseñados para integrarse con Vee-Validate.

### Ejemplo de Validación

```vue
<template>
  <Form @submit="onSubmit">
    <BaseInput
      v-model="form.email"
      name="email"
      label="Correo electrónico"
      :error="errors.email"
    />
    <BaseInput
      v-model="form.password"
      name="password"
      type="password"
      label="Contraseña"
      :error="errors.password"
    />
    <BaseButton type="submit" :loading="isSubmitting">Iniciar sesión</BaseButton>
  </Form>
</template>

<script setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().required('El correo es requerido').email('Correo inválido'),
  password: yup.string().required('La contraseña es requerida')
});

const { handleSubmit, errors, values: form, isSubmitting } = useForm({
  validationSchema: schema
});

const onSubmit = handleSubmit(async (values) => {
  // Lógica de envío
});
</script>
```

## Accesibilidad

Todos los componentes de formulario siguen las mejores prácticas de accesibilidad:

1. Etiquetas asociadas correctamente con los campos
2. Atributos ARIA apropiados
3. Mensajes de error anunciados por lectores de pantalla
4. Navegación por teclado
5. Contraste de color suficiente

### VxvRange

`VxvRange` es un componente para seleccionar valores numéricos dentro de un rango, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/VxvRange.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `[Number, String]` | `0` | Valor del range (v-model) |
| `label` | `String` | `''` | Etiqueta del range |
| `min` | `[Number, String]` | `0` | Valor mínimo |
| `max` | `[Number, String]` | `100` | Valor máximo |
| `step` | `[Number, String]` | `1` | Incremento del range |
| `id` | `String` | Generado automáticamente | ID del range |
| `disabled` | `Boolean` | `false` | Si el range está deshabilitado |
| `required` | `Boolean` | `false` | Si el range es requerido |
| `error` | `String` | `''` | Mensaje de error |
| `hint` | `String` | `''` | Texto de ayuda |
| `rangeClass` | `String` | `''` | Clases CSS adicionales para el range |
| `labelClass` | `String` | `''` | Clases CSS adicionales para la etiqueta |
| `showMinMax` | `Boolean` | `false` | Si se muestran los valores mínimo y máximo |
| `showValue` | `Boolean` | `true` | Si se muestra el valor actual |
| `showTooltip` | `Boolean` | `false` | Si se muestra un tooltip con el valor actual |
| `formatValue` | `Function` | `null` | Función para formatear el valor actual |
| `formatMin` | `Function` | `null` | Función para formatear el valor mínimo |
| `formatMax` | `Function` | `null` | Función para formatear el valor máximo |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `label` | Personalización de la etiqueta |
| `error` | Personalización del mensaje de error |
| `hint` | Personalización del texto de ayuda |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambia el valor |
| `change` | Se emite cuando se completa un cambio |

#### Estilo

El componente `BaseRange` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Track (barra) en gris oscuro
- Thumb (control deslizante) en azul con borde y brillo
- Efecto de brillo aumentado al enfocar
- Estilo deshabilitado con opacidad reducida
- Visualización opcional de valores mínimo, máximo y actual

#### Ejemplos de Uso

**Range Básico**:
```vue
<BaseRange
  v-model="volume"
  label="Volumen"
  :min="0"
  :max="100"
/>
```

**Range con Valores Mínimo y Máximo**:
```vue
<BaseRange
  v-model="price"
  label="Precio"
  :min="0"
  :max="1000"
  :step="10"
  :show-min-max="true"
/>
```

**Range con Formateo de Valores**:
```vue
<BaseRange
  v-model="price"
  label="Precio Máximo"
  :min="0"
  :max="1000000"
  :step="10000"
  :show-min-max="true"
  :format-value="value => `${value.toLocaleString()} ISK`"
  :format-min="value => `${value.toLocaleString()} ISK`"
  :format-max="value => `${value.toLocaleString()} ISK`"
/>
```

**Range con Tooltip**:
```vue
<BaseRange
  v-model="distance"
  label="Distancia"
  :min="0"
  :max="100"
  :show-tooltip="true"
  :format-value="value => `${value} km`"
/>
```

## Mejores Prácticas

1. Siempre proporciona etiquetas para los campos
2. Muestra mensajes de error claros y específicos
3. Agrupa campos relacionados con `FormGroup`
4. Usa validación tanto del lado del cliente como del servidor
5. Proporciona retroalimentación visual para estados de carga
6. Usa el tipo de campo apropiado para cada tipo de dato
7. Implementa la validación en tiempo real para una mejor experiencia de usuario
