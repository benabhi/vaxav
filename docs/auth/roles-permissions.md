# Sistema de Roles y Permisos

Este documento describe el sistema de roles y permisos implementado en la aplicación Vaxav.

## Visión General

El sistema utiliza un enfoque basado en roles y permisos para controlar el acceso a las diferentes funcionalidades de la aplicación. Cada usuario puede tener uno o más roles, y cada rol puede tener uno o más permisos. Los permisos determinan qué acciones puede realizar un usuario.

## Modelos de Datos

### Usuario (User)

- Representa a un usuario del sistema.
- Puede tener múltiples roles.
- La relación con los roles se implementa mediante una tabla pivote `role_user`.

### Rol (Role)

- Representa un conjunto de permisos.
- Tiene un nombre, un slug (identificador único) y una descripción.
- Puede tener múltiples permisos.
- La relación con los permisos se implementa mediante una tabla pivote `permission_role`.

### Permiso (Permission)

- Representa una acción específica que se puede realizar en el sistema.
- Tiene un nombre, un slug (identificador único) y una descripción.
- Puede pertenecer a múltiples roles.

## Roles Predefinidos

El sistema incluye los siguientes roles predefinidos:

1. **Super Admin** (`superadmin`): Tiene acceso completo a todas las funcionalidades del sistema.
2. **Administrador** (`admin`): Tiene acceso a la mayoría de las funcionalidades administrativas.
3. **Moderador** (`moderator`): Tiene acceso limitado para moderar contenido.
4. **Usuario** (`user`): Tiene acceso básico para usuarios regulares.

## Permisos Disponibles

Los permisos se organizan por módulos y acciones. Algunos ejemplos incluyen:

- `users.view`: Ver usuarios
- `users.create`: Crear usuarios
- `users.edit`: Editar usuarios
- `users.delete`: Eliminar usuarios
- `roles.view`: Ver roles
- `roles.create`: Crear roles
- `roles.edit`: Editar roles
- `roles.delete`: Eliminar roles

## Verificación de Permisos

La verificación de permisos se realiza a través de un middleware personalizado `CheckPermission`. Este middleware verifica si el usuario autenticado tiene el permiso requerido para acceder a una ruta específica.

### Ejemplo de uso en rutas:

```php
Route::apiResource('users', UserController::class)->middleware([
    'permission:users.view',     // Para index y show
    'permission:users.create',   // Para store
    'permission:users.edit',     // Para update
    'permission:users.delete'    // Para destroy
]);
```

## Gestión de Roles y Permisos

La gestión de roles y permisos se realiza a través de la interfaz de administración. Los usuarios con los permisos adecuados pueden:

1. **Crear, editar y eliminar roles**: A través de la página de administración de roles.
2. **Asignar permisos a roles**: Al crear o editar un rol.
3. **Asignar roles a usuarios**: Al crear o editar un usuario.

## Consideraciones Importantes

- Los roles predefinidos (`superadmin`, `admin`, `moderator`, `user`) no se pueden eliminar.
- El slug de los roles predefinidos no se puede modificar.
- Se recomienda no modificar los permisos predefinidos para mantener la consistencia del sistema.
- Al crear nuevos permisos, se recomienda seguir la convención `modulo.accion` para el slug.
