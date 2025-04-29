# VxvNavbar

El componente `VxvNavbar` es una barra de navegación flexible y personalizable que se utiliza para mostrar el logo de la aplicación, enlaces de navegación y acciones como botones de inicio de sesión o información del usuario.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| sticky | Boolean | `true` | Si es `true`, la barra de navegación permanecerá fija en la parte superior de la pantalla al hacer scroll |
| transparent | Boolean | `false` | Si es `true`, la barra de navegación tendrá un fondo semi-transparente con efecto de desenfoque |
| className | String | `''` | Clases CSS adicionales para personalizar la barra de navegación |
| logoSize | String | `'md'` | Tamaño del logo (sm, md, lg, xl) |
| logoLink | String | `'/'` | Ruta de destino para el enlace del logo |
| links | Array | `[]` | Array de objetos con la configuración de los enlaces de navegación |
| activeClass | String | `'bg-gray-700 text-blue-400'` | Clases CSS a aplicar cuando un enlace está activo |
| inactiveClass | String | `'text-gray-300 hover:text-white'` | Clases CSS a aplicar cuando un enlace está inactivo |
| activeIconClass | String | `'text-blue-400'` | Clases CSS a aplicar al icono cuando un enlace está activo |
| inactiveIconClass | String | `'text-gray-400'` | Clases CSS a aplicar al icono cuando un enlace está inactivo |

## Slots

| Nombre | Descripción |
|--------|-------------|
| logo | Personalización del logo (por defecto usa `VxvLogo`) |
| links | Personalización de los enlaces de navegación (por defecto usa `VxvNavLink` para cada enlace en la propiedad `links`) |
| actions | Acciones adicionales como botones de inicio de sesión, información del usuario, etc. |

## Ejemplos de uso

### Uso básico

```vue
<template>
  <VxvNavbar :links="navLinks" />
</template>

<script setup>
const navLinks = [
  { to: '/', label: 'Inicio', exact: true },
  { to: '/features', label: 'Características' },
  { to: '/pricing', label: 'Precios' },
  { to: '/contact', label: 'Contacto' }
];
</script>
```

### Con acciones personalizadas

```vue
<template>
  <VxvNavbar :links="navLinks">
    <template #actions>
      <VxvButton variant="secondary" size="md">Iniciar Sesión</VxvButton>
      <VxvButton variant="primary" size="md">Registrarse</VxvButton>
    </template>
  </VxvNavbar>
</template>
```

### Con logo personalizado

```vue
<template>
  <VxvNavbar :links="navLinks">
    <template #logo>
      <img src="/custom-logo.svg" alt="Logo" class="h-10" />
    </template>
  </VxvNavbar>
</template>
```

### Con enlaces personalizados

```vue
<template>
  <VxvNavbar>
    <template #links>
      <div class="ml-8 flex space-x-4">
        <VxvNavLink to="/" label="Inicio" :horizontal="true" />
        <div class="relative group">
          <button class="text-gray-300 hover:text-white px-3 py-2">
            Productos <span class="ml-1">▼</span>
          </button>
          <div class="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg hidden group-hover:block">
            <VxvNavLink to="/products/software" label="Software" />
            <VxvNavLink to="/products/hardware" label="Hardware" />
          </div>
        </div>
      </div>
    </template>
  </VxvNavbar>
</template>
```

### Barra de navegación transparente

```vue
<template>
  <VxvNavbar :links="navLinks" :transparent="true" />
</template>
```

### Barra de navegación no fija

```vue
<template>
  <VxvNavbar :links="navLinks" :sticky="false" />
</template>
```

## Integración con el sistema de autenticación

El componente `VxvNavbar` se puede integrar fácilmente con el sistema de autenticación para mostrar diferentes enlaces y acciones según el estado de autenticación del usuario:

```vue
<template>
  <VxvNavbar :links="navLinks">
    <template #actions>
      <template v-if="isLoggedIn">
        <div class="text-sm text-gray-300">
          <span class="mr-2">{{ user.name }}</span>
        </div>
        <VxvButton variant="secondary" size="md" @click="logout">
          Cerrar Sesión
        </VxvButton>
      </template>
      <template v-else>
        <VxvButton variant="secondary" size="md" @click="login">
          Iniciar Sesión
        </VxvButton>
        <VxvButton variant="primary" size="md" @click="register">
          Registrarse
        </VxvButton>
      </template>
    </template>
  </VxvNavbar>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.currentUser);

// Enlaces de navegación dinámicos basados en el estado de autenticación
const navLinks = computed(() => {
  const links = [
    { to: '/', label: 'Inicio', exact: true },
    { to: '/features', label: 'Características' }
  ];
  
  if (isLoggedIn.value) {
    links.push(
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/profile', label: 'Perfil' }
    );
  }
  
  return links;
});

const logout = () => authStore.logout();
const login = () => router.push('/login');
const register = () => router.push('/register');
</script>
```

## Notas de implementación

- El componente `VxvNavbar` utiliza internamente los componentes `VxvLogo` y `VxvNavLink`.
- La barra de navegación es responsive y los enlaces se ocultan en pantallas pequeñas (se recomienda implementar un menú móvil separado).
- Se puede personalizar completamente utilizando los slots disponibles.
- La propiedad `links` espera un array de objetos con la siguiente estructura:
  ```typescript
  interface NavLink {
    to: string;       // Ruta de destino
    label: string;    // Texto a mostrar
    icon?: any;       // Componente de icono opcional
    exact?: boolean;  // Si la ruta debe coincidir exactamente
  }
  ```
