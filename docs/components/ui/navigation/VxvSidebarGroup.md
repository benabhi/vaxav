# VxvSidebarGroup

El componente `VxvSidebarGroup` proporciona un grupo de navegación colapsable para usar dentro de una barra lateral, con soporte para estado activo basado en la ruta actual.

## Importación

```javascript
import VxvSidebarGroup from '@/components/ui/navigation/VxvSidebarGroup.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | - | Título del grupo (requerido) |
| `defaultCollapsed` | `Boolean` | `false` | Si el grupo debe estar colapsado inicialmente |
| `isSidebarCollapsed` | `Boolean` | `false` | Si la barra lateral está colapsada |
| `isMobile` | `Boolean` | `false` | Si la vista está en modo móvil |
| `basePath` | `String` | `''` | Ruta base para determinar si el grupo está activo |
| `additionalPaths` | `Array<String>` | `[]` | Rutas adicionales que activan este grupo |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido del grupo (normalmente enlaces de navegación) |
| `icon` | Icono personalizado para mostrar cuando la barra lateral está colapsada |

## Ejemplos de Uso

### Grupo de navegación básico

```vue
<VxvSidebarGroup title="Administración" basePath="/admin">
  <VxvNavLink to="/admin/usuarios" icon="users">Usuarios</VxvNavLink>
  <VxvNavLink to="/admin/roles" icon="shield-check">Roles</VxvNavLink>
  <VxvNavLink to="/admin/permisos" icon="key">Permisos</VxvNavLink>
</VxvSidebarGroup>
```

### Grupo con rutas adicionales

```vue
<VxvSidebarGroup 
  title="Configuración" 
  basePath="/configuracion" 
  :additionalPaths="['/perfil/preferencias', '/sistema/ajustes']"
>
  <VxvNavLink to="/configuracion/general" icon="cog">General</VxvNavLink>
  <VxvNavLink to="/configuracion/notificaciones" icon="bell">Notificaciones</VxvNavLink>
  <VxvNavLink to="/perfil/preferencias" icon="user-circle">Preferencias</VxvNavLink>
  <VxvNavLink to="/sistema/ajustes" icon="adjustments">Ajustes del sistema</VxvNavLink>
</VxvSidebarGroup>
```

### Grupo con icono personalizado

```vue
<VxvSidebarGroup 
  title="Reportes" 
  basePath="/reportes" 
  :isSidebarCollapsed="sidebarCollapsed"
>
  <template #icon>
    <svg class="h-5 w-5 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
  </template>
  
  <VxvNavLink to="/reportes/ventas" icon="chart-bar">Ventas</VxvNavLink>
  <VxvNavLink to="/reportes/usuarios" icon="users">Usuarios</VxvNavLink>
  <VxvNavLink to="/reportes/actividad" icon="clock">Actividad</VxvNavLink>
</VxvSidebarGroup>
```

### Uso en una barra lateral

```vue
<VxvSidebar :collapsed="sidebarCollapsed" :is-mobile="isMobileView">
  <VxvSidebarGroup 
    title="Dashboard" 
    basePath="/dashboard" 
    :isSidebarCollapsed="sidebarCollapsed" 
    :isMobile="isMobileView"
  >
    <VxvNavLink to="/dashboard" icon="home">Inicio</VxvNavLink>
    <VxvNavLink to="/dashboard/estadisticas" icon="chart-pie">Estadísticas</VxvNavLink>
  </VxvSidebarGroup>
  
  <VxvSidebarGroup 
    title="Usuarios" 
    basePath="/usuarios" 
    :isSidebarCollapsed="sidebarCollapsed" 
    :isMobile="isMobileView"
  >
    <VxvNavLink to="/usuarios" icon="users">Lista</VxvNavLink>
    <VxvNavLink to="/usuarios/nuevo" icon="user-add">Nuevo Usuario</VxvNavLink>
  </VxvSidebarGroup>
</VxvSidebar>
```

## Comportamiento

El componente `VxvSidebarGroup` tiene varios comportamientos inteligentes:

1. **Expansión automática**: Si la ruta actual coincide con `basePath` o alguna de las rutas en `additionalPaths`, el grupo se expande automáticamente.

2. **Resaltado activo**: El grupo se resalta visualmente cuando está activo (cuando la ruta actual coincide con alguna de sus rutas).

3. **Adaptación a barra lateral colapsada**: Cuando la barra lateral está colapsada, solo se muestra el icono del grupo.

4. **Modo móvil**: En modo móvil, el grupo siempre se muestra expandido cuando está activo, independientemente del estado de colapso de la barra lateral.

## Notas de Uso

- Utiliza este componente dentro de `VxvSidebar` para organizar los enlaces de navegación en grupos lógicos.
- El componente está diseñado para trabajar con `VxvNavLink` como elementos hijos.
- Para determinar si un grupo está activo, proporciona la `basePath` que corresponde a la sección de la aplicación.
- Si tienes enlaces que deberían activar el grupo pero no comparten la misma ruta base, utiliza `additionalPaths`.
- El componente es compatible con Storybook y maneja correctamente los casos donde `useRoute()` no está disponible.
- Para una mejor experiencia de usuario, mantén los grupos de navegación concisos y agrupa los enlaces relacionados.
