# Implementación de Autenticación en el Frontend

Este documento describe cómo se implementa la autenticación y autorización en el frontend de la aplicación Vaxav.

## Tecnologías Utilizadas

- **Vue.js 3**: Framework JavaScript para construir la interfaz de usuario.
- **Pinia**: Biblioteca de gestión de estado para Vue.js.
- **Axios**: Cliente HTTP para realizar solicitudes a la API.
- **Vue Router**: Enrutador oficial para Vue.js.

## Estructura de Archivos

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── DeleteRoleModal.vue
│   │   │   ├── DeleteUserModal.vue
│   │   │   ├── RoleModal.vue
│   │   │   └── UserModal.vue
│   │   └── ui/
│   │       ├── Modal.vue
│   │       └── ...
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   └── api.js
│   ├── stores/
│   │   └── auth.js
│   └── views/
│       ├── admin/
│       │   ├── RolesView.vue
│       │   └── UsersView.vue
│       ├── LoginView.vue
│       └── ...
```

## Store de Autenticación

El store de autenticación (`auth.js`) gestiona el estado de autenticación del usuario y proporciona métodos para iniciar sesión, cerrar sesión y verificar la autenticación.

### Funcionalidades principales:

- **Estado**: Almacena el usuario actual, el token de autenticación y el estado de carga.
- **Getters**: Proporciona acceso al usuario, token y estado de autenticación.
- **Acciones**:
  - `login`: Inicia sesión con credenciales y almacena el token.
  - `logout`: Cierra sesión y elimina el token.
  - `checkAuth`: Verifica si el usuario está autenticado.
  - `fetchUser`: Obtiene los datos del usuario autenticado.

## Servicio de API

El servicio de API (`api.js`) configura Axios para realizar solicitudes a la API del backend.

### Funcionalidades principales:

- **Configuración base**: URL base, timeout, etc.
- **Interceptores**:
  - **Solicitud**: Añade el token de autenticación al encabezado `Authorization`.
  - **Respuesta**: Maneja errores de autenticación (401, 403) y redirige al login si es necesario.

## Protección de Rutas

El enrutador (`router/index.ts`) protege las rutas que requieren autenticación mediante guardias de navegación.

### Ejemplo de configuración:

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

## Componentes de Autenticación

### LoginView.vue

- Formulario de inicio de sesión.
- Valida las credenciales del usuario.
- Utiliza el store de autenticación para iniciar sesión.
- Redirige al usuario a la página principal después del inicio de sesión exitoso.

### Componentes de Administración

#### UsersView.vue

- Muestra la lista de usuarios.
- Permite crear, editar y eliminar usuarios.
- Utiliza los componentes `UserModal.vue` y `DeleteUserModal.vue`.

#### RolesView.vue

- Muestra la lista de roles.
- Permite crear, editar y eliminar roles.
- Utiliza los componentes `RoleModal.vue` y `DeleteRoleModal.vue`.

## Verificación de Permisos

La verificación de permisos en el frontend se realiza a través de funciones auxiliares que comprueban si el usuario tiene los permisos necesarios para realizar ciertas acciones.

### Ejemplo de uso:

```javascript
const hasPermission = (permission) => {
  const authStore = useAuthStore();
  if (!authStore.user || !authStore.user.roles) return false;
  
  return authStore.user.roles.some(role => 
    role.permissions.some(p => p.slug === permission)
  );
};

// Uso en un componente
const canEditUsers = computed(() => hasPermission('users.edit'));
```

## Manejo de Errores

El frontend maneja los errores de autenticación y autorización de la siguiente manera:

- **Error 401 (No autorizado)**: Redirige al usuario a la página de inicio de sesión.
- **Error 403 (Prohibido)**: Muestra un mensaje de error indicando que el usuario no tiene permisos suficientes.
- **Errores de validación**: Muestra los mensajes de error devueltos por la API.
