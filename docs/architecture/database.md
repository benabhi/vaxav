# Estructura de la Base de Datos

Este documento describe la estructura de la base de datos de Vaxav, incluyendo las tablas, relaciones y campos principales.

## Diagrama de Entidad-Relación

```
+-------------+       +-------------+       +-------------+
|    Users    |       |    Roles    |       | Permissions |
+-------------+       +-------------+       +-------------+
| id          |       | id          |       | id          |
| name        |       | name        |       | name        |
| email       |       | slug        |       | slug        |
| password    |       | description |       | description |
| ...         |       | ...         |       | ...         |
+-------------+       +-------------+       +-------------+
      |                     |                     |
      |                     |                     |
      v                     v                     v
+-------------+       +-------------+       +-------------+
|  role_user  |       |permission_role      |   Pilots    |
+-------------+       +-------------+       +-------------+
| role_id     |       | permission_id|       | id          |
| user_id     |       | role_id     |       | user_id     |
+-------------+       +-------------+       | name        |
                                           | credits     |
                                           | experience  |
                                           | ...         |
                                           +-------------+
                                                  |
                                                  |
                                                  v
+-------------+       +-------------+       +-------------+
|   Ships     |       |   Planets   |       |  Resources  |
+-------------+       +-------------+       +-------------+
| id          |       | id          |       | id          |
| pilot_id    |       | name        |       | name        |
| name        |       | type        |       | description |
| type        |       | position_x  |       | rarity      |
| health      |       | position_y  |       | ...         |
| speed       |       | resources   |       +-------------+
| ...         |       | ...         |             |
+-------------+       +-------------+             |
      |                     |                     |
      |                     |                     |
      v                     v                     v
+-------------+       +-------------+       +-------------+
| ship_upgrades|       | planet_resources   | market_listings
+-------------+       +-------------+       +-------------+
| id          |       | planet_id   |       | id          |
| ship_id     |       | resource_id |       | seller_id   |
| name        |       | quantity    |       | resource_id |
| level       |       | ...         |       | quantity    |
| ...         |       +-------------+       | price       |
+-------------+                             | ...         |
                                           +-------------+
```

## Tablas Principales

### Users

Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | varchar | Nombre del usuario |
| email | varchar | Correo electrónico (único) |
| password | varchar | Contraseña (hasheada) |
| email_verified_at | timestamp | Fecha de verificación del email |
| remember_token | varchar | Token para "recordarme" |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### Roles

Almacena los roles disponibles en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | varchar | Nombre del rol |
| slug | varchar | Identificador único del rol (para programación) |
| description | text | Descripción del rol |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### Permissions

Almacena los permisos disponibles en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | varchar | Nombre del permiso |
| slug | varchar | Identificador único del permiso (para programación) |
| description | text | Descripción del permiso |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### role_user

Tabla pivote para la relación muchos a muchos entre roles y usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| role_id | bigint | ID del rol |
| user_id | bigint | ID del usuario |

### permission_role

Tabla pivote para la relación muchos a muchos entre permisos y roles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| permission_id | bigint | ID del permiso |
| role_id | bigint | ID del rol |

### Pilots

Almacena la información de los pilotos en el juego.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| user_id | bigint | ID del usuario asociado |
| name | varchar | Nombre del piloto |
| credits | integer | Cantidad de créditos |
| experience | integer | Puntos de experiencia |
| level | integer | Nivel del piloto |
| current_planet_id | bigint | ID del planeta actual |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### Ships

Almacena la información de las naves espaciales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| pilot_id | bigint | ID del piloto propietario |
| name | varchar | Nombre de la nave |
| type | varchar | Tipo de nave |
| health | integer | Puntos de salud |
| max_health | integer | Puntos de salud máximos |
| speed | integer | Velocidad de la nave |
| cargo_capacity | integer | Capacidad de carga |
| fuel | integer | Combustible actual |
| max_fuel | integer | Capacidad máxima de combustible |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### Planets

Almacena la información de los planetas en el universo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | varchar | Nombre del planeta |
| type | varchar | Tipo de planeta |
| position_x | integer | Coordenada X en el universo |
| position_y | integer | Coordenada Y en el universo |
| description | text | Descripción del planeta |
| has_market | boolean | Si el planeta tiene mercado |
| has_shipyard | boolean | Si el planeta tiene astillero |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### Resources

Almacena la información de los recursos disponibles en el juego.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | varchar | Nombre del recurso |
| description | text | Descripción del recurso |
| rarity | varchar | Rareza del recurso |
| base_price | integer | Precio base del recurso |
| weight | decimal | Peso por unidad |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### planet_resources

Tabla pivote que almacena los recursos disponibles en cada planeta.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| planet_id | bigint | ID del planeta |
| resource_id | bigint | ID del recurso |
| quantity | integer | Cantidad disponible |
| regen_rate | decimal | Tasa de regeneración |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### market_listings

Almacena las ofertas del mercado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| seller_id | bigint | ID del piloto vendedor |
| planet_id | bigint | ID del planeta donde se vende |
| resource_id | bigint | ID del recurso en venta |
| quantity | integer | Cantidad en venta |
| price_per_unit | integer | Precio por unidad |
| expires_at | timestamp | Fecha de expiración |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

### ship_upgrades

Almacena las mejoras instaladas en las naves.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| ship_id | bigint | ID de la nave |
| name | varchar | Nombre de la mejora |
| type | varchar | Tipo de mejora |
| level | integer | Nivel de la mejora |
| bonus | integer | Bonificación proporcionada |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de última actualización |

## Relaciones

### User

- **roles**: Relación muchos a muchos con `Role` a través de `role_user`.
- **pilot**: Relación uno a uno con `Pilot`.

### Role

- **permissions**: Relación muchos a muchos con `Permission` a través de `permission_role`.
- **users**: Relación muchos a muchos con `User` a través de `role_user`.

### Permission

- **roles**: Relación muchos a muchos con `Role` a través de `permission_role`.

### Pilot

- **user**: Relación uno a uno con `User`.
- **ships**: Relación uno a muchos con `Ship`.
- **currentPlanet**: Relación uno a uno con `Planet`.
- **marketListings**: Relación uno a muchos con `MarketListing`.

### Ship

- **pilot**: Relación muchos a uno con `Pilot`.
- **upgrades**: Relación uno a muchos con `ShipUpgrade`.

### Planet

- **resources**: Relación muchos a muchos con `Resource` a través de `planet_resources`.
- **pilots**: Relación uno a muchos con `Pilot` (pilotos actualmente en el planeta).
- **marketListings**: Relación uno a muchos con `MarketListing`.

### Resource

- **planets**: Relación muchos a muchos con `Planet` a través de `planet_resources`.
- **marketListings**: Relación uno a muchos con `MarketListing`.

## Índices

Para optimizar el rendimiento, se han creado los siguientes índices:

- `users.email`: Índice único para búsquedas por email.
- `roles.slug`: Índice único para búsquedas por slug.
- `permissions.slug`: Índice único para búsquedas por slug.
- `pilots.user_id`: Índice para búsquedas por usuario.
- `ships.pilot_id`: Índice para búsquedas por piloto.
- `planets.position_x, planets.position_y`: Índice compuesto para búsquedas por coordenadas.
- `market_listings.planet_id`: Índice para búsquedas por planeta.
- `market_listings.seller_id`: Índice para búsquedas por vendedor.

## Migraciones

Las migraciones de Laravel definen la estructura de la base de datos y se encuentran en el directorio `database/migrations/`.

### Ejemplo de Migración

```php
// database/migrations/2023_01_01_000000_create_roles_table.php
public function up()
{
    Schema::create('roles', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->text('description')->nullable();
        $table->timestamps();
    });
}
```

## Seeders

Los seeders de Laravel populan la base de datos con datos iniciales y se encuentran en el directorio `database/seeders/`.

### Ejemplo de Seeder

```php
// database/seeders/RoleSeeder.php
public function run()
{
    $roles = [
        [
            'name' => 'Super Admin',
            'slug' => 'superadmin',
            'description' => 'Acceso completo a todas las funcionalidades',
        ],
        [
            'name' => 'Administrador',
            'slug' => 'admin',
            'description' => 'Acceso a la mayoría de las funcionalidades administrativas',
        ],
        // ...
    ];

    foreach ($roles as $role) {
        Role::create($role);
    }
}
```

## Factories

Las factories de Laravel generan datos de prueba y se encuentran en el directorio `database/factories/`.

### Ejemplo de Factory

```php
// database/factories/UserFactory.php
public function definition()
{
    return [
        'name' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'email_verified_at' => now(),
        'password' => Hash::make('password'),
        'remember_token' => Str::random(10),
    ];
}
```

## Buenas Prácticas

1. **Migraciones Incrementales**: Crear migraciones pequeñas y enfocadas.
2. **Restricciones de Integridad**: Utilizar claves foráneas para mantener la integridad referencial.
3. **Normalización**: Mantener la base de datos normalizada para evitar redundancia.
4. **Índices Adecuados**: Crear índices para campos frecuentemente consultados.
5. **Transacciones**: Utilizar transacciones para operaciones que afectan a múltiples tablas.
6. **Soft Deletes**: Utilizar soft deletes para mantener un historial de datos eliminados.

## Recursos Adicionales

- [Documentación de Migraciones de Laravel](https://laravel.com/docs/migrations)
- [Documentación de Eloquent ORM](https://laravel.com/docs/eloquent)
- [Documentación de Seeders de Laravel](https://laravel.com/docs/seeding)
