# Estrategia de Testing en Vaxav

Esta sección documenta la estrategia de testing implementada en Vaxav, incluyendo las herramientas, enfoques y mejores prácticas.

## Índice

- [Enfoque General](#enfoque-general)
- [Testing de Backend](#testing-de-backend)
- [Testing de Frontend](#testing-de-frontend)
- [Testing End-to-End con Cypress](#testing-end-to-end-con-cypress)
- [Herramientas Utilizadas](#herramientas-utilizadas)
- [Ejecución de Tests](#ejecución-de-tests)
- [Mejores Prácticas](./best-practices.md)
- [Solución de Problemas](./troubleshooting.md)

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

El frontend de Vaxav utiliza Vitest y Vue Test Utils para el testing unitario y de integración. Los tests están organizados en:

- **Tests Unitarios**: Prueban componentes, composables y utilidades de forma aislada.
- **Tests de Integración**: Prueban la interacción entre componentes.
- **Tests de Vistas**: Prueban las vistas completas con sus dependencias.

## Testing End-to-End con Cypress

Para el testing end-to-end (E2E), utilizamos Cypress. Estos tests verifican el funcionamiento de la aplicación desde la perspectiva del usuario final, probando flujos completos como registro, login y otras funcionalidades clave.

- **Tests de Autenticación**: Prueban los flujos de registro, login y verificación de email.
- **Tests de Navegación**: Verifican que la navegación entre páginas funcione correctamente.
- **Tests de Funcionalidades**: Prueban las funcionalidades principales de la aplicación.

Para más detalles, consulta la documentación de Cypress:
- [Guía de Testing con Cypress](./cypress/README.md)
- [Testing de Autenticación](./cypress/auth-testing.md)
- [Ejecución en Modo Headless](./cypress/headless-testing.md)

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
- **Cypress**: Framework de testing end-to-end

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

#### Tests Unitarios y de Integración

```bash
# Navegar al directorio del frontend
cd frontend

# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar tests específicos
npm run test:unit src/views/admin/__tests__/RoleCreateView.spec.ts

# Ejecutar tests con cobertura
npm run test:unit -- --coverage
```

#### Tests End-to-End con Cypress

```bash
# Navegar al directorio del frontend
cd frontend

# Abrir Cypress en modo interactivo
npm run test:e2e

# Ejecutar tests en modo headless (sin interfaz gráfica)
npm run test:e2e:headless

# Ejecutar tests específicos
npm run test:e2e:headless -- --spec "tests/e2e/specs/auth/login.cy.js"

# Ejecutar tests en entornos sin interfaz gráfica (como Ubuntu Server)
npm run test:e2e:ci
```

También puedes usar el script personalizado `run-cypress.sh`:

```bash
cd frontend
./run-cypress.sh
```

Este script:
- Configura Xvfb para ejecutar Cypress en entornos sin interfaz gráfica
- Ejecuta los tests en modo headless
- Proporciona feedback visual sobre el resultado

## Estructura Recomendada para Tests

### Tests Unitarios y de Integración

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

### Tests End-to-End con Cypress

```
tests/
└── e2e/
    ├── fixtures/       # Datos de prueba
    │   └── users.json
    ├── specs/          # Tests E2E
    │   ├── auth/
    │   │   ├── login.cy.js
    │   │   ├── register.cy.js
    │   │   └── email-verification.cy.js
    │   └── ...
    └── support/        # Comandos personalizados y configuración
        ├── commands.js
        └── e2e.js
```

## Contribución a la Documentación de Testing

Si encuentras áreas que podrían mejorarse en esta documentación o tienes sugerencias adicionales, por favor:

1. Crea una nueva rama
2. Realiza tus cambios
3. Envía un pull request con una descripción clara de las mejoras

## Recursos Adicionales

### Vitest y Vue Test Utils
- [Documentación oficial de Vitest](https://vitest.dev/)
- [Documentación de Vue Test Utils](https://test-utils.vuejs.org/)
- [Guía de testing de Vue.js](https://vuejs.org/guide/scaling-up/testing.html)

### Cypress
- [Documentación oficial de Cypress](https://docs.cypress.io/)
- [Buenas prácticas de Cypress](https://docs.cypress.io/guides/references/best-practices)
- [API de Cypress](https://docs.cypress.io/api/table-of-contents)
- [Ejemplos de Cypress](https://github.com/cypress-io/cypress-example-recipes)

### Laravel Testing
- [Documentación de testing de Laravel](https://laravel.com/docs/10.x/testing)
- [Documentación de PHPUnit](https://phpunit.de/documentation.html)
