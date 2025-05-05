# Gestión de Perfil de Usuario

Este documento describe la funcionalidad de gestión de perfil de usuario implementada en la aplicación Vaxav.

## Visión General

La funcionalidad de perfil de usuario permite a los usuarios autenticados ver y actualizar su información personal, incluyendo nombre, correo electrónico y contraseña. Esta funcionalidad está integrada con el sistema de autenticación de Laravel Sanctum y respeta los roles y permisos asignados al usuario.

## Componentes Principales

La funcionalidad de perfil de usuario consta de los siguientes componentes:

1. **Vista de Perfil**: Interfaz de usuario para ver y editar la información del perfil.
2. **API de Perfil**: Endpoints para obtener y actualizar la información del perfil.
3. **Controlador de Perfil**: Lógica de negocio para gestionar las operaciones del perfil.
4. **Validación**: Reglas para validar los datos del perfil.

## Endpoints de API

### Obtener Perfil

**Endpoint:** `GET /api/auth/profile`

**Descripción:** Obtiene la información del perfil del usuario autenticado.

**Encabezados Requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa:**
```json
{
  "id": 1,
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "roles": [
    {
      "id": 2,
      "name": "Usuario",
      "slug": "user"
    }
  ],
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-01T00:00:00.000000Z",
  "is_superadmin": false,
  "is_admin": false,
  "is_moderator": false
}
```

### Actualizar Perfil

**Endpoint:** `PUT /api/auth/profile`

**Descripción:** Actualiza la información del perfil del usuario autenticado.

**Encabezados Requeridos:**
```
Authorization: Bearer {token}
```

**Parámetros:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@ejemplo.com",
  "password": "nueva-contraseña",
  "password_confirmation": "nueva-contraseña"
}
```

**Notas:**
- Los campos `password` y `password_confirmation` son opcionales. Si no se proporcionan, la contraseña no se actualizará.
- El campo `email` debe ser único en la base de datos.

**Respuesta Exitosa:**
```json
{
  "message": "Perfil actualizado correctamente",
  "user": {
    "id": 1,
    "name": "Nuevo Nombre",
    "email": "nuevo@ejemplo.com",
    "roles": [
      {
        "id": 2,
        "name": "Usuario",
        "slug": "user"
      }
    ],
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "is_superadmin": false,
    "is_admin": false,
    "is_moderator": false
  }
}
```

## Implementación en el Frontend

### Vista de Perfil

La vista de perfil (`ProfileView.vue`) proporciona una interfaz de usuario para ver y editar la información del perfil. Incluye:

- Campos para nombre y correo electrónico
- Campos opcionales para cambiar la contraseña
- Visualización de roles asignados (solo lectura)
- Validación en tiempo real
- Mensajes de error y éxito

### Acceso a la Vista de Perfil

La vista de perfil está accesible a través de la ruta `/profile` y está protegida por el middleware de autenticación. Solo los usuarios autenticados pueden acceder a esta vista.

```javascript
// router/index.ts
{
  path: '/profile',
  name: 'profile',
  component: () => import('../views/profile/ProfileView.vue'),
  meta: { requiresAuth: true }
}
```

### Menú de Usuario

El perfil es accesible desde el menú de usuario en la barra de navegación:

```html
<VxvDropdown menuClass="w-40">
  <template #trigger>
    <VxvButton variant="secondary" size="md">
      {{ user?.name }}
      <template #icon-right>
        <ChevronDownIcon class="h-4 w-4" />
      </template>
    </VxvButton>
  </template>

  <VxvDropdownItem label="Perfil" to="/profile" />
  <VxvDropdownItem label="Cerrar Sesión" @click="logout" />
</VxvDropdown>
```

## Implementación en el Backend

### Controlador de Perfil

El controlador `ProfileController` gestiona las operaciones relacionadas con el perfil del usuario:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $user->load('roles');

        // Add role helper properties
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json($userData);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        // Update user data
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Update password if provided
        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Reload user with roles
        $user->load('roles');

        // Add role helper properties
        $userData = $user->toArray();
        $userData['is_superadmin'] = $user->isSuperAdmin();
        $userData['is_admin'] = $user->isAdmin();
        $userData['is_moderator'] = $user->isModerator();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $userData
        ]);
    }
}
```

### Rutas de API

Las rutas de perfil están definidas en el grupo de autenticación y protegidas por el middleware `auth:sanctum`:

```php
// routes/api.php
Route::prefix('auth')->group(function () {
    // ... otras rutas de autenticación ...

    // Rutas de perfil
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
    });
});
```

## Validación

### Validación en el Backend

La validación en el backend se realiza utilizando las reglas de validación de Laravel:

- **Nombre**: Requerido, cadena, máximo 255 caracteres
- **Correo electrónico**: Requerido, formato de correo válido, único (excepto el propio usuario)
- **Contraseña**: Opcional, confirmada, cumple con los requisitos de seguridad

### Validación en el Frontend

La validación en el frontend se realiza utilizando el composable `useForm`:

```javascript
const validationRules = {
  name: [
    value => !value ? 'El nombre es obligatorio' : null
  ],
  email: [
    value => !value ? 'El correo electrónico es obligatorio' : null,
    value => value && !/\S+@\S+\.\S+/.test(value) ? 'El correo electrónico no es válido' : null
  ],
  password: [
    value => value && value.length < 8 && value.length > 0 ? 'La contraseña debe tener al menos 8 caracteres' : null
  ],
  password_confirmation: [
    (value, values) => values.password && value !== values.password ? 'Las contraseñas no coinciden' : null
  ]
};
```

## Seguridad

- Las rutas de perfil están protegidas por el middleware `auth:sanctum`
- Las contraseñas se almacenan utilizando el algoritmo de hash bcrypt
- La validación se realiza tanto en el frontend como en el backend
- Se verifica que el usuario solo pueda actualizar su propio perfil

## Tests

Se han implementado tests para verificar el correcto funcionamiento de la funcionalidad de perfil:

- Test de visualización del perfil
- Test de actualización del perfil
- Test de actualización de contraseña
- Test de validación de datos
- Test de seguridad (acceso no autorizado)

## Documentación Relacionada

Para obtener más información sobre aspectos relacionados, consulte los siguientes documentos:

- [Autenticación y Autorización](./README.md): Visión general del sistema de autenticación y autorización.
- [Implementación Frontend](./frontend-implementation.md): Cómo se implementa la autenticación en el frontend.
- [Implementación Backend](./backend-implementation.md): Cómo se implementa la autenticación en el backend.
- [Validación de Contraseñas](./password-validation.md): Detalles sobre el sistema de validación de contraseñas en el perfil.
