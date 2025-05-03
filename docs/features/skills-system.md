# Sistema de Habilidades en VAXAV

Este documento describe la implementación del sistema de habilidades en VAXAV, incluyendo la estructura de la base de datos, los modelos, controladores, composables y vistas.

## Índice

1. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
2. [Modelos](#modelos)
3. [Controladores](#controladores)
4. [Composables](#composables)
5. [Vistas](#vistas)
6. [Flujo de Datos](#flujo-de-datos)
7. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)

## Estructura de la Base de Datos

El sistema de habilidades utiliza cuatro tablas principales:

### 1. `skills_categories`

Almacena las categorías de habilidades.

**Estructura:**
- `id` - Identificador único
- `name` - Nombre de la categoría
- `description` - Descripción de la categoría
- `timestamps` - Fechas de creación y actualización

### 2. `skills`

Almacena las habilidades disponibles en el juego.

**Estructura:**
- `id` - Identificador único
- `skill_category_id` - Clave foránea a la tabla skills_categories
- `name` - Nombre de la habilidad
- `description` - Descripción de la habilidad
- `multiplier` - Multiplicador de la habilidad (1-5)
- `timestamps` - Fechas de creación y actualización

### 3. `skills_prerequisites`

Almacena los prerrequisitos para cada habilidad. Es una tabla intermedia que relaciona una habilidad con sus habilidades prerrequisito.

**Estructura:**
- `id` - Identificador único
- `skill_id` - Clave foránea a la tabla skills (la habilidad que tiene el prerrequisito)
- `prerequisite_id` - Clave foránea a la tabla skills (la habilidad que es prerrequisito)
- `prerequisite_level` - Nivel requerido del prerrequisito
- `timestamps` - Fechas de creación y actualización

### 4. `pilots_skills`

Almacena las habilidades que posee cada piloto. Es una tabla intermedia que relaciona pilotos con habilidades.

**Estructura:**
- `id` - Identificador único
- `pilot_id` - Clave foránea a la tabla pilots
- `skill_id` - Clave foránea a la tabla skills
- `xp` - Experiencia acumulada en la habilidad
- `current_level` - Nivel actual de la habilidad para el piloto
- `active` - Indica si la habilidad está activa (booleano, por defecto false)
- `timestamps` - Fechas de creación y actualización

## Modelos

### SkillCategory

El modelo `SkillCategory` representa una categoría de habilidades.

**Relaciones:**
- `skills()`: Una categoría tiene muchas habilidades.

```php
// backend/app/Models/SkillCategory.php
public function skills()
{
    return $this->hasMany(Skill::class, 'skill_category_id');
}
```

### Skill

El modelo `Skill` representa una habilidad en el juego.

**Relaciones:**
- `category()`: Una habilidad pertenece a una categoría.
- `prerequisites()`: Una habilidad puede tener múltiples prerrequisitos (otras habilidades).
- `requiredFor()`: Una habilidad puede ser prerrequisito para otras habilidades.
- `pilots()`: Una habilidad puede ser aprendida por múltiples pilotos.

```php
// backend/app/Models/Skill.php
public function category()
{
    return $this->belongsTo(SkillCategory::class, 'skill_category_id');
}

public function prerequisites()
{
    return $this->belongsToMany(
        Skill::class,
        'skills_prerequisites',
        'skill_id',
        'prerequisite_id'
    )->withPivot('prerequisite_level');
}

public function requiredFor()
{
    return $this->belongsToMany(
        Skill::class,
        'skills_prerequisites',
        'prerequisite_id',
        'skill_id'
    );
}

public function pilots()
{
    return $this->belongsToMany(
        Pilot::class,
        'pilots_skills',
        'skill_id',
        'pilot_id'
    )->withPivot('xp', 'current_level', 'active');
}
```

### SkillPrerequisite

El modelo `SkillPrerequisite` representa la relación entre una habilidad y sus prerrequisitos.

```php
// backend/app/Models/SkillPrerequisite.php
protected $table = 'skills_prerequisites';

protected $fillable = [
    'skill_id',
    'prerequisite_id',
    'prerequisite_level'
];
```

## Controladores

### SkillCategoryController

El controlador `SkillCategoryController` maneja las operaciones CRUD para las categorías de habilidades.

**Métodos principales:**
- `index()`: Lista todas las categorías de habilidades con filtros y paginación.
- `store()`: Crea una nueva categoría de habilidad.
- `show()`: Muestra una categoría de habilidad específica.
- `update()`: Actualiza una categoría de habilidad existente.
- `destroy()`: Elimina una categoría de habilidad.

### SkillController

El controlador `SkillController` maneja las operaciones CRUD para las habilidades.

**Métodos principales:**
- `index()`: Lista todas las habilidades con filtros, paginación y sus prerrequisitos.
- `store()`: Crea una nueva habilidad con sus prerrequisitos.
- `show()`: Muestra una habilidad específica con sus prerrequisitos.
- `update()`: Actualiza una habilidad existente y sus prerrequisitos.
- `destroy()`: Elimina una habilidad.
- `getSkillsForDropdown()`: Obtiene una lista simplificada de habilidades para usar en dropdowns.

## Composables

### useSkillCategories

El composable `useSkillCategories` proporciona funcionalidad para gestionar las categorías de habilidades en el frontend.

**Estado:**
- `categories`: Lista de categorías de habilidades.
- `loading`: Estado de carga.
- `pagination`: Información de paginación.
- `filters`: Filtros aplicados.

**Métodos:**
- `fetchCategories()`: Obtiene la lista de categorías con filtros y paginación.
- `createCategory()`: Crea una nueva categoría.
- `updateCategory()`: Actualiza una categoría existente.
- `deleteCategory()`: Elimina una categoría.
- `getCategory()`: Obtiene una categoría específica.
- `changePage()`: Cambia la página actual.
- `changePerPage()`: Cambia el número de elementos por página.
- `updateFilters()`: Actualiza los filtros aplicados.
- `updateSort()`: Actualiza la ordenación.
- `resetFilters()`: Restablece todos los filtros a sus valores por defecto.

### useSkills

El composable `useSkills` proporciona funcionalidad para gestionar las habilidades en el frontend.

**Estado:**
- `skills`: Lista de habilidades.
- `loading`: Estado de carga.
- `pagination`: Información de paginación.
- `filters`: Filtros aplicados.

**Métodos:**
- `fetchSkills()`: Obtiene la lista de habilidades con filtros, paginación y sus prerrequisitos.
- `createSkill()`: Crea una nueva habilidad.
- `updateSkill()`: Actualiza una habilidad existente.
- `deleteSkill()`: Elimina una habilidad.
- `getSkill()`: Obtiene una habilidad específica.
- `getSkillsForDropdown()`: Obtiene una lista simplificada de habilidades para usar en dropdowns.
- `changePage()`: Cambia la página actual.
- `changePerPage()`: Cambia el número de elementos por página.
- `updateFilters()`: Actualiza los filtros aplicados.
- `updateSort()`: Actualiza la ordenación.
- `resetFilters()`: Restablece todos los filtros a sus valores por defecto.

## Vistas

### SkillCategoriesView

La vista `SkillCategoriesView` muestra una tabla de categorías de habilidades con funcionalidad para filtrar, ordenar y paginar.

**Características:**
- Tabla con columnas para nombre y descripción.
- Filtro de búsqueda por nombre.
- Botones para crear, editar y eliminar categorías.
- Modal de confirmación para eliminar categorías.

### SkillsView

La vista `SkillsView` muestra una tabla de habilidades con funcionalidad para filtrar, ordenar y paginar.

**Características:**
- Tabla con columnas para nombre, categoría, multiplicador, descripción y prerrequisitos.
- Filtros de búsqueda, categoría y multiplicador.
- Botones para crear, editar y eliminar habilidades.
- Modal de confirmación para eliminar habilidades.
- Visualización de prerrequisitos como badges.

### SkillCategoryCreateView

La vista `SkillCategoryCreateView` proporciona un formulario para crear nuevas categorías de habilidades.

**Campos:**
- Nombre
- Descripción

### SkillCategoryEditView

La vista `SkillCategoryEditView` proporciona un formulario para editar categorías de habilidades existentes.

**Campos:**
- Nombre
- Descripción

### SkillCreateView

La vista `SkillCreateView` proporciona un formulario para crear nuevas habilidades.

**Campos:**
- Nombre
- Descripción
- Categoría
- Multiplicador
- Prerrequisitos (múltiples, con nivel requerido)

### SkillEditView

La vista `SkillEditView` proporciona un formulario para editar habilidades existentes.

**Campos:**
- Nombre
- Descripción
- Categoría
- Multiplicador
- Prerrequisitos (múltiples, con nivel requerido)

## Flujo de Datos

### Carga de Habilidades

1. El usuario accede a la vista `SkillsView`.
2. La vista llama al método `fetchSkills()` del composable `useSkills`.
3. El composable hace una petición al endpoint `/admin/skills` con los filtros y paginación.
4. El controlador `SkillController` procesa la petición y devuelve las habilidades con sus prerrequisitos.
5. El composable procesa los datos recibidos y actualiza el estado `skills`.
6. La vista muestra las habilidades en la tabla.

### Filtrado de Habilidades

1. El usuario aplica un filtro (búsqueda, categoría o multiplicador).
2. La vista llama al método `updateFilters()` del composable `useSkills`.
3. El composable actualiza el estado `filters` y llama al método `fetchSkills()`.
4. El controlador `SkillController` procesa la petición con los nuevos filtros.
5. El composable procesa los datos recibidos y actualiza el estado `skills`.
6. La vista muestra las habilidades filtradas en la tabla.

### Creación de Habilidades

1. El usuario accede a la vista `SkillCreateView`.
2. La vista carga las categorías y habilidades disponibles para prerrequisitos.
3. El usuario completa el formulario y lo envía.
4. La vista llama al método `createSkill()` del composable `useSkills`.
5. El composable hace una petición al endpoint `/admin/skills` con los datos del formulario.
6. El controlador `SkillController` procesa la petición, crea la habilidad y sus prerrequisitos.
7. El composable muestra una notificación de éxito y redirige a la vista `SkillsView`.

### Edición de Habilidades

1. El usuario accede a la vista `SkillEditView` para una habilidad específica.
2. La vista carga los datos de la habilidad, las categorías y habilidades disponibles para prerrequisitos.
3. El usuario modifica el formulario y lo envía.
4. La vista llama al método `updateSkill()` del composable `useSkills`.
5. El composable hace una petición al endpoint `/admin/skills/{id}` con los datos actualizados.
6. El controlador `SkillController` procesa la petición, actualiza la habilidad y sus prerrequisitos.
7. El composable muestra una notificación de éxito y redirige a la vista `SkillsView`.

### Eliminación de Habilidades

1. El usuario hace clic en el botón "Eliminar" para una habilidad específica.
2. La vista muestra un modal de confirmación.
3. El usuario confirma la eliminación.
4. La vista llama al método `deleteSkill()` del composable `useSkills`.
5. El composable hace una petición al endpoint `/admin/skills/{id}` para eliminar la habilidad.
6. El controlador `SkillController` procesa la petición y elimina la habilidad.
7. El composable muestra una notificación de éxito y actualiza la lista de habilidades.

## Sistema de Activación de Habilidades

El sistema de habilidades incluye un mecanismo de activación que requiere que los jugadores activen explícitamente las habilidades que desean utilizar, incluso después de cumplir con los prerrequisitos. Esto añade una capa estratégica al juego, ya que los jugadores deben decidir qué habilidades mantener activas.

### Implementación de la Activación

La activación de habilidades se implementa a través del campo `active` en la tabla `pilots_skills`. Este campo es un booleano que indica si la habilidad está activa (true) o inactiva (false).

Por defecto, todas las habilidades se asignan como inactivas (false) cuando un piloto se crea. Las habilidades deben ser activadas explícitamente por el jugador.

### Flujo de Activación

1. El jugador cumple con los prerrequisitos para una habilidad (tiene las habilidades prerrequisito al nivel requerido).
2. El jugador activa la habilidad a través de la interfaz de usuario.
3. El sistema actualiza el campo `active` en la tabla `pilots_skills`.
4. La habilidad ahora está disponible para su uso en el juego.

### Controlador para Activación

```php
// Ejemplo de método para activar/desactivar una habilidad
public function toggleSkillActivation(Request $request, $skillId)
{
    $user = $request->user();
    $pilot = $user->pilot;

    if (!$pilot) {
        return response()->json(['message' => 'El usuario no tiene un piloto'], 404);
    }

    $pilotSkill = PilotSkill::where('pilot_id', $pilot->id)
        ->where('skill_id', $skillId)
        ->first();

    if (!$pilotSkill) {
        return response()->json(['message' => 'El piloto no tiene esta habilidad'], 404);
    }

    // Verificar si el piloto cumple con los prerrequisitos
    $skill = Skill::with('prerequisites')->find($skillId);
    $canActivate = true;

    foreach ($skill->prerequisites as $prerequisite) {
        $prereqLevel = $prerequisite->pivot->prerequisite_level;
        $pilotPrereq = PilotSkill::where('pilot_id', $pilot->id)
            ->where('skill_id', $prerequisite->id)
            ->first();

        if (!$pilotPrereq || $pilotPrereq->current_level < $prereqLevel) {
            $canActivate = false;
            break;
        }
    }

    if (!$canActivate) {
        return response()->json([
            'message' => 'No cumples con los prerrequisitos para activar esta habilidad'
        ], 400);
    }

    // Activar o desactivar la habilidad
    $pilotSkill->active = !$pilotSkill->active;
    $pilotSkill->save();

    return response()->json([
        'message' => $pilotSkill->active ? 'Habilidad activada' : 'Habilidad desactivada',
        'active' => $pilotSkill->active
    ]);
}
```

## Problemas Comunes y Soluciones

### Prerrequisitos no se muestran correctamente

**Problema:** Al filtrar habilidades por multiplicador, los prerrequisitos no se muestran correctamente porque no están incluidos en los resultados filtrados.

**Solución:** Modificar el controlador `SkillController` para cargar manualmente los prerrequisitos de cada habilidad y formatearlos correctamente:

```php
// Cargar manualmente los prerrequisitos para cada habilidad
foreach ($skills as $skill) {
    // Obtener los prerrequisitos de la base de datos
    $prerequisites = DB::table('skills_prerequisites')
        ->where('skill_id', $skill->id)
        ->get();

    // Formatear los prerrequisitos con la información completa
    $formattedPrerequisites = [];
    foreach ($prerequisites as $prereq) {
        if (isset($allSkills[$prereq->prerequisite_id])) {
            $prerequisiteSkill = $allSkills[$prereq->prerequisite_id];
            $formattedPrerequisites[] = [
                'prerequisite_id' => $prereq->prerequisite_id,
                'prerequisite_level' => $prereq->prerequisite_level,
                'prerequisite' => [
                    'id' => $prerequisiteSkill->id,
                    'name' => $prerequisiteSkill->name,
                    'multiplier' => $prerequisiteSkill->multiplier
                ]
            ];
        }
    }

    // Asignar los prerrequisitos formateados a la habilidad
    $skill->prerequisites = $formattedPrerequisites;
}
```

### Filtro de multiplicador no se restablece correctamente

**Problema:** Al hacer clic en el botón "Restablecer", el filtro de multiplicador no se limpia correctamente y no muestra el placeholder "Todos".

**Solución:** Modificar el método `handleReset` en la vista `SkillsView` para establecer explícitamente el valor del multiplicador a cadena vacía:

```javascript
// Manejar el evento de reset de filtros
const handleReset = () => {
  // Asegurarnos de que el valor del multiplicador se limpie correctamente
  // Establecer a cadena vacía para que el placeholder "Todos" se muestre
  filters.multiplier = '';

  // También limpiar el filtro de categoría
  filters.category_id = '';

  // Usar el método resetFilters del composable
  resetFilters();
};
```

### Estructura de datos de prerrequisitos inconsistente

**Problema:** La estructura de datos de los prerrequisitos puede ser inconsistente, lo que dificulta su procesamiento en el frontend.

**Solución:** Estandarizar la estructura de datos de los prerrequisitos en el backend y simplificar el procesamiento en el frontend:

```javascript
// Verificar si un prerrequisito es válido para mostrar
const isValidPrerequisite = (prerequisite) => {
  // Con la nueva estructura, un prerrequisito válido debe tener un objeto prerequisite
  // con al menos un id y un name
  return prerequisite &&
         prerequisite.prerequisite &&
         prerequisite.prerequisite.id &&
         prerequisite.prerequisite.name;
};

// Obtener el nombre del prerrequisito con su nivel
const getPrerequisiteName = (prerequisite) => {
  // Con la nueva estructura, siempre debería tener un objeto prerequisite
  // con un name y un prerequisite_level
  if (prerequisite && prerequisite.prerequisite && prerequisite.prerequisite.name) {
    return `${prerequisite.prerequisite.name} (Nv.${prerequisite.prerequisite_level || '?'})`;
  }

  return 'Prerrequisito no disponible';
};
```
