# Sistema de Pilotos en VAXAV

Este documento describe la implementación del sistema de pilotos en VAXAV, incluyendo la estructura de la base de datos, los modelos, controladores y flujo de creación de pilotos.

## Índice

1. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
2. [Modelos](#modelos)
3. [Controladores](#controladores)
4. [Flujo de Creación de Pilotos](#flujo-de-creación-de-pilotos)
5. [Relación con Habilidades](#relación-con-habilidades)
6. [Interfaz de Usuario](#interfaz-de-usuario)

## Estructura de la Base de Datos

El sistema de pilotos utiliza principalmente la tabla `pilots`:

### Tabla `pilots`

**Estructura:**
- `id` - Identificador único
- `name` - Nombre del piloto
- `race` - Raza del piloto (Humano, Cyborg, Alienígena, Sintético)
- `user_id` - Clave foránea a la tabla users (el usuario que controla el piloto)
- `corporation_id` - Clave foránea a la tabla corporations (opcional)
- `credits` - Cantidad de créditos que posee el piloto
- `location_id` - Clave foránea a la tabla solar_systems (ubicación actual)
- `timestamps` - Fechas de creación y actualización

## Modelos

### Modelo `Pilot`

El modelo `Pilot` representa a un piloto en el juego.

```php
// backend/app/Models/Pilot.php
class Pilot extends Model
{
    protected $fillable = [
        'name',
        'race',
        'user_id',
        'corporation_id',
        'credits',
        'location_id',
    ];

    // Relación con el usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con la corporación
    public function corporation()
    {
        return $this->belongsTo(Corporation::class);
    }

    // Relación con las naves
    public function ships()
    {
        return $this->hasMany(Ship::class);
    }

    // Relación con las habilidades
    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'pilots_skills',
            'pilot_id',
            'skill_id'
        )->withPivot('xp', 'current_level', 'active');
    }

    // Relación con la ubicación actual
    public function location()
    {
        return $this->belongsTo(SolarSystem::class, 'location_id');
    }
}
```

### Modelo `User` (Relación con Pilot)

El modelo `User` tiene una relación uno a uno con `Pilot`.

```php
// backend/app/Models/User.php
public function pilot()
{
    return $this->hasOne(Pilot::class);
}
```

## Controladores

### PilotController

El controlador `PilotController` maneja las operaciones relacionadas con pilotos.

**Métodos principales:**

```php
// backend/app/Http/Controllers/PilotController.php

// Obtener el piloto del usuario actual
public function current(Request $request)
{
    $user = $request->user();
    $pilot = $user->pilot;

    if (!$pilot) {
        return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
    }

    return response()->json($pilot);
}

// Crear un nuevo piloto
public function store(Request $request)
{
    $user = $request->user();

    // Verificar si el usuario ya tiene un piloto
    if ($user->pilot) {
        return response()->json(['message' => 'El usuario ya tiene un piloto'], 400);
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'race' => 'required|string|in:Humano,Cyborg,Alienígena,Sintético',
    ]);

    // Obtener ubicación inicial
    $locationId = SolarSystem::first()?->id;

    // Crear el piloto
    $pilot = Pilot::create([
        'name' => $validated['name'],
        'race' => $validated['race'],
        'user_id' => $user->id,
        'credits' => 10000, // Créditos iniciales
        'location_id' => $locationId,
    ]);

    // Inicializar habilidades del piloto
    $skills = Skill::all();
    foreach ($skills as $skill) {
        PilotSkill::create([
            'pilot_id' => $pilot->id,
            'skill_id' => $skill->id,
            'xp' => 0,
            'current_level' => 0,
            'active' => false,
        ]);
    }

    return response()->json($pilot, 201);
}
```

## Flujo de Creación de Pilotos

El flujo de creación de pilotos es el siguiente:

1. **Registro de Usuario**: El usuario se registra en el sistema.
2. **Verificación de Email**: El usuario verifica su dirección de email.
3. **Creación de Piloto**: El usuario crea un piloto proporcionando nombre y raza.
4. **Inicialización de Habilidades**: El sistema asigna automáticamente todas las habilidades disponibles al piloto con nivel 0.
5. **Acceso al Juego**: Una vez creado el piloto, el usuario puede acceder a todas las funcionalidades del juego.

## Relación con Habilidades

Los pilotos tienen una relación muchos a muchos con las habilidades a través de la tabla `pilots_skills`. Cada piloto puede tener múltiples habilidades, y cada habilidad puede ser aprendida por múltiples pilotos.

La tabla `pilots_skills` almacena:
- La experiencia acumulada en cada habilidad
- El nivel actual de la habilidad
- Si la habilidad está activa o no

Para más detalles sobre el sistema de habilidades, consulta la [documentación del sistema de habilidades](./skills-system.md).

## Interfaz de Usuario

### Creación de Piloto

La interfaz de creación de piloto se encuentra en `frontend/src/views/pilot/CreatePilotView.vue`. Esta vista muestra un formulario donde el usuario puede ingresar el nombre y seleccionar la raza de su piloto.

**Características principales:**
- Validación de formulario en tiempo real
- Selección de raza con descripciones
- Feedback visual durante el proceso de creación
- Redirección automática a la página principal después de la creación exitosa

### Vista de Perfil de Piloto

La vista de perfil de piloto muestra información detallada sobre el piloto actual, incluyendo:
- Información básica (nombre, raza, créditos)
- Ubicación actual
- Habilidades y niveles
- Naves poseídas

Esta vista permite al usuario gestionar su piloto y ver su progreso en el juego.

## Restricciones y Reglas

1. **Un Usuario, Un Piloto**: Cada usuario puede tener un solo piloto activo.
2. **Verificación Requerida**: El usuario debe verificar su email antes de poder crear un piloto.
3. **Piloto Requerido**: El usuario debe crear un piloto antes de poder acceder a las funcionalidades del juego.
4. **Razas Limitadas**: El piloto solo puede ser de una de las razas predefinidas (Humano, Cyborg, Alienígena, Sintético).
5. **Créditos Iniciales**: Cada piloto comienza con 10,000 créditos.
6. **Ubicación Inicial**: Cada piloto comienza en el primer sistema solar disponible.
