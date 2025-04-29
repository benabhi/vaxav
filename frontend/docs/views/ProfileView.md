# Vista de Perfil de Usuario (ProfileView)

## Descripción

La vista de perfil de usuario permite a los usuarios autenticados ver y editar su información personal, incluyendo nombre, correo electrónico y contraseña. También muestra los roles asignados al usuario (solo lectura).

## Ubicación

`src/views/profile/ProfileView.vue`

## Características

- Visualización de la información actual del usuario
- Edición de nombre y correo electrónico
- Cambio opcional de contraseña
- Visualización de roles asignados (solo lectura)
- Validación en tiempo real
- Mensajes de error y éxito
- Indicador de carga durante las operaciones

## Componentes Utilizados

- `VxvForm`: Contenedor del formulario con título y botón de envío
- `VxvInput`: Campos de entrada para nombre, correo y contraseña
- `VxvBadge`: Visualización de roles asignados

## Composables Utilizados

- `useForm`: Gestión del formulario y validación
- `useRouter`: Navegación entre rutas
- `useNotificationStore`: Mostrar notificaciones de éxito/error
- `useAuthStore`: Acceso a la información del usuario autenticado

## Propiedades

Esta vista no recibe propiedades.

## Eventos

Esta vista no emite eventos.

## Métodos

### `handleSubmit`

Método que se ejecuta al enviar el formulario. Actualiza la información del usuario en el servidor y muestra una notificación de éxito o error.

### `getRoleBadgeColor`

Método que devuelve el color del badge según el slug del rol.

## Estados

- `loading`: Indica si se está cargando la información del usuario
- `submitting`: Indica si se está enviando el formulario
- `values`: Valores actuales del formulario
- `errors`: Errores de validación
- `touched`: Campos que han sido tocados por el usuario
- `userRoles`: Roles asignados al usuario

## Validación

La validación se realiza utilizando el composable `useForm` con las siguientes reglas:

- **Nombre**: Requerido
- **Correo electrónico**: Requerido, formato válido
- **Contraseña**: Opcional, mínimo 8 caracteres
- **Confirmación de contraseña**: Debe coincidir con la contraseña

## Ejemplo de Uso

```html
<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto py-8 px-4">
      <h1 class="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div v-if="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else>
        <VxvForm
          title="Editar Perfil"
          submitText="Guardar cambios"
          :loading="submitting"
          @submit="handleSubmit"
        >
          <!-- Campos del formulario -->
        </VxvForm>
      </div>
    </div>
  </div>
</template>
```

## Notas de Implementación

- La vista está protegida por el middleware de autenticación en el router
- Los campos de contraseña son opcionales; si se dejan en blanco, la contraseña no se actualizará
- Los roles se muestran solo para información y no pueden ser modificados por el usuario
- La vista utiliza el store de autenticación para obtener y actualizar la información del usuario

## Flujo de Datos

1. Al montar el componente, se carga la información del usuario desde el store de autenticación
2. El usuario puede editar su información en el formulario
3. Al enviar el formulario, se validan los datos y se envían al servidor
4. Si la actualización es exitosa, se actualiza la información en el store y se muestra una notificación de éxito
5. Si hay errores, se muestran en el formulario

## Seguridad

- La vista está protegida por el middleware de autenticación
- La validación se realiza tanto en el cliente como en el servidor
- Las contraseñas se envían a través de HTTPS y se almacenan con hash en el servidor

## Componentes Relacionados

- `AppHeader.vue`: Contiene el enlace al perfil en el menú de usuario
- `VxvDropdown.vue`: Utilizado en el menú de usuario para acceder al perfil
- `VxvForm.vue`: Contenedor del formulario de perfil
- `VxvInput.vue`: Campos de entrada para el formulario de perfil
- `VxvBadge.vue`: Visualización de roles asignados
