# VxvDropdown

El componente `VxvDropdown` es un menú desplegable que se puede utilizar para mostrar opciones adicionales o acciones relacionadas con un elemento de la interfaz.

## Características

- **Posicionamiento flexible**: Puede posicionarse en diferentes direcciones (arriba, abajo, izquierda, derecha)
- **Trigger personalizable**: Cualquier elemento puede ser el disparador del dropdown
- **Animaciones suaves**: Transiciones de entrada y salida para una mejor experiencia de usuario
- **Cierre automático**: Se cierra al hacer clic fuera o presionar ESC
- **Accesibilidad**: Soporte para navegación por teclado

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| position | String | `'bottom-right'` | Posición del dropdown respecto al trigger. Opciones: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`, `'left'`, `'right'` |
| triggerClass | String | `''` | Clases CSS adicionales para el elemento trigger |
| menuClass | String | `'w-48'` | Clases CSS adicionales para el menú desplegable |
| closeOnClickOutside | Boolean | `true` | Si el dropdown debe cerrarse al hacer clic fuera de él |
| closeOnEsc | Boolean | `true` | Si el dropdown debe cerrarse al presionar la tecla ESC |

## Eventos

| Nombre | Descripción |
|--------|-------------|
| open | Se emite cuando el dropdown se abre |
| close | Se emite cuando el dropdown se cierra |

## Slots

| Nombre | Descripción |
|--------|-------------|
| trigger | Elemento que activa el dropdown al hacer clic |
| default | Contenido del dropdown (normalmente elementos `VxvDropdownItem`) |

## Métodos Expuestos

| Nombre | Descripción |
|--------|-------------|
| isOpen | Estado actual del dropdown (abierto/cerrado) |
| toggleDropdown | Alterna el estado del dropdown |
| closeDropdown | Cierra el dropdown |

## Componentes Relacionados

### VxvDropdownItem

El componente `VxvDropdownItem` se utiliza dentro de `VxvDropdown` para crear elementos del menú desplegable.

#### Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| label | String | `''` | Texto del elemento |
| to | String/Object | `null` | Ruta para router-link |
| href | String | `null` | URL para enlaces externos |
| icon | Object/Function | `null` | Componente de icono |
| disabled | Boolean | `false` | Si el elemento está deshabilitado |
| className | String | `''` | Clases CSS adicionales |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| click | Se emite cuando se hace clic en el elemento |

## Ejemplos de Uso

### Dropdown Básico

```vue
<VxvDropdown>
  <template #trigger>
    <VxvButton>Opciones</VxvButton>
  </template>
  
  <VxvDropdownItem label="Opción 1" />
  <VxvDropdownItem label="Opción 2" />
  <VxvDropdownItem label="Opción 3" />
</VxvDropdown>
```

### Dropdown con Iconos

```vue
<VxvDropdown>
  <template #trigger>
    <VxvButton>
      Usuario
      <ChevronDownIcon class="ml-2 -mr-1 h-5 w-5" />
    </VxvButton>
  </template>
  
  <VxvDropdownItem label="Perfil" :icon="UserIcon" />
  <VxvDropdownItem label="Configuración" :icon="SettingsIcon" />
  <VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" />
</VxvDropdown>
```

### Dropdown con Texto como Trigger

```vue
<VxvDropdown triggerClass="text-blue-400 hover:text-blue-300 flex items-center">
  <template #trigger>
    <span>Usuario</span>
    <ChevronDownIcon class="ml-1 h-4 w-4" />
  </template>
  
  <VxvDropdownItem label="Perfil" />
  <VxvDropdownItem label="Cerrar Sesión" />
</VxvDropdown>
```

### Dropdown con Diferentes Posiciones

```vue
<VxvDropdown position="top-left">
  <template #trigger>
    <VxvButton>Top Left</VxvButton>
  </template>
  <VxvDropdownItem label="Opción 1" />
  <VxvDropdownItem label="Opción 2" />
</VxvDropdown>
```

### Dropdown con Elementos Deshabilitados

```vue
<VxvDropdown>
  <template #trigger>
    <VxvButton>Opciones</VxvButton>
  </template>
  
  <VxvDropdownItem label="Opción 1" />
  <VxvDropdownItem label="Opción 2 (Deshabilitada)" :disabled="true" />
  <VxvDropdownItem label="Opción 3" />
</VxvDropdown>
```

### Dropdown con Eventos

```vue
<VxvDropdown>
  <template #trigger>
    <VxvButton>Opciones</VxvButton>
  </template>
  
  <VxvDropdownItem @click="handleClick('Opción 1')">Opción 1</VxvDropdownItem>
  <VxvDropdownItem @click="handleClick('Opción 2')">Opción 2</VxvDropdownItem>
  <VxvDropdownItem @click="handleClick('Opción 3')">Opción 3</VxvDropdownItem>
</VxvDropdown>
```

## Implementación en la Barra de Navegación

El componente `VxvDropdown` se puede utilizar en la barra de navegación para mostrar opciones de usuario:

```vue
<template>
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img class="h-8 w-8" src="/logo.svg" alt="Logo">
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Inicio</a>
              <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Juego</a>
              <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Acerca de</a>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <VxvDropdown triggerClass="text-gray-300 hover:text-white flex items-center">
              <template #trigger>
                <span>Usuario</span>
                <ChevronDownIcon class="ml-1 h-4 w-4" />
              </template>
              
              <VxvDropdownItem label="Perfil" :icon="UserIcon" to="/profile" />
              <VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" @click="logout" />
            </VxvDropdown>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
```

## Notas de Implementación

1. **Posicionamiento**: El dropdown se posiciona automáticamente según la propiedad `position`
2. **Cierre automático**: Se cierra al hacer clic fuera o presionar ESC (configurable)
3. **Accesibilidad**: Incluye soporte para navegación por teclado y atributos ARIA
4. **Personalización**: Altamente personalizable a través de slots y propiedades
5. **Rendimiento**: Utiliza transiciones de Vue para animaciones eficientes
