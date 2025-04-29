# Guía de Testing para VAXAV

## Principios Generales

Los tests en VAXAV deben seguir estos principios fundamentales:

1. **Enfocarse en la funcionalidad básica e importante**: Probar lo que realmente importa, no cada detalle de implementación.
2. **Evitar dependencias del DOM**: Los tests no deben depender de la estructura del DOM, que puede cambiar frecuentemente.
3. **Mantener los tests simples y robustos**: Tests complejos son frágiles y difíciles de mantener.
4. **Probar la lógica de negocio, no la implementación**: Centrarse en el "qué" hace el código, no en el "cómo" lo hace.

## Estructura Recomendada para Tests

### 1. Configuración de Mocks

```javascript
// Importar primero, luego mockear
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

// Mockear las dependencias
vi.mock('@/services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn()
    }
  };
});

vi.mock('@/stores/notification', () => {
  return {
    useNotificationStore: vi.fn()
  };
});
```

### 2. Estructura del Test

```javascript
describe('ComponentName - Core Logic', () => {
  let dependencies;
  
  beforeEach(() => {
    // Resetear mocks
    vi.clearAllMocks();
    
    // Configurar mocks
    dependencies = {
      // Configuración de mocks...
    };
    
    // Crear funciones que simulan el comportamiento del componente
    // ...
  });
  
  it('should perform the main functionality', async () => {
    // Configurar respuestas de mocks para este test específico
    
    // Llamar a la función que se está probando
    
    // Verificar resultados
    expect(result).toEqual(expectedValue);
    
    // Verificar que se llamaron las dependencias correctamente
    expect(api.post).toHaveBeenCalledWith('/endpoint', expectedData);
  });
});
```

## Qué Probar y Qué No Probar

### Probar:

✅ **Lógica de negocio principal**: Funciones que implementan reglas de negocio importantes.

✅ **Interacciones con API**: Verificar que se llaman los endpoints correctos con los datos correctos.

✅ **Manejo de errores**: Comprobar que los errores se manejan adecuadamente.

✅ **Transformaciones de datos**: Asegurar que los datos se transforman correctamente.

### No Probar:

❌ **Detalles de implementación**: Evitar probar cómo se implementa algo, centrarse en qué hace.

❌ **Estructura del DOM**: No depender de selectores CSS específicos o estructura del DOM.

❌ **Librerías externas**: Asumir que las librerías externas funcionan correctamente.

❌ **Estilos y diseño**: No probar aspectos visuales que deberían verificarse manualmente.

## Ejemplo de un Buen Test

```javascript
it('should create role successfully', async () => {
  // Mock API response
  api.post.mockResolvedValue({
    data: {
      id: 1,
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      permissions: [1, 2]
    }
  });

  // Call the function directly
  const result = await createRole({
    name: 'Test Role',
    slug: 'test-role',
    description: 'Test role description',
    permissions: [1, 2]
  });

  // Verify API was called with correct data
  expect(api.post).toHaveBeenCalledWith('/admin/roles', {
    name: 'Test Role',
    slug: 'test-role',
    description: 'Test role description',
    permissions: [1, 2]
  });

  // Verify success notification was shown
  expect(notificationStore.adminSuccess).toHaveBeenCalled();
  
  // Verify the result
  expect(result.id).toBe(1);
  expect(result.name).toBe('Test Role');
});
```

## Ejecutando los Tests

Para ejecutar los tests, use el siguiente comando:

```bash
npm run test:unit -- --no-cache [ruta-a-los-tests]
```

Es importante usar la opción `--no-cache` para evitar problemas con la caché de Vitest, que puede causar que se ejecuten versiones antiguas de los tests.

Ejemplos:

```bash
# Ejecutar todos los tests
npm run test:unit -- --no-cache

# Ejecutar tests específicos
npm run test:unit -- --no-cache src/views/admin/__tests__/RoleCreateView.spec.ts

# Ejecutar tests que coincidan con un patrón
npm run test:unit -- --no-cache "src/**/*.spec.ts"
```

## Solución de Problemas Comunes

### Tests que fallan después de cambios en el código

Si los tests fallan después de hacer cambios en el código, asegúrese de:

1. Ejecutar los tests con `--no-cache` para evitar problemas de caché.
2. Verificar que los mocks estén actualizados para reflejar los cambios en el código.
3. Comprobar que las expectativas (expects) sean consistentes con el nuevo comportamiento.

### Tests que pasan localmente pero fallan en CI

Posibles causas:

1. Diferencias en el entorno (versiones de Node.js, dependencias, etc.).
2. Problemas de timing (tests que dependen de timeouts o promesas).
3. Diferencias en la configuración de los tests.

### Tests lentos

Si los tests son lentos, considere:

1. Reducir el número de tests que interactúan con el DOM.
2. Usar mocks para evitar operaciones costosas.
3. Agrupar tests relacionados para reducir la configuración repetitiva.

## Conclusión

Seguir estas prácticas ayudará a mantener una suite de tests robusta, rápida y fácil de mantener. Recuerde que el objetivo de los tests es proporcionar confianza en el código, no probar cada línea de código.
