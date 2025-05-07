# Ejecutar Tests de Cypress en Modo Headless

Este documento proporciona una guía detallada para ejecutar tests de Cypress en modo headless (sin interfaz gráfica), especialmente en entornos de servidor como Ubuntu Server.

## Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración](#configuración)
4. [Ejecución de Tests](#ejecución-de-tests)
5. [Integración con CI/CD](#integración-con-cicd)
6. [Solución de Problemas](#solución-de-problemas)

## Introducción

Ejecutar tests de Cypress en modo headless es esencial para:

- Entornos de servidor sin interfaz gráfica
- Integración continua (CI/CD)
- Ejecución automatizada de tests
- Mejora del rendimiento en la ejecución de tests

## Requisitos Previos

### Dependencias del Sistema

En sistemas basados en Ubuntu, necesitas instalar las siguientes dependencias:

```bash
sudo apt-get update
sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

### Xvfb (X Virtual FrameBuffer)

Xvfb es un servidor de visualización virtual que permite ejecutar aplicaciones que requieren una interfaz gráfica sin mostrarla realmente:

```bash
sudo apt-get install -y xvfb
```

## Configuración

### Scripts en package.json

Hemos configurado los siguientes scripts en `package.json`:

```json
{
  "scripts": {
    "test:e2e": "cypress open",
    "test:e2e:headless": "cypress run",
    "test:e2e:ci": "xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' cypress run"
  }
}
```

### Script Personalizado run-cypress.sh

También hemos creado un script personalizado `run-cypress.sh` para facilitar la ejecución de tests con Xvfb:

```bash
#!/bin/bash
# Script para ejecutar Cypress en modo headless con Xvfb

# Configurar resolución de pantalla virtual
export DISPLAY=:99
export CYPRESS_VIEWPORT_WIDTH=1280
export CYPRESS_VIEWPORT_HEIGHT=720

# Iniciar Xvfb
Xvfb :99 -screen 0 1280x720x24 > /dev/null 2>&1 &
XVFB_PID=$!

# Esperar a que Xvfb esté listo
sleep 1

# Ejecutar Cypress
echo "Ejecutando tests de Cypress..."
npx cypress run "$@"
CYPRESS_EXIT_CODE=$?

# Detener Xvfb
kill $XVFB_PID

# Salir con el código de salida de Cypress
exit $CYPRESS_EXIT_CODE
```

Para hacer el script ejecutable:

```bash
chmod +x frontend/run-cypress.sh
```

### Configuración de Cypress

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

## Ejecución de Tests

### Usando npm Scripts

```bash
# Ejecutar todos los tests en modo headless
cd frontend
npm run test:e2e:headless

# Ejecutar tests específicos
cd frontend
npm run test:e2e:headless -- --spec "tests/e2e/specs/auth/login.cy.js"

# Ejecutar tests con Xvfb (para entornos sin interfaz gráfica)
cd frontend
npm run test:e2e:ci
```

### Usando el Script Personalizado

```bash
cd frontend
./run-cypress.sh

# Ejecutar tests específicos
./run-cypress.sh --spec "tests/e2e/specs/auth/login.cy.js"
```

### Usando Xvfb Directamente

```bash
cd frontend
xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' npx cypress run
```

## Integración con CI/CD

### GitHub Actions

Ejemplo de configuración para GitHub Actions:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
      
      - name: Start development server
        run: |
          cd frontend
          npm run dev &
          sleep 10
      
      - name: Run Cypress tests
        run: |
          cd frontend
          npm run test:e2e:ci
```

### GitLab CI

Ejemplo de configuración para GitLab CI:

```yaml
e2e-tests:
  stage: test
  image: node:18
  before_script:
    - apt-get update
    - apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
    - cd frontend
    - npm ci
    - npm run dev &
    - sleep 10
  script:
    - npm run test:e2e:ci
  artifacts:
    paths:
      - frontend/cypress/videos
      - frontend/cypress/screenshots
    when: always
```

## Solución de Problemas

### Error: Xvfb no está instalado

```
Error: Xvfb is not installed or cannot be found
```

Solución:
```bash
sudo apt-get install -y xvfb
```

### Error: No se puede abrir la pantalla

```
Error: DISPLAY environment variable not set
```

Solución:
```bash
export DISPLAY=:99
Xvfb :99 -screen 0 1280x720x24 > /dev/null 2>&1 &
```

### Error: Dependencias faltantes

```
Error: ... dependency not found
```

Solución:
```bash
sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

### Tests inestables (flaky)

Si los tests fallan de forma intermitente:

1. Aumentar los timeouts:
   ```javascript
   Cypress.config('defaultCommandTimeout', 10000);
   ```

2. Usar esperas explícitas:
   ```javascript
   cy.wait(1000); // Esperar 1 segundo
   cy.wait('@apiRequest'); // Esperar a que se complete una petición
   ```

3. Verificar condiciones antes de actuar:
   ```javascript
   cy.get('button').should('be.enabled').click();
   ```

### Problemas de memoria

Si Cypress se cierra inesperadamente por problemas de memoria:

```bash
# Aumentar la memoria disponible para Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Visualización de resultados

Aunque estés ejecutando los tests en modo headless, Cypress genera varios tipos de resultados que puedes revisar:

1. **Resultados en la consola**: Cypress muestra los resultados de los tests en la consola.
2. **Capturas de pantalla**: Se guardan en `frontend/cypress/screenshots/`.
3. **Videos**: Se guardan en `frontend/cypress/videos/`.

Para habilitar o deshabilitar la grabación de videos, puedes modificar `cypress.config.js`:

```javascript
video: true, // o false para desactivar
```
