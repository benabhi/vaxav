# Testing End-to-End con Cypress

Este documento proporciona una guía completa para realizar pruebas end-to-end (E2E) en VAXAV utilizando Cypress.

## Índice

1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Escribiendo Tests](#escribiendo-tests)
5. [Ejecutando Tests](#ejecutando-tests)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Solución de Problemas](#solución-de-problemas)
8. [Recursos Adicionales](#recursos-adicionales)

## Introducción

Las pruebas end-to-end (E2E) verifican que la aplicación funciona correctamente desde la perspectiva del usuario, probando flujos completos como registro, login, y otras funcionalidades clave. Cypress es una herramienta moderna para pruebas E2E que ofrece:

- Ejecución rápida y confiable
- Depuración visual
- Esperas automáticas
- Capturas de pantalla y videos
- Soporte para pruebas en modo headless (sin interfaz gráfica)

## Instalación y Configuración

### Requisitos Previos

Para ejecutar Cypress en un entorno sin interfaz gráfica (como Ubuntu Server), necesitas instalar las siguientes dependencias:

```bash
sudo apt-get update
sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

### Instalación

Cypress ya está instalado como dependencia de desarrollo en el proyecto. Si necesitas reinstalarlo:

```bash
cd frontend
npm install cypress --save-dev
```

### Configuración

La configuración de Cypress se encuentra en `frontend/cypress.config.js`:

```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.js',
    fixturesFolder: 'tests/e2e/fixtures',
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

## Estructura de Carpetas

Los tests E2E se organizan en la siguiente estructura:

```
frontend/
├── tests/
│   ├── e2e/
│   │   ├── fixtures/       # Datos de prueba
│   │   │   └── users.json  # Datos de usuarios para tests
│   │   ├── specs/          # Tests E2E
│   │   │   ├── auth/       # Tests de autenticación
│   │   │   │   ├── login.cy.js
│   │   │   │   ├── register.cy.js
│   │   │   │   └── email-verification.cy.js
│   │   │   └── ...
│   │   └── support/        # Comandos personalizados y configuración
│   │       ├── commands.js
│   │       └── e2e.js
└── cypress.config.js       # Configuración de Cypress
```

## Escribiendo Tests

### Estructura Básica de un Test

```javascript
// Test para el flujo de login
describe('Login', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');
    
    // Limpiar el estado de autenticación antes de cada test
    cy.clearAuth();
    
    // Visitar la página de login
    cy.visit('/login');
  });

  it('debería mostrar el formulario de login correctamente', () => {
    // Verificar que el título del formulario sea correcto
    cy.contains('h2', 'Iniciar Sesión').should('be.visible');
    
    // Verificar que los campos del formulario estén presentes
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    
    // Verificar que el botón de submit esté presente
    cy.get('button[type="submit"]').contains('Iniciar Sesión').should('be.visible');
  });

  it('debería mostrar error con credenciales incorrectas', function() {
    // Ingresar credenciales incorrectas
    cy.get('input#email').type(this.users.invalidUser.email);
    cy.get('input#password').type(this.users.invalidUser.password);
    
    // Enviar el formulario
    cy.get('button[type="submit"]').click();
    
    // Verificar que se muestre algún tipo de mensaje de error
    cy.get('body').should('contain.text', 'Error');
  });
});
```

### Uso de Fixtures

Los fixtures permiten definir datos de prueba reutilizables:

```javascript
// frontend/tests/e2e/fixtures/users.json
{
  "validUser": {
    "email": "usuario@example.com",
    "password": "password123",
    "name": "Usuario de Prueba"
  },
  "invalidUser": {
    "email": "usuario_inexistente@example.com",
    "password": "contraseña_incorrecta"
  },
  "newUser": {
    "name": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "password": "password123"
  }
}
```

Para usar estos datos en los tests:

```javascript
beforeEach(() => {
  cy.fixture('users.json').as('users');
});

it('debería iniciar sesión correctamente', function() {
  cy.get('input#email').type(this.users.validUser.email);
  cy.get('input#password').type(this.users.validUser.password);
});
```

### Comandos Personalizados

Los comandos personalizados permiten reutilizar código en múltiples tests:

```javascript
// frontend/tests/e2e/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('clearAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('user');
  });
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

Para usar estos comandos:

```javascript
it('debería acceder al dashboard después de iniciar sesión', function() {
  cy.login(this.users.validUser.email, this.users.validUser.password);
  cy.url().should('include', '/dashboard');
});
```

## Ejecutando Tests

### Comandos Básicos

```bash
# Abrir Cypress en modo interactivo
cd frontend
npm run test:e2e

# Ejecutar tests en modo headless (sin interfaz gráfica)
cd frontend
npm run test:e2e:headless

# Ejecutar tests específicos
cd frontend
npm run test:e2e:headless -- --spec "tests/e2e/specs/auth/login.cy.js"
```

### Ejecución en Entornos sin Interfaz Gráfica

Para ejecutar tests en un servidor sin interfaz gráfica (como Ubuntu Server), se utiliza Xvfb:

```bash
# Usando el script npm configurado
cd frontend
npm run test:e2e:ci

# O manualmente
cd frontend
xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' cypress run
```

También puedes usar el script personalizado `run-cypress.sh`:

```bash
cd frontend
./run-cypress.sh
```

## Buenas Prácticas

1. **Independencia de tests**: Cada test debe poder ejecutarse de forma aislada.
2. **Limpieza del estado**: Usar `beforeEach` para limpiar el estado antes de cada test.
3. **Selectores robustos**: Usar selectores que sean resistentes a cambios en el diseño.
4. **Esperas explícitas**: Aunque Cypress maneja automáticamente muchas esperas, a veces es necesario esperar explícitamente.
5. **Interceptación de peticiones**: Usar `cy.intercept()` para simular respuestas del servidor.
6. **Verificación de resultados**: Verificar siempre el resultado esperado de cada acción.
7. **Comandos personalizados**: Crear comandos personalizados para acciones comunes.

## Solución de Problemas

### Tests Inestables (Flaky Tests)

Si los tests fallan de forma intermitente:

1. **Aumentar timeouts**: 
   ```javascript
   Cypress.config('defaultCommandTimeout', 10000);
   ```

2. **Esperas explícitas**:
   ```javascript
   cy.wait(1000); // Esperar 1 segundo
   cy.wait('@apiRequest'); // Esperar a que se complete una petición
   ```

3. **Verificar condiciones antes de actuar**:
   ```javascript
   cy.get('button').should('be.enabled').click();
   ```

### Problemas con Peticiones API

1. **Interceptar peticiones**:
   ```javascript
   cy.intercept('POST', '**/login').as('loginRequest');
   cy.get('button[type="submit"]').click();
   cy.wait('@loginRequest');
   ```

2. **Simular respuestas**:
   ```javascript
   cy.intercept('POST', '**/login', {
     statusCode: 200,
     body: { token: 'fake-token', user: { id: 1, name: 'Test User' } }
   }).as('loginRequest');
   ```

### Problemas en Entornos sin Interfaz Gráfica

1. **Verificar dependencias**:
   ```bash
   sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
   ```

2. **Usar Xvfb correctamente**:
   ```bash
   export DISPLAY=:99
   Xvfb :99 -screen 0 1280x720x24 > /dev/null 2>&1 &
   ```

## Recursos Adicionales

- [Documentación oficial de Cypress](https://docs.cypress.io/)
- [Buenas prácticas de Cypress](https://docs.cypress.io/guides/references/best-practices)
- [API de Cypress](https://docs.cypress.io/api/table-of-contents)
- [Ejemplos de Cypress](https://github.com/cypress-io/cypress-example-recipes)
