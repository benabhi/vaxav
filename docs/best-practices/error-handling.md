# Manejo de Errores en Vaxav

Este documento describe las mejores prácticas para el manejo de errores en la aplicación Vaxav, tanto en el backend como en el frontend.

## Índice

1. [Principios Generales](#principios-generales)
2. [Manejo de Errores en el Backend](#manejo-de-errores-en-el-backend)
3. [Manejo de Errores en el Frontend](#manejo-de-errores-en-el-frontend)
4. [Ejemplos Prácticos](#ejemplos-prácticos)
5. [Códigos de Estado HTTP](#códigos-de-estado-http)

## Principios Generales

El manejo de errores en Vaxav sigue estos principios fundamentales:

1. **Mensajes claros y específicos**: Los mensajes de error deben ser descriptivos y orientados al usuario.
2. **Responsabilidad compartida**: El backend proporciona mensajes de error específicos, y el frontend los muestra de manera adecuada.
3. **Seguridad**: No exponer información sensible en los mensajes de error.
4. **Consistencia**: Mantener un formato consistente para todos los errores.
5. **Internacionalización**: Preparar los mensajes para ser traducidos a diferentes idiomas.

## Manejo de Errores en el Backend

### Responsabilidades del Backend

El backend es responsable de:

1. **Validar los datos de entrada**: Utilizando las reglas de validación de Laravel.
2. **Proporcionar mensajes de error específicos**: Para cada tipo de error que pueda ocurrir.
3. **Usar los códigos de estado HTTP adecuados**: Para indicar el tipo de error.
4. **Estructurar las respuestas de error de manera consistente**: Siguiendo un formato estándar.

### Estructura de Respuesta de Error

Las respuestas de error del backend siguen esta estructura:

```json
{
  "message": "Mensaje general del error",
  "errors": {
    "campo1": ["Error específico para campo1"],
    "campo2": ["Error específico para campo2"]
  }
}
```

### Ejemplo de Validación en el Backend

```php
$request->validate([
    'email'    => 'required|email',
    'password' => 'required',
], [
    'email.required'    => 'Por favor, ingresa tu dirección de correo electrónico.',
    'email.email'       => 'Por favor, ingresa una dirección de correo electrónico válida.',
    'password.required' => 'Por favor, ingresa tu contraseña.',
]);
```

### Manejo de Errores Específicos

Para errores específicos, como credenciales incorrectas, el backend debe proporcionar mensajes claros:

```php
// Verificar si el usuario existe
$user = User::where('email', $request->email)->first();

if (!$user) {
    throw ValidationException::withMessages([
        'email' => ['El usuario con este correo electrónico no existe.'],
    ]);
}

// Si la contraseña es incorrecta
throw ValidationException::withMessages([
    'password' => ['La contraseña ingresada es incorrecta.'],
]);
```

## Manejo de Errores en el Frontend

### Responsabilidades del Frontend

El frontend es responsable de:

1. **Mostrar los mensajes de error del backend**: De manera clara y en el contexto adecuado.
2. **Proporcionar mensajes de fallback**: Cuando el backend no proporciona un mensaje específico.
3. **Presentar los errores de manera amigable**: Utilizando componentes de UI consistentes.
4. **Manejar diferentes tipos de errores**: Validación, autenticación, autorización, etc.

### Estructura para Manejar Errores

```typescript
try {
  // Llamada a la API
  await userStore.login(credentials);
} catch (error: any) {
  // Manejar diferentes tipos de errores
  if (error.response?.status === 422) {
    // Error de validación
    if (error.response?.data?.errors?.email) {
      // Mostrar error específico del email
      const errorMessage = Array.isArray(error.response.data.errors.email)
        ? error.response.data.errors.email[0]
        : error.response.data.errors.email;
      
      notificationStore.error(errorMessage, 'Error de autenticación');
    } else if (error.response?.data?.errors?.password) {
      // Mostrar error específico de la contraseña
      const errorMessage = Array.isArray(error.response.data.errors.password)
        ? error.response.data.errors.password[0]
        : error.response.data.errors.password;
      
      notificationStore.error(errorMessage, 'Error de autenticación');
    } else {
      // Mensaje genérico para otros errores de validación
      notificationStore.error('Por favor, verifica los datos ingresados.', 'Error de validación');
    }
  } else if (error.response?.status === 429) {
    // Error de límite de intentos
    notificationStore.error('Demasiados intentos. Por favor, inténtalo de nuevo más tarde.', 'Error de límite');
  } else if (error.response?.status === 500) {
    // Error del servidor
    notificationStore.error('Ha ocurrido un error en el servidor. Por favor, inténtalo de nuevo más tarde.', 'Error del servidor');
  } else {
    // Otros errores
    const errorMessage = error.response?.data?.message || 'Ha ocurrido un error inesperado.';
    notificationStore.error(errorMessage, 'Error');
  }
}
```

## Ejemplos Prácticos

### Ejemplo 1: Inicio de Sesión

**Backend (AuthController.php)**:
```php
public function login(Request $request)
{
    try {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ], [
            'email.required'    => 'Por favor, ingresa tu dirección de correo electrónico.',
            'email.email'       => 'Por favor, ingresa una dirección de correo electrónico válida.',
            'password.required' => 'Por favor, ingresa tu contraseña.',
        ]);
        
        // Verificar si el usuario existe
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['El usuario con este correo electrónico no existe.'],
            ]);
        }
        
        // Intentar autenticar
        if (Auth::attempt($request->only('email', 'password'))) {
            // Autenticación exitosa...
        }
        
        // Si llegamos aquí, el usuario existe pero la contraseña es incorrecta
        throw ValidationException::withMessages([
            'password' => ['La contraseña ingresada es incorrecta.'],
        ]);
    } catch (ValidationException $e) {
        throw $e;
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Ha ocurrido un error al intentar iniciar sesión.',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

**Frontend (LoginView.vue)**:
```typescript
try {
  await userStore.login(form);
  // Éxito...
} catch (error: any) {
  console.error('Error al iniciar sesión:', error);
  
  // Mostrar mensaje de error específico
  if (error.response?.status === 422) {
    if (error.response?.data?.errors?.email) {
      const errorMessage = Array.isArray(error.response.data.errors.email)
        ? error.response.data.errors.email[0]
        : error.response.data.errors.email;
      
      notificationStore.error(errorMessage, 'Error de autenticación');
    } else if (error.response?.data?.errors?.password) {
      const errorMessage = Array.isArray(error.response.data.errors.password)
        ? error.response.data.errors.password[0]
        : error.response.data.errors.password;
      
      notificationStore.error(errorMessage, 'Error de autenticación');
    } else {
      notificationStore.error('Credenciales incorrectas', 'Error de autenticación');
    }
  } else {
    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
    notificationStore.error(errorMessage, 'Error de autenticación');
  }
}
```

## Códigos de Estado HTTP

Los códigos de estado HTTP más comunes utilizados en la aplicación son:

| Código | Descripción | Uso en Vaxav |
|--------|-------------|--------------|
| 200    | OK | Respuesta exitosa |
| 201    | Created | Recurso creado exitosamente |
| 400    | Bad Request | Solicitud mal formada |
| 401    | Unauthorized | No autenticado |
| 403    | Forbidden | No autorizado |
| 404    | Not Found | Recurso no encontrado |
| 422    | Unprocessable Entity | Error de validación |
| 429    | Too Many Requests | Límite de intentos excedido |
| 500    | Internal Server Error | Error del servidor |
