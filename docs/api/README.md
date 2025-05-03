# API de Vaxav

Esta sección documenta la API RESTful de Vaxav, que proporciona acceso a todas las funcionalidades del juego desde el frontend.

## Estructura de la API

La API de Vaxav sigue los principios RESTful y está organizada en los siguientes grupos de endpoints:

1. **Autenticación**: Endpoints para registro, inicio de sesión, verificación de email y gestión de tokens.
2. **Usuarios**: Endpoints para gestionar usuarios y perfiles.
3. **Pilotos**: Endpoints para crear y gestionar pilotos.
4. **Habilidades**: Endpoints para gestionar habilidades de pilotos.
5. **Universo**: Endpoints para explorar el universo (regiones, constelaciones, sistemas solares).
6. **Naves**: Endpoints para gestionar naves y equipamiento.
7. **Mercado**: Endpoints para el sistema de comercio.
8. **Administración**: Endpoints para funciones administrativas.

## Autenticación

Todos los endpoints de la API (excepto los de autenticación pública) requieren autenticación mediante tokens. La API utiliza Laravel Sanctum para la autenticación basada en tokens.

Para más detalles sobre la autenticación, consulta la [documentación de autenticación](../auth/README.md).

## Documentación de Endpoints

La API está documentada en los siguientes archivos:

- [Autenticación](./authentication.md) - Endpoints de registro, login y gestión de tokens
- [Pilotos](./pilots.md) - Endpoints relacionados con pilotos
- [Habilidades](./skills.md) - Endpoints relacionados con habilidades

## Formato de Respuesta

Todas las respuestas de la API siguen un formato consistente:

### Respuestas Exitosas

```json
{
  "data": {
    // Datos solicitados
  },
  "meta": {
    // Metadatos (paginación, etc.)
  }
}
```

### Respuestas de Error

```json
{
  "message": "Mensaje de error descriptivo",
  "errors": {
    // Detalles de errores de validación (si aplica)
  }
}
```

## Códigos de Estado HTTP

La API utiliza los siguientes códigos de estado HTTP:

- `200 OK`: La solicitud se completó con éxito
- `201 Created`: El recurso se creó con éxito
- `204 No Content`: La solicitud se completó con éxito pero no hay contenido para devolver
- `400 Bad Request`: La solicitud contiene datos inválidos
- `401 Unauthorized`: No se proporcionó autenticación o es inválida
- `403 Forbidden`: El usuario no tiene permiso para acceder al recurso
- `404 Not Found`: El recurso solicitado no existe
- `422 Unprocessable Entity`: La solicitud contiene errores de validación
- `500 Internal Server Error`: Error del servidor

## Paginación

Los endpoints que devuelven colecciones de recursos utilizan paginación. La respuesta incluye metadatos de paginación:

```json
{
  "data": [
    // Recursos
  ],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "http://vaxav.test/api/resources",
    "per_page": 15,
    "to": 15,
    "total": 75
  },
  "links": {
    "first": "http://vaxav.test/api/resources?page=1",
    "last": "http://vaxav.test/api/resources?page=5",
    "prev": null,
    "next": "http://vaxav.test/api/resources?page=2"
  }
}
```

## Filtrado y Ordenación

Muchos endpoints soportan filtrado y ordenación mediante parámetros de consulta:

- `?filter[campo]=valor`: Filtra por un campo específico
- `?sort=campo`: Ordena por un campo en orden ascendente
- `?sort=-campo`: Ordena por un campo en orden descendente

## Ejemplos de Uso

### Obtener el Piloto Actual

```javascript
// Usando Axios
const response = await axios.get('/api/pilots/current', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const pilot = response.data;
```

### Crear un Piloto

```javascript
// Usando Axios
const response = await axios.post('/api/pilots', {
  name: 'Nombre del Piloto',
  race: 'Humano'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const newPilot = response.data;
```
