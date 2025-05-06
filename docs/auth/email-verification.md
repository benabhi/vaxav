# Sistema de Verificación de Email en Vaxav

Este documento describe la implementación del sistema de verificación de email en Vaxav, incluyendo el flujo de verificación, los componentes involucrados y la configuración del backend.

## Índice

1. [Visión General](#visión-general)
2. [Flujo de Verificación](#flujo-de-verificación)
3. [Implementación del Backend](#implementación-del-backend)
4. [Implementación del Frontend](#implementación-del-frontend)
5. [Configuración de Email](#configuración-de-email)
6. [Solución de Problemas](#solución-de-problemas)

## Visión General

El sistema de verificación de email de Vaxav proporciona dos métodos para que los usuarios verifiquen su dirección de email:

1. **Enlace de Verificación**: Un enlace único enviado por email que verifica automáticamente la cuenta cuando se hace clic.
2. **Código de Verificación**: Un código numérico de 6 dígitos que el usuario puede ingresar manualmente.

Este enfoque dual garantiza que los usuarios puedan verificar su email incluso si tienen problemas con el enlace de verificación.

## Flujo de Verificación

El flujo de verificación de email es el siguiente:

1. **Registro de Usuario**: El usuario se registra proporcionando su nombre, email y contraseña.
2. **Envío de Email de Verificación**: El sistema envía automáticamente un email con:
   - Un enlace de verificación único
   - Un código de verificación de 6 dígitos
3. **Verificación por Enlace**:
   - El usuario puede hacer clic en el enlace para verificar su email automáticamente
   - No requiere que el usuario esté autenticado
   - Después de verificar, se muestra un mensaje de éxito
   - El usuario debe hacer clic en "Ir a Iniciar Sesión" para continuar
   - Si el usuario estaba autenticado, se cierra su sesión
4. **Verificación por Código**:
   - Alternativamente, el usuario puede ingresar el código de 6 dígitos en la página de verificación
   - Después de verificar, se muestra un mensaje de éxito
   - El usuario debe hacer clic en "Ir a Iniciar Sesión" para continuar
   - Si el usuario estaba autenticado, se cierra su sesión
5. **Reenvío de Email**: Si el usuario no recibe el email, puede solicitar un reenvío desde la página de verificación.
6. **Restricciones de Acceso**:
   - Los usuarios con correo no verificado no pueden acceder a ninguna funcionalidad principal
   - Son redirigidos automáticamente a la página de verificación
   - No ven los enlaces de navegación en la barra lateral
7. **Redirección Post-Verificación**:
   - Después de iniciar sesión con un correo verificado, el usuario es redirigido a la página de creación de piloto
   - Si el usuario ya tiene un piloto, es redirigido a la página principal

## Implementación del Backend

### Modelos

El sistema utiliza el modelo `User` estándar de Laravel con el trait `MustVerifyEmail` y un modelo adicional `VerificationCode` para los códigos de verificación:

```php
// app/Models/User.php
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    // ...
}

// app/Models/VerificationCode.php
class VerificationCode extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### Controladores

El sistema utiliza dos controladores principales:

```php
// app/Http/Controllers/VerifyEmailController.php
class VerifyEmailController extends Controller
{
    // Verifica el email a través del enlace (no requiere autenticación)
    public function verify(Request $request, $id, $hash)
    {
        // Buscar el usuario por ID
        $user = User::find($id);

        // Verificar el hash y actualizar email_verified_at
        // Si el usuario está autenticado, cerrar su sesión
        // Implementación...
    }

    // Reenvía el email de verificación
    public function resend(Request $request)
    {
        // Implementación...
    }

    // Muestra información sobre la verificación
    public function notice()
    {
        // Implementación...
    }
}

// app/Http/Controllers/VerifyEmailWithCodeController.php
class VerifyEmailWithCodeController extends Controller
{
    // Verifica el email a través del código
    public function verify(Request $request)
    {
        // Implementación...
    }

    // Genera un nuevo código de verificación
    public function generateCode(Request $request)
    {
        // Implementación...
    }
}
```

### Rutas

Las rutas para la verificación de email son:

```php
// routes/api.php
// Ruta pública para verificación de email por enlace (sin autenticación)
Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->middleware(['throttle:6,1'])
    ->name('verification.verify');

// Rutas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/email/verification-notification', [VerifyEmailController::class, 'resend'])
        ->middleware(['throttle:6,1'])
        ->name('verification.send');

    Route::get('/email/verify', [VerifyEmailController::class, 'notice'])
        ->name('verification.notice');

    Route::post('/email/verify-code', [VerifyEmailWithCodeController::class, 'verify'])
        ->middleware(['throttle:6,1'])
        ->name('verification.code');

    Route::post('/email/generate-code', [VerifyEmailWithCodeController::class, 'generateCode'])
        ->middleware(['throttle:3,1'])
        ->name('verification.generate-code');
});
```

### Notificaciones

El sistema utiliza una notificación personalizada para enviar el email de verificación:

```php
// app/Notifications/VerifyEmailNotification.php
class VerifyEmailNotification extends Notification
{
    // Implementación...
}
```

## Implementación del Frontend

### Vistas

El frontend incluye las siguientes vistas para la verificación de email:

- `VerifyEmailView.vue`: Vista principal para la verificación de email que incluye:
  - Formulario para ingresar el código de verificación
  - Botón para reenviar el email de verificación
  - Mensaje de éxito después de la verificación
  - Botón "Ir a Iniciar Sesión" después de verificar

### Componentes

Los componentes utilizados en la verificación de email son:

- `VxvForm`: Componente de formulario para la entrada del código de verificación
- `VxvInput`: Componente de entrada para el código de verificación
- `VxvButton`: Componente de botón para enviar el código, reenviar el email y navegar al login
- `VxvAlert`: Componente para mostrar mensajes de éxito o error

### Stores

El estado de verificación de email se gestiona a través de dos stores:

#### Store de Autenticación

```javascript
// src/stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // ...
    emailVerified: false,
    // ...
  }),

  actions: {
    // Verificar email con código
    async verifyEmailWithCode(code) {
      const result = await authService.verifyEmailWithCode(code);
      if (result.verified) {
        // Actualizar el usuario para reflejar la verificación
        await this.fetchUser();
      }
      return result;
    },

    // Reenviar email de verificación
    async resendVerificationEmail() {
      return await authService.resendVerificationEmail();
    },

    // Comprobar estado de verificación
    async checkEmailVerification() {
      // Obtener el estado actual del usuario
      await this.fetchUser();

      // Verificar específicamente el estado de verificación
      const status = await authService.getEmailVerificationStatus();

      // Actualizar el estado en el store
      this.emailVerified = status.verified;

      return status;
    },

    // Obtener usuario actual
    async fetchUser() {
      const user = await authService.getUser();
      this.user = user;
      this.isAuthenticated = true;

      // Verificar explícitamente si el email está verificado
      this.emailVerified = user.email_verified_at !== null;
    }
  }
});
```

#### Store de Usuario Unificado

```javascript
// src/stores/user.ts
export const useUserStore = defineStore('user', {
  // ...
  getters: {
    // Indica si el email del usuario está verificado
    isEmailVerified: () => {
      const authStore = useAuthStore();
      return authStore.emailVerified;
    },
    // ...
  },

  actions: {
    // Carga todos los datos del usuario
    async loadUserData() {
      const authStore = useAuthStore();

      // Cargar datos de autenticación
      if (!authStore.isAuthenticated && authStore.token) {
        await authStore.fetchUser();
      }

      // Verificar explícitamente el estado de verificación del email
      if (authStore.isAuthenticated) {
        await authStore.checkEmailVerification();

        // Cargar datos del piloto
        const pilotStore = usePilotStore();
        await pilotStore.fetchCurrentPilot();
      }
    },

    // Iniciar sesión
    async login(credentials) {
      const authStore = useAuthStore();
      await authStore.login(credentials);

      if (authStore.isAuthenticated) {
        await this.loadUserData();

        // Verificar explícitamente el estado de verificación del email
        await authStore.checkEmailVerification();
      }
    }
  }
});
```

## Configuración de Email

El sistema está configurado para enviar emails utilizando el driver de email configurado en Laravel. Para desarrollo, se puede utilizar el driver `log` para ver los emails en los logs:

```php
// .env
MAIL_MAILER=log
```

Para producción, se recomienda configurar un servicio de email como Mailgun, Postmark o Amazon SES:

```php
// .env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
```

## Solución de Problemas

### Emails no Recibidos

Si los usuarios no reciben los emails de verificación:

1. Verificar la configuración de email en `.env`
2. Comprobar los logs de Laravel en `storage/logs/laravel.log`
3. Verificar que el usuario no esté ya verificado
4. Comprobar si el email está siendo bloqueado por filtros de spam

### Errores de Verificación

Si los usuarios tienen problemas para verificar su email:

1. Asegurarse de que el enlace no esté caducado (válido por 60 minutos)
2. Verificar que el código de verificación sea correcto y no haya caducado
3. Comprobar que el usuario esté autenticado al verificar con código
4. Verificar que la firma del enlace sea válida

### Redirección Incorrecta

Si los usuarios no son redirigidos correctamente después de la verificación:

1. Verificar la lógica de redirección en el componente `VerifyEmailView.vue`
2. Comprobar que el guardia de navegación en `router/guards.ts` esté funcionando correctamente
3. Verificar que todas las rutas tengan la meta `requiresEmailVerification: true` cuando sea necesario
4. Asegurarse de que el método `checkEmailVerification` se esté llamando después del inicio de sesión
5. Verificar que el nombre de la ruta de verificación sea `verify-email` en todos los lugares donde se usa
