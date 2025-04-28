# Estrategia de Testing

Este documento describe la estrategia de testing para el proyecto Vaxav, incluyendo los tipos de tests, herramientas utilizadas y mejores prácticas.

## Objetivos

Los objetivos principales de nuestra estrategia de testing son:

1. **Garantizar la calidad del código**: Asegurar que el código funciona como se espera y cumple con los requisitos.
2. **Prevenir regresiones**: Evitar que cambios nuevos rompan funcionalidades existentes.
3. **Facilitar el refactoring**: Permitir mejoras en el código con confianza.
4. **Documentar el comportamiento esperado**: Los tests sirven como documentación viva del comportamiento esperado del sistema.

## Tipos de Tests

### Frontend (Vue.js)

#### Tests Unitarios

Utilizamos **Vitest** para los tests unitarios del frontend. Estos tests se enfocan en componentes individuales, stores y utilidades.

**Ubicación**: `frontend/src/**/__tests__/*.spec.ts`

**Ejemplos de tests unitarios**:
- Tests de componentes Vue
- Tests de stores Pinia
- Tests de utilidades y helpers

#### Tests de Integración

Los tests de integración verifican que múltiples componentes funcionan correctamente juntos.

**Ejemplos de tests de integración**:
- Tests de vistas completas
- Tests de flujos de usuario (como el proceso de login)

### Backend (Laravel)

#### Tests Unitarios

Utilizamos **PHPUnit** para los tests unitarios del backend. Estos tests se enfocan en clases y métodos individuales.

**Ubicación**: `api/tests/Unit/`

**Ejemplos de tests unitarios**:
- Tests de modelos
- Tests de servicios
- Tests de helpers y utilidades

#### Tests de Características (Feature Tests)

Los tests de características prueban endpoints completos de la API y flujos de usuario.

**Ubicación**: `api/tests/Feature/`

**Ejemplos de tests de características**:
- Tests de autenticación
- Tests de CRUD para recursos
- Tests de permisos y autorización

## Funcionalidades Críticas a Testear

Hemos identificado las siguientes funcionalidades críticas que deben tener cobertura de tests:

### Frontend

1. **Autenticación**:
   - Login
   - Registro
   - Logout
   - Recuperación de contraseña

2. **Gestión de Usuarios**:
   - Listado de usuarios
   - Creación de usuarios
   - Edición de usuarios
   - Eliminación de usuarios

3. **Gestión de Roles y Permisos**:
   - Listado de roles
   - Creación de roles
   - Edición de roles
   - Eliminación de roles
   - Asignación de permisos

4. **Gestión de Pilotos**:
   - Creación de pilotos
   - Selección de pilotos
   - Visualización de información de pilotos

### Backend

1. **Autenticación**:
   - Registro de usuarios
   - Login
   - Logout
   - Verificación de tokens

2. **Gestión de Usuarios**:
   - CRUD completo
   - Validación de datos
   - Asignación de roles

3. **Gestión de Roles y Permisos**:
   - CRUD completo
   - Validación de datos
   - Asignación de permisos a roles

4. **Gestión de Pilotos**:
   - CRUD completo
   - Validación de datos
   - Relación con usuarios

5. **Gestión del Universo**:
   - CRUD para sistemas solares, estrellas, planetas, etc.
   - Validación de relaciones entre entidades

## Herramientas de Testing

### Frontend

- **Vitest**: Framework de testing para Vue.js
- **@vue/test-utils**: Utilidades para testear componentes Vue
- **@pinia/testing**: Utilidades para testear stores Pinia
- **jsdom**: Simulación de DOM para tests en Node.js

### Backend

- **PHPUnit**: Framework de testing para PHP
- **Laravel Testing Tools**: Herramientas de testing incluidas en Laravel
- **Database Migrations**: Para preparar la base de datos de testing
- **Factories**: Para generar datos de prueba

## Mejores Prácticas

1. **Escribir tests antes de implementar nuevas funcionalidades** (TDD cuando sea posible)
2. **Mantener los tests independientes entre sí**
3. **Usar datos de prueba generados dinámicamente** (factories, fakers)
4. **Evitar dependencias externas** en los tests unitarios
5. **Mockear servicios externos** cuando sea necesario
6. **Mantener los tests rápidos** para facilitar la ejecución frecuente
7. **Nombrar los tests de forma descriptiva** para entender qué se está probando
8. **Seguir el patrón AAA** (Arrange, Act, Assert) para estructurar los tests

## Ejecución de Tests

### Frontend

```bash
# Ejecutar todos los tests unitarios
cd frontend
npm run test:unit

# Ejecutar tests con watch mode (para desarrollo)
npm run test:unit -- --watch

# Ejecutar un archivo de test específico
npm run test:unit -- src/stores/__tests__/auth.spec.ts
```

### Backend

```bash
# Ejecutar todos los tests
cd api
php artisan test

# Ejecutar tests de una carpeta específica
php artisan test --filter=Feature/Auth

# Ejecutar un test específico
php artisan test --filter=AuthenticationTest::test_users_can_login
```

## Integración Continua

Los tests se ejecutan automáticamente en el pipeline de CI/CD cuando:

1. Se crea un Pull Request
2. Se hace merge a la rama principal

Esto asegura que solo el código que pasa todos los tests llegue a producción.

## Cobertura de Código

Aspiramos a mantener una cobertura de código de al menos:

- 80% para el código crítico del backend
- 70% para el código crítico del frontend

Sin embargo, priorizamos la calidad de los tests sobre la cantidad. Es mejor tener menos tests significativos que muchos tests superficiales.

## Mantenimiento de Tests

Los tests deben mantenerse y actualizarse junto con el código. Cuando se modifica una funcionalidad:

1. Actualizar los tests existentes para reflejar el nuevo comportamiento
2. Añadir nuevos tests para cubrir nuevos casos de uso
3. Eliminar tests obsoletos que ya no son relevantes
