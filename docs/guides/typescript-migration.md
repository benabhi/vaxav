# Guía de Migración a TypeScript

Esta guía proporciona instrucciones para migrar progresivamente el código JavaScript de Vaxav a TypeScript, mejorando la seguridad de tipos y la consistencia del código.

## Beneficios de TypeScript

1. **Detección temprana de errores**: Identificar errores durante el desarrollo en lugar de en tiempo de ejecución.
2. **Mejor documentación**: Los tipos sirven como documentación integrada.
3. **Mejor experiencia de desarrollo**: Autocompletado y sugerencias más precisas.
4. **Refactorización más segura**: Cambios en la base de código con mayor confianza.
5. **Mejor mantenibilidad**: Código más fácil de entender y mantener.

## Estado Actual de la Migración

Hasta ahora, hemos migrado los siguientes archivos a TypeScript:

1. **Stores**:
   - `auth.ts`: Store de autenticación
   - `pilot.ts`: Store de piloto
   - `user.ts`: Store unificado
   - `notification.ts`: Store de notificaciones

2. **Composables**:
   - `usePermissions.ts`: Composable para gestionar permisos
   - `useRoles.ts`: Composable para gestionar roles
   - `usePilotSkills.ts`: Composable para gestionar habilidades del piloto

3. **Configuración**:
   - `skillLevels.ts`: Configuración de niveles de habilidades

4. **Vistas**:
   - Vistas de autenticación actualizadas para usar el store unificado:
     - `LoginView.vue`
     - `RegisterView.vue`
     - `VerifyEmailView.vue`
     - `ForgotPasswordView.vue`
     - `ResetPasswordView.vue`
   - Vistas de administración actualizadas para usar el store unificado:
     - `RolesView.vue`

## Plan de Migración

La migración a TypeScript se realizará de forma progresiva, siguiendo este orden de prioridad:

1. **Modelos y tipos**: Definir interfaces para todas las estructuras de datos.
2. **Servicios**: Migrar los servicios que interactúan con la API.
3. **Stores**: Migrar los stores de Pinia.
4. **Composables**: Migrar los composables.
5. **Componentes críticos**: Migrar componentes con lógica compleja.
6. **Componentes UI**: Migrar componentes de interfaz de usuario.

## Paso 1: Definir Interfaces para Modelos

Crear un archivo `types/models.ts` con interfaces para todas las estructuras de datos:

```typescript
// frontend/src/types/models.ts
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
}

export interface Pilot {
  id: number;
  name: string;
  race: string;
  credits: number;
  user_id: number;
  corporation_id: number | null;
  location_id: number | null;
  created_at: string;
  updated_at: string;
}

// ... otras interfaces ...
```

## Paso 2: Migrar Servicios

Migrar los servicios a TypeScript, utilizando las interfaces definidas:

```typescript
// frontend/src/services/authService.ts
import api from './api';
import type { User, LoginCredentials, RegisterData } from '@/types/models';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface EmailVerificationStatus {
  verified: boolean;
  message: string;
}

export interface PasswordResetData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

const authService = {
  /**
   * Iniciar sesión de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registrar un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // ... otros métodos ...
};

export default authService;
```

## Paso 3: Migrar Stores

Migrar los stores de Pinia a TypeScript:

```typescript
// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import authService from '@/services/authService';
import type { User, LoginCredentials, RegisterData, PasswordResetData } from '@/types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailVerified: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    emailVerified: false,
  }),

  getters: {
    currentUser: (state): User | null => state.user,
    isLoggedIn: (state): boolean => state.isAuthenticated,
    isEmailVerified: (state): boolean => state.emailVerified,
    // ... otros getters ...
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(credentials);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;

        // ... resto de la implementación ...
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // ... otras acciones ...
  },
});
```

## Paso 4: Migrar Composables

Migrar los composables a TypeScript:

```typescript
// frontend/src/composables/usePilotSkills.ts
import { ref, Ref } from 'vue';
import api from '@/services/api';
import type { Skill, SkillCategory } from '@/types/models';

/**
 * Composable para gestionar las habilidades del piloto
 */
export function usePilotSkills() {
  const pilotSkills: Ref<Skill[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  /**
   * Obtiene las habilidades del piloto actual
   */
  const fetchCurrentPilotSkills = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/pilots/current/skills');
      pilotSkills.value = response.data;
    } catch (err: any) {
      console.error('Error fetching pilot skills:', err);
      error.value = 'Error al cargar las habilidades del piloto';
      pilotSkills.value = [];
    } finally {
      loading.value = false;
    }
  };

  // ... otros métodos ...

  return {
    pilotSkills,
    loading,
    error,
    fetchCurrentPilotSkills,
    // ... otros métodos ...
  };
}
```

## Paso 5: Migrar Componentes

Migrar los componentes Vue a TypeScript:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Skill } from '@/types/models';
import { usePilotSkills } from '@/composables/usePilotSkills';

interface Props {
  skillId: number;
  showDetails?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'activate', skillId: number): void;
  (e: 'deactivate', skillId: number): void;
}>();

const { pilotSkills, loading, error, fetchCurrentPilotSkills } = usePilotSkills();

const skill = computed((): Skill | undefined => {
  return pilotSkills.value.find(s => s.id === props.skillId);
});

const isActive = computed((): boolean => {
  return skill.value?.pivot?.active || false;
});

const toggleSkill = async (): Promise<void> => {
  if (isActive.value) {
    emit('deactivate', props.skillId);
  } else {
    emit('activate', props.skillId);
  }
};

onMounted(async () => {
  if (pilotSkills.value.length === 0) {
    await fetchCurrentPilotSkills();
  }
});
</script>

<template>
  <div class="skill-component">
    <!-- Contenido del componente -->
  </div>
</template>
```

## Consejos para la Migración

1. **Migración gradual**: No intentes migrar todo a la vez. Comienza con archivos pequeños y aislados.
2. **Usa `any` temporalmente**: Si no estás seguro del tipo correcto, usa `any` temporalmente y refina más tarde.
3. **Habilita `allowJs: true`**: Permite que TypeScript y JavaScript coexistan durante la migración.
4. **Usa archivos de declaración**: Crea archivos `.d.ts` para bibliotecas sin tipos.
5. **Prueba después de cada cambio**: Asegúrate de que todo sigue funcionando después de cada migración.

## Configuración de TypeScript

Asegúrate de que el archivo `tsconfig.json` esté correctamente configurado:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

## Recursos Adicionales

- [Documentación oficial de TypeScript](https://www.typescriptlang.org/docs/)
- [Vue.js + TypeScript](https://vuejs.org/guide/typescript/overview.html)
- [Pinia + TypeScript](https://pinia.vuejs.org/core-concepts/typescript.html)
- [Migración de JavaScript a TypeScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
