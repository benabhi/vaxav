# Solución de Problemas con Vitest

## Problemas con la Caché de Vitest

### Problema

Los tests siguen ejecutando versiones antiguas del código o de los tests, incluso después de modificarlos.

### Soluciones

#### Método 1: Usar el script de limpieza de caché

Hemos creado un script `test-clean.sh` que automatiza la limpieza de caché y la ejecución de tests:

```bash
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

#### Método 2: Comandos manuales

- Siempre ejecutar los tests con la opción `--no-cache`:
  ```bash
  npm run test:unit -- --no-cache src/path/to/test.spec.ts
  ```
- Si el problema persiste, eliminar manualmente la caché de Vitest:
  ```bash
  rm -rf node_modules/.vitest
  ```

#### Método 3: Usar resetModules en los tests

Añadir `vi.resetModules()` antes de los tests problemáticos:

```javascript
beforeEach(() => {
  vi.resetModules();
});
```

#### Método 4: Configuración global

Hemos añadido un archivo `vitest.config.ts` con configuraciones que ayudan a prevenir problemas de caché:

```javascript
// vitest.config.ts
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

## Archivo de Configuración de Vitest

Hemos creado un archivo `vitest.config.ts` en la raíz del proyecto con la siguiente configuración:

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    cache: false, // Desactivar la caché por defecto
    clearMocks: true, // Limpiar mocks automáticamente
    restoreMocks: true, // Restaurar mocks automáticamente
    mockReset: true, // Resetear mocks automáticamente
    deps: {
      inline: ['vue', '@vue', '@vueuse'], // Incluir dependencias importantes
    },
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

## Archivo de Configuración de Setup

También hemos creado un archivo `vitest.setup.ts` en la raíz del proyecto:

```javascript
import { vi } from 'vitest';

// Resetear los módulos antes de cada test para evitar problemas con la caché
beforeEach(() => {
  vi.resetModules();
});

// Limpiar todos los mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
});
```

## Script de Limpieza de Caché

El script `test-clean.sh` contiene el siguiente código:

```bash
#!/bin/bash

# Script para ejecutar tests de Vitest con limpieza de caché
# Uso: ./test-clean.sh [ruta-a-los-tests]

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Limpiando caché de Vitest...${NC}"
rm -rf node_modules/.vitest

# Si se proporciona una ruta específica, ejecutar solo esos tests
if [ $# -eq 0 ]; then
  echo -e "${YELLOW}Ejecutando todos los tests con la nueva configuración...${NC}"
  npx vitest run --config vitest.config.ts
else
  echo -e "${YELLOW}Ejecutando tests en: $1 con la nueva configuración...${NC}"
  npx vitest run --config vitest.config.ts "$1"
fi

# Verificar el resultado
if [ $? -eq 0 ]; then
  echo -e "${GREEN}¡Tests completados con éxito!${NC}"
else
  echo -e "${RED}Los tests han fallado.${NC}"
  exit 1
fi
```

## Cómo Usar la Nueva Configuración

Para usar la nueva configuración, ejecuta los tests con el siguiente comando:

```bash
./test-clean.sh
```

O para tests específicos:

```bash
./test-clean.sh src/views/admin/__tests__/RoleCreateView.spec.ts
```

## Conclusión

Con estas herramientas y configuraciones, deberías poder resolver la mayoría de los problemas relacionados con la caché de Vitest y asegurar que tus tests se ejecuten correctamente.
