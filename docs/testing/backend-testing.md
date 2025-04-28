# Guía de Testing para el Backend

Esta guía proporciona información detallada sobre cómo escribir y ejecutar tests para el backend de Vaxav.

## Configuración

El proyecto utiliza las siguientes herramientas para testing:

- **PHPUnit**: Framework de testing para PHP
- **Laravel Testing Tools**: Herramientas de testing incluidas en Laravel
- **SQLite en memoria**: Para tests que requieren base de datos
- **Factories**: Para generar datos de prueba

## Estructura de Tests

Los tests se organizan en dos carpetas principales:

```
api/tests/
├── Feature/           # Tests de características (endpoints, flujos completos)
│   ├── Auth/          # Tests relacionados con autenticación
│   ├── Admin/         # Tests relacionados con administración
│   └── ...
└── Unit/              # Tests unitarios (clases y métodos individuales)
    ├── Models/        # Tests de modelos
    ├── Services/      # Tests de servicios
    └── ...
```

## Tipos de Tests

### Tests Unitarios

Los tests unitarios prueban componentes individuales del sistema, como modelos, servicios o helpers.

**Ejemplo de test unitario para un modelo**:

```php
<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Role;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_roles()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create();
        
        // Act
        $user->roles()->attach($role);
        
        // Assert
        $this->assertTrue($user->roles->contains($role));
        $this->assertEquals(1, $user->roles->count());
    }
    
    public function test_user_has_role_by_slug()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create(['slug' => 'admin']);
        $user->roles()->attach($role);
        
        // Act & Assert
        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('editor'));
    }
}
```

### Tests de Características (Feature Tests)

Los tests de características prueban endpoints completos de la API y flujos de usuario.

**Ejemplo de test de característica para autenticación**:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_login()
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => ['id', 'name', 'email'],
                     'token',
                 ]);
    }
    
    public function test_users_cannot_login_with_invalid_credentials()
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Act
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        // Assert
        $response->assertStatus(401)
                 ->assertJson([
                     'message' => 'Invalid credentials',
                 ]);
    }
}
```

## Uso de Factories

Las factories permiten generar datos de prueba de forma rápida y consistente.

**Ejemplo de uso de factories**:

```php
// Crear un usuario
$user = User::factory()->create();

// Crear un usuario con atributos específicos
$admin = User::factory()->create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
]);

// Crear múltiples usuarios
$users = User::factory()->count(3)->create();

// Crear un usuario con relaciones
$userWithRoles = User::factory()
    ->hasAttached(
        Role::factory()->count(2),
        ['created_at' => now(), 'updated_at' => now()]
    )
    ->create();
```

## Uso de RefreshDatabase

El trait `RefreshDatabase` asegura que la base de datos se reinicie entre tests, manteniendo los tests aislados.

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyTest extends TestCase
{
    use RefreshDatabase;
    
    // Tus tests aquí...
}
```

## Testing de API

Para probar endpoints de API, Laravel proporciona métodos útiles:

```php
// GET request
$response = $this->getJson('/api/users');

// POST request
$response = $this->postJson('/api/users', [
    'name' => 'New User',
    'email' => 'new@example.com',
    'password' => 'password',
]);

// PUT request
$response = $this->putJson('/api/users/1', [
    'name' => 'Updated User',
]);

// DELETE request
$response = $this->deleteJson('/api/users/1');

// Con autenticación
$response = $this->actingAs($user)
                 ->getJson('/api/admin/users');

// Con token
$response = $this->withHeaders([
    'Authorization' => 'Bearer ' . $token,
])->getJson('/api/admin/users');
```

## Aserciones para Respuestas de API

Laravel proporciona aserciones específicas para respuestas de API:

```php
$response->assertStatus(200);                 // Verifica el código de estado
$response->assertOk();                        // Verifica que el código sea 200
$response->assertCreated();                   // Verifica que el código sea 201
$response->assertNoContent();                 // Verifica que el código sea 204
$response->assertUnauthorized();              // Verifica que el código sea 401
$response->assertForbidden();                 // Verifica que el código sea 403
$response->assertNotFound();                  // Verifica que el código sea 404

$response->assertJson([...]);                 // Verifica que la respuesta contenga JSON
$response->assertJsonStructure([...]);        // Verifica la estructura del JSON
$response->assertJsonCount(3, 'data');        // Verifica el número de elementos
$response->assertJsonPath('user.email', 'test@example.com'); // Verifica un valor específico

$response->assertJsonValidationErrors(['name']); // Verifica errores de validación
```

## Testing de Autenticación y Autorización

### Autenticación

```php
// Actuar como un usuario
$this->actingAs($user);

// Actuar como un usuario para una guardia específica
$this->actingAs($user, 'api');

// Usar un token
$this->withHeaders([
    'Authorization' => 'Bearer ' . $token,
]);

// Verificar que una ruta requiere autenticación
$response = $this->getJson('/api/protected-route');
$response->assertUnauthorized();
```

### Autorización

```php
// Verificar que un usuario con cierto rol puede acceder a una ruta
$adminUser = User::factory()->create();
$adminRole = Role::factory()->create(['slug' => 'admin']);
$adminUser->roles()->attach($adminRole);

$response = $this->actingAs($adminUser)
                 ->getJson('/api/admin/users');
$response->assertOk();

// Verificar que un usuario sin el rol adecuado no puede acceder
$regularUser = User::factory()->create();

$response = $this->actingAs($regularUser)
                 ->getJson('/api/admin/users');
$response->assertForbidden();
```

## Mocking

### Mocking de Servicios

Para tests unitarios, a menudo necesitas mockear dependencias:

```php
use Mockery;
use App\Services\PaymentService;
use App\Services\NotificationService;
use App\Controllers\OrderController;

public function test_order_processing()
{
    // Crear mocks
    $paymentService = Mockery::mock(PaymentService::class);
    $notificationService = Mockery::mock(NotificationService::class);
    
    // Configurar expectativas
    $paymentService->shouldReceive('process')
                  ->once()
                  ->with(100)
                  ->andReturn(true);
                  
    $notificationService->shouldReceive('sendConfirmation')
                       ->once()
                       ->with('user@example.com')
                       ->andReturn(true);
    
    // Inyectar mocks
    $controller = new OrderController($paymentService, $notificationService);
    
    // Ejecutar y verificar
    $result = $controller->processOrder(['amount' => 100, 'email' => 'user@example.com']);
    $this->assertTrue($result);
}
```

### Mocking de Facades

Laravel permite mockear facades fácilmente:

```php
use Illuminate\Support\Facades\Http;

// Mockear respuestas HTTP
Http::fake([
    'example.com/*' => Http::response(['data' => 'fake'], 200),
    '*' => Http::response('Not Found', 404),
]);

// Verificar que se hicieron las llamadas esperadas
Http::assertSent(function ($request) {
    return $request->url() == 'https://example.com/api' &&
           $request->hasHeader('Authorization');
});
```

## Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests con información detallada
php artisan test --verbose

# Ejecutar un archivo específico
php artisan test tests/Feature/Auth/AuthenticationTest.php

# Ejecutar un test específico
php artisan test --filter=test_users_can_login

# Ejecutar tests de una carpeta específica
php artisan test --testsuite=Feature
```

### Depuración de Tests

Para depurar tests, puedes usar:

1. **Dump and die**: `dd($variable)` para inspeccionar variables
2. **Logging**: `Log::info($variable)` para registrar información
3. **PHPUnit breakpoints**: Configurar xdebug y usar breakpoints en tu IDE

## Mejores Prácticas

1. **Usa nombres descriptivos para los tests**: El nombre debe describir qué se está probando.

2. **Sigue el patrón AAA**:
   - **Arrange**: Configura los datos y condiciones
   - **Act**: Ejecuta la acción a probar
   - **Assert**: Verifica los resultados

3. **Mantén los tests independientes**: Cada test debe poder ejecutarse de forma aislada.

4. **Usa RefreshDatabase**: Para asegurar que cada test comienza con una base de datos limpia.

5. **Usa factories para generar datos**: Evita crear datos manualmente.

6. **Testea casos de error**: No solo el camino feliz, también casos de error y bordes.

7. **Mantén los tests rápidos**: Evita operaciones lentas o usa mocks cuando sea apropiado.

8. **Testea solo lo que necesitas**: No es necesario probar cada línea de código, enfócate en la funcionalidad crítica.

## Resolución de Problemas Comunes

### Los tests fallan con errores de base de datos

- Asegúrate de usar `RefreshDatabase`
- Verifica que las migraciones están actualizadas
- Comprueba si hay problemas con las relaciones entre modelos

### Los tests de autenticación fallan

- Verifica que estás usando la guardia correcta (`web` o `api`)
- Comprueba si los tokens se están generando correctamente
- Asegúrate de que las rutas están protegidas con los middleware adecuados

### Los mocks no funcionan como se espera

- Verifica que estás configurando las expectativas correctamente
- Asegúrate de que el mock se está inyectando en el lugar correcto
- Comprueba si hay dependencias ocultas que no estás mockeando
