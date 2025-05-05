# Gestión de Estado con Pinia

Este documento describe la arquitectura y uso de los stores de Pinia en Vaxav.

## Estructura de Stores

Los stores están organizados por dominio:

- `auth.ts`: Gestión de autenticación y usuario
- `pilot.ts`: Gestión de pilotos
- `notification.js`: Sistema de notificaciones
- `user.ts`: Store unificado para información de usuario (combina auth y pilot)

## Store Unificado de Usuario

El store unificado de usuario (`user.ts`) proporciona una interfaz centralizada para acceder a toda la información relacionada con el usuario y su piloto, eliminando la necesidad de importar múltiples stores en los componentes.

### Propósito

- Centralizar el acceso a la información del usuario
- Proporcionar una carga automática de datos
- Simplificar el acceso a información combinada
- Mejorar la consistencia en toda la aplicación

### Implementación

```typescript
// frontend/src/stores/user.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { usePilotStore } from './pilot';
import { watch } from 'vue';

export const useUserStore = defineStore('user', {
  state: () => ({
    // Estado para controlar la carga de datos
    isLoaded: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Getters que combinan información de auth y pilot
    isLoggedIn: () => {
      const authStore = useAuthStore();
      return authStore.isLoggedIn;
    },

    isEmailVerified: () => {
      const authStore = useAuthStore();
      return authStore.isEmailVerified;
    },

    hasPilot: () => {
      const pilotStore = usePilotStore();
      return pilotStore.hasPilot;
    },

    pilotName: () => {
      const pilotStore = usePilotStore();
      return pilotStore.pilotName;
    },

    // ... otros getters ...
  },

  actions: {
    // Cargar todos los datos del usuario
    async loadUserData() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();

        // Primero cargar datos de autenticación
        if (!authStore.isAuthenticated && authStore.token) {
          await authStore.fetchUser();
        }

        // Si está autenticado, cargar datos del piloto
        if (authStore.isAuthenticated) {
          const pilotStore = usePilotStore();
          await pilotStore.fetchCurrentPilot();
        }

        this.isLoaded = true;
      } catch (error) {
        this.error = error.message || 'Error al cargar datos del usuario';
        console.error('Error en loadUserData:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Método para actualizar datos después de cambios
    async refreshUserData() {
      this.isLoaded = false;
      return this.loadUserData();
    }
  }
});

// Configurar watcher para recargar datos cuando cambie el token
export function setupUserStoreWatchers() {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  watch(() => authStore.token, (newToken) => {
    if (newToken) {
      userStore.loadUserData();
    }
  });
}
```

### Uso en Componentes

#### Ejemplo Básico

```vue
<script setup>
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(async () => {
  // Cargar datos del usuario si no están cargados
  if (!userStore.isLoaded) {
    await userStore.loadUserData();
  }
});
</script>

<template>
  <div>
    <div v-if="userStore.isLoading">Cargando...</div>
    <div v-else-if="userStore.error">Error: {{ userStore.error }}</div>
    <div v-else-if="userStore.isLoggedIn">
      <h1>Bienvenido, {{ userStore.pilotName || 'Usuario' }}</h1>

      <div v-if="userStore.hasPilot">
        <p>Créditos: {{ userStore.pilotCredits }}</p>
        <p>Raza: {{ userStore.pilotRace }}</p>
      </div>
      <div v-else>
        <p>No tienes un piloto. ¡Crea uno ahora!</p>
      </div>
    </div>
    <div v-else>
      <p>Por favor, inicia sesión para continuar.</p>
    </div>
  </div>
</template>
```

#### Componentes Actualizados

Los siguientes componentes han sido actualizados para usar el store unificado:

1. **AppHeader.vue**: Usa el store unificado para mostrar información del usuario y generar el menú de navegación.

2. **PilotOverviewView.vue**: Usa el store unificado para mostrar información del piloto y gestionar la carga de datos.

3. **HomeView.vue**: Usa el store unificado para mostrar información del usuario y piloto en la página principal.

4. **AdminLayout.vue**: Usa el store unificado para verificar permisos y generar el menú de navegación.

5. **CreatePilotView.vue**: Usa el store unificado para actualizar los datos después de crear un piloto.

6. **LoginView.vue**: Usa el store unificado para gestionar el inicio de sesión y cargar datos del usuario.

7. **RegisterView.vue**: Usa el store unificado para gestionar el registro y cargar datos del usuario.

8. **VerifyEmailView.vue**: Usa el store unificado para verificar el email y gestionar el estado de verificación.

9. **ForgotPasswordView.vue**: Usa el store unificado para gestionar la recuperación de contraseña.

10. **ResetPasswordView.vue**: Usa el store unificado para gestionar el restablecimiento de contraseña.

11. **RolesView.vue**: Usa el store unificado para verificar permisos de administración.

#### Ejemplo de Actualización (AppHeader.vue)

```typescript
// Antes
import { useAuthStore } from '@/stores/auth';
import { usePilotStore } from '@/stores/pilot';

const authStore = useAuthStore();
const pilotStore = usePilotStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const hasPilot = computed(() => pilotStore.hasPilot);

// Después
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const hasPilot = computed(() => userStore.hasPilot);
```

## Carga Automática de Datos

El store unificado se integra con el router para cargar automáticamente los datos del usuario cuando sea necesario:

```typescript
// frontend/src/router/guards.ts
import { useUserStore } from '@/stores/user';

export async function setupAuthGuard(router) {
  const userStore = useUserStore();

  router.beforeEach(async (to, from, next) => {
    // Si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
      // Cargar datos del usuario si no están cargados
      if (!userStore.isLoaded) {
        await userStore.loadUserData();
      }

      // Verificar autenticación
      if (!userStore.isLoggedIn) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
      }

      // Verificar verificación de email si es necesario
      if (to.meta.requiresEmailVerification && !userStore.isEmailVerified) {
        return next({ name: 'verify-email' });
      }

      // Verificar si tiene piloto si es necesario
      if (to.meta.requiresPilot && !userStore.hasPilot) {
        return next({ name: 'create-pilot' });
      }
    }

    next();
  });
}
```

## Persistencia de Estado

Para persistir el estado entre recargas de página, se utiliza el plugin `pinia-plugin-persistedstate`:

```typescript
// frontend/src/stores/plugins/persistence.ts
import { createPersistedState } from 'pinia-plugin-persistedstate';

export const piniaPersistedState = createPersistedState({
  // Configuración global
  storage: localStorage,
  key: (id) => `vaxav_${id}`,
});

// Configuración específica para cada store
export const authPersistOptions = {
  persist: {
    paths: ['token', 'user.id', 'user.email', 'isAuthenticated', 'emailVerified'],
  },
};

export const pilotPersistOptions = {
  persist: {
    paths: ['currentPilot'],
  },
};

export const userPersistOptions = {
  persist: {
    paths: ['isLoaded'],
  },
};
```

## Buenas Prácticas

### Uso del Store Unificado

1. **Usar el Store Unificado**: Siempre que necesites información del usuario o piloto, usa el store unificado en lugar de los stores individuales.

2. **Evitar la Carga Manual**: No llames a `fetchUser()` o `fetchCurrentPilot()` directamente; usa `loadUserData()` del store unificado.

3. **Verificar Estado de Carga**: Siempre verifica `isLoaded` y `isLoading` antes de acceder a los datos.

4. **Manejar Errores**: Siempre verifica `error` y muestra mensajes apropiados al usuario.

5. **Actualizar Después de Cambios**: Después de operaciones que modifican datos del usuario o piloto, llama a `refreshUserData()`.

### Migración de Componentes Existentes

Para migrar componentes existentes al store unificado, sigue estos pasos:

1. **Importar el Store Unificado**:
   ```typescript
   import { useUserStore } from '@/stores/user';
   ```

2. **Reemplazar Inicialización de Stores**:
   ```typescript
   // Antes
   const authStore = useAuthStore();
   const pilotStore = usePilotStore();

   // Después
   const userStore = useUserStore();
   ```

3. **Actualizar Referencias a Getters**:
   ```typescript
   // Antes
   const isLoggedIn = computed(() => authStore.isLoggedIn);
   const hasPilot = computed(() => pilotStore.hasPilot);

   // Después
   const isLoggedIn = computed(() => userStore.isLoggedIn);
   const hasPilot = computed(() => userStore.hasPilot);
   ```

4. **Actualizar Carga de Datos**:
   ```typescript
   // Antes
   onMounted(async () => {
     if (authStore.isLoggedIn) {
       await pilotStore.fetchCurrentPilot();
     }
   });

   // Después
   onMounted(async () => {
     if (userStore.isLoggedIn && !userStore.isLoaded) {
       await userStore.loadUserData();
     }
   });
   ```

5. **Actualizar Referencias en Templates**:
   ```html
   <!-- Antes -->
   <p>{{ pilotStore.pilotName }}</p>

   <!-- Después -->
   <p>{{ userStore.pilotName }}</p>
   ```

## Migración a TypeScript

Todos los stores deben migrarse a TypeScript para mejorar la seguridad de tipos y la consistencia. Consulta la [guía de migración a TypeScript](../guides/typescript-migration.md) para más detalles.
