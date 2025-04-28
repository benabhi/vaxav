# Sistema de Autenticación y Autorización

Este documento describe el sistema de autenticación y autorización implementado en la aplicación Vaxav.

## Visión General

El sistema utiliza un enfoque basado en tokens JWT (JSON Web Tokens) a través de Laravel Sanctum para la autenticación, y un sistema personalizado de roles y permisos para la autorización. Esta combinación proporciona una solución segura, flexible y escalable para gestionar el acceso a los recursos de la aplicación.

## Componentes Principales

El sistema consta de los siguientes componentes principales:

1. **Autenticación con Laravel Sanctum**: Gestiona la creación y validación de tokens de acceso.
2. **Sistema de Roles y Permisos**: Define qué acciones puede realizar cada usuario.
3. **Middleware de Permisos**: Valida los permisos del usuario para acceder a rutas específicas.
4. **Interfaz de Administración**: Permite gestionar usuarios, roles y permisos.

## Flujo de Autenticación

1. El usuario envía sus credenciales (email y contraseña) al endpoint `/api/login`.
2. El servidor valida las credenciales y, si son correctas, genera un token de acceso.
3. El cliente almacena el token en el almacenamiento local (localStorage).
4. Para las solicitudes posteriores, el cliente incluye el token en el encabezado `Authorization`.
5. El servidor valida el token y permite o deniega el acceso según los permisos del usuario.

## Cierre de Sesión

1. El usuario solicita cerrar sesión a través del endpoint `/api/logout`.
2. El servidor invalida el token actual.
3. El cliente elimina el token del almacenamiento local.

## Seguridad

- Los tokens tienen un tiempo de expiración configurable.
- Las contraseñas se almacenan utilizando el algoritmo de hash bcrypt.
- Se implementan protecciones contra ataques CSRF y XSS.
- Las solicitudes de API están protegidas por middleware de autenticación.

## Documentación Relacionada

Para obtener más información sobre aspectos específicos del sistema, consulte los siguientes documentos:

- [Roles y Permisos](./roles-permissions.md): Detalles sobre el sistema de roles y permisos.
- [Implementación Frontend](./frontend-implementation.md): Cómo se implementa la autenticación en el frontend.
- [Implementación Backend](./backend-implementation.md): Cómo se implementa la autenticación en el backend.
