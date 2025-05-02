# Tests del Backend

Este documento describe los tests implementados en el backend de VAXAV para asegurar la calidad y el correcto funcionamiento de las funcionalidades críticas.

## Estructura de los Tests

Los tests están organizados en las siguientes categorías:

- **Tests de Autenticación**: Verifican el registro, inicio de sesión, cierre de sesión y gestión de usuarios.
- **Tests de Verificación de Email**: Comprueban el proceso de verificación de email tanto por enlace como por código.
- **Tests de Pilotos**: Validan la creación y gestión de pilotos.
- **Tests de Flujo de Usuario**: Prueban el flujo completo desde el registro hasta la creación de piloto.
- **Tests de Administración**: Verifican las funcionalidades de administración de usuarios y roles.

## Tests Implementados

### Tests de Autenticación

Ubicación: `tests/Feature/Auth/AuthenticationTest.php`

- `test_users_can_register`: Verifica que los usuarios pueden registrarse correctamente.
- `test_users_can_login`: Comprueba que los usuarios pueden iniciar sesión con credenciales válidas.
- `test_users_can_logout`: Verifica que los usuarios pueden cerrar sesión correctamente.
- `test_users_cannot_login_with_invalid_credentials`: Comprueba que no se puede iniciar sesión con credenciales inválidas.
- `test_authenticated_users_can_get_their_profile`: Verifica que los usuarios autenticados pueden obtener su perfil.
- `test_unauthenticated_users_cannot_access_protected_routes`: Comprueba que los usuarios no autenticados no pueden acceder a rutas protegidas.

### Tests de Verificación de Email

Ubicación: `tests/Feature/Auth/EmailVerificationTest.php`

- `test_user_can_verify_email_with_link`: Verifica que los usuarios pueden verificar su email mediante un enlace.
- `test_user_can_verify_email_with_code`: Comprueba que los usuarios pueden verificar su email mediante un código.
- `test_user_cannot_verify_with_invalid_code`: Verifica que no se puede verificar el email con un código inválido.
- `test_user_can_resend_verification_email`: Comprueba que los usuarios pueden solicitar el reenvío del email de verificación.
- `test_verified_user_cannot_verify_again`: Verifica que un usuario ya verificado no puede verificar su email nuevamente.

### Tests de Pilotos

Ubicación: `tests/Feature/Pilot/PilotCreationTest.php`

- `test_user_can_create_pilot`: Verifica que los usuarios pueden crear un piloto.
- `test_user_cannot_create_multiple_pilots`: Comprueba que un usuario no puede crear más de un piloto.
- `test_pilot_creation_requires_valid_data`: Verifica que la creación de pilotos requiere datos válidos.
- `test_user_can_get_current_pilot`: Comprueba que los usuarios pueden obtener su piloto actual.
- `test_user_without_pilot_gets_404_when_requesting_current_pilot`: Verifica que se devuelve un error 404 cuando un usuario sin piloto intenta obtener su piloto actual.

### Tests de Flujo de Usuario

Ubicación: `tests/Feature/UserFlowTest.php`

- `test_complete_user_flow_registration_verification_pilot_creation`: Prueba el flujo completo desde el registro hasta la creación de piloto, pasando por la verificación de email.

### Tests de Administración

Ubicación: `tests/Feature/Admin/UserManagementTest.php` y `tests/Feature/Admin/RoleManagementTest.php`

- Tests para la gestión de usuarios por parte de administradores.
- Tests para la gestión de roles y permisos.

## Ejecución de los Tests

Para ejecutar todos los tests:

```bash
cd backend
php artisan test
```

Para ejecutar un grupo específico de tests:

```bash
# Ejecutar tests de autenticación
php artisan test --filter=AuthenticationTest

# Ejecutar tests de verificación de email
php artisan test --filter=EmailVerificationTest

# Ejecutar tests de pilotos
php artisan test --filter=PilotCreationTest

# Ejecutar tests de flujo de usuario
php artisan test --filter=UserFlowTest
```

## Cobertura de Tests

Los tests cubren las siguientes funcionalidades críticas:

1. **Autenticación**: Registro, inicio de sesión, cierre de sesión y gestión de usuarios.
2. **Verificación de Email**: Verificación por enlace y por código, reenvío de emails de verificación.
3. **Creación de Pilotos**: Creación de pilotos, validación de datos, obtención del piloto actual.
4. **Flujo de Usuario**: Flujo completo desde el registro hasta la creación de piloto.
5. **Administración**: Gestión de usuarios, roles y permisos.

## Mantenimiento de los Tests

Al implementar nuevas funcionalidades o modificar las existentes, es importante actualizar o crear nuevos tests para asegurar que todo sigue funcionando correctamente. Los tests deben ser específicos, claros y cubrir tanto los casos de éxito como los de error.
