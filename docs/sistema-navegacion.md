# Sistema de Navegación en VAXAV

Este documento describe el sistema de navegación implementado en VAXAV, explicando cómo funcionan los componentes `VxvNavLink`, `VxvDropdown` y `VxvSidebarGroup` y cómo se integran para crear una experiencia de navegación coherente.

## Estructura de Componentes

El sistema de navegación de VAXAV se compone principalmente de los siguientes componentes:

1. **VxvNavLink**: Componente base para enlaces de navegación
2. **VxvDropdown**: Componente para menús desplegables
3. **VxvDropdownItem**: Elemento dentro de un menú desplegable
4. **VxvSidebarGroup**: Componente para agrupar enlaces relacionados
5. **VxvNavbar**: Barra de navegación principal con soporte para menús desplegables

## Componente VxvNavLink

El componente `VxvNavLink` es el bloque fundamental del sistema de navegación. Ha sido diseñado para ser flexible y adaptarse a diferentes contextos:

### Props Principales

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `to` | `String` | Ruta de destino para el enlace |
| `label` | `String` | Texto del enlace |
| `icon` | `Object/Function` | Componente de icono opcional |
| `exact` | `Boolean` | Si la ruta debe coincidir exactamente |
| `simple` | `Boolean` | Estilo simplificado sin fondo |
| `horizontal` | `Boolean` | Si el enlace debe mostrarse horizontalmente |
| `isMobile` | `Boolean` | Indica si se está mostrando en la versión móvil |
| `isSidebarCollapsed` | `Boolean` | Indica si la barra lateral está colapsada |
| `activeClass` | `String` | Clase CSS a aplicar cuando el enlace está activo |
| `inactiveClass` | `String` | Clase CSS a aplicar cuando el enlace está inactivo |

### Modos de Visualización

El componente `VxvNavLink` puede mostrarse en diferentes modos:

1. **Modo Normal**: Enlace estándar con posible fondo gris cuando está activo
   ```vue
   <VxvNavLink to="/pilot/overview" label="Vista General" />
   ```

2. **Modo Simple**: Enlace sin fondo, solo cambia el color del texto
   ```vue
   <VxvNavLink to="/pilot/overview" label="Vista General" simple />
   ```

3. **Modo Horizontal**: Enlace que se muestra horizontalmente (para barras de navegación)
   ```vue
   <VxvNavLink to="/pilot/overview" label="Vista General" horizontal />
   ```

### Lógica de Activación

La lógica para determinar si un enlace está activo ha sido simplificada:

1. **Coincidencia Exacta**:
   - Si la ruta actual coincide exactamente con la ruta del enlace, el enlace está activo

2. **Coincidencia Parcial**:
   - Si `exact=false` (valor por defecto), el enlace está activo si la ruta actual comienza con la ruta del enlace
   - Por ejemplo, un enlace a `/pilot` estará activo en `/pilot/skills`

```javascript
// Lógica simplificada de activación
const isActive = computed(() => {
  // Si la ruta actual coincide exactamente con la ruta del enlace
  if (route.path === props.to) {
    return true;
  }

  // Si se requiere coincidencia exacta, solo devolver true si las rutas son idénticas
  if (props.exact) {
    return false;
  }

  // Para enlaces no exactos, verificar si la ruta actual comienza con la ruta del enlace
  return route.path.startsWith(`${props.to}/`);
});
```

### Estilos Condicionales

El componente aplica diferentes estilos según el modo y el estado:

1. **Enlaces Activos**:
   - **Navbar**: Solo texto azul (configurable mediante `activeClass`)
   - **Sidebar**: Texto azul (configurable mediante `activeClass`)
   - **Sidebar Móvil**: Solo texto azul

2. **Enlaces Inactivos**:
   - **Navbar**: Texto gris que cambia a blanco al pasar el ratón
   - **Sidebar**: Texto gris que cambia a blanco al pasar el ratón
   - **Sidebar Móvil**: Texto gris que cambia a blanco al pasar el ratón

3. **Enlaces Especiales**:
   - **Administración**: Texto amarillo en negrita para destacarlo de los demás enlaces

## Componente VxvDropdown

El componente `VxvDropdown` proporciona menús desplegables para la navegación:

### Props Principales

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `position` | `String` | Posición del menú desplegable (bottom-right, bottom-left, etc.) |
| `triggerClass` | `String` | Clase CSS para el elemento que activa el menú |
| `menuClass` | `String` | Clase CSS para el menú desplegable |
| `closeOnClickOutside` | `Boolean` | Si el menú debe cerrarse al hacer clic fuera |
| `closeOnEsc` | `Boolean` | Si el menú debe cerrarse al presionar Escape |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `open` | Se emite cuando el menú se abre |
| `close` | Se emite cuando el menú se cierra |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `trigger` | Elemento que activa el menú desplegable |
| `default` | Contenido del menú desplegable |

### Ejemplo de Uso

```vue
<VxvDropdown position="bottom-left">
  <template #trigger>
    <div class="flex items-center text-base font-medium cursor-pointer px-3 py-1">
      Piloto
      <svg class="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
  </template>

  <VxvDropdownItem to="/pilot/overview" label="Vista General" />
  <VxvDropdownItem to="/pilot/skills" label="Habilidades" />
</VxvDropdown>
```

## Componente VxvDropdownItem

El componente `VxvDropdownItem` representa un elemento dentro de un menú desplegable:

### Props Principales

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `to` | `String/Object` | Ruta de destino para el enlace |
| `href` | `String` | URL para enlaces externos |
| `label` | `String` | Texto del elemento |
| `icon` | `Object/Function` | Componente de icono opcional |
| `disabled` | `Boolean` | Si el elemento está deshabilitado |
| `className` | `String` | Clase CSS adicional |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `click` | Se emite cuando se hace clic en el elemento |

### Comportamiento

- Al hacer clic en un elemento del menú desplegable, el menú se cierra automáticamente
- Si el elemento tiene una propiedad `to`, se navega a la ruta especificada
- Si el elemento tiene una propiedad `href`, se navega a la URL especificada
- Si el elemento no tiene ni `to` ni `href`, se comporta como un botón

### Ejemplo de Uso

```vue
<VxvDropdownItem to="/pilot/overview" label="Vista General" />
<VxvDropdownItem to="/pilot/skills" label="Habilidades" />
<VxvDropdownItem label="Cerrar Sesión" @click="logout" />
```

## Componente VxvSidebarGroup

El componente `VxvSidebarGroup` agrupa enlaces relacionados bajo un título colapsable:

### Props Principales

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `title` | `String` | Título del grupo |
| `basePath` | `String` | Ruta base para determinar si el grupo está activo |
| `additionalPaths` | `Array` | Rutas adicionales que activan este grupo |
| `isMobile` | `Boolean` | Indica si se está mostrando en la versión móvil |
| `isSidebarCollapsed` | `Boolean` | Indica si la barra lateral está colapsada |

### Lógica de Activación

Un grupo se considera activo si:
- La ruta actual coincide con la ruta base o comienza con ella
- La ruta actual coincide con alguna de las rutas adicionales

```javascript
const isActive = computed(() => {
  if (!props.basePath) return false;

  // Para rutas principales
  if (basePathSegments.length === 1) {
    return currentPathSegments.length > 0 &&
           currentPathSegments[0] === basePathSegments[0];
  }

  // Verificar ruta base
  const basePathMatch = route.path === props.basePath ||
                        route.path.startsWith(`${props.basePath}/`);
  if (basePathMatch) return true;

  // Verificar rutas adicionales
  return props.additionalPaths.some(path =>
    route.path === path || route.path.startsWith(`${path}/`)
  );
});
```

## Integración en la Aplicación

### Menú Principal (Navbar)

En el navbar, los enlaces principales ahora utilizan `VxvDropdown` para crear menús desplegables:

```vue
<VxvNavbar :links="navLinks" @mobile-menu-click="openMobileMenu">
  <!-- Otros elementos del navbar -->
</VxvNavbar>
```

El botón hamburguesa del navbar abre el sidebar móvil correspondiente según la ruta actual:

```javascript
// Métodos para el menú móvil
const openMobileMenu = () => {
  // Verificar si estamos en una ruta de administración
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    // Si estamos en una ruta de administración, abrir el sidebar del AdminLayout
    window.dispatchEvent(new CustomEvent('open-admin-sidebar'))
  } else {
    // Si no estamos en una ruta de administración, abrir el sidebar normal
    isMobileMenuOpen.value = true
  }
}
```

Donde `navLinks` es un array de objetos con la siguiente estructura:

```javascript
const navLinks = [
  {
    to: '/pilot',
    label: 'Piloto',
    exact: false,
    children: [
      { to: '/pilot/overview', label: 'Vista General' },
      { to: '/pilot/skills', label: 'Habilidades' }
    ]
  },
  {
    to: '/universe',
    label: 'Universo',
    exact: false,
    children: [
      { to: '/universe/galaxy', label: 'Galaxia' },
      { to: '/universe/solar-system', label: 'Sistema Solar' }
    ]
  },
  { to: '/market', label: 'Mercado' },
  { to: '/ships', label: 'Naves' }
];
```

Los enlaces con `children` se muestran como menús desplegables, mientras que los enlaces sin `children` se muestran como enlaces normales.

### Sidebar Móvil

En el sidebar móvil, los grupos utilizan `VxvSidebarGroup` y los enlaces utilizan `VxvNavLink`:

```vue
<VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/pilot">
  <VxvNavLink
    to="/pilot/overview"
    label="Vista General"
    :is-mobile="true"
    active-class="text-blue-400"
  />
</VxvSidebarGroup>
```

Los grupos muestran fondo gris cuando están activos, mientras que los enlaces dentro de los grupos muestran el texto en azul cuando están activos.

## Estructura de URLs

La estructura de URLs en VAXAV sigue un patrón jerárquico:

```
/{seccion}/{subseccion}
```

Ejemplos:
- `/pilot/overview`: Vista general del piloto
- `/pilot/skills`: Habilidades del piloto
- `/universe/galaxy`: Vista de la galaxia
- `/universe/solar-system`: Vista de sistema solar

Esta estructura se refleja en el sistema de navegación, donde:
- Los enlaces principales corresponden a las secciones (`/pilot`, `/universe`)
- Los enlaces secundarios corresponden a las subsecciones (`/pilot/overview`, `/universe/galaxy`)

## Mejores Prácticas

1. **Uso de Menús Desplegables**: Utiliza `VxvDropdown` para agrupar enlaces relacionados en el navbar
2. **Uso de activeClass**: Personaliza la apariencia de los enlaces activos mediante la propiedad `activeClass`
3. **Consistencia Visual**: Mantén una apariencia consistente en toda la aplicación
4. **Estructura Jerárquica**: Organiza los enlaces de manera lógica y jerárquica
5. **Prueba de Navegación**: Verifica que los enlaces se activen correctamente en diferentes escenarios
6. **Simplicidad**: Mantén la lógica de activación simple y predecible

## Ejemplos de Uso

### Menú Principal con Dropdowns

```vue
<template>
  <VxvNavbar :links="navLinks" @mobile-menu-click="toggleSidebar">
    <!-- Acciones del usuario -->
    <template #actions>
      <VxvDropdown menuClass="w-40">
        <template #trigger>
          <VxvButton variant="secondary" size="md">
            {{ user.name }}
            <template #icon-right>
              <ChevronDownIcon class="h-4 w-4" />
            </template>
          </VxvButton>
        </template>

        <VxvDropdownItem label="Perfil" to="/profile" />
        <VxvDropdownItem label="Cerrar Sesión" @click="logout" />
      </VxvDropdown>
    </template>
  </VxvNavbar>
</template>

<script setup>
const navLinks = computed(() => {
  const links = [
    {
      to: '/pilot',
      label: 'Piloto',
      exact: false,
      children: [
        { to: '/pilot/overview', label: 'Vista General' },
        { to: '/pilot/skills', label: 'Habilidades' }
      ]
    },
    {
      to: '/universe',
      label: 'Universo',
      exact: false,
      children: [
        { to: '/universe/galaxy', label: 'Galaxia' },
        { to: '/universe/solar-system', label: 'Sistema Solar' }
      ]
    },
    { to: '/market', label: 'Mercado' },
    { to: '/ships', label: 'Naves' }
  ];

  // Añadir enlace de administración si el usuario es moderador
  if (isModerator.value) {
    links.push({
      to: '/admin',
      label: 'Administración',
      className: 'font-bold text-yellow-400 hover:text-yellow-300'
    });
  }

  return links;
});
</script>
```

### Sidebar Móvil

```vue
<div
  v-if="isMobileMenuOpen"
  class="fixed inset-0 z-50 md:hidden mobile-sidebar-container"
  @click="closeMobileMenu"
>
  <div
    class="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out border-r border-gray-700 z-10"
    :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    @click.stop
  >
    <VxvSidebar
      title="VAXAV"
      :collapsible="false"
      :is-mobile="true"
      @close="closeMobileMenu"
    >
      <VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/pilot">
        <VxvNavLink
          v-for="item in pilotMenuItems"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :exact="item.exact"
          :is-mobile="true"
          active-class="text-blue-400"
        />
      </VxvSidebarGroup>

      <!-- Otros grupos y enlaces -->
    </VxvSidebar>
  </div>
</div>
```

## Conclusión

El sistema de navegación de VAXAV proporciona una experiencia de usuario coherente y flexible, adaptándose a diferentes contextos y dispositivos. La combinación de `VxvNavLink`, `VxvDropdown` y `VxvSidebarGroup` permite crear menús jerárquicos con estados activos claros y consistentes.

El nuevo diseño con menús desplegables en el navbar mejora la experiencia de usuario al:

1. **Reducir el espacio ocupado**: Los menús desplegables permiten mostrar más opciones sin ocupar espacio horizontal adicional.
2. **Mejorar la organización**: Las opciones relacionadas se agrupan de manera lógica y jerárquica.
3. **Simplificar la navegación**: La lógica de activación es más simple y predecible.
4. **Mantener la coherencia visual**: Los enlaces activos se muestran de manera consistente en toda la aplicación.

Este sistema de navegación es fácilmente extensible y puede adaptarse a nuevas secciones y subsecciones a medida que la aplicación crece.
