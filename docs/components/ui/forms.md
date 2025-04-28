# Componentes de Formulario

Los componentes de formulario permiten a los usuarios ingresar, editar y enviar datos. Vaxav proporciona un conjunto completo de componentes de formulario que son accesibles, validables y fáciles de usar.

## Componentes Disponibles

### BaseInput

`BaseInput` es el componente base para campos de entrada de texto, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/BaseInput.vue`

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

El componente `BaseInput` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro (`bg-gray-700`)
- Texto blanco (`text-white`)
- Bordes sutiles (`border-gray-600`)
- Enfoque azul (`focus:border-blue-500`)
- Mensajes de error en rojo (`text-red-500`)
- Textos de ayuda en gris claro (`text-gray-400`)

#### Ejemplos de Uso

**Input Básico**:
```vue
<BaseInput
  v-model="username"
  label="Nombre de usuario"
  placeholder="Ingrese su nombre de usuario"
/>
```

**Input con Error**:
```vue
<BaseInput
  v-model="email"
  label="Correo electrónico"
  type="email"
  :error="errors.email"
  required
/>
```

**Input con Icono**:
```vue
<BaseInput v-model="search" placeholder="Buscar...">
  <template #prefix>
    <SearchIcon class="w-5 h-5 text-gray-400" />
  </template>
</BaseInput>
```

**Input con Etiqueta Personalizada**:
```vue
<BaseInput v-model="form.name" labelClass="text-lg font-bold text-white">
  <template #label>
    Nombre <span class="text-blue-400">*</span>
  </template>
</BaseInput>
```

### BaseTextarea

`BaseTextarea` es un componente para campos de texto multilínea.

**Archivo**: `/components/ui/forms/BaseTextarea.vue`

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

### BaseSelect

`BaseSelect` es un componente para seleccionar opciones de una lista, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/forms/BaseSelect.vue`

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

El componente `BaseSelect` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

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

### BaseCheckbox

`BaseCheckbox` es un componente para selecciones booleanas o múltiples.

**Archivo**: `/components/ui/forms/BaseCheckbox.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `[Boolean, Array]` | `false` | Valor del checkbox |
| `label` | `String` | `''` | Etiqueta del checkbox |
| `value` | `[String, Number, Boolean, Object]` | `true` | Valor cuando se usa en un grupo |
| `id` | `String` | `null` | ID del campo |
| `name` | `String` | `''` | Nombre del campo |
| `disabled` | `Boolean` | `false` | Si está deshabilitado |
| `required` | `Boolean` | `false` | Si es requerido |
| `error` | `String` | `''` | Mensaje de error |
| `indeterminate` | `Boolean` | `false` | Estado indeterminado |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Personalización de la etiqueta |

#### Ejemplos de Uso

```vue
<BaseCheckbox v-model="acceptTerms" label="Acepto los términos y condiciones" />

<!-- Grupo de checkboxes -->
<BaseCheckbox v-model="selectedFruits" value="apple" label="Manzana" />
<BaseCheckbox v-model="selectedFruits" value="banana" label="Banana" />
<BaseCheckbox v-model="selectedFruits" value="orange" label="Naranja" />
```

### BaseRadio

`BaseRadio` es un componente para selecciones únicas dentro de un grupo.

**Archivo**: `/components/ui/forms/BaseRadio.vue`

#### Props

Similar a `BaseCheckbox` pero para selecciones de radio.

#### Ejemplos de Uso

```vue
<BaseRadio v-model="gender" value="male" label="Masculino" name="gender" />
<BaseRadio v-model="gender" value="female" label="Femenino" name="gender" />
<BaseRadio v-model="gender" value="other" label="Otro" name="gender" />
```

### BaseSwitch

`BaseSwitch` es un componente para alternar entre dos estados.

**Archivo**: `/components/ui/forms/BaseSwitch.vue`

#### Props

Similar a `BaseCheckbox` pero con estilo de interruptor.

#### Ejemplos de Uso

```vue
<BaseSwitch v-model="darkMode" label="Modo oscuro" />
```

### FormGroup

`FormGroup` es un contenedor para agrupar campos de formulario relacionados.

**Archivo**: `/components/ui/forms/FormGroup.vue`

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

## Mejores Prácticas

1. Siempre proporciona etiquetas para los campos
2. Muestra mensajes de error claros y específicos
3. Agrupa campos relacionados con `FormGroup`
4. Usa validación tanto del lado del cliente como del servidor
5. Proporciona retroalimentación visual para estados de carga
6. Usa el tipo de campo apropiado para cada tipo de dato
7. Implementa la validación en tiempo real para una mejor experiencia de usuario
