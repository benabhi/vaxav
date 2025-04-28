# Implementación de Autenticación en el Backend

Este documento describe cómo se implementa la autenticación y autorización en el backend de la aplicación Vaxav.

## Tecnologías Utilizadas

- **Laravel**: Framework PHP para el desarrollo del backend.
- **Laravel Sanctum**: Paquete oficial de Laravel para la autenticación basada en tokens.
- **MySQL**: Sistema de gestión de bases de datos relacional.

## Estructura de Archivos

```
api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── RoleController.php
│   │   │   │   └── UserController.php
│   │   │   ├── AuthController.php
│   │   │   └── ...
│   │   ├── Middleware/
│   │   │   ├── CheckPermission.php
│   │   │   └── ...
│   │   └── ...
│   ├── Models/
│   │   ├── Permission.php
│   │   ├── Role.php
│   │   ├── User.php
│   │   └── ...
│   └── ...
├── database/
│   ├── migrations/
│   │   ├── 2014_10_12_000000_create_users_table.php
│   │   ├── 2023_01_01_000000_create_roles_table.php
│   │   ├── 2023_01_01_000001_create_permissions_table.php
│   │   ├── 2023_01_01_000002_create_permission_role_table.php
│   │   ├── 2023_01_01_000003_create_role_user_table.php
│   │   └── ...
│   └── seeders/
│       ├── RoleSeeder.php
│       ├── PermissionSeeder.php
│       └── ...
├── routes/
│   ├── api.php
│   └── ...
└── ...
```

## Modelos

### User.php

El modelo `User` representa a un usuario del sistema y define las relaciones con los roles.

```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Relación muchos a muchos con roles
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    // Verificar si el usuario tiene un rol específico
    public function hasRole($role)
    {
        return $this->roles->contains('slug', $role);
    }

    // Verificar si el usuario tiene un permiso específico
    public function hasPermission($permission)
    {
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('slug', $permission)) {
                return true;
            }
        }
        return false;
    }
}
```

### Role.php

El modelo `Role` representa un rol en el sistema y define las relaciones con los permisos y usuarios.

```php
class Role extends Model
{
    use HasFactory;

    // Relación muchos a muchos con permisos
    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    // Relación muchos a muchos con usuarios
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
```

### Permission.php

El modelo `Permission` representa un permiso en el sistema y define la relación con los roles.

```php
class Permission extends Model
{
    use HasFactory;

    // Relación muchos a muchos con roles
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
```

## Middleware

### CheckPermission.php

El middleware `CheckPermission` verifica si el usuario autenticado tiene el permiso requerido para acceder a una ruta específica.

```php
class CheckPermission
{
    public function handle($request, Closure $next, $permission)
    {
        if (!$request->user() || !$request->user()->hasPermission($permission)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

## Controladores

### AuthController.php

El controlador `AuthController` gestiona la autenticación de usuarios.

```php
class AuthController extends Controller
{
    // Iniciar sesión
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles.permissions'),
            'token' => $token
        ]);
    }

    // Cerrar sesión
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // Obtener usuario autenticado
    public function user(Request $request)
    {
        return response()->json($request->user()->load('roles.permissions'));
    }
}
```

### UserController.php

El controlador `UserController` gestiona las operaciones CRUD para los usuarios.

```php
class UserController extends Controller
{
    // Listar usuarios
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json(['data' => $users, 'total' => $users->count()]);
    }

    // Crear usuario
    public function store(Request $request)
    {
        // Validación y creación de usuario
    }

    // Actualizar usuario
    public function update(Request $request, User $user)
    {
        // Validación y actualización de usuario
    }

    // Eliminar usuario
    public function destroy(User $user)
    {
        // Eliminación de usuario
    }
}
```

### RoleController.php

El controlador `RoleController` gestiona las operaciones CRUD para los roles.

```php
class RoleController extends Controller
{
    // Listar roles
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json(['data' => $roles, 'total' => $roles->count()]);
    }

    // Listar permisos disponibles
    public function permissions()
    {
        return response()->json(Permission::all());
    }

    // Crear rol
    public function store(Request $request)
    {
        // Validación y creación de rol
    }

    // Actualizar rol
    public function update(Request $request, Role $role)
    {
        // Validación y actualización de rol
    }

    // Eliminar rol
    public function destroy(Role $role)
    {
        // Eliminación de rol
    }
}
```

## Rutas

### api.php

El archivo `api.php` define las rutas de la API, incluyendo las rutas de autenticación y las rutas protegidas.

```php
// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Rutas de administración
    Route::prefix('admin')->group(function () {
        // Gestión de usuarios
        Route::apiResource('users', UserController::class)->middleware([
            'permission:users.view',     // Para index y show
            'permission:users.create',   // Para store
            'permission:users.edit',     // Para update
            'permission:users.delete'    // Para destroy
        ]);

        // Gestión de roles
        Route::apiResource('roles', RoleController::class)->middleware([
            'permission:roles.view',     // Para index y show
            'permission:roles.create',   // Para store
            'permission:roles.edit',     // Para update
            'permission:roles.delete'    // Para destroy
        ]);
        Route::get('permissions', [RoleController::class, 'permissions'])->middleware('permission:roles.view');
    });
});
```

## Migraciones y Seeders

Las migraciones crean las tablas necesarias para el sistema de autenticación y autorización, mientras que los seeders populan las tablas con datos iniciales.

### Migraciones

- `create_users_table.php`: Crea la tabla de usuarios.
- `create_roles_table.php`: Crea la tabla de roles.
- `create_permissions_table.php`: Crea la tabla de permisos.
- `create_permission_role_table.php`: Crea la tabla pivote entre permisos y roles.
- `create_role_user_table.php`: Crea la tabla pivote entre roles y usuarios.

### Seeders

- `RoleSeeder.php`: Crea los roles predefinidos.
- `PermissionSeeder.php`: Crea los permisos predefinidos.
- `UserSeeder.php`: Crea usuarios iniciales con roles asignados.

## Configuración de Sanctum

La configuración de Laravel Sanctum se realiza en el archivo `config/sanctum.php`. Algunos aspectos importantes incluyen:

- **Tiempo de expiración de tokens**: Define cuánto tiempo son válidos los tokens.
- **Middleware**: Configura el middleware que se aplica a las rutas protegidas.
- **Dominios permitidos**: Define qué dominios pueden utilizar los tokens de Sanctum.
