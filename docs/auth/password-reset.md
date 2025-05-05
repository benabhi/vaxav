# Recuperación de Contraseña

Este documento describe la implementación de la funcionalidad de recuperación de contraseña en VAXAV.

## Descripción General

La recuperación de contraseña permite a los usuarios restablecer su contraseña cuando la han olvidado. El proceso consta de dos pasos principales:

1. El usuario solicita un enlace de restablecimiento de contraseña proporcionando su dirección de correo electrónico.
2. El usuario recibe un correo electrónico con un enlace que contiene un token único para restablecer su contraseña.
3. El usuario hace clic en el enlace y establece una nueva contraseña.

## Implementación Backend

### Controlador

El controlador `PasswordResetController` maneja las solicitudes de restablecimiento de contraseña:

- `sendResetLinkEmail`: Envía un enlace de restablecimiento al correo electrónico proporcionado.
- `reset`: Restablece la contraseña utilizando el token proporcionado.

### Rutas

Las rutas para la recuperación de contraseña están definidas en `routes/api.php`:

```php
// Rutas de restablecimiento de contraseña
Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])
    ->middleware(['guest', 'throttle:6,1'])
    ->name('password.email');

Route::post('/auth/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware(['guest'])
    ->name('password.update');
```

### Notificación Personalizada

Para integrar correctamente el backend con el frontend, se utiliza una notificación personalizada `ResetPasswordNotification` que genera la URL correcta para el frontend:

```php
// app/Notifications/ResetPasswordNotification.php
class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    // ...

    protected function resetUrl($notifiable)
    {
        // Usar la URL del frontend en lugar de la URL generada por Laravel
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        return $frontendUrl . '/reset-password/' . $this->token . '?email=' . urlencode($notifiable->getEmailForPasswordReset());
    }
}
```

El modelo `User` debe sobrescribir el método `sendPasswordResetNotification` para utilizar esta notificación personalizada:

```php
// app/Models/User.php
public function sendPasswordResetNotification($token)
{
    $this->notify(new ResetPasswordNotification($token));
}
```

### Configuración

Para que la notificación personalizada funcione correctamente, se debe configurar la URL del frontend en el archivo `.env`:

```
APP_FRONTEND_URL=http://localhost:5173
```

Y en el archivo `config/app.php`:

```php
'frontend_url' => env('APP_FRONTEND_URL', 'http://localhost:5173'),
```

### Base de Datos

Laravel utiliza la tabla `password_reset_tokens` para almacenar los tokens de restablecimiento de contraseña. Esta tabla ya está incluida en la migración predeterminada de Laravel.

## Implementación Frontend

### Vistas

- `ForgotPasswordView.vue`: Formulario para solicitar un enlace de restablecimiento de contraseña.
- `ResetPasswordView.vue`: Formulario para establecer una nueva contraseña utilizando el token recibido.

### Estructura de los Formularios

Los formularios de recuperación de contraseña utilizan el componente `VxvForm` con un slot `#alert` para mostrar mensajes de éxito o error debajo del título:

```vue
<!-- ForgotPasswordView.vue -->
<VxvForm
  title="Recuperar Contraseña"
  :has-border="false"
  submitText="Enviar enlace"
  cancelText="Volver al login"
  :loading="loading"
  @submit="handleSubmit"
  @cancel="goToLogin"
>
  <template #alert>
    <VxvAlert
      v-if="message"
      :variant="alertVariant"
      :message="message"
      class="mb-6"
    />
  </template>

  <!-- Campos del formulario -->
</VxvForm>
```

Esta estructura garantiza que los mensajes de alerta aparezcan en una posición consistente en todos los formularios de la aplicación.

### Rutas

Las rutas para las vistas de recuperación de contraseña están definidas en `router/index.ts`:

```typescript
{
  path: '/forgot-password',
  name: 'password.request',
  component: () => import('../views/auth/ForgotPasswordView.vue'),
  meta: { requiresGuest: true }
},
{
  path: '/reset-password/:token',
  name: 'password.reset',
  component: () => import('../views/auth/ResetPasswordView.vue'),
  props: true,
  meta: { requiresGuest: true }
}
```

### Servicios

El servicio `authService` proporciona métodos para interactuar con la API de recuperación de contraseña:

- `forgotPassword`: Solicita un enlace de restablecimiento de contraseña.
- `resetPassword`: Restablece la contraseña utilizando el token proporcionado.

## Flujo de Recuperación de Contraseña

1. **Solicitud de Restablecimiento**:
   - El usuario accede a la página de "Olvidé mi contraseña" desde la página de inicio de sesión.
   - El usuario ingresa su dirección de correo electrónico y envía el formulario.
   - El sistema verifica si el correo electrónico existe en la base de datos.
   - Si el correo electrónico existe, el sistema genera un token único y envía un correo electrónico con un enlace para restablecer la contraseña.

2. **Restablecimiento de Contraseña**:
   - El usuario hace clic en el enlace recibido en su correo electrónico.
   - El sistema verifica la validez del token.
   - Si el token es válido, el usuario puede ingresar una nueva contraseña.
   - El sistema actualiza la contraseña del usuario y elimina el token utilizado.
   - El usuario es redirigido a la página de inicio de sesión con un mensaje de éxito.

## Consideraciones de Seguridad

- Los tokens de restablecimiento de contraseña tienen una validez limitada (60 minutos por defecto).
- Se aplica limitación de tasa (throttling) para prevenir ataques de fuerza bruta.
- Los tokens son de un solo uso y se eliminan después de ser utilizados.

### Validación de Contraseñas

Las contraseñas deben cumplir con los siguientes requisitos de seguridad:

- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

Estas validaciones se aplican tanto en el frontend (mediante validación en JavaScript) como en el backend (mediante reglas de validación de Laravel).

## Solución de Problemas Comunes

### Error "Route [password.reset] not defined"

Este error ocurre cuando Laravel intenta generar una URL para la ruta "password.reset", pero esta ruta no está definida en el backend. Para solucionar este problema:

1. **Implementar una notificación personalizada**: Crear una clase `ResetPasswordNotification` que sobrescriba el método `resetUrl` para generar la URL correcta del frontend.

2. **Sobrescribir el método en el modelo User**: Asegurarse de que el modelo `User` sobrescriba el método `sendPasswordResetNotification` para utilizar la notificación personalizada.

3. **Configurar la URL del frontend**: Definir la variable `APP_FRONTEND_URL` en el archivo `.env` y utilizarla en la configuración de la aplicación.

4. **Verificar las rutas del frontend**: Asegurarse de que las rutas del frontend para la recuperación de contraseña estén correctamente definidas y coincidan con las URL generadas por la notificación personalizada.

### Problemas con la Visualización de Alertas

Si las alertas no se muestran correctamente en los formularios:

1. **Verificar la estructura del formulario**: Asegurarse de que el componente `VxvAlert` esté dentro del slot `#alert` del componente `VxvForm`.

2. **Verificar el estado de los mensajes**: Comprobar que las variables `message` y `alertVariant` se estén actualizando correctamente en el componente.

3. **Comprobar los estilos**: Verificar que las clases CSS aplicadas al componente `VxvAlert` no estén siendo sobrescritas por otros estilos.
