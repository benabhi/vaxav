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

### Base de Datos

Laravel utiliza la tabla `password_reset_tokens` para almacenar los tokens de restablecimiento de contraseña. Esta tabla ya está incluida en la migración predeterminada de Laravel.

## Implementación Frontend

### Vistas

- `ForgotPasswordView.vue`: Formulario para solicitar un enlace de restablecimiento de contraseña.
- `ResetPasswordView.vue`: Formulario para establecer una nueva contraseña utilizando el token recibido.

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
- Las contraseñas se validan para garantizar que cumplan con los requisitos mínimos de seguridad.
- Los tokens son de un solo uso y se eliminan después de ser utilizados.
