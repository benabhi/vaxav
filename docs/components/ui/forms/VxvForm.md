# VxvForm

`VxvForm` es un componente contenedor para formularios que proporciona un diseño consistente y botones de acción estándar.

## Características

- Diseño consistente con la estética sci-fi retro de Vaxav
- Botones de acción estándar (enviar y cancelar)
- Soporte para estados de carga
- Personalización de botones mediante slots
- Soporte para alertas y contenido adicional

## Ubicación

**Archivo**: `/components/ui/forms/VxvForm.vue`

**Storybook**: Este componente está documentado en Storybook con ejemplos interactivos.

## API

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `''` | Título del formulario |
| `submitText` | `String` | `'Guardar'` | Texto del botón de envío |
| `cancelText` | `String` | `'Cancelar'` | Texto del botón de cancelación |
| `showSubmit` | `Boolean` | `true` | Si se debe mostrar el botón de envío |
| `showCancel` | `Boolean` | `true` | Si se debe mostrar el botón de cancelación |
| `loading` | `Boolean` | `false` | Si el formulario está en estado de carga |
| `disabled` | `Boolean` | `false` | Si el formulario está deshabilitado |
| `maxWidth` | `String` | `'2xl'` | Ancho máximo del formulario (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'4xl'`, `'5xl'`, `'6xl'`, `'7xl'`) |
| `hasBorder` | `Boolean` | `true` | Si el formulario debe tener borde |
| `fullWidthSubmit` | `Boolean` | `false` | Si el botón de envío debe ocupar todo el ancho disponible |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal del formulario |
| `alert` | Para mostrar alertas en la parte superior del formulario |
| `buttons` | Para personalizar los botones de acción (reemplaza los botones predeterminados) |
| `footer` | Para añadir contenido debajo de los botones |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `submit` | Se emite cuando se envía el formulario |
| `cancel` | Se emite cuando se hace clic en el botón de cancelación |

## Ejemplos de Uso

### Formulario Básico

```vue
<VxvForm
  title="Iniciar Sesión"
  submitText="Iniciar Sesión"
  @submit="handleSubmit"
>
  <VxvInput
    v-model="form.email"
    label="Correo electrónico"
    type="email"
    required
  />
  <VxvInput
    v-model="form.password"
    label="Contraseña"
    type="password"
    required
  />
</VxvForm>
```

### Formulario con Botones Personalizados

El slot `buttons` permite personalizar completamente los botones de acción. Esto es útil cuando necesitas añadir botones adicionales o cambiar su disposición.

```vue
<VxvForm
  title="Editar Piloto"
  @submit="handleSubmit"
  @cancel="goBack"
>
  <VxvInput
    v-model="form.name"
    label="Nombre"
    required
  />
  <VxvSelect
    v-model="form.race"
    label="Raza"
    :options="razas"
    required
  />
  
  <!-- Personalización de botones -->
  <template #buttons>
    <div class="flex items-center space-x-3">
      <VxvButton
        type="submit"
        variant="primary"
      >
        Guardar cambios
      </VxvButton>
      
      <VxvButton
        variant="secondary"
        @click="goToSkills"
        type="button"
      >
        Editar Habilidades
      </VxvButton>
      
      <VxvButton
        type="button"
        variant="secondary"
        @click="goBack"
      >
        Cancelar
      </VxvButton>
    </div>
  </template>
</VxvForm>
```

### Formulario con Alerta

El slot `alert` permite mostrar mensajes informativos o de error en la parte superior del formulario.

```vue
<VxvForm
  title="Registro"
  submitText="Registrarse"
  @submit="handleSubmit"
>
  <template #alert>
    <VxvAlert
      type="info"
      title="Información"
      message="Completa todos los campos para crear tu cuenta."
    />
  </template>
  
  <VxvInput
    v-model="form.name"
    label="Nombre"
    required
  />
  <VxvInput
    v-model="form.email"
    label="Correo electrónico"
    type="email"
    required
  />
</VxvForm>
```

### Formulario con Contenido Adicional en el Footer

El slot `footer` permite añadir contenido debajo de los botones de acción.

```vue
<VxvForm
  title="Iniciar Sesión"
  submitText="Iniciar Sesión"
  @submit="handleSubmit"
>
  <VxvInput
    v-model="form.email"
    label="Correo electrónico"
    type="email"
    required
  />
  <VxvInput
    v-model="form.password"
    label="Contraseña"
    type="password"
    required
  />
  
  <template #footer>
    <div class="mt-4 text-center">
      <p class="text-gray-400">
        ¿No tienes una cuenta?
        <router-link to="/register" class="text-blue-400 hover:underline">
          Regístrate
        </router-link>
      </p>
      <p class="mt-2 text-gray-400">
        <router-link to="/forgot-password" class="text-blue-400 hover:underline">
          ¿Olvidaste tu contraseña?
        </router-link>
      </p>
    </div>
  </template>
</VxvForm>
```

### Formulario en Estado de Carga

```vue
<VxvForm
  title="Iniciar Sesión"
  submitText="Iniciar Sesión"
  :loading="isLoading"
  @submit="handleSubmit"
>
  <VxvInput
    v-model="form.email"
    label="Correo electrónico"
    type="email"
    required
  />
  <VxvInput
    v-model="form.password"
    label="Contraseña"
    type="password"
    required
  />
</VxvForm>
```

## Personalización

### Estilos

El componente `VxvForm` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro (`bg-gray-800`)
- Texto blanco (`text-white`)
- Bordes sutiles (`border-gray-700`)
- Título con tipografía sci-fi
- Botones con estilo consistente

### Tamaños

Puedes controlar el ancho máximo del formulario mediante la prop `maxWidth`:

```vue
<VxvForm
  title="Formulario Pequeño"
  maxWidth="sm"
  @submit="handleSubmit"
>
  <!-- Contenido -->
</VxvForm>

<VxvForm
  title="Formulario Grande"
  maxWidth="4xl"
  @submit="handleSubmit"
>
  <!-- Contenido -->
</VxvForm>
```

## Accesibilidad

El componente `VxvForm` sigue las mejores prácticas de accesibilidad:

1. Estructura semántica con elementos `<form>` y `<fieldset>`
2. Etiquetas y títulos claros
3. Mensajes de error anunciados por lectores de pantalla
4. Navegación por teclado
5. Estados de foco visibles

## Mejores Prácticas

1. Usa el título para describir claramente el propósito del formulario
2. Agrupa campos relacionados
3. Proporciona retroalimentación visual para estados de carga
4. Usa el slot `alert` para mostrar mensajes importantes
5. Personaliza los botones solo cuando sea necesario
6. Mantén los formularios concisos y enfocados en una tarea específica
