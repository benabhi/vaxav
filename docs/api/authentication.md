# Autenticación en Vaxav

> **Nota**: Esta documentación ha sido reemplazada por una versión más completa y actualizada. Por favor, consulte la [nueva documentación de autenticación y autorización](../auth/README.md).

Este documento describe el sistema de autenticación utilizado en Vaxav, incluyendo los endpoints disponibles y el flujo de autenticación.

## Tecnología

Vaxav utiliza Laravel Sanctum para la autenticación basada en tokens. Este enfoque proporciona:

- Autenticación segura para la API
- Tokens de acceso para usuarios
- Protección contra CSRF para rutas web

## Endpoints de Autenticación

### Registro de Usuario

**Endpoint:** `POST /api/register`

**Descripción:** Registra un nuevo usuario en el sistema.

**Parámetros:**
```json
{
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña",
  "password_confirmation": "contraseña"
}
```

**Respuesta Exitosa:**
```json
{
  "user": {
    "id": 1,
    "name": "Nombre del Usuario",
    "email": "usuario@ejemplo.com",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  },
  "token": "1|abcdefghijklmnopqrstuvwxyz123456"
}
```

### Inicio de Sesión

**Endpoint:** `POST /api/login`

**Descripción:** Inicia sesión con un usuario existente.

**Parámetros:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta Exitosa:**
```json
{
  "user": {
    "id": 1,
    "name": "Nombre del Usuario",
    "email": "usuario@ejemplo.com",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  },
  "token": "1|abcdefghijklmnopqrstuvwxyz123456"
}
```

### Cierre de Sesión

**Endpoint:** `POST /api/logout`

**Descripción:** Cierra la sesión del usuario actual y revoca su token.

**Encabezados Requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

### Obtener Usuario Actual

**Endpoint:** `GET /api/user`

**Descripción:** Obtiene la información del usuario autenticado.

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
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

### Obtener Perfil de Usuario

**Endpoint:** `GET /api/auth/profile`

**Descripción:** Obtiene la información detallada del perfil del usuario autenticado, incluyendo roles.

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

### Actualizar Perfil de Usuario

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
- Los campos `password` y `password_confirmation` son opcionales.
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

## Flujo de Autenticación

### Registro de Usuario

1. El cliente envía una solicitud POST a `/api/register` con los datos del usuario
2. El servidor valida los datos
3. Si los datos son válidos, se crea un nuevo usuario en la base de datos
4. Se genera un token de acceso para el usuario
5. El servidor devuelve los datos del usuario y el token

### Inicio de Sesión

1. El cliente envía una solicitud POST a `/api/login` con las credenciales
2. El servidor valida las credenciales
3. Si las credenciales son válidas, se genera un token de acceso
4. El servidor devuelve los datos del usuario y el token

### Uso del Token

1. El cliente almacena el token (generalmente en localStorage)
2. Para solicitudes autenticadas, el cliente incluye el token en el encabezado `Authorization`
3. El servidor valida el token en cada solicitud
4. Si el token es válido, la solicitud se procesa
5. Si el token no es válido o ha expirado, se devuelve un error 401

### Cierre de Sesión

1. El cliente envía una solicitud POST a `/api/logout` con el token en el encabezado
2. El servidor revoca el token
3. El cliente elimina el token almacenado

## Implementación en el Frontend

### Almacenamiento del Token

El token se almacena en el localStorage del navegador:

```javascript
// Guardar token
localStorage.setItem('auth_token', token);

// Recuperar token
const token = localStorage.getItem('auth_token');

// Eliminar token
localStorage.removeItem('auth_token');
```

### Configuración de Axios

El token se incluye automáticamente en todas las solicitudes a través de Axios:

```javascript
// Configurar token en los headers
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Manejo de Errores de Autenticación

Si una solicitud devuelve un error 401 (No autorizado), el usuario es redirigido a la página de inicio de sesión:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirigir a la página de inicio de sesión
      router.push('/login');
      // Limpiar el token
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);
```

## Protección de Rutas

### Backend (Laravel)

Las rutas que requieren autenticación están protegidas con el middleware `auth:sanctum`:

```php
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
```

### Frontend (Vue.js)

Las rutas que requieren autenticación están protegidas en el router:

```javascript
const router = createRouter({
  // ...
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    // ...
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login' });
  } else {
    next();
  }
});
```

## Seguridad

- Los tokens tienen una duración limitada
- Las contraseñas se almacenan hasheadas usando bcrypt
- Las solicitudes de autenticación están protegidas contra ataques de fuerza bruta
- Se utilizan HTTPS para todas las comunicaciones en producción

## Credenciales de Prueba

Para pruebas, puedes usar las siguientes credenciales:

- **Email**: test@example.com
- **Contraseña**: password
