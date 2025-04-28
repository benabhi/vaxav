# BaseForm

El componente `BaseForm` es un contenedor para formularios que proporciona un estilo consistente y funcionalidad común para todos los formularios de la aplicación.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| title | String | *Requerido* | Título del formulario |
| submitText | String | `'Guardar'` | Texto del botón de envío |
| cancelText | String | `'Cancelar'` | Texto del botón de cancelación |
| showCancel | Boolean | `true` | Si es `true`, muestra el botón de cancelación |
| loading | Boolean | `false` | Si es `true`, muestra un indicador de carga en el botón de envío |
| maxWidth | String | `'3xl'` | Ancho máximo del formulario (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full) |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| submit | - | Se emite cuando se envía el formulario |
| cancel | - | Se emite cuando se hace clic en el botón de cancelación |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido del formulario (campos, validaciones, etc.) |

## Ejemplos de uso

### Formulario básico

```vue
<template>
  <BaseForm 
    title="Crear Usuario"
    submitText="Crear"
    :loading="submitting"
    @submit="handleSubmit"
    @cancel="goBack"
  >
    <div class="mb-4">
      <BaseInput
        id="name"
        v-model="form.name"
        label="Nombre"
        required
        :error="errors.name"
      />
    </div>
    
    <div class="mb-4">
      <BaseInput
        id="email"
        v-model="form.email"
        label="Correo electrónico"
        type="email"
        required
        :error="errors.email"
      />
    </div>
  </BaseForm>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseForm from '@/components/ui/forms/BaseForm.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';

const router = useRouter();
const submitting = ref(false);
const errors = reactive({});
const form = reactive({
  name: '',
  email: ''
});

const handleSubmit = async () => {
  submitting.value = true;
  try {
    // Lógica para enviar el formulario
    await saveData(form);
    router.push('/users');
  } catch (error) {
    // Manejar errores
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push('/users');
};
</script>
```

### Formulario con validación

```vue
<template>
  <BaseForm 
    title="Editar Perfil"
    submitText="Guardar cambios"
    :loading="submitting"
    @submit="handleSubmit"
    @cancel="goBack"
  >
    <div class="mb-4">
      <BaseInput
        id="name"
        v-model="values.name"
        label="Nombre"
        required
        :error="touched.name && errors.name ? errors.name : ''"
        @blur="() => handleBlur('name')"
      />
    </div>
    
    <div class="mb-4">
      <BaseInput
        id="email"
        v-model="values.email"
        label="Correo electrónico"
        type="email"
        required
        :error="touched.email && errors.email ? errors.email : ''"
        @blur="() => handleBlur('email')"
      />
    </div>
  </BaseForm>
</template>

<script setup>
import { useRouter } from 'vue-router';
import BaseForm from '@/components/ui/forms/BaseForm.vue';
import BaseInput from '@/components/ui/forms/BaseInput.vue';
import { useForm } from '@/composables/useForm';

const router = useRouter();

const {
  values,
  errors,
  touched,
  submitting,
  handleBlur,
  handleSubmit,
  setErrors
} = useForm({
  initialValues: {
    name: '',
    email: ''
  },
  validationRules: {
    name: [
      value => !value ? 'El nombre es obligatorio' : null,
      value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
    ],
    email: [
      value => !value ? 'El correo electrónico es obligatorio' : null,
      value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'El correo electrónico no es válido' : null
    ]
  },
  onSubmit: async (formValues) => {
    // Lógica para enviar el formulario
    await updateProfile(formValues);
    router.push('/profile');
  }
});

const goBack = () => {
  router.push('/profile');
};
</script>
```

### Formulario sin botón de cancelación

```vue
<BaseForm 
  title="Cambiar contraseña"
  submitText="Actualizar contraseña"
  :show-cancel="false"
  :loading="submitting"
  @submit="handleSubmit"
>
  <!-- Contenido del formulario -->
</BaseForm>
```

### Formulario con ancho personalizado

```vue
<BaseForm 
  title="Configuración"
  max-width="2xl"
  :loading="submitting"
  @submit="handleSubmit"
  @cancel="goBack"
>
  <!-- Contenido del formulario -->
</BaseForm>
```
