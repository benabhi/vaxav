# Guía de Testing para el Frontend

Esta guía proporciona información detallada sobre cómo escribir y ejecutar tests para el frontend de Vaxav.

## Configuración

El proyecto utiliza las siguientes herramientas para testing:

- **Vitest**: Framework de testing rápido y compatible con Vite
- **@vue/test-utils**: Biblioteca oficial para testear componentes Vue
- **jsdom**: Simulación de DOM para entorno Node.js
- **@pinia/testing**: Utilidades para testear stores Pinia

## Estructura de Tests

Los tests se organizan siguiendo la estructura del código fuente, con archivos de test ubicados en carpetas `__tests__` junto a los archivos que prueban:

```
frontend/src/
├── components/
│   ├── __tests__/
│   │   └── ComponentName.spec.ts
│   └── ComponentName.vue
├── stores/
│   ├── __tests__/
│   │   └── store-name.spec.ts
│   └── store-name.ts
└── views/
    ├── __tests__/
    │   └── ViewName.spec.ts
    └── ViewName.vue
```

## Tipos de Tests

### Tests de Componentes

Los tests de componentes verifican que los componentes Vue se renderizan correctamente y responden adecuadamente a las interacciones del usuario.

**Ejemplo**:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(BaseButton, { 
      slots: { default: 'Click me' } 
    })
    
    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('btn-primary')
  })
  
  it('applies the correct variant class', () => {
    const wrapper = mount(BaseButton, { 
      props: { variant: 'secondary' },
      slots: { default: 'Cancel' } 
    })
    
    expect(wrapper.classes()).toContain('btn-secondary')
  })
  
  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton, { 
      slots: { default: 'Click me' } 
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Tests de Stores (Pinia)

Los tests de stores verifican que los stores Pinia gestionan correctamente el estado y las acciones.

**Ejemplo**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import api from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('should set user and token on successful login', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    const mockResponse = { data: { user: mockUser, token: 'fake-token' } }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const authStore = useAuthStore()
    await authStore.login({ email: 'test@example.com', password: 'password' })
    
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe('fake-token')
    expect(authStore.isAuthenticated).toBe(true)
  })
})
```

### Tests de Vistas

Los tests de vistas verifican que las vistas completas funcionan correctamente, incluyendo la interacción con stores y componentes.

**Ejemplo**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginView from '../LoginView.vue'
import { useAuthStore } from '@/stores/auth'

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('LoginView', () => {
  let wrapper
  
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
    
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia],
        stubs: {
          BaseButton: true,
          BaseInput: true
        }
      }
    })
  })
  
  it('should call login action when form is submitted', async () => {
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockResolvedValue()
    
    // Fill the form
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password')
    
    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check if login was called with correct credentials
    expect(authStore.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })
})
```

## Mocking

### Mocking de Componentes

Para tests que no necesitan probar la implementación interna de componentes hijos, puedes usar stubs:

```typescript
const wrapper = mount(ParentComponent, {
  global: {
    stubs: {
      ChildComponent: true, // Stub simple
      OtherComponent: {
        template: '<div class="stubbed">Stubbed Component</div>'
      }
    }
  }
})
```

### Mocking de API

Para tests que involucran llamadas a la API, debes mockear el servicio de API:

```typescript
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// En el test
vi.mocked(api.get).mockResolvedValue({
  data: { /* datos de respuesta simulados */ }
})
```

### Mocking de Stores

Para tests de componentes que usan stores, puedes usar `createTestingPinia`:

```typescript
import { createTestingPinia } from '@pinia/testing'

const wrapper = mount(Component, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          auth: {
            user: { id: 1, name: 'Test User' },
            isAuthenticated: true
          }
        }
      })
    ]
  }
})
```

## Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
npm run test:unit

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:unit -- --watch

# Ejecutar un archivo específico
npm run test:unit -- src/components/__tests__/BaseButton.spec.ts

# Ejecutar tests con cobertura
npm run test:unit -- --coverage
```

### Depuración de Tests

Para depurar tests, puedes usar:

1. **Modo watch con UI**: `npm run test:unit -- --watch --ui`
2. **Debugger en el código**: Añade `debugger` en tu test y ejecuta con Node inspector

## Mejores Prácticas

1. **Testea comportamiento, no implementación**: Enfócate en lo que el componente debe hacer, no en cómo lo hace.

2. **Mantén los tests independientes**: Cada test debe poder ejecutarse de forma aislada.

3. **Usa datos de prueba consistentes**: Crea helpers o factories para generar datos de prueba.

4. **Limpia después de cada test**: Usa `beforeEach` y `afterEach` para configurar y limpiar el entorno.

5. **Nombra los tests descriptivamente**: El nombre debe describir qué se está probando y qué resultado se espera.

6. **Sigue el patrón AAA**:
   - **Arrange**: Configura los datos y condiciones
   - **Act**: Ejecuta la acción a probar
   - **Assert**: Verifica los resultados

7. **Evita tests frágiles**: No dependas de detalles de implementación que puedan cambiar.

8. **Testea casos de error**: No solo el camino feliz, también casos de error y bordes.

## Resolución de Problemas Comunes

### El componente no se renderiza como se espera

- Verifica que todos los props necesarios estén pasados al componente
- Comprueba si el componente depende de stores o servicios que necesitan ser mockeados
- Usa `wrapper.html()` para ver el HTML renderizado y depurar

### Los eventos no se disparan

- Asegúrate de usar `await` cuando llames a `wrapper.trigger()`
- Verifica que el elemento no esté deshabilitado o sea inaccesible
- Comprueba si hay condiciones que previenen que el evento se dispare

### Los mocks no funcionan

- Asegúrate de que el mock está definido antes de importar el módulo real
- Verifica que estás usando `vi.mocked()` para tipar correctamente los mocks
- Usa `vi.resetAllMocks()` en `beforeEach` para evitar interferencias entre tests
