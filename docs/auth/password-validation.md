# Validación de Contraseñas en VAXAV

Este documento describe el sistema de validación de contraseñas implementado en VAXAV, tanto en el frontend como en el backend, para los formularios de registro, actualización de perfil y restablecimiento de contraseña.

## Requisitos de Contraseña

Las contraseñas en VAXAV deben cumplir con los siguientes requisitos:

1. **Longitud mínima**: 8 caracteres
2. **Complejidad**:
   - Al menos una letra mayúscula
   - Al menos una letra minúscula
   - Al menos un número
   - Al menos un carácter especial (por ejemplo, @, $, !, %, *, ?, &)

Estos requisitos se aplican en los siguientes escenarios:
- Registro de usuario
- Actualización de contraseña en el perfil
- Restablecimiento de contraseña

## Implementación en el Frontend

### Expresión Regular

La validación en el frontend utiliza la siguiente expresión regular:

```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
```

Esta expresión regular verifica:
- `(?=.*[a-z])`: Al menos una letra minúscula
- `(?=.*[A-Z])`: Al menos una letra mayúscula
- `(?=.*\d)`: Al menos un número
- `(?=.*[@$!%*?&])`: Al menos uno de los caracteres especiales listados
- `[A-Za-z\d@$!%*?&]{8,}`: Un total de al menos 8 caracteres, compuestos por letras, números y los caracteres especiales permitidos

### Formulario de Registro

En el archivo `frontend/src/views/auth/RegisterView.vue`, la validación se implementa en la función `validateForm()`:

```javascript
password: [
  value => !value ? 'La contraseña es obligatoria' : null,
  value => value && value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : null,
  value => value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) ? 
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' : null
]
```

### Formulario de Perfil

En el archivo `frontend/src/views/profile/ProfileView.vue`, la validación se implementa de manera similar:

```javascript
password: [
  value => value && value.length < 8 && value.length > 0 ? 'La contraseña debe tener al menos 8 caracteres' : null,
  value => value && value.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) ? 
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' : null
]
```

Además, se realiza una validación manual antes de enviar los datos al backend:

```javascript
if (userData.password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(userData.password)) {
    setErrors({
      password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
    });
    throw new Error('Contraseña inválida');
  }
}
```

## Implementación en el Backend

### Controlador de Autenticación

En el archivo `backend/app/Http/Controllers/AuthController.php`, la validación se implementa en el método `register()`:

```php
'password' => [
    'required',
    'string',
    'min:8',
    'confirmed',
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
]
```

### Controlador de Perfil

En el archivo `backend/app/Http/Controllers/ProfileController.php`, la validación se implementa en el método `update()`:

```php
'password' => [
    'nullable',
    'string',
    'min:8',
    'confirmed',
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
]
```

También se incluyen mensajes de error personalizados:

```php
'password.min' => 'La contraseña debe tener al menos 8 caracteres',
'password.regex' => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
'password.confirmed' => 'Las contraseñas no coinciden'
```

## Diferencias entre Registro y Perfil

Aunque las reglas de validación son las mismas, hay algunas diferencias en la implementación:

### Registro

- La contraseña es **obligatoria**
- Se requiere confirmación de contraseña
- Se valida antes de crear el usuario

### Perfil

- La contraseña es **opcional** (solo se valida si se proporciona)
- Se requiere confirmación de contraseña solo si se proporciona una contraseña
- Se valida antes de actualizar el usuario

## Tests

Se han implementado tests automatizados para verificar que la validación de contraseñas funciona correctamente:

### Tests de Validación de Contraseña

En el archivo `backend/tests/Feature/Auth/PasswordValidationTest.php`, se prueban diferentes escenarios:

1. **Registro con contraseña débil**:
   - Contraseña demasiado corta
   - Contraseña sin mayúsculas
   - Contraseña sin minúsculas
   - Contraseña sin números
   - Contraseña sin caracteres especiales

2. **Actualización de perfil con contraseña débil**:
   - Mismos escenarios que en el registro

### Tests de Perfil

En el archivo `backend/tests/Feature/ProfileControllerTest.php`, se prueba:
- Actualización de perfil con contraseña válida
- Validación de errores al actualizar el perfil

### Tests de Flujo de Usuario

En el archivo `backend/tests/Feature/UserFlowTest.php`, se prueba el flujo completo:
- Registro con contraseña válida
- Verificación de email
- Creación de piloto

## Mejores Prácticas

1. **Validación en ambos lados**: La validación se realiza tanto en el frontend como en el backend para proporcionar feedback inmediato al usuario y garantizar la seguridad.

2. **Mensajes de error claros**: Los mensajes de error son específicos y explican claramente qué requisitos debe cumplir la contraseña.

3. **Consistencia**: Las mismas reglas de validación se aplican en todos los formularios donde se requiere una contraseña.

4. **Tests automatizados**: Se han implementado tests para verificar que la validación funciona correctamente en diferentes escenarios.

## Ejemplos de Contraseñas Válidas

- `Password123!`
- `Secure$123`
- `Complex@456`
- `VaxavGame#789`

## Ejemplos de Contraseñas Inválidas

- `password` (sin mayúsculas, números ni caracteres especiales)
- `Password` (sin números ni caracteres especiales)
- `password123` (sin mayúsculas ni caracteres especiales)
- `PASSWORD123` (sin minúsculas ni caracteres especiales)
- `Pass123` (demasiado corta)
- `Password123` (sin caracteres especiales)

## Documentación Relacionada

- [Validaciones del Formulario de Registro](./registration-validation.md): Detalles sobre todas las validaciones del formulario de registro.
- [Gestión de Perfil de Usuario](./user-profile.md): Información sobre la gestión del perfil de usuario.
- [Restablecimiento de Contraseña](./password-reset.md): Información sobre el proceso de restablecimiento de contraseña.
