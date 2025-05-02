# Sistema de Verificación de Email en VAXAV

Este documento describe el sistema de verificación de email implementado en VAXAV, incluyendo su funcionamiento, configuración y posibles problemas.

## Descripción General

El sistema de verificación de email en VAXAV permite confirmar que los usuarios tienen acceso a la dirección de correo electrónico que proporcionaron durante el registro. Ofrece dos métodos de verificación:

1. **Enlace de verificación**: El usuario puede hacer clic en un enlace enviado a su correo electrónico.
2. **Código de verificación**: El usuario puede ingresar un código de 6 dígitos enviado en el mismo correo.

## Implementación Técnica

### Componentes Principales

1. **Personalización del Email de Verificación**:
   - Implementado en `backend/app/Providers/AppServiceProvider.php`
   - Utiliza el método `VerifyEmail::toMailUsing()` para personalizar el correo

2. **Modelo de Código de Verificación**:
   - Definido en `backend/app/Models/VerificationCode.php`
   - Almacena códigos de verificación temporales para los usuarios

3. **Controlador de Verificación**:
   - Implementado en `backend/app/Http/Controllers/VerifyEmailController.php`
   - Maneja las solicitudes de verificación por enlace y reenvío de correos

4. **Controlador de Verificación por Código**:
   - Implementado en `backend/app/Http/Controllers/VerifyEmailWithCodeController.php`
   - Maneja las solicitudes de verificación por código

5. **Vista de Verificación en el Frontend**:
   - Implementada en `frontend/src/views/auth/VerifyEmailView.vue`
   - Proporciona la interfaz para verificar el email y solicitar reenvíos

### Flujo de Verificación

1. **Registro de Usuario**:
   - El usuario se registra proporcionando su email
   - Laravel envía automáticamente un correo de verificación

2. **Personalización del Correo**:
   - El método `boot()` en `AppServiceProvider` personaliza el correo
   - Genera un código de verificación de 6 dígitos
   - Almacena el código en la base de datos
   - Construye una URL de verificación para el frontend
   - Envía un correo con el enlace y el código

3. **Verificación por Enlace**:
   - El usuario hace clic en el enlace en su correo
   - El frontend extrae los parámetros de la URL
   - Envía una solicitud al backend para verificar el email
   - El backend verifica la firma y marca el email como verificado

4. **Verificación por Código**:
   - El usuario ingresa el código de 6 dígitos en el frontend
   - El frontend envía el código al backend
   - El backend verifica el código y marca el email como verificado

5. **Reenvío de Verificación**:
   - El usuario puede solicitar un nuevo correo de verificación
   - El backend genera un nuevo código y envía un nuevo correo

## Configuración

### Configuración del Correo

La configuración del correo se encuentra en el archivo `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicación
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@vaxav.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Configuración del Frontend

La URL del frontend se configura en el archivo `.env`:

```
APP_FRONTEND_URL=http://localhost:5173
```

Esta URL se utiliza para construir los enlaces de verificación que se envían en los correos.

## Personalización del Correo de Verificación

El correo de verificación se personaliza en el método `boot()` de `AppServiceProvider`:

```php
VerifyEmail::toMailUsing(function ($notifiable, $url) {
    // Extraer los parámetros de la URL
    $parsedUrl = parse_url($url);
    $path = $parsedUrl['path'] ?? '';
    $query = $parsedUrl['query'] ?? '';
    
    // Extraer id y hash del path
    preg_match('/\/email\/verify\/(\d+)\/([^\/]+)/', $path, $matches);
    $id = $matches[1] ?? '';
    $hash = $matches[2] ?? '';
    
    // Construir la URL del frontend
    $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
    $verificationUrl = $frontendUrl . "/email/verify?id={$id}&hash={$hash}&{$query}";
    
    // Generar un código de verificación de 6 dígitos
    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    
    // Guardar el código en la base de datos
    VerificationCode::where('user_id', $notifiable->id)->delete();
    VerificationCode::create([
        'user_id' => $notifiable->id,
        'code' => $code,
        'expires_at' => now()->addMinutes(30) // Expira en 30 minutos
    ]);

    return (new MailMessage)
        ->subject('Verifica tu Dirección de Email - VAXAV')
        ->greeting('¡Hola ' . $notifiable->name . '!')
        ->line('Gracias por registrarte en VAXAV. Por favor, verifica tu dirección de email haciendo clic en el botón de abajo.')
        ->action('Verificar Email', $verificationUrl)
        ->line('Alternativamente, puedes usar el siguiente código de verificación en la página de verificación:')
        ->line('Tu código de verificación es: **' . $code . '**')
        ->line('Este código expirará en 30 minutos.')
        ->line('Si no creaste una cuenta, no es necesario realizar ninguna acción.')
        ->salutation('Saludos, El Equipo de VAXAV');
});
```

## Problemas Comunes y Soluciones

### 1. Correos no Enviados

**Problema**: Los correos de verificación no se envían.

**Soluciones**:
- Verificar la configuración de correo en el archivo `.env`
- Verificar que el servicio de correo esté funcionando correctamente
- Revisar los logs en `storage/logs/laravel.log` para ver errores específicos

### 2. Errores en la Verificación por Enlace

**Problema**: Los enlaces de verificación no funcionan correctamente.

**Soluciones**:
- Verificar que la URL del frontend esté configurada correctamente
- Asegurarse de que la ruta de verificación en el backend esté definida correctamente
- Comprobar que los parámetros se extraen y pasan correctamente

### 3. Errores en la Verificación por Código

**Problema**: Los códigos de verificación no funcionan.

**Soluciones**:
- Verificar que los códigos se generan y almacenan correctamente en la base de datos
- Comprobar que los códigos no hayan expirado (30 minutos por defecto)
- Asegurarse de que el controlador de verificación por código esté funcionando correctamente

### 4. Conflictos de Notificaciones

**Problema**: Conflictos entre diferentes métodos de personalización de correos.

**Solución**:
- Utilizar un solo enfoque para personalizar los correos (preferiblemente en `AppServiceProvider`)
- Evitar implementar `MustVerifyEmail` y personalizar `sendEmailVerificationNotification()` al mismo tiempo

## Mejores Prácticas

1. **Limpieza de Caché**: Después de realizar cambios en la configuración o en las notificaciones, limpiar la caché con `php artisan optimize:clear`.

2. **Pruebas de Correo**: Probar el envío de correos en diferentes clientes y dispositivos para asegurar que se muestran correctamente.

3. **Seguridad**: Asegurarse de que los enlaces y códigos de verificación sean seguros y no puedan ser adivinados o manipulados.

4. **Experiencia de Usuario**: Proporcionar mensajes claros y opciones de reenvío para mejorar la experiencia del usuario.

5. **Monitoreo**: Monitorear los logs y las tasas de verificación para detectar problemas temprano.

## Conclusión

El sistema de verificación de email en VAXAV proporciona una forma segura y flexible para verificar las direcciones de correo electrónico de los usuarios. Al ofrecer tanto verificación por enlace como por código, se mejora la accesibilidad y la experiencia del usuario.
