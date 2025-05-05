# Store Unificado de Usuario

## Descripción

El store unificado de usuario (`useUserStore`) proporciona un punto centralizado para acceder a toda la información relacionada con el usuario autenticado y su piloto. Este store combina la funcionalidad de `useAuthStore` y `usePilotStore` para simplificar el acceso a los datos y reducir la duplicación de código.

## Estructura

### Estado

El estado del store unificado incluye:

- `isLoaded`: Indica si los datos del usuario han sido cargados.
- `isLoading`: Indica si se están cargando datos del usuario.
- `error`: Mensaje de error durante la carga de datos.

### Getters

El store proporciona los siguientes getters:

- `isLoggedIn`: Indica si el usuario está autenticado.
- `isEmailVerified`: Indica si el email del usuario está verificado.
- `hasPilot`: Indica si el usuario tiene un piloto.
- `pilotName`: Nombre del piloto del usuario.
- `pilotRace`: Raza del piloto del usuario.
- `pilotCredits`: Créditos del piloto del usuario.
- `isModerator`: Indica si el usuario es moderador.
- `isAdmin`: Indica si el usuario es administrador.
- `userData`: Datos completos del usuario.
- `pilotData`: Datos completos del piloto.
- `isUserDataLoading`: Indica si se están cargando datos del usuario o piloto.

### Acciones

El store proporciona las siguientes acciones:

- `loadUserData()`: Carga todos los datos del usuario (autenticación y piloto).
- `register(userData)`: Registra un nuevo usuario.
- `login(credentials)`: Inicia sesión con un usuario existente.
- `logout()`: Cierra la sesión del usuario actual.
- `createPilot(pilotData)`: Crea un nuevo piloto para el usuario actual.
- `refreshUserData()`: Actualiza los datos del usuario después de cambios.
- `clearError()`: Limpia el error actual.

## Uso

### Importación

```typescript
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
```

### Verificar estado de autenticación

```typescript
// Verificar si el usuario está autenticado
if (userStore.isLoggedIn) {
  // El usuario está autenticado
}

// Verificar si el email está verificado
if (userStore.isEmailVerified) {
  // El email está verificado
}

// Verificar si el usuario tiene un piloto
if (userStore.hasPilot) {
  // El usuario tiene un piloto
}
```

### Acceder a datos del usuario

```typescript
// Obtener datos del usuario
const user = userStore.userData;
console.log(user.name); // Nombre del usuario
console.log(user.email); // Email del usuario

// Obtener datos del piloto
const pilot = userStore.pilotData;
console.log(pilot.name); // Nombre del piloto
console.log(pilot.race); // Raza del piloto
console.log(pilot.credits); // Créditos del piloto
```

### Iniciar sesión

```typescript
try {
  await userStore.login({
    email: 'usuario@ejemplo.com',
    password: 'contraseña'
  });
  
  // Inicio de sesión exitoso
  console.log('Sesión iniciada correctamente');
} catch (error) {
  // Error al iniciar sesión
  console.error('Error al iniciar sesión:', error);
}
```

### Registrar un nuevo usuario

```typescript
try {
  await userStore.register({
    name: 'Nombre Usuario',
    email: 'usuario@ejemplo.com',
    email_confirmation: 'usuario@ejemplo.com',
    password: 'Contraseña123!',
    password_confirmation: 'Contraseña123!'
  });
  
  // Registro exitoso
  console.log('Usuario registrado correctamente');
} catch (error) {
  // Error al registrar usuario
  console.error('Error al registrar usuario:', error);
}
```

### Crear un piloto

```typescript
try {
  await userStore.createPilot({
    name: 'Nombre Piloto',
    race: 'Humano'
  });
  
  // Piloto creado exitosamente
  console.log('Piloto creado correctamente');
} catch (error) {
  // Error al crear piloto
  console.error('Error al crear piloto:', error);
}
```

### Cerrar sesión

```typescript
await userStore.logout();
console.log('Sesión cerrada correctamente');
```

### Manejar errores

```typescript
try {
  await userStore.loadUserData();
} catch (error) {
  console.error('Error al cargar datos del usuario:', userStore.error);
}

// Limpiar error
userStore.clearError();
```

## Ventajas del Store Unificado

1. **Acceso centralizado**: Proporciona un único punto de acceso a todos los datos del usuario.
2. **Reducción de duplicación**: Evita la duplicación de código al combinar la funcionalidad de múltiples stores.
3. **Mejor mantenibilidad**: Facilita el mantenimiento al centralizar la lógica relacionada con el usuario.
4. **Consistencia**: Garantiza que los datos del usuario y piloto estén siempre sincronizados.
5. **Tipado fuerte**: Proporciona tipos TypeScript para mejorar la seguridad y el autocompletado.

## Migración desde Stores Individuales

Si estás migrando desde los stores individuales (`useAuthStore` y `usePilotStore`), aquí hay una guía de equivalencias:

| Store Individual | Store Unificado |
|------------------|-----------------|
| `useAuthStore().isAuthenticated` | `useUserStore().isLoggedIn` |
| `useAuthStore().isEmailVerified` | `useUserStore().isEmailVerified` |
| `useAuthStore().user` | `useUserStore().userData` |
| `useAuthStore().isModerator` | `useUserStore().isModerator` |
| `useAuthStore().isAdmin` | `useUserStore().isAdmin` |
| `useAuthStore().login(credentials)` | `useUserStore().login(credentials)` |
| `useAuthStore().register(userData)` | `useUserStore().register(userData)` |
| `useAuthStore().logout()` | `useUserStore().logout()` |
| `usePilotStore().hasPilot` | `useUserStore().hasPilot` |
| `usePilotStore().currentPilot` | `useUserStore().pilotData` |
| `usePilotStore().pilotName` | `useUserStore().pilotName` |
| `usePilotStore().pilotRace` | `useUserStore().pilotRace` |
| `usePilotStore().pilotCredits` | `useUserStore().pilotCredits` |
| `usePilotStore().createPilot(pilotData)` | `useUserStore().createPilot(pilotData)` |
