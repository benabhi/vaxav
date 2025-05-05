# Estructuras de Datos de la API

Este documento describe las estructuras de datos utilizadas en la API de Vaxav, proporcionando una referencia clara para el desarrollo del frontend.

## Modelos Principales

### Usuario (User)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: Role[];
  created_at: string;
  updated_at: string;
}
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "email_verified_at": "2023-01-01T00:00:00.000Z",
  "roles": [
    {
      "id": 1,
      "name": "Usuario",
      "slug": "user"
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### Rol (Role)

```typescript
interface Role {
  id: number;
  name: string;
  slug: string;
  permissions: Permission[];
}
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Administrador",
  "slug": "admin",
  "permissions": [
    {
      "id": 1,
      "name": "Gestionar Usuarios",
      "slug": "manage-users"
    },
    {
      "id": 2,
      "name": "Gestionar Roles",
      "slug": "manage-roles"
    }
  ]
}
```

### Permiso (Permission)

```typescript
interface Permission {
  id: number;
  name: string;
  slug: string;
}
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Gestionar Usuarios",
  "slug": "manage-users"
}
```

### Piloto (Pilot)

```typescript
interface Pilot {
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
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Piloto Ejemplo",
  "race": "Humano",
  "credits": 1000,
  "user_id": 1,
  "corporation_id": null,
  "location_id": 1,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### Habilidad (Skill)

```typescript
interface Skill {
  id: number;
  name: string;
  skill_category_id: number;
  multiplier: number;
  description?: string;
  prerequisites?: SkillPrerequisite[];
  pivot?: {
    pilot_id: number;
    skill_id: number;
    current_level: number;
    xp: number;
    active: boolean;
  };
}
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Armas Láser Básicas",
  "skill_category_id": 1,
  "multiplier": 1,
  "description": "Dominio fundamental de armas láser estándar",
  "prerequisites": [
    {
      "skill_id": 1,
      "prerequisite_id": 2,
      "prerequisite_level": 3
    }
  ],
  "pivot": {
    "pilot_id": 1,
    "skill_id": 1,
    "current_level": 3,
    "xp": 250,
    "active": true
  }
}
```

### Categoría de Habilidad (SkillCategory)

```typescript
interface SkillCategory {
  id: number;
  name: string;
  description?: string;
}
```

#### Ejemplo de Respuesta

```json
{
  "id": 1,
  "name": "Combate",
  "description": "Habilidades relacionadas con el combate"
}
```

### Prerrequisito de Habilidad (SkillPrerequisite)

```typescript
interface SkillPrerequisite {
  skill_id: number;
  prerequisite_id: number;
  prerequisite_level: number;
}
```

#### Ejemplo de Respuesta

```json
{
  "skill_id": 3,
  "prerequisite_id": 1,
  "prerequisite_level": 2
}
```

## Estructuras de Solicitud

### Credenciales de Inicio de Sesión (LoginCredentials)

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}
```

#### Ejemplo de Solicitud

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña",
  "remember": true
}
```

### Datos de Registro (RegisterData)

```typescript
interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
```

#### Ejemplo de Solicitud

```json
{
  "name": "Nuevo Usuario",
  "email": "nuevo@ejemplo.com",
  "password": "contraseña",
  "password_confirmation": "contraseña"
}
```

### Datos de Creación de Piloto (CreatePilotData)

```typescript
interface CreatePilotData {
  name: string;
  race: string;
}
```

#### Ejemplo de Solicitud

```json
{
  "name": "Nuevo Piloto",
  "race": "Humano"
}
```

### Datos de Restablecimiento de Contraseña (PasswordResetData)

```typescript
interface PasswordResetData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}
```

#### Ejemplo de Solicitud

```json
{
  "email": "usuario@ejemplo.com",
  "password": "nueva_contraseña",
  "password_confirmation": "nueva_contraseña",
  "token": "token_de_restablecimiento"
}
```

## Estructuras de Respuesta Especiales

### Respuesta de Autenticación (AuthResponse)

```typescript
interface AuthResponse {
  token: string;
  user: User;
}
```

#### Ejemplo de Respuesta

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "email_verified_at": "2023-01-01T00:00:00.000Z",
    "roles": [
      {
        "id": 1,
        "name": "Usuario",
        "slug": "user"
      }
    ],
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Estado de Verificación de Email (EmailVerificationStatus)

```typescript
interface EmailVerificationStatus {
  verified: boolean;
  message: string;
}
```

#### Ejemplo de Respuesta

```json
{
  "verified": true,
  "message": "Email verificado correctamente"
}
```

## Uso en el Frontend

Estas estructuras de datos deben utilizarse en el frontend para garantizar la consistencia y la seguridad de tipos. Se recomienda crear interfaces TypeScript que coincidan con estas estructuras.

### Ejemplo de Implementación en TypeScript

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

// ... otras interfaces ...
```

### Uso en Servicios

```typescript
// frontend/src/services/authService.ts
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/models';
import api from './api';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  // ... otros métodos ...
};

export default authService;
```

### Uso en Stores

```typescript
// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import type { User, LoginCredentials, RegisterData } from '@/types/models';
import authService from '@/services/authService';

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
  
  // ... getters y actions ...
});
```
