# Arquitectura del Frontend

Este documento describe la arquitectura del frontend de Vaxav, desarrollado con Vue.js 3.

## Tecnologías Principales

- **Vue.js 3**: Framework JavaScript para construir la interfaz de usuario.
- **Vue Router**: Enrutador oficial para Vue.js.
- **Pinia**: Biblioteca de gestión de estado para Vue.js.
- **Axios**: Cliente HTTP para realizar solicitudes a la API.
- **Tailwind CSS**: Framework CSS para el diseño de la interfaz de usuario.
- **Vite**: Herramienta de construcción y servidor de desarrollo.

## Estructura de Directorios

```
frontend/
├── public/              # Archivos estáticos públicos
├── src/                 # Código fuente principal
│   ├── assets/          # Recursos estáticos (imágenes, fuentes, etc.)
│   ├── components/      # Componentes Vue reutilizables
│   │   ├── admin/       # Componentes específicos para administración
│   │   ├── icons/       # Componentes de iconos
│   │   ├── layout/      # Componentes de estructura y layout
│   │   └── ui/          # Componentes de interfaz de usuario
│   │       ├── buttons/     # Botones y controles de acción
│   │       ├── data-display/ # Componentes para mostrar datos
│   │       ├── feedback/    # Componentes de retroalimentación
│   │       ├── forms/       # Campos de formulario
│   │       ├── modals/      # Ventanas modales
│   │       ├── navigation/  # Componentes de navegación
│   │       └── overlays/    # Componentes superpuestos
│   ├── router/          # Configuración de rutas
│   ├── services/        # Servicios para interactuar con APIs
│   ├── stores/          # Stores de Pinia para gestión de estado
│   ├── views/           # Componentes de página/vista
│   │   ├── admin/       # Vistas de administración
│   │   ├── auth/        # Vistas de autenticación
│   │   ├── market/      # Vistas del mercado
│   │   ├── pilot/       # Vistas relacionadas con pilotos
│   │   ├── ships/       # Vistas relacionadas con naves
│   │   └── universe/    # Vistas relacionadas con el universo
│   ├── App.vue          # Componente raíz
│   ├── main.ts          # Punto de entrada principal
│   └── vite-env.d.ts    # Declaraciones de tipos para Vite
├── .env                 # Variables de entorno
├── index.html           # Plantilla HTML principal
├── package.json         # Dependencias y scripts
├── tailwind.config.js   # Configuración de Tailwind CSS
├── tsconfig.json        # Configuración de TypeScript
└── vite.config.ts       # Configuración de Vite
```

## Componentes

Los componentes están organizados siguiendo una metodología de diseño atómico:

1. **Componentes UI**: Componentes básicos y reutilizables (botones, inputs, etc.).
2. **Componentes de Layout**: Definen la estructura de la aplicación (header, sidebar, etc.).
3. **Componentes Específicos**: Componentes para funcionalidades específicas (admin, etc.).
4. **Vistas**: Componentes de página completa que utilizan los componentes anteriores.

Para más detalles sobre los componentes, consulte la [documentación de componentes](../components/README.md).

## Enrutamiento

El enrutamiento se gestiona con Vue Router. La configuración se encuentra en `src/router/index.ts`.

### Estructura de Rutas

Las rutas están organizadas por módulos:

- `/`: Página principal
- `/login`, `/register`: Autenticación
- `/admin/*`: Panel de administración
- `/pilot/*`: Gestión de pilotos
- `/ships/*`: Gestión de naves
- `/universe/*`: Exploración del universo
- `/market/*`: Mercado

### Protección de Rutas

Las rutas que requieren autenticación están protegidas mediante guardias de navegación que utilizan el store unificado:

```typescript
// src/router/guards.ts
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

      // Verificar roles si es necesario
      if (to.meta.requiredRole && !userStore[`is${to.meta.requiredRole}`]) {
        return next({ name: 'unauthorized' });
      }
    }

    next();
  });
}
```

## Gestión de Estado

La gestión de estado se realiza con Pinia. Los stores están organizados por funcionalidad:

- `auth.ts`: Estado de autenticación y usuario actual
- `pilot.ts`: Estado relacionado con pilotos
- `notification.js`: Sistema de notificaciones
- `user.ts`: Store unificado que combina información de usuario y piloto

### Store Unificado de Usuario

El store unificado de usuario (`user.ts`) proporciona una interfaz centralizada para acceder a toda la información relacionada con el usuario y su piloto, eliminando la necesidad de importar múltiples stores en los componentes.

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { usePilotStore } from './pilot';
import { watch } from 'vue';

export const useUserStore = defineStore('user', {
  state: () => ({
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

    hasPilot: () => {
      const pilotStore = usePilotStore();
      return pilotStore.hasPilot;
    },

    // ... otros getters ...
  },

  actions: {
    // Cargar todos los datos del usuario
    async loadUserData() {
      // Implementación...
    },

    // Actualizar datos después de cambios
    async refreshUserData() {
      // Implementación...
    }
  }
});
```

### Persistencia de Estado

Para persistir el estado entre recargas de página, se utiliza el plugin `pinia-plugin-persistedstate`:

```typescript
// src/stores/plugins/persistence.ts
import { createPersistedState } from 'pinia-plugin-persistedstate';

export const piniaPersistedState = createPersistedState({
  storage: localStorage,
  key: (id) => `vaxav_${id}`,
});

// Configuración específica para cada store
export const authPersistOptions = {
  persist: {
    paths: ['token', 'user.id', 'user.email', 'isAuthenticated', 'emailVerified'],
  },
};
```

Para más detalles sobre los stores, consulte la [documentación de stores](../stores/README.md).

## Servicios

Los servicios encapsulan la lógica para interactuar con APIs externas:

- `api.js`: Configuración base de Axios y manejo de errores
- Servicios específicos para diferentes recursos (usuarios, pilotos, etc.)

### Ejemplo de Servicio

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptores para manejar tokens y errores
// ...

export default api;
```

## Estilos

Los estilos se gestionan principalmente con Tailwind CSS:

- Clases utilitarias para la mayoría de los estilos
- Componentes personalizados para patrones repetitivos
- Variables CSS para temas y personalización

### Temas

La aplicación soporta temas claro y oscuro mediante las clases de Tailwind:

```html
<div class="dark:bg-gray-900 dark:text-white">
  <!-- Contenido -->
</div>
```

## Buenas Prácticas

### Componentes y Estructura

1. **Componentes Pequeños y Enfocados**: Cada componente debe tener una única responsabilidad.
2. **Composición sobre Herencia**: Utilizar la composición de componentes en lugar de herencia.
3. **Props Validadas**: Todas las props deben tener validación de tipo y valores por defecto cuando sea apropiado.
4. **Eventos Nombrados Consistentemente**: Usar convenciones de nombres para eventos (ej. `update:modelValue`).

### Gestión de Estado

5. **Usar el Store Unificado**: Para información del usuario y piloto, usar siempre el store unificado (`useUserStore`).
6. **Carga Automática de Datos**: Aprovechar la carga automática de datos del store unificado en lugar de cargar manualmente.
7. **Verificar Estado de Carga**: Siempre verificar `isLoaded` y `isLoading` antes de acceder a los datos.
8. **Persistencia de Estado**: Utilizar el plugin de persistencia para datos que deben mantenerse entre sesiones.

### Código y Calidad

9. **Separación de Preocupaciones**: Mantener la lógica de negocio en stores y servicios, no en componentes.
10. **Código Tipado**: Utilizar TypeScript para mejorar la robustez del código.
11. **Documentación de Código**: Documentar componentes, funciones y tipos con comentarios JSDoc.
12. **Pruebas Unitarias**: Escribir pruebas para componentes y lógica crítica.

## Flujo de Desarrollo

1. **Crear Componentes UI**: Desarrollar componentes básicos y reutilizables.
2. **Crear Stores y Servicios**: Implementar la lógica de negocio y comunicación con la API.
3. **Crear Vistas**: Componer vistas utilizando componentes UI y conectándolos a stores.
4. **Implementar Rutas**: Configurar el enrutamiento para las vistas.
5. **Pruebas y Refinamiento**: Probar la funcionalidad y refinar la experiencia de usuario.

## Recursos Adicionales

- [Documentación de Vue.js](https://vuejs.org/)
- [Documentación de Pinia](https://pinia.vuejs.org/)
- [Documentación de Vue Router](https://router.vuejs.org/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
