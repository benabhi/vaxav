# VxvSidebar

El componente `VxvSidebar` es una barra lateral de navegación que se utiliza principalmente en el layout de administración. Proporciona una navegación jerárquica con soporte para grupos de enlaces y es completamente responsive.

## Características

- **Diseño sencillo**: Barra lateral con ancho fijo y diseño limpio
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Móvil**: En pantallas pequeñas, se muestra como un menú lateral deslizable
- **Grupos**: Soporta agrupación de enlaces con títulos colapsables
- **Opcionalmente colapsable**: Puede habilitarse la funcionalidad de colapso si se desea

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| title | String | `''` | Título de la barra lateral |
| collapsible | Boolean | `true` | Si la barra lateral puede colapsarse |
| defaultCollapsed | Boolean | `false` | Si la barra lateral debe estar colapsada por defecto |
| isMobile | Boolean | `false` | Si la barra lateral está en modo móvil |
| className | String | `''` | Clases CSS adicionales |

## Eventos

| Nombre | Descripción |
|--------|-------------|
| collapse | Se emite cuando la barra lateral se colapsa |
| expand | Se emite cuando la barra lateral se expande |
| close | Se emite cuando se cierra la barra lateral móvil |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido de la barra lateral (enlaces y grupos) |
| collapsedIcon | Icono personalizado para mostrar cuando la barra lateral está colapsada |

## Componentes Relacionados

### VxvSidebarGroup

El componente `VxvSidebarGroup` se utiliza dentro de `VxvSidebar` para agrupar enlaces relacionados bajo un título colapsable.

#### Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| title | String | Requerido | Título del grupo |
| defaultCollapsed | Boolean | `false` | Si el grupo debe estar colapsado por defecto |
| isSidebarCollapsed | Boolean | `false` | Si la barra lateral está colapsada |
| isMobile | Boolean | `false` | Si la barra lateral está en modo móvil |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| default | Enlaces dentro del grupo |
| icon | Icono personalizado para mostrar cuando la barra lateral está colapsada |

### VxvNavLink

El componente `VxvNavLink` se utiliza dentro de `VxvSidebar` o `VxvSidebarGroup` para crear enlaces de navegación.

#### Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| to | String | Requerido | Ruta de destino |
| label | String | Requerido | Texto del enlace |
| icon | Object/Function | `null` | Componente de icono |
| exact | Boolean | `false` | Si la ruta debe coincidir exactamente |
| horizontal | Boolean | `false` | Si el enlace debe mostrarse horizontalmente |
| activeClass | String | `'bg-gray-700 text-blue-400'` | Clases CSS para el enlace activo |
| inactiveClass | String | `'text-gray-300 hover:text-white'` | Clases CSS para el enlace inactivo |
| activeIconClass | String | `'text-blue-400'` | Clases CSS para el icono del enlace activo |
| inactiveIconClass | String | `'text-gray-400'` | Clases CSS para el icono del enlace inactivo |
| className | String | `''` | Clases CSS adicionales |
| isSidebarCollapsed | Boolean | `false` | Si la barra lateral está colapsada |
| isMobile | Boolean | `false` | Si la barra lateral está en modo móvil |

## Ejemplos de Uso

### Uso Básico

```vue
<VxvSidebar title="Panel Admin">
  <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />
  <VxvNavLink to="/settings" label="Configuración" :icon="CogIcon" />
</VxvSidebar>
```

### Con Grupos

```vue
<VxvSidebar title="Panel Admin">
  <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />

  <VxvSidebarGroup title="Gestión de Usuarios">
    <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
    <VxvNavLink to="/roles" label="Roles" :icon="UserGroupIcon" />
  </VxvSidebarGroup>

  <VxvNavLink to="/settings" label="Configuración" :icon="CogIcon" />
</VxvSidebar>
```

### Sidebar Colapsable

```vue
<VxvSidebar
  title="Panel Admin"
  :collapsible="true"
  :default-collapsed="isSidebarCollapsed"
  :is-mobile="false"
  @collapse="handleSidebarCollapse"
  @expand="handleSidebarExpand"
>
  <VxvNavLink
    to="/dashboard"
    label="Dashboard"
    :icon="HomeIcon"
    :is-sidebar-collapsed="isSidebarCollapsed"
    :is-mobile="false"
  />

  <VxvSidebarGroup
    title="Gestión de Usuarios"
    :is-sidebar-collapsed="isSidebarCollapsed"
    :is-mobile="false"
  >
    <VxvNavLink
      to="/users"
      label="Usuarios"
      :icon="UsersIcon"
      :is-sidebar-collapsed="isSidebarCollapsed"
      :is-mobile="false"
    />
    <VxvNavLink
      to="/roles"
      label="Roles"
      :icon="UserGroupIcon"
      :is-sidebar-collapsed="isSidebarCollapsed"
      :is-mobile="false"
    />
  </VxvSidebarGroup>
</VxvSidebar>
```

### Sidebar Móvil

```vue
<VxvSidebar
  title="Panel Admin"
  :collapsible="false"
  :is-mobile="true"
  @close="closeMobileMenu"
>
  <VxvNavLink
    to="/dashboard"
    label="Dashboard"
    :icon="HomeIcon"
    :is-sidebar-collapsed="false"
    :is-mobile="true"
  />

  <VxvSidebarGroup
    title="Gestión de Usuarios"
    :is-sidebar-collapsed="false"
    :is-mobile="true"
  >
    <VxvNavLink
      to="/users"
      label="Usuarios"
      :icon="UsersIcon"
      :is-sidebar-collapsed="false"
      :is-mobile="true"
    />
  </VxvSidebarGroup>
</VxvSidebar>
```

## Implementación en AdminLayout

El componente `VxvSidebar` se utiliza en el layout de administración para proporcionar navegación. En pantallas grandes, se muestra como una barra lateral fija con ancho constante. En pantallas pequeñas, se oculta y se puede mostrar como un menú deslizable.

```vue
<template>
  <div class="flex min-h-full">
    <!-- Sidebar para pantallas grandes -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 hidden lg:block">
      <VxvSidebar
        title="Panel Admin"
        :collapsible="false"
        :is-mobile="false"
      >
        <!-- Contenido del sidebar -->
        <VxvSidebarGroup title="Gestión de Usuarios">
          <VxvNavLink to="/admin/users" label="Usuarios" />
          <VxvNavLink to="/admin/roles" label="Roles" />
        </VxvSidebarGroup>

        <VxvNavLink to="/admin/settings" label="Configuración" />
      </VxvSidebar>
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1">
      <!-- Header con botón de menú móvil -->
      <VxvPageTitle
        :title="title"
        @mobile-menu-click="openMobileMenu"
      />

      <!-- Contenido -->
      <main class="p-4">
        <!-- Contenido de la página -->
      </main>
    </div>

    <!-- Sidebar móvil (overlay) -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 lg:hidden">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="closeMobileMenu"></div>

      <!-- Sidebar móvil -->
      <div class="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg transform transition-transform">
        <VxvSidebar
          title="Panel Admin"
          :collapsible="false"
          :is-mobile="true"
          @close="closeMobileMenu"
        >
          <!-- Contenido del sidebar móvil -->
          <VxvSidebarGroup title="Gestión de Usuarios">
            <VxvNavLink to="/admin/users" label="Usuarios" />
            <VxvNavLink to="/admin/roles" label="Roles" />
          </VxvSidebarGroup>

          <VxvNavLink to="/admin/settings" label="Configuración" />
        </VxvSidebar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado del menú móvil
const isMobileMenuOpen = ref(false);

// Controles del menú móvil
const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>
```

## Notas de Implementación

1. **Diseño sencillo**: El sidebar tiene un ancho fijo de 16rem (64px) y un diseño limpio sin iconos.
2. **Responsive**: El sidebar se oculta automáticamente en pantallas pequeñas y se muestra como un menú deslizable.
3. **Opcionalmente colapsable**: La funcionalidad de colapso está disponible pero deshabilitada por defecto.
4. **Accesibilidad**: Se incluyen atributos ARIA y mensajes de screen reader para mejorar la accesibilidad.
5. **Animaciones**: Se utilizan transiciones suaves para mejorar la experiencia de usuario en el modo móvil.
