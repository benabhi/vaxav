# Estrategia de Testing en Vaxav

Esta sección documenta la estrategia de testing implementada en Vaxav, incluyendo las herramientas, enfoques y mejores prácticas.

## Índice

- [Enfoque General](#enfoque-general)
- [Testing de Backend](#testing-de-backend)
- [Testing de Frontend](#testing-de-frontend)
- [Herramientas Utilizadas](#herramientas-utilizadas)
- [Ejecución de Tests](#ejecución-de-tests)
- [Mejores Prácticas](./best-practices.md)
- [Testing de Componentes Vue](./vue-component-testing.md)
- [Solución de Problemas](./troubleshooting.md)
- [Solución de Problemas con Vitest](./testing-vitest.md)

## Enfoque General

La estrategia de testing de Vaxav se basa en los siguientes principios:

1. **Enfocarse en la funcionalidad básica e importante**: Priorizamos el testing de la lógica de negocio crítica.
2. **Evitar dependencias del DOM**: Minimizamos las dependencias del DOM en los tests de frontend.
3. **Mantener los tests simples y robustos**: Preferimos tests simples que sean fáciles de mantener.
4. **Probar la lógica de negocio, no la implementación**: Nos centramos en el comportamiento, no en los detalles de implementación.
5. **Ejecutar siempre los tests con `--no-cache` o usar el script `test-clean.sh`**: Evitamos problemas con la caché de Vitest.

## Testing de Backend

El backend de Vaxav utiliza el framework de testing integrado en Laravel. Los tests están organizados en:

- **Tests Unitarios**: Prueban componentes individuales aislados.
- **Tests de Características**: Prueban funcionalidades completas, incluyendo controladores y modelos.
- **Tests de API**: Prueban los endpoints de la API.

Para más detalles, consulta la [documentación de testing de backend](./backend-testing.md).

## Testing de Frontend

El frontend de Vaxav utiliza Vitest y Vue Test Utils para el testing. Los tests están organizados en:

- **Tests Unitarios**: Prueban componentes, composables y utilidades de forma aislada.
- **Tests de Integración**: Prueban la interacción entre componentes.
- **Tests de Vistas**: Prueban las vistas completas con sus dependencias.

Para más detalles, consulta la [documentación de testing de frontend](./frontend-testing.md).

## Herramientas Utilizadas

### Backend
- **PHPUnit**: Framework de testing para PHP
- **Laravel Testing**: Herramientas de testing específicas de Laravel
- **Mockery**: Biblioteca para crear mocks en PHP

### Frontend
- **Vitest**: Framework de testing para JavaScript/TypeScript
- **Vue Test Utils**: Utilidades de testing para Vue.js
- **Testing Library**: Utilidades para testing centrado en el usuario
- **Jest DOM**: Extensiones de Jest para el DOM

## Ejecución de Tests

### Backend (Laravel)

Para ejecutar los tests del backend:

```bash
# Navegar al directorio del backend
cd backend

# Ejecutar todos los tests
php artisan test

# Ejecutar un test específico
php artisan test --filter=UserTest

# Ejecutar tests con cobertura (requiere Xdebug)
php artisan test --coverage
```

### Frontend (Vue.js)

#### Script de Limpieza de Caché (Recomendado)

Hemos creado un script `test-clean.sh` que automatiza la limpieza de caché y la ejecución de tests:

```bash
# Navegar al directorio del frontend
cd frontend

# Ejecutar todos los tests con limpieza de caché
./test-clean.sh

# Ejecutar tests específicos con limpieza de caché
./test-clean.sh src/views/admin/__tests__/RoleCreateView.spec.ts

# Ejecutar múltiples tests específicos
./test-clean.sh "src/views/admin/__tests__/RoleCreateView.spec.ts src/views/admin/__tests__/RoleEditView.spec.ts"
```

Este script:
- Elimina la caché de Vitest antes de ejecutar los tests
- Ejecuta los tests con la configuración optimizada
- Proporciona feedback visual sobre el resultado

#### Comandos Manuales

También puedes ejecutar los tests manualmente:

```bash
# Navegar al directorio del frontend
cd frontend

# Ejecutar todos los tests
npm run test:unit -- --no-cache

# Ejecutar tests específicos
npm run test:unit -- --no-cache src/views/admin/__tests__/RoleCreateView.spec.ts

# Ejecutar tests que coincidan con un patrón
npm run test:unit -- --no-cache "src/**/*.spec.ts"

# Ejecutar tests con cobertura
npm run test:unit -- --no-cache --coverage
```

## Estructura Recomendada para Tests

```
src/
├── components/
│   ├── MyComponent.vue
│   └── __tests__/
│       └── MyComponent.spec.ts
├── composables/
│   ├── useMyComposable.js
│   └── __tests__/
│       └── useMyComposable.spec.ts
└── views/
    ├── MyView.vue
    └── __tests__/
        └── MyView.spec.ts
```

## Contribución a la Documentación de Testing

Si encuentras áreas que podrían mejorarse en esta documentación o tienes sugerencias adicionales, por favor:

1. Crea una nueva rama
2. Realiza tus cambios
3. Envía un pull request con una descripción clara de las mejoras

## Configuración Personalizada de Vitest

Hemos implementado archivos de configuración que ayudan a resolver los problemas de caché:

- `vitest.config.ts`: Configuración principal con opciones optimizadas:
  ```javascript
  export default defineConfig({
    test: {
      cache: false,
      clearMocks: true,
      restoreMocks: true,
      mockReset: true,
      setupFiles: ['./vitest.setup.ts'],
    }
  });
  ```

- `vitest.setup.ts`: Reseteo de módulos y limpieza de mocks:
  ```javascript
  import { vi } from 'vitest';

  // Resetear los módulos antes de cada test
  beforeEach(() => {
    vi.resetModules();
  });

  // Limpiar todos los mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks();
  });
  ```

## Recursos Adicionales

- [Documentación oficial de Vitest](https://vitest.dev/)
- [Documentación de Vue Test Utils](https://test-utils.vuejs.org/)
- [Guía de testing de Vue.js](https://vuejs.org/guide/scaling-up/testing.html)
