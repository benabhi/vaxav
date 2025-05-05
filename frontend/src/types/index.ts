/**
 * @file Definiciones de tipos compartidos
 * @description Tipos e interfaces comunes utilizados en toda la aplicación
 * @module types
 */

/**
 * Interfaz para un usuario
 */
export interface User {
  /** ID único del usuario */
  id: number;
  /** Nombre del usuario */
  name: string;
  /** Correo electrónico del usuario */
  email: string;
  /** Fecha de verificación del correo electrónico */
  email_verified_at?: string | null;
  /** Roles asignados al usuario */
  roles?: Role[];
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para un rol
 */
export interface Role {
  /** ID único del rol */
  id: number;
  /** Nombre del rol */
  name: string;
  /** Slug del rol (identificador único) */
  slug: string;
  /** Descripción del rol */
  description?: string;
  /** Permisos asignados al rol */
  permissions?: Permission[];
}

/**
 * Interfaz para un permiso
 */
export interface Permission {
  /** ID único del permiso */
  id: number;
  /** Nombre del permiso */
  name: string;
  /** Slug del permiso (identificador único) */
  slug: string;
  /** Descripción del permiso */
  description?: string;
}

/**
 * Interfaz para un piloto
 */
export interface Pilot {
  /** ID único del piloto */
  id: number;
  /** ID del usuario al que pertenece el piloto */
  user_id: number;
  /** Nombre del piloto */
  name: string;
  /** Raza del piloto */
  race: string;
  /** Créditos disponibles */
  credits: number;
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para una habilidad
 */
export interface Skill {
  /** ID único de la habilidad */
  id: number;
  /** Nombre de la habilidad */
  name: string;
  /** Descripción de la habilidad */
  description?: string;
  /** ID de la categoría a la que pertenece la habilidad */
  category_id: number;
  /** Categoría a la que pertenece la habilidad */
  category?: SkillCategory;
  /** Multiplicador de la habilidad (1-5) */
  multiplier: number;
  /** Icono de la habilidad */
  icon?: string;
  /** Prerrequisitos de la habilidad */
  prerequisites?: Prerequisite[];
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para un prerrequisito de habilidad
 */
export interface Prerequisite {
  /** ID único del prerrequisito */
  id?: number;
  /** ID de la habilidad que tiene el prerrequisito */
  skill_id: number;
  /** ID de la habilidad prerrequisito */
  prerequisite_id: number;
  /** Nivel requerido de la habilidad prerrequisito */
  prerequisite_level: number;
  /** Habilidad prerrequisito */
  prerequisite?: Skill;
}

/**
 * Interfaz para una categoría de habilidad
 */
export interface SkillCategory {
  /** ID único de la categoría */
  id: number;
  /** Nombre de la categoría */
  name: string;
  /** Descripción de la categoría */
  description?: string;
  /** Icono de la categoría */
  icon?: string;
  /** Orden de la categoría */
  order?: number;
  /** Fecha de creación */
  created_at?: string;
  /** Fecha de última actualización */
  updated_at?: string;
}

/**
 * Interfaz para la paginación
 */
export interface Pagination {
  /** Página actual */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Elementos por página */
  perPage: number;
  /** Total de elementos */
  total?: number;
}

/**
 * Interfaz para los filtros
 */
export interface Filters {
  /** Término de búsqueda */
  search?: string;
  /** Campo de ordenación */
  sort_field?: string;
  /** Dirección de ordenación */
  sort_direction?: 'asc' | 'desc';
  /** Filtros adicionales */
  [key: string]: any;
}

/**
 * Interfaz para los datos de ordenación
 */
export interface SortData {
  /** Campo de ordenación */
  key: string | null;
  /** Dirección de ordenación */
  order: 'asc' | 'desc';
}

/**
 * Interfaz para las credenciales de inicio de sesión
 */
export interface LoginCredentials {
  /** Correo electrónico */
  email: string;
  /** Contraseña */
  password: string;
}

/**
 * Interfaz para los datos de registro
 */
export interface RegisterData {
  /** Nombre del usuario */
  name: string;
  /** Correo electrónico */
  email: string;
  /** Confirmación del correo electrónico */
  email_confirmation: string;
  /** Contraseña */
  password: string;
  /** Confirmación de la contraseña */
  password_confirmation: string;
}

/**
 * Interfaz para los datos de creación de piloto
 */
export interface PilotData {
  /** Nombre del piloto */
  name: string;
  /** Raza del piloto */
  race: string;
}
