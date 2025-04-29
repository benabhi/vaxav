# Solución de Problemas con Vitest

## Problemas con la Caché de Vitest

### Problema

Los tests siguen ejecutando versiones antiguas del código o de los tests, incluso después de modificarlos.

### Soluciones

#### Método 1: Usar el script de limpieza de caché

Hemos creado un script que automatiza la limpieza de caché y la ejecución de tests:

```bash
# Ejecutar todos los tests con limpieza de caché
./docs/testing/run-tests.sh

# Ejecutar tests específicos con limpieza de caché
./docs/testing/run-tests.sh src/views/admin/__tests__/RoleCreateView.spec.ts
```

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

## Cómo Usar la Nueva Configuración

Para usar la nueva configuración, ejecuta los tests con el siguiente comando:

```bash
npx vitest run --config vitest.config.ts
```

O añade un script en tu `package.json`:

```json
{
  "scripts": {
    "test:clean": "vitest run --config vitest.config.ts"
  }
}
```

Y luego ejecuta:

```bash
npm run test:clean
```

## Conclusión

Con estas herramientas y configuraciones, deberías poder resolver la mayoría de los problemas relacionados con la caché de Vitest y asegurar que tus tests se ejecuten correctamente.
