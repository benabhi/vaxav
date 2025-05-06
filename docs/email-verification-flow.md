# Flujo de Verificación de Correo Electrónico

Este documento describe el flujo de verificación de correo electrónico en VAXAV, incluyendo el proceso de registro, verificación y acceso a la aplicación.

## Índice

1. [Visión General](#visión-general)
2. [Proceso de Registro](#proceso-de-registro)
3. [Métodos de Verificación](#métodos-de-verificación)
4. [Restricciones de Navegación](#restricciones-de-navegación)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Implementación Técnica](#implementación-técnica)
7. [Solución de Problemas](#solución-de-problemas)

## Visión General

La verificación de correo electrónico es un paso obligatorio en VAXAV. Los usuarios no pueden acceder a ninguna funcionalidad de la aplicación hasta que verifiquen su dirección de correo electrónico. Este proceso garantiza que:

1. Los usuarios proporcionan direcciones de correo electrónico válidas
2. Se reduce el registro de cuentas falsas o spam
3. Se establece un canal de comunicación confiable con los usuarios

## Proceso de Registro

1. El usuario completa el formulario de registro con:
   - Nombre de usuario
   - Dirección de correo electrónico
   - Confirmación de correo electrónico
   - Contraseña
   - Confirmación de contraseña

2. Al enviar el formulario, se crea la cuenta de usuario con estado "no verificado"

3. El sistema envía automáticamente un correo electrónico de verificación que contiene:
   - Un enlace de verificación único
   - Un código de verificación de 6 dígitos (método alternativo)

4. El usuario es redirigido a la página de verificación de correo electrónico

## Métodos de Verificación

VAXAV ofrece dos métodos para verificar la dirección de correo electrónico:

### 1. Verificación por Enlace

- El usuario hace clic en el enlace de verificación en el correo electrónico
- El enlace contiene parámetros únicos (ID de usuario y hash)
- No requiere que el usuario esté autenticado
- Después de la verificación, el usuario es redirigido a la página de inicio de sesión

### 2. Verificación por Código

- El usuario ingresa el código de 6 dígitos en la página de verificación
- Requiere que el usuario esté autenticado
- Después de la verificación, el usuario es redirigido a la página de inicio de sesión

## Restricciones de Navegación

Todas las rutas principales de la aplicación requieren verificación de correo electrónico:

- Rutas de piloto (`/pilot/*`)
- Ruta de creación de piloto (`/create-pilot`)
- Rutas del universo (`/universe/*`)
- Rutas de mercado (`/market/*`)
- Rutas de naves (`/ships/*`)
- Ruta de perfil (`/profile`)
- Rutas de administración (`/admin/*`)

Si un usuario no verificado intenta acceder a estas rutas, será redirigido automáticamente a la página de verificación de correo electrónico.

## Flujo de Usuario

### Registro y Verificación Inmediata

1. El usuario se registra
2. Es redirigido a la página de verificación de correo electrónico
3. Verifica su correo electrónico (por enlace o código)
4. Es redirigido a la página de inicio de sesión
5. Inicia sesión
6. Es redirigido a la página de creación de piloto
7. Crea su piloto
8. Accede a todas las funcionalidades de la aplicación

### Registro sin Verificación Inmediata

1. El usuario se registra
2. Es redirigido a la página de verificación de correo electrónico
3. Cierra sesión sin verificar su correo electrónico
4. Más tarde, inicia sesión nuevamente
5. Es redirigido automáticamente a la página de verificación de correo electrónico
6. Verifica su correo electrónico
7. Es redirigido a la página de inicio de sesión
8. Inicia sesión
9. Es redirigido a la página de creación de piloto
10. Crea su piloto
11. Accede a todas las funcionalidades de la aplicación

## Implementación Técnica

### Backend

La verificación de correo electrónico se implementa en el backend mediante:

1. **Controladores**:
   - `VerifyEmailController`: Maneja la verificación por enlace
   - `VerifyEmailWithCodeController`: Maneja la verificación por código

2. **Rutas**:
   - `/auth/email/verify/{id}/{hash}`: Verifica el correo por enlace (no requiere autenticación)
   - `/auth/email/verify-code`: Verifica el correo por código (requiere autenticación)
   - `/auth/email/generate-code`: Genera un nuevo código de verificación
   - `/auth/email/verification-notification`: Reenvía el correo de verificación

3. **Modelo de Usuario**:
   - Campo `email_verified_at`: Almacena la fecha y hora de verificación
   - Método `hasVerifiedEmail()`: Verifica si el correo está verificado

### Frontend

La verificación de correo electrónico se implementa en el frontend mediante:

1. **Componentes**:
   - `VerifyEmailView.vue`: Página de verificación de correo electrónico
   - `RegisterView.vue`: Página de registro que redirige a la verificación

2. **Stores**:
   - `useAuthStore`: Maneja la autenticación y verificación de correo
   - `useUserStore`: Store unificado que incluye el estado de verificación

3. **Router**:
   - Meta `requiresEmailVerification`: Indica que una ruta requiere verificación
   - Guardia de navegación: Redirige a los usuarios no verificados

4. **Servicios**:
   - `authService.verifyEmailWithCode()`: Verifica el correo por código
   - `authService.resendVerificationEmail()`: Reenvía el correo de verificación

## Solución de Problemas

### El usuario no recibe el correo de verificación

1. Verificar la carpeta de spam
2. Usar la opción "Reenviar email de verificación" en la página de verificación
3. Verificar que la dirección de correo sea correcta

### El enlace de verificación no funciona

1. Asegurarse de que el enlace completo se abre correctamente
2. Intentar con el método de código de verificación
3. Solicitar un nuevo correo de verificación

### El código de verificación no funciona

1. Asegurarse de ingresar el código exactamente como aparece en el correo
2. Solicitar un nuevo código de verificación
3. Intentar con el método de enlace de verificación

### El usuario es redirigido constantemente a la verificación

1. Verificar que el correo electrónico haya sido verificado correctamente
2. Cerrar sesión y volver a iniciar sesión
3. Limpiar la caché del navegador
