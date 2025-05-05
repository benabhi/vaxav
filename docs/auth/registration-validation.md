# Validaciones del Formulario de Registro

Este documento describe las validaciones implementadas en el formulario de registro de Vaxav, tanto en el frontend como en el backend. Estas mismas validaciones también se aplican en el formulario de restablecimiento de contraseña.

## Índice

1. [Requisitos de Validación](#requisitos-de-validación)
2. [Implementación en el Frontend](#implementación-en-el-frontend)
3. [Implementación en el Backend](#implementación-en-el-backend)
4. [Mensajes de Error](#mensajes-de-error)
5. [Pruebas](#pruebas)

## Requisitos de Validación

Los requisitos de validación para el formulario de registro son los siguientes:

### Nombre de Usuario
- Solo puede contener letras y números
- Mínimo 3 caracteres
- Máximo 12 caracteres

### Email
- Debe tener un formato de email válido
- Debe ser único en la base de datos
- Debe ser confirmado con un campo de confirmación

### Contraseña
- Mínimo 8 caracteres
- Debe incluir al menos una letra mayúscula
- Debe incluir al menos una letra minúscula
- Debe incluir al menos un número
- Debe incluir al menos un carácter especial (@$!%*?&)
- Debe ser confirmada con un campo de confirmación

## Implementación en el Frontend

Las validaciones en el frontend se implementan en el componente `RegisterView.vue` utilizando una función de validación personalizada.

### Estructura del Formulario

```vue
<template>
  <VxvForm title="Crear Cuenta" @submit="handleSubmit">
    <!-- Nombre de Usuario -->
    <VxvInput
      id="name"
      v-model="form.name"
      label="Nombre"
      type="text"
      required
      :error="errors.name"
    />

    <!-- Email -->
    <VxvInput
      id="email"
      v-model="form.email"
      label="Email"
      type="email"
      required
      :error="errors.email"
    />

    <!-- Confirmación de Email -->
    <VxvInput
      id="email_confirmation"
      v-model="form.email_confirmation"
      label="Confirmar Email"
      type="email"
      required
      :error="errors.email_confirmation"
    />

    <!-- Contraseña -->
    <VxvInput
      id="password"
      v-model="form.password"
      label="Contraseña"
      type="password"
      required
      :error="errors.password"
    />

    <!-- Confirmación de Contraseña -->
    <VxvInput
      id="password_confirmation"
      v-model="form.password_confirmation"
      label="Confirmar Contraseña"
      type="password"
      required
      :error="errors.password_confirmation"
    />
  </VxvForm>
</template>
```

### Función de Validación

```typescript
const validateForm = (): boolean => {
  let isValid = true;

  // Limpiar errores previos
  errors.name = '';
  errors.email = '';
  errors.email_confirmation = '';
  errors.password = '';
  errors.password_confirmation = '';

  // Validar nombre (solo letras y números, 3-12 caracteres)
  if (!form.name) {
    errors.name = 'El nombre es obligatorio';
    isValid = false;
  } else if (!/^[a-zA-Z0-9]{3,12}$/.test(form.name)) {
    errors.name = 'El nombre debe tener entre 3 y 12 caracteres alfanuméricos';
    isValid = false;
  }

  // Validar email (formato de email)
  if (!form.email) {
    errors.email = 'El email es obligatorio';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email debe tener un formato válido';
    isValid = false;
  }

  // Validar confirmación de email
  if (!form.email_confirmation) {
    errors.email_confirmation = 'La confirmación de email es obligatoria';
    isValid = false;
  } else if (form.email !== form.email_confirmation) {
    errors.email_confirmation = 'Los emails no coinciden';
    isValid = false;
  }

  // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial)
  if (!form.password) {
    errors.password = 'La contraseña es obligatoria';
    isValid = false;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
    isValid = false;
  }

  // Validar confirmación de contraseña
  if (!form.password_confirmation) {
    errors.password_confirmation = 'La confirmación de contraseña es obligatoria';
    isValid = false;
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden';
    isValid = false;
  }

  return isValid;
};
```

### Manejo de Errores del Servidor

```typescript
const handleSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateForm()) {
    return;
  }

  try {
    await authStore.register(form);

    if (authStore.isLoggedIn) {
      // Redirigir a la página de verificación de email
      router.push({ name: 'verification.notice' });
    }
  } catch (error: any) {
    // Los errores de validación del servidor ya son manejados por el store
    console.error('Error en el registro:', error);

    // Si hay errores de validación del servidor, actualizar los errores locales
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;

      if (serverErrors.name) {
        errors.name = Array.isArray(serverErrors.name) ? serverErrors.name[0] : serverErrors.name;
      }

      if (serverErrors.email) {
        errors.email = Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email;
      }

      if (serverErrors.password) {
        errors.password = Array.isArray(serverErrors.password) ? serverErrors.password[0] : serverErrors.password;
      }

      if (serverErrors.password_confirmation) {
        errors.password_confirmation = Array.isArray(serverErrors.password_confirmation)
          ? serverErrors.password_confirmation[0]
          : serverErrors.password_confirmation;
      }
    }
  }
};
```

## Implementación en el Backend

Las validaciones en el backend se implementan en el controlador `AuthController.php` utilizando el método `validate` de Laravel.

```php
public function register(Request $request)
{
    $request->validate([
        'name'               => 'required|string|min:3|max:12|regex:/^[a-zA-Z0-9]+$/',
        'email'              => 'required|string|email|max:255|unique:users',
        'email_confirmation' => 'required|string|same:email',
        'password'           => [
            'required',
            'string',
            'min:8',
            'confirmed',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
        ],
    ], [
        'name.required'               => 'El nombre es obligatorio',
        'name.min'                    => 'El nombre debe tener al menos 3 caracteres',
        'name.max'                    => 'El nombre no puede tener más de 12 caracteres',
        'name.regex'                  => 'El nombre solo puede contener letras y números',
        'email.required'              => 'El email es obligatorio',
        'email.email'                 => 'El email debe tener un formato válido',
        'email.unique'                => 'Este email ya está en uso',
        'email_confirmation.required' => 'La confirmación de email es obligatoria',
        'email_confirmation.same'     => 'Los emails no coinciden',
        'password.required'           => 'La contraseña es obligatoria',
        'password.min'                => 'La contraseña debe tener al menos 8 caracteres',
        'password.regex'              => 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
        'password.confirmed'          => 'Las contraseñas no coinciden',
    ]);

    // Crear usuario...
}
```

## Mensajes de Error

Los mensajes de error se muestran en el formulario de registro utilizando el componente `VxvInput` con la propiedad `:error`.

### Mensajes de Error en el Frontend

- **Nombre de Usuario**:
  - "El nombre es obligatorio"
  - "El nombre debe tener entre 3 y 12 caracteres alfanuméricos"

- **Email**:
  - "El email es obligatorio"
  - "El email debe tener un formato válido"

- **Confirmación de Email**:
  - "La confirmación de email es obligatoria"
  - "Los emails no coinciden"

- **Contraseña**:
  - "La contraseña es obligatoria"
  - "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"

- **Confirmación de Contraseña**:
  - "La confirmación de contraseña es obligatoria"
  - "Las contraseñas no coinciden"

### Mensajes de Error en el Backend

- **Nombre de Usuario**:
  - "El nombre es obligatorio"
  - "El nombre debe tener al menos 3 caracteres"
  - "El nombre no puede tener más de 12 caracteres"
  - "El nombre solo puede contener letras y números"

- **Email**:
  - "El email es obligatorio"
  - "El email debe tener un formato válido"
  - "Este email ya está en uso"

- **Confirmación de Email**:
  - "La confirmación de email es obligatoria"
  - "Los emails no coinciden"

- **Contraseña**:
  - "La contraseña es obligatoria"
  - "La contraseña debe tener al menos 8 caracteres"
  - "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
  - "Las contraseñas no coinciden"

## Pruebas

Las pruebas para el formulario de registro se implementan en el archivo `AuthenticationTest.php`.

```php
public function test_users_can_register()
{
    $response = $this->postJson('/api/auth/register', [
        'name'                  => 'TestUser123',
        'email'                 => 'test@example.com',
        'email_confirmation'    => 'test@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'created_at', 'updated_at'],
            'token',
        ]);

    $this->assertDatabaseHas('users', [
        'name'  => 'TestUser123',
        'email' => 'test@example.com',
    ]);
}
```

### Casos de Prueba Adicionales

Se recomienda implementar los siguientes casos de prueba adicionales:

1. **Validación de Nombre de Usuario**:
   - Nombre de usuario demasiado corto
   - Nombre de usuario demasiado largo
   - Nombre de usuario con caracteres no permitidos

2. **Validación de Email**:
   - Email con formato inválido
   - Email ya existente
   - Email y confirmación de email no coinciden

3. **Validación de Contraseña**:
   - Contraseña demasiado corta
   - Contraseña sin mayúscula
   - Contraseña sin minúscula
   - Contraseña sin número
   - Contraseña sin carácter especial
   - Contraseña y confirmación de contraseña no coinciden
