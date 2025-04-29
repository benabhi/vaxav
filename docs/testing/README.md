# Documentación de Testing para VAXAV

Esta carpeta contiene la documentación relacionada con las prácticas de testing en el proyecto VAXAV.

## Contenido

- [Mejores Prácticas](./best-practices.md): Principios generales y mejores prácticas para escribir tests efectivos.
- [Testing de Componentes Vue](./vue-component-testing.md): Guía específica para el testing de componentes Vue.
- [Solución de Problemas](./troubleshooting.md): Soluciones a problemas comunes en los tests.
- [Solución de Problemas con Vitest](./testing-vitest.md): Guía específica para resolver problemas con la caché de Vitest.

## Resumen de Principios Clave

1. **Enfocarse en la funcionalidad básica e importante**
2. **Evitar dependencias del DOM**
3. **Mantener los tests simples y robustos**
4. **Probar la lógica de negocio, no la implementación**
5. **Ejecutar siempre los tests con `--no-cache` o usar el script `test-clean.sh`**

## Comandos Útiles

### Script de Limpieza de Caché (Recomendado)

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

### Comandos Manuales

También puedes ejecutar los tests manualmente:

```bash
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
