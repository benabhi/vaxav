# useForm

El composable `useForm` proporciona funcionalidad para gestionar formularios y validaciones en la aplicación.

## Importación

```javascript
import { useForm } from '@/composables/useForm';
```

## Uso Básico

```javascript
const {
  values,
  errors,
  touched,
  submitting,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  resetForm
} = useForm({
  initialValues: {
    name: '',
    email: '',
    password: ''
  },
  validationRules: {
    name: [
      value => !value ? 'El nombre es obligatorio' : null,
      value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
    ],
    email: [
      value => !value ? 'El email es obligatorio' : null,
      value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'El email no es válido' : null
    ],
    password: [
      value => !value ? 'La contraseña es obligatoria' : null,
      value => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null
    ]
  },
  onSubmit: async (values) => {
    // Enviar formulario
    console.log('Formulario enviado:', values);
  },
  onError: (errors) => {
    console.log('Errores de validación:', errors);
  }
});
```

## Estado

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `values` | `Reactive<Object>` | Valores del formulario |
| `errors` | `Reactive<Object>` | Errores de validación |
| `touched` | `Reactive<Object>` | Campos que han sido tocados |
| `submitting` | `Ref<Boolean>` | Indica si el formulario se está enviando |
| `submitted` | `Ref<Boolean>` | Indica si el formulario ha sido enviado |
| `isValid` | `ComputedRef<Boolean>` | Indica si el formulario es válido |
| `isDirty` | `ComputedRef<Boolean>` | Indica si el formulario ha sido modificado |

## Métodos

### handleChange

Maneja el cambio de valor de un campo.

```javascript
handleChange('name', 'Nuevo valor');
```

### handleBlur

Maneja cuando un campo pierde el foco.

```javascript
handleBlur('name');
```

### handleSubmit

Maneja el envío del formulario.

```javascript
handleSubmit();
```

### validateField

Valida un campo específico.

```javascript
const error = validateField('name');
```

### validateForm

Valida todos los campos del formulario.

```javascript
const isValid = validateForm();
```

### resetForm

Restablece el formulario a sus valores iniciales.

```javascript
resetForm();
```

### setValues

Establece los valores del formulario.

```javascript
setValues({
  name: 'Nuevo nombre',
  email: 'nuevo@email.com'
});
```

### setErrors

Establece los errores del formulario (útil para errores de API).

```javascript
setErrors({
  email: 'Este email ya está en uso'
});
```

## Ejemplo Completo

```vue
<template>
  <form @submit="handleSubmit">
    <div class="mb-4">
      <label for="name" class="block text-sm font-medium text-gray-300">Nombre</label>
      <input
        id="name"
        type="text"
        :value="values.name"
        @input="e => handleChange('name', e.target.value)"
        @blur="() => handleBlur('name')"
        class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        :class="{ 'border-red-500': touched.name && errors.name }"
      />
      <p v-if="touched.name && errors.name" class="mt-1 text-sm text-red-500">
        {{ errors.name }}
      </p>
    </div>

    <div class="mb-4">
      <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
      <input
        id="email"
        type="email"
        :value="values.email"
        @input="e => handleChange('email', e.target.value)"
        @blur="() => handleBlur('email')"
        class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        :class="{ 'border-red-500': touched.email && errors.email }"
      />
      <p v-if="touched.email && errors.email" class="mt-1 text-sm text-red-500">
        {{ errors.email }}
      </p>
    </div>

    <div class="mb-4">
      <label for="password" class="block text-sm font-medium text-gray-300">Contraseña</label>
      <input
        id="password"
        type="password"
        :value="values.password"
        @input="e => handleChange('password', e.target.value)"
        @blur="() => handleBlur('password')"
        class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        :class="{ 'border-red-500': touched.password && errors.password }"
      />
      <p v-if="touched.password && errors.password" class="mt-1 text-sm text-red-500">
        {{ errors.password }}
      </p>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        @click="resetForm"
        class="mr-2 px-4 py-2 bg-gray-600 text-white rounded-md"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="submitting || !isValid"
        class="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {{ submitting ? 'Enviando...' : 'Enviar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { useForm } from '@/composables/useForm';

const {
  values,
  errors,
  touched,
  submitting,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  resetForm
} = useForm({
  initialValues: {
    name: '',
    email: '',
    password: ''
  },
  validationRules: {
    name: [
      value => !value ? 'El nombre es obligatorio' : null,
      value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
    ],
    email: [
      value => !value ? 'El email es obligatorio' : null,
      value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'El email no es válido' : null
    ],
    password: [
      value => !value ? 'La contraseña es obligatoria' : null,
      value => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null
    ]
  },
  onSubmit: async (values) => {
    // Enviar formulario
    console.log('Formulario enviado:', values);
  },
  onError: (errors) => {
    console.log('Errores de validación:', errors);
  }
});
</script>
```

## Integración con BaseInput

El composable `useForm` se puede integrar fácilmente con los componentes de formulario existentes:

```vue
<template>
  <form @submit="handleSubmit">
    <BaseInput
      id="name"
      v-model="values.name"
      label="Nombre"
      :error="touched.name && errors.name ? errors.name : ''"
      @blur="() => handleBlur('name')"
    />

    <BaseInput
      id="email"
      v-model="values.email"
      label="Email"
      type="email"
      :error="touched.email && errors.email ? errors.email : ''"
      @blur="() => handleBlur('email')"
    />

    <BaseInput
      id="password"
      v-model="values.password"
      label="Contraseña"
      type="password"
      :error="touched.password && errors.password ? errors.password : ''"
      @blur="() => handleBlur('password')"
    />

    <div class="flex justify-end">
      <BaseButton
        type="button"
        variant="secondary"
        @click="resetForm"
        class="mr-2"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        variant="primary"
        :disabled="submitting || !isValid"
        :loading="submitting"
      >
        Enviar
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { watch } from 'vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import BaseButton from '@/components/ui/buttons/BaseButton.vue';
import { useForm } from '@/composables/useForm';

const {
  values,
  errors,
  touched,
  submitting,
  isValid,
  handleBlur,
  handleSubmit,
  resetForm
} = useForm({
  // Configuración del formulario
});

// Actualizar valores cuando cambia v-model
watch(() => values.name, (newValue) => {
  // Lógica adicional si es necesario
});
</script>
```
