# Arquitectura del Backend

Este documento describe la arquitectura del backend de Vaxav, desarrollado con Laravel.

## Tecnologías Principales

- **Laravel**: Framework PHP para el desarrollo del backend.
- **Laravel Sanctum**: Paquete oficial de Laravel para la autenticación basada en tokens.
- **MySQL/SQLite**: Sistema de gestión de bases de datos relacional.
- **Eloquent ORM**: ORM de Laravel para interactuar con la base de datos.
- **PHPUnit**: Framework de pruebas para PHP.

## Estructura de Directorios

```
api/
├── app/                 # Código principal de la aplicación
│   ├── Http/            # Controladores, middleware y requests
│   │   ├── Controllers/ # Controladores de la aplicación
│   │   │   └── Admin/   # Controladores para el panel de administración
│   │   └── Middleware/  # Middleware personalizado
│   ├── Models/          # Modelos Eloquent
│   ├── Providers/       # Proveedores de servicios
│   └── ...
├── bootstrap/           # Archivos de arranque de Laravel
├── config/              # Archivos de configuración
├── database/            # Migraciones, factories y seeders
│   ├── migrations/      # Migraciones de base de datos
│   ├── factories/       # Factories para pruebas
│   └── seeders/         # Seeders para datos iniciales
├── public/              # Punto de entrada público
├── resources/           # Vistas, assets y traducciones
├── routes/              # Definiciones de rutas
│   ├── api.php          # Rutas de API
│   └── web.php          # Rutas web
├── storage/             # Archivos generados por la aplicación
├── tests/               # Pruebas automatizadas
├── .env                 # Variables de entorno
└── composer.json        # Dependencias y configuración
```

## Modelos

Los modelos representan las entidades principales del sistema y definen las relaciones entre ellas.

### Modelos Principales

- **User**: Representa a un usuario del sistema.
- **Role**: Representa un rol en el sistema.
- **Permission**: Representa un permiso en el sistema.
- **Pilot**: Representa un piloto en el juego.
- **Ship**: Representa una nave espacial.
- **Planet**: Representa un planeta en el universo.
- **Market**: Representa el mercado de recursos.

### Ejemplo de Modelo

```php
// app/Models/User.php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relación con roles
    public function roles()
    {
        return $this->belongsToMany(Role::class);
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

## Controladores

Los controladores gestionan las solicitudes HTTP y devuelven respuestas. Están organizados por funcionalidad.

### Controladores Principales

- **AuthController**: Gestiona la autenticación de usuarios.
- **Admin/UserController**: Gestiona las operaciones CRUD para usuarios.
- **Admin/RoleController**: Gestiona las operaciones CRUD para roles.
- **PilotController**: Gestiona las operaciones relacionadas con pilotos.
- **ShipController**: Gestiona las operaciones relacionadas con naves.
- **UniverseController**: Gestiona las operaciones relacionadas con el universo.
- **MarketController**: Gestiona las operaciones relacionadas con el mercado.

### Ejemplo de Controlador

```php
// app/Http/Controllers/Admin/UserController.php
class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json(['data' => $users, 'total' => $users->count()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (isset($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return response()->json($user->load('roles'), 201);
    }

    // Otros métodos (show, update, destroy)...
}
```

## Middleware

El middleware proporciona una capa de filtrado para las solicitudes HTTP.

### Middleware Personalizado

- **CheckPermission**: Verifica si el usuario tiene el permiso requerido.

### Ejemplo de Middleware

```php
// app/Http/Middleware/CheckPermission.php
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

## Rutas

Las rutas definen los endpoints de la API y los controladores que los gestionan.

### Ejemplo de Rutas

```php
// routes/api.php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Rutas de administración
    Route::prefix('admin')->middleware('permission:admin.access')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);
        Route::get('permissions', [RoleController::class, 'permissions']);
    });

    // Otras rutas protegidas...
});
```

## Autenticación y Autorización

La autenticación se gestiona con Laravel Sanctum, mientras que la autorización utiliza un sistema personalizado de roles y permisos.

Para más detalles, consulte la [documentación de autenticación y autorización](../auth/README.md).

## Base de Datos

La estructura de la base de datos se define mediante migraciones de Laravel.

### Tablas Principales

- **users**: Almacena los usuarios del sistema.
- **roles**: Almacena los roles disponibles.
- **permissions**: Almacena los permisos disponibles.
- **role_user**: Tabla pivote para la relación entre roles y usuarios.
- **permission_role**: Tabla pivote para la relación entre permisos y roles.
- **pilots**: Almacena los pilotos del juego.
- **ships**: Almacena las naves espaciales.
- **planets**: Almacena los planetas del universo.
- **resources**: Almacena los recursos disponibles.
- **market_listings**: Almacena las ofertas del mercado.

Para más detalles sobre la estructura de la base de datos, consulte la [documentación de la base de datos](./database.md).

## Validación

La validación de datos se realiza principalmente en los controladores utilizando el sistema de validación de Laravel.

### Ejemplo de Validación

```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|string|email|max:255|unique:users',
    'password' => 'required|string|min:8',
    'roles' => 'array',
    'roles.*' => 'exists:roles,id',
]);
```

## Manejo de Errores

Los errores se manejan de forma consistente en toda la API:

- **Errores de Validación**: Devuelven un código 422 con los mensajes de error.
- **Errores de Autenticación**: Devuelven un código 401 con un mensaje de error.
- **Errores de Autorización**: Devuelven un código 403 con un mensaje de error.
- **Errores de Recurso No Encontrado**: Devuelven un código 404 con un mensaje de error.
- **Errores del Servidor**: Devuelven un código 500 con un mensaje de error.

## Pruebas

Las pruebas se organizan en:

- **Pruebas Unitarias**: Prueban componentes individuales.
- **Pruebas de Integración**: Prueban la interacción entre componentes.
- **Pruebas de Características**: Prueban funcionalidades completas.

### Ejemplo de Prueba

```php
// tests/Feature/UserTest.php
class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_users_list()
    {
        $user = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'Admin']);
        $user->roles()->attach($adminRole);

        $response = $this->actingAs($user)
                         ->getJson('/api/admin/users');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'total']);
    }

    // Otras pruebas...
}
```

## Buenas Prácticas

1. **Controladores Delgados**: Mantener los controladores enfocados en la gestión de solicitudes HTTP.
2. **Modelos Gordos**: Colocar la lógica de negocio en los modelos o servicios dedicados.
3. **Validación Estricta**: Validar todas las entradas de usuario.
4. **Respuestas Consistentes**: Mantener un formato de respuesta consistente en toda la API.
5. **Pruebas Exhaustivas**: Escribir pruebas para todas las funcionalidades críticas.
6. **Documentación Clara**: Documentar todos los endpoints y sus parámetros.

## Flujo de Desarrollo

1. **Definir Modelos**: Crear los modelos y sus relaciones.
2. **Crear Migraciones**: Definir la estructura de la base de datos.
3. **Implementar Controladores**: Desarrollar la lógica de los controladores.
4. **Definir Rutas**: Configurar las rutas para los controladores.
5. **Escribir Pruebas**: Crear pruebas para verificar la funcionalidad.
6. **Documentar API**: Documentar los endpoints para los desarrolladores frontend.

## Recursos Adicionales

- [Documentación de Laravel](https://laravel.com/docs)
- [Documentación de Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Documentación de Eloquent ORM](https://laravel.com/docs/eloquent)
