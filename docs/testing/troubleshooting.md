# Solución de Problemas en Tests de VAXAV

## Problemas Comunes y Soluciones

### 1. Problemas con la Caché de Vitest

**Problema**: Los tests siguen ejecutando versiones antiguas del código o de los tests, incluso después de modificarlos.

**Solución**: 
- Siempre ejecutar los tests con la opción `--no-cache`:
  ```bash
  npm run test:unit -- --no-cache src/path/to/test.spec.ts
  ```
- Si el problema persiste, eliminar manualmente la caché de Vitest:
  ```bash
  rm -rf node_modules/.vitest
  ```

### 2. Tests que Fallan por Cambios en el DOM

**Problema**: Los tests fallan porque buscan elementos específicos en el DOM que han cambiado.

**Solución**:
- Reescribir los tests para que no dependan de la estructura del DOM.
- Centrarse en probar la lógica de negocio en lugar de la representación visual.
- Usar mocks para simular las interacciones con el DOM.

Ejemplo de refactorización:

```javascript
// Antes: Dependiente del DOM
it('should show error message', async () => {
  await wrapper.find('form').trigger('submit');
  expect(wrapper.find('.error-message').exists()).toBe(true);
});

// Después: Independiente del DOM
it('should set error state on form submission', async () => {
  await submitForm();
  expect(isError.value).toBe(true);
});
```

### 3. Problemas con Mocks

**Problema**: Los mocks no funcionan como se espera o no se restablecen correctamente entre tests.

**Solución**:
- Asegurarse de llamar `vi.clearAllMocks()` en el `beforeEach`.
- Verificar que los mocks estén configurados correctamente.
- Usar `mockImplementation` para comportamientos más complejos.

```javascript
beforeEach(() => {
  vi.clearAllMocks();
  
  api.get.mockImplementation((url) => {
    if (url === '/users') {
      return Promise.resolve({ data: mockUsers });
    }
    return Promise.reject(new Error('Unexpected URL'));
  });
});
```

### 4. Tests Asíncronos que Fallan

**Problema**: Los tests asíncronos fallan de manera inconsistente o no esperan a que las promesas se resuelvan.

**Solución**:
- Asegurarse de usar `async/await` correctamente.
- Usar `flushPromises` para esperar a que todas las promesas se resuelvan.
- Verificar que los mocks asíncronos estén configurados correctamente.

```javascript
import { flushPromises } from '@vue/test-utils';

it('should load data asynchronously', async () => {
  // Configurar mock
  api.get.mockResolvedValue({ data: { items: [] } });
  
  // Llamar a la función asíncrona
  fetchData();
  
  // Esperar a que todas las promesas se resuelvan
  await flushPromises();
  
  // Verificar resultados
  expect(api.get).toHaveBeenCalled();
});
```

### 5. Tests que Interfieren Entre Sí

**Problema**: Los tests afectan el estado global y causan que otros tests fallen.

**Solución**:
- Aislar cada test asegurándose de que no modifique el estado global.
- Usar `beforeEach` para restablecer el estado antes de cada test.
- Considerar el uso de `vi.isolateModules()` para tests que modifican módulos.

```javascript
beforeEach(() => {
  // Restablecer el estado global
  localStorage.clear();
  sessionStorage.clear();
  document.cookie = '';
  
  // Restablecer mocks
  vi.clearAllMocks();
});
```

### 6. Tests Lentos

**Problema**: Los tests tardan demasiado en ejecutarse.

**Solución**:
- Reducir el número de tests que montan componentes completos.
- Usar mocks para evitar operaciones costosas como llamadas a API.
- Ejecutar solo los tests relevantes durante el desarrollo.

```bash
# Ejecutar solo los tests relevantes
npm run test:unit -- --no-cache src/components/MyComponent.spec.ts

# Ejecutar tests en paralelo
npm run test:unit -- --no-cache --threads
```

### 7. Errores de Importación en Tests

**Problema**: Los tests fallan con errores de importación o no pueden encontrar módulos.

**Solución**:
- Verificar que las rutas de importación sean correctas.
- Asegurarse de que los alias de importación (como `@/`) estén configurados correctamente en `vite.config.ts`.
- Verificar que los módulos importados estén correctamente mockeados.

```javascript
// Configuración correcta de alias en vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

### 8. Problemas con el Router de Vue

**Problema**: Los tests que involucran el router de Vue fallan o causan advertencias.

**Solución**:
- Crear un router de prueba simplificado.
- Mockear el router en lugar de usar uno real.
- Probar la lógica de navegación directamente en lugar de a través del router.

```javascript
// Crear un router de prueba simplificado
const router = {
  push: vi.fn(),
  currentRoute: {
    value: {
      path: '/test',
      params: { id: '1' }
    }
  }
};

// Mockear el useRouter composable
vi.mock('vue-router', () => ({
  useRouter: () => router,
  useRoute: () => router.currentRoute.value
}));
```

## Consejos Generales

1. **Mantener los tests simples**: Un test debe probar una sola cosa.
2. **Evitar tests frágiles**: Los tests no deben romperse por cambios menores en el código.
3. **Documentar casos especiales**: Si un test requiere una configuración especial, documentarlo.
4. **Revisar regularmente los tests**: Eliminar tests obsoletos o redundantes.
5. **Usar herramientas de cobertura**: Identificar áreas del código que no están siendo probadas.

## Recursos Adicionales

- [Documentación oficial de Vitest](https://vitest.dev/)
- [Documentación de Vue Test Utils](https://test-utils.vuejs.org/)
- [Guía de testing de Vue.js](https://vuejs.org/guide/scaling-up/testing.html)
