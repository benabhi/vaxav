# Flujo de Navegación

Este documento describe el flujo de navegación en Vaxav, incluyendo las restricciones de acceso y el proceso que deben seguir los usuarios para acceder a todas las funcionalidades del juego.

## Visión General

Vaxav implementa un flujo de navegación estructurado que guía a los usuarios a través de un proceso específico antes de obtener acceso completo al juego. Este flujo asegura que todos los usuarios completen los pasos necesarios para una experiencia de juego óptima.

## Secuencia de Navegación Obligatoria

Los usuarios deben completar la siguiente secuencia de pasos en orden:

1. **Registro**: El usuario crea una cuenta proporcionando nombre, correo electrónico y contraseña.
2. **Verificación de Email**: El usuario debe verificar su dirección de correo electrónico.
3. **Creación de Piloto**: El usuario debe crear un piloto para representarse en el universo del juego.
4. **Acceso Completo**: Una vez completados los pasos anteriores, el usuario obtiene acceso completo a todas las funcionalidades del juego.

## Restricciones de Acceso

### Usuarios No Autenticados

Los usuarios no autenticados solo pueden acceder a:

- Página de inicio (vista limitada)
- Página de registro
- Página de inicio de sesión
- Página de recuperación de contraseña

### Usuarios Autenticados Sin Email Verificado

Los usuarios que han iniciado sesión pero no han verificado su email solo pueden acceder a:

- Página de verificación de email

### Usuarios Autenticados Con Email Verificado Pero Sin Piloto

Los usuarios que han verificado su email pero no han creado un piloto solo pueden acceder a:

- Página de inicio (vista limitada)
- Página de creación de piloto

### Usuarios Completos (Autenticados, Email Verificado, Con Piloto)

Los usuarios que han completado todos los pasos pueden acceder a todas las funcionalidades del juego:

- Página de inicio (vista completa)
- Exploración del universo
- Mercado
- Gestión de naves
- Perfil de usuario
- Y todas las demás funcionalidades según sus roles y permisos

## Implementación Técnica

### Middleware de Navegación

El flujo de navegación se implementa mediante middleware en Vue Router que verifica el estado del usuario antes de permitir el acceso a las rutas:

1. **Middleware de Autenticación**: Verifica si el usuario ha iniciado sesión.
2. **Middleware de Verificación de Email**: Verifica si el usuario ha verificado su email.
3. **Middleware de Piloto**: Verifica si el usuario ha creado un piloto.

### Código de Implementación

El middleware se implementa en `frontend/src/router/index.ts`:

```typescript
// Navegación de protección de rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Verificar autenticación
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'login' });
  }
  
  // Verificar si la ruta es solo para invitados
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'home' });
  }
  
  // Verificar roles específicos
  if (to.meta.requiresRoles && authStore.user) {
    const userHasRole = hasRole(authStore.user, to.meta.requiresRoles);
    if (!userHasRole) {
      return next({ name: 'home' });
    }
  }
  
  // Verificar email
  if (authStore.user &&
    !authStore.isEmailVerified &&
    to.name !== 'verification.notice' &&
    to.name !== 'login' &&
    to.name !== 'register' &&
    to.name !== 'password.request' &&
    to.name !== 'password.reset') {
    return next({ name: 'verification.notice' });
  }
  
  // Verificar piloto
  if (authStore.user && 
    authStore.isEmailVerified && 
    to.name !== 'create-pilot' &&
    to.name !== 'login' &&
    to.name !== 'register' &&
    to.name !== 'password.request' &&
    to.name !== 'password.reset') {
    
    const pilotStore = usePilotStore();
    if (!pilotStore.hasPilot && !pilotStore.loading) {
      try {
        await pilotStore.fetchCurrentPilot();
      } catch (error) {
        console.error('Error fetching pilot:', error);
      }
    }
    
    if (!pilotStore.hasPilot && to.name !== 'home') {
      return next({ name: 'create-pilot' });
    }
  }
  
  next();
});
```

## Interfaz de Usuario

La interfaz de usuario refleja el flujo de navegación mostrando diferentes opciones según el estado del usuario:

### Página de Inicio

- **Usuario No Autenticado**: Muestra opciones para iniciar sesión o registrarse.
- **Usuario Sin Piloto**: Muestra un mensaje y un botón para crear un piloto.
- **Usuario Completo**: Muestra información del piloto y acciones rápidas para acceder a las principales funcionalidades del juego.

### Barra de Navegación

- **Usuario No Autenticado**: Muestra enlaces a inicio, inicio de sesión y registro.
- **Usuario Sin Piloto**: Muestra enlaces limitados.
- **Usuario Completo**: Muestra todos los enlaces disponibles según los roles y permisos del usuario.

## Beneficios del Flujo Estructurado

Este flujo de navegación estructurado proporciona varios beneficios:

1. **Experiencia Guiada**: Los usuarios son guiados a través de los pasos necesarios para comenzar a jugar.
2. **Verificación de Identidad**: La verificación de email ayuda a confirmar la identidad de los usuarios.
3. **Consistencia de Datos**: Asegura que todos los usuarios tengan un piloto antes de interactuar con el juego.
4. **Seguridad**: Restringe el acceso a funcionalidades según el estado del usuario.

## Consideraciones Futuras

El flujo de navegación podría expandirse en el futuro para incluir:

- Tutorial interactivo para nuevos jugadores
- Proceso de onboarding más detallado
- Personalización de la experiencia según el tipo de jugador
- Integración con sistemas de logros y progresión
