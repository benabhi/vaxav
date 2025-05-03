# API de Habilidades

Esta documentación describe los endpoints disponibles para gestionar las habilidades de los pilotos en Vaxav.

## Estructura de Datos

### Categoría de Habilidad

```json
{
  "id": 1,
  "name": "Combate",
  "description": "Habilidades relacionadas con el combate y el uso de armas.",
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z"
}
```

### Habilidad

```json
{
  "id": 1,
  "skill_category_id": 1,
  "name": "Armas Láser Básicas",
  "description": "Conocimientos básicos sobre el uso de armas láser.",
  "multiplier": 1,
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z",
  "category": {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  "prerequisites": [
    {
      "id": 5,
      "skill_id": 1,
      "prerequisite_id": 3,
      "prerequisite_level": 2,
      "prerequisite": {
        "id": 3,
        "name": "Otra Habilidad"
      }
    }
  ]
}
```

### Habilidad de Piloto

```json
{
  "id": 1,
  "pilot_id": 1,
  "skill_id": 1,
  "xp": 1500,
  "current_level": 2,
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z",
  "skill": {
    "id": 1,
    "name": "Armas Láser Básicas",
    "description": "Conocimientos básicos sobre el uso de armas láser.",
    "multiplier": 1,
    "category": {
      "id": 1,
      "name": "Combate"
    }
  }
}
```

## Endpoints Públicos

### Obtener todas las habilidades

```
GET /api/skills
```

Devuelve una lista de todas las habilidades disponibles en el juego.

#### Respuesta

```json
[
  {
    "id": 1,
    "skill_category_id": 1,
    "name": "Armas Láser Básicas",
    "description": "Conocimientos básicos sobre el uso de armas láser.",
    "multiplier": 1,
    "category": {
      "id": 1,
      "name": "Combate"
    }
  },
  // ... más habilidades
]
```

### Obtener todas las categorías de habilidades

```
GET /api/skills/categories
```

Devuelve una lista de todas las categorías de habilidades.

#### Respuesta

```json
[
  {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  // ... más categorías
]
```

### Obtener habilidades por categoría

```
GET /api/skills/categories/{categoryId}
```

Devuelve una lista de habilidades que pertenecen a una categoría específica.

#### Respuesta

```json
[
  {
    "id": 1,
    "skill_category_id": 1,
    "name": "Armas Láser Básicas",
    "description": "Conocimientos básicos sobre el uso de armas láser.",
    "multiplier": 1
  },
  // ... más habilidades
]
```

### Obtener detalles de una habilidad

```
GET /api/skills/{skillId}
```

Devuelve los detalles completos de una habilidad, incluyendo sus prerrequisitos.

#### Respuesta

```json
{
  "id": 1,
  "skill_category_id": 1,
  "name": "Armas Láser Básicas",
  "description": "Conocimientos básicos sobre el uso de armas láser.",
  "multiplier": 1,
  "category": {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  "prerequisites": [
    {
      "id": 5,
      "skill_id": 1,
      "prerequisite_id": 3,
      "prerequisite_level": 2,
      "prerequisite": {
        "id": 3,
        "name": "Otra Habilidad"
      }
    }
  ]
}
```

### Obtener las habilidades del piloto actual

```
GET /api/pilots/current/skills
```

Devuelve las habilidades del piloto del usuario autenticado.

#### Respuesta

```json
[
  {
    "id": 1,
    "pilot_id": 1,
    "skill_id": 1,
    "xp": 1500,
    "current_level": 2,
    "skill": {
      "id": 1,
      "name": "Armas Láser Básicas",
      "description": "Conocimientos básicos sobre el uso de armas láser.",
      "multiplier": 1,
      "category": {
        "id": 1,
        "name": "Combate"
      }
    }
  },
  // ... más habilidades
]
```

### Obtener las habilidades de un piloto específico

```
GET /api/pilots/{pilotId}/skills
```

Devuelve las habilidades de un piloto específico. El usuario debe estar autorizado para ver esta información.

#### Respuesta

```json
[
  {
    "id": 1,
    "pilot_id": 1,
    "skill_id": 1,
    "xp": 1500,
    "current_level": 2,
    "skill": {
      "id": 1,
      "name": "Armas Láser Básicas",
      "description": "Conocimientos básicos sobre el uso de armas láser.",
      "multiplier": 1,
      "category": {
        "id": 1,
        "name": "Combate"
      }
    }
  },
  // ... más habilidades
]
```

## Endpoints de Administración

### Obtener todas las categorías de habilidades (Admin)

```
GET /api/admin/skill-categories
```

Devuelve una lista paginada de todas las categorías de habilidades.

#### Parámetros de consulta

- `search`: Filtrar por nombre o descripción
- `sort_field`: Campo por el que ordenar (por defecto: 'name')
- `sort_direction`: Dirección de ordenación ('asc' o 'desc', por defecto: 'asc')
- `per_page`: Número de elementos por página (por defecto: 10)
- `page`: Número de página

#### Respuesta

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Combate",
      "description": "Habilidades relacionadas con el combate y el uso de armas.",
      "created_at": "2023-05-15T10:00:00.000000Z",
      "updated_at": "2023-05-15T10:00:00.000000Z"
    },
    // ... más categorías
  ],
  "first_page_url": "http://vaxav.test/api/admin/skill-categories?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://vaxav.test/api/admin/skill-categories?page=1",
  "links": [
    // ... enlaces de paginación
  ],
  "next_page_url": null,
  "path": "http://vaxav.test/api/admin/skill-categories",
  "per_page": 10,
  "prev_page_url": null,
  "to": 8,
  "total": 8
}
```

### Crear una categoría de habilidad (Admin)

```
POST /api/admin/skill-categories
```

Crea una nueva categoría de habilidad.

#### Cuerpo de la solicitud

```json
{
  "name": "Nueva Categoría",
  "description": "Descripción de la nueva categoría."
}
```

#### Respuesta

```json
{
  "id": 9,
  "name": "Nueva Categoría",
  "description": "Descripción de la nueva categoría.",
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z"
}
```

### Obtener una categoría de habilidad (Admin)

```
GET /api/admin/skill-categories/{id}
```

Devuelve los detalles de una categoría de habilidad específica, incluyendo sus habilidades.

#### Respuesta

```json
{
  "id": 1,
  "name": "Combate",
  "description": "Habilidades relacionadas con el combate y el uso de armas.",
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z",
  "skills": [
    {
      "id": 1,
      "skill_category_id": 1,
      "name": "Armas Láser Básicas",
      "description": "Conocimientos básicos sobre el uso de armas láser.",
      "multiplier": 1
    },
    // ... más habilidades
  ]
}
```

### Actualizar una categoría de habilidad (Admin)

```
PUT /api/admin/skill-categories/{id}
```

Actualiza una categoría de habilidad existente.

#### Cuerpo de la solicitud

```json
{
  "name": "Combate Actualizado",
  "description": "Descripción actualizada."
}
```

#### Respuesta

```json
{
  "id": 1,
  "name": "Combate Actualizado",
  "description": "Descripción actualizada.",
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:30:00.000000Z"
}
```

### Eliminar una categoría de habilidad (Admin)

```
DELETE /api/admin/skill-categories/{id}
```

Elimina una categoría de habilidad. No se puede eliminar si tiene habilidades asociadas.

#### Respuesta

```json
{
  "message": "Categoría eliminada correctamente."
}
```

### Obtener todas las habilidades (Admin)

```
GET /api/admin/skills
```

Devuelve una lista paginada de todas las habilidades.

#### Parámetros de consulta

- `search`: Filtrar por nombre o descripción
- `category_id`: Filtrar por categoría
- `multiplier`: Filtrar por multiplicador
- `sort_field`: Campo por el que ordenar (por defecto: 'name')
- `sort_direction`: Dirección de ordenación ('asc' o 'desc', por defecto: 'asc')
- `per_page`: Número de elementos por página (por defecto: 10)
- `page`: Número de página

#### Respuesta

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "skill_category_id": 1,
      "name": "Armas Láser Básicas",
      "description": "Conocimientos básicos sobre el uso de armas láser.",
      "multiplier": 1,
      "created_at": "2023-05-15T10:00:00.000000Z",
      "updated_at": "2023-05-15T10:00:00.000000Z",
      "category": {
        "id": 1,
        "name": "Combate",
        "description": "Habilidades relacionadas con el combate y el uso de armas."
      },
      "prerequisites": []
    },
    // ... más habilidades
  ],
  "first_page_url": "http://vaxav.test/api/admin/skills?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "http://vaxav.test/api/admin/skills?page=3",
  "links": [
    // ... enlaces de paginación
  ],
  "next_page_url": "http://vaxav.test/api/admin/skills?page=2",
  "path": "http://vaxav.test/api/admin/skills",
  "per_page": 10,
  "prev_page_url": null,
  "to": 10,
  "total": 25
}
```

### Crear una habilidad (Admin)

```
POST /api/admin/skills
```

Crea una nueva habilidad.

#### Cuerpo de la solicitud

```json
{
  "skill_category_id": 1,
  "name": "Nueva Habilidad",
  "description": "Descripción de la nueva habilidad.",
  "multiplier": 2,
  "prerequisites": [
    {
      "skill_id": 1,
      "level": 3
    }
  ]
}
```

#### Respuesta

```json
{
  "id": 26,
  "skill_category_id": 1,
  "name": "Nueva Habilidad",
  "description": "Descripción de la nueva habilidad.",
  "multiplier": 2,
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z",
  "category": {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  "prerequisites": [
    {
      "id": 10,
      "skill_id": 26,
      "prerequisite_id": 1,
      "prerequisite_level": 3,
      "created_at": "2023-05-15T10:00:00.000000Z",
      "updated_at": "2023-05-15T10:00:00.000000Z"
    }
  ]
}
```

### Obtener una habilidad (Admin)

```
GET /api/admin/skills/{id}
```

Devuelve los detalles de una habilidad específica, incluyendo su categoría y prerrequisitos.

#### Respuesta

```json
{
  "id": 1,
  "skill_category_id": 1,
  "name": "Armas Láser Básicas",
  "description": "Conocimientos básicos sobre el uso de armas láser.",
  "multiplier": 1,
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:00:00.000000Z",
  "category": {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  "prerequisites": []
}
```

### Actualizar una habilidad (Admin)

```
PUT /api/admin/skills/{id}
```

Actualiza una habilidad existente.

#### Cuerpo de la solicitud

```json
{
  "skill_category_id": 1,
  "name": "Armas Láser Básicas Actualizado",
  "description": "Descripción actualizada.",
  "multiplier": 1,
  "prerequisites": [
    {
      "skill_id": 2,
      "level": 2
    }
  ]
}
```

#### Respuesta

```json
{
  "id": 1,
  "skill_category_id": 1,
  "name": "Armas Láser Básicas Actualizado",
  "description": "Descripción actualizada.",
  "multiplier": 1,
  "created_at": "2023-05-15T10:00:00.000000Z",
  "updated_at": "2023-05-15T10:30:00.000000Z",
  "category": {
    "id": 1,
    "name": "Combate",
    "description": "Habilidades relacionadas con el combate y el uso de armas."
  },
  "prerequisites": [
    {
      "id": 11,
      "skill_id": 1,
      "prerequisite_id": 2,
      "prerequisite_level": 2,
      "created_at": "2023-05-15T10:30:00.000000Z",
      "updated_at": "2023-05-15T10:30:00.000000Z"
    }
  ]
}
```

### Eliminar una habilidad (Admin)

```
DELETE /api/admin/skills/{id}
```

Elimina una habilidad. No se puede eliminar si es un prerrequisito para otras habilidades o está asignada a pilotos.

#### Respuesta

```json
{
  "message": "Habilidad eliminada correctamente."
}
```

### Obtener habilidades para dropdown (Admin)

```
GET /api/admin/skills-dropdown
```

Devuelve una lista simplificada de habilidades para usar en dropdowns.

#### Respuesta

```json
[
  {
    "id": 1,
    "name": "Armas Láser Básicas",
    "multiplier": 1
  },
  // ... más habilidades
]
```
