# Testing de Componentes Vue en VAXAV

## Introducción

Este documento proporciona guías específicas para el testing de componentes Vue en el proyecto VAXAV. Complementa la guía general de testing en `best-practices.md`.

## Enfoque Recomendado

En VAXAV, recomendamos un enfoque de testing que se centre en la lógica de negocio de los componentes, evitando las pruebas que dependen demasiado del DOM o de detalles de implementación.

### Estructura de un Test de Componente Vue

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Importar dependencias
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';

// Mockear dependencias
vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('@/stores/notification', () => ({ useNotificationStore: vi.fn() }));
vi.mock('@/composables/useForm', () => ({ useForm: vi.fn() }));

describe('ComponentName - Core Logic', () => {
  let dependencies;
  let componentLogic;
  
  beforeEach(() => {
    // Resetear mocks
    vi.clearAllMocks();
    
    // Configurar mocks
    dependencies = {
      // Configuración de mocks...
    };
    
    // Crear funciones que simulan la lógica del componente
    componentLogic = {
      // Funciones que implementan la lógica del componente...
    };
  });
  
  it('should perform the main functionality', async () => {
    // Test de la funcionalidad principal
  });
});
```

## Qué Probar en Componentes Vue

### 1. Composables y Hooks

Los composables y hooks son ideales para testing unitario porque encapsulan lógica reutilizable:

```javascript
it('should handle form submission', async () => {
  // Configurar mocks
  api.post.mockResolvedValue({ data: { id: 1, name: 'Test' } });
  
  // Llamar a la función del composable
  const result = await submitForm({ name: 'Test' });
  
  // Verificar resultados
  expect(api.post).toHaveBeenCalledWith('/endpoint', { name: 'Test' });
  expect(result.id).toBe(1);
});
```

### 2. Métodos y Computed Properties

Probar métodos y propiedades computadas directamente:

```javascript
it('should calculate total correctly', () => {
  // Configurar el estado inicial
  const state = { items: [{ price: 10 }, { price: 20 }] };
  
  // Llamar a la función que calcula el total
  const total = calculateTotal(state.items);
  
  // Verificar el resultado
  expect(total).toBe(30);
});
```

### 3. Manejo de Eventos

Probar el manejo de eventos simulando las funciones de callback:

```javascript
it('should handle click event', async () => {
  // Configurar mocks
  const mockFn = vi.fn();
  
  // Simular el evento
  await handleClick({ preventDefault: mockFn });
  
  // Verificar que se llamó la función de prevención
  expect(mockFn).toHaveBeenCalled();
  
  // Verificar otras acciones realizadas por el manejador
  expect(api.post).toHaveBeenCalledWith('/endpoint', { clicked: true });
});
```

## Evitar en Tests de Componentes Vue

### 1. Dependencia del DOM

❌ **Mal enfoque**:
```javascript
it('should show error message', async () => {
  // Este test depende de la estructura del DOM
  expect(wrapper.find('.error-message').exists()).toBe(true);
  expect(wrapper.find('.error-message').text()).toBe('Error');
});
```

✅ **Buen enfoque**:
```javascript
it('should set error state correctly', async () => {
  // Este test se centra en el estado, no en el DOM
  await showError('Error message');
  expect(errorState.value).toBe('Error message');
  expect(isError.value).toBe(true);
});
```

### 2. Probar Librerías Externas

❌ **Mal enfoque**:
```javascript
it('should format date correctly', () => {
  // Este test está probando una librería externa (dayjs)
  expect(formatDate('2023-01-01')).toBe('01/01/2023');
});
```

✅ **Buen enfoque**:
```javascript
it('should use formatted date in API call', () => {
  // Este test se centra en cómo usamos la fecha formateada
  submitForm({ date: '2023-01-01' });
  expect(api.post).toHaveBeenCalledWith('/endpoint', expect.objectContaining({
    formattedDate: expect.any(String)
  }));
});
```

## Ejecutando Tests de Componentes

Para ejecutar tests de componentes Vue, use:

```bash
npm run test:unit -- --no-cache src/components/MyComponent.spec.ts
```

Es **crucial** usar la opción `--no-cache` para evitar problemas con la caché de Vitest, especialmente después de modificar los tests.

## Ejemplos de Tests Bien Estructurados

### Ejemplo 1: Test de un Formulario

```javascript
describe('RoleCreateView - Form Logic', () => {
  let notificationStore;
  let formMock;
  let onSubmit;

  beforeEach(() => {
    // Configuración de mocks...
  });

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

    // Call the onSubmit function directly
    const result = await onSubmit({
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
  });

  it('should handle validation errors', async () => {
    // Mock API error response
    api.post.mockRejectedValue({
      response: {
        data: {
          errors: {
            slug: ['El slug ya está en uso.']
          }
        }
      }
    });

    // Call the onSubmit function and catch the error
    try {
      await onSubmit({
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
        permissions: [1, 2]
      });
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Verify error handling
      expect(formMock.setErrors).toHaveBeenCalledWith({
        slug: 'El slug ya está en uso.'
      });
    }
  });
});
```

### Ejemplo 2: Test de una Tabla de Datos

```javascript
describe('UsersView - Core Logic', () => {
  let notificationStore;
  let confirmationMock;
  let fetchUsers;
  let deleteUser;

  beforeEach(() => {
    // Configuración de mocks...
  });

  it('should fetch users successfully', async () => {
    // Call the fetchUsers function
    const result = await fetchUsers();

    // Verify API was called with correct parameters
    expect(api.get).toHaveBeenCalledWith('/admin/users', {
      params: {
        page: 1
      }
    });

    // Verify the result contains the expected data
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('Admin User');
  });

  it('should delete a user when confirmed', async () => {
    // Mock successful deletion
    api.delete.mockResolvedValue({ data: { success: true } });

    // Call the deleteUser function
    await deleteUser(2);

    // Verify confirmation was requested
    expect(confirmationMock.confirm).toHaveBeenCalled();

    // Verify API was called with correct ID
    expect(api.delete).toHaveBeenCalledWith('/admin/users/2');

    // Verify success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
  });
});
```

## Conclusión

Siguiendo estas guías, los tests de componentes Vue en VAXAV serán más robustos, mantenibles y efectivos. Recuerde centrarse en probar la lógica de negocio y evitar dependencias del DOM o detalles de implementación.
