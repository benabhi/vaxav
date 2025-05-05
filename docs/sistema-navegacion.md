# Sistema de Navegación en VAXAV

Este documento describe el sistema de navegación implementado en VAXAV, explicando cómo funcionan los componentes `VxvNavLink` y `VxvSidebarGroup` y cómo se integran para crear una experiencia de navegación coherente.

## Estructura de Componentes

El sistema de navegación de VAXAV se compone principalmente de los siguientes componentes:

1. **VxvNavLink**: Componente base para enlaces de navegación
2. **VxvSidebarGroup**: Componente para agrupar enlaces relacionados
3. **VxvNavbar**: Barra de navegación principal
4. **VxvPageTitle**: Título de página con navegación secundaria

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
| `pageNav` | `Boolean` | Indica si es un enlace de navegación secundaria |
| `parentSegment` | `String` | Segmento principal al que pertenece (ej: 'pilot', 'universe') |
| `isMobile` | `Boolean` | Indica si se está mostrando en la versión móvil |
| `isSidebarCollapsed` | `Boolean` | Indica si la barra lateral está colapsada |

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

3. **Modo PageNav**: Enlace para navegación secundaria (en PageTitle)
   ```vue
   <VxvNavLink to="/pilot/overview" label="Vista General" pageNav parentSegment="pilot" />
   ```

### Lógica de Activación

La lógica para determinar si un enlace está activo es compleja y maneja varios casos:

1. **Enlaces de Página (pageNav)**:
   - Si `pageNav=true` y se proporciona `parentSegment`
   - Se considera activo si la ruta actual coincide exactamente o si estamos en la misma sección y subsección

2. **Enlaces Principales**:
   - Si es un enlace a una sección principal (como `/pilot`, `/universe`)
   - Se considera activo si la ruta actual comienza con el mismo segmento principal
   - También se considera activo si es un enlace a una vista principal (como `/pilot/overview`, `/universe/galaxy`)

3. **Otros Enlaces**:
   - Si `exact=true`, solo se considera activo si la ruta coincide exactamente
   - De lo contrario, se considera activo si la ruta actual comienza con la ruta del enlace

```javascript
// Ejemplo simplificado de la lógica de activación
const isActive = computed(() => {
  // Para enlaces de página (pageNav)
  if (props.pageNav && props.parentSegment) {
    if (route.path === props.to) return true;
    
    const currentPathSegments = route.path.split('/').filter(Boolean);
    if (currentPathSegments.length >= 2) {
      return currentPathSegments[0] === props.parentSegment && 
             currentPathSegments[1] === linkPathSegments[1];
    }
  }
  
  // Para enlaces principales
  if (!props.exact) {
    if (route.path === props.to) return true;
    
    if (linkPathSegments.length === 1 || 
        (linkPathSegments.length > 1 && 
         (linkPathSegments[1] === 'overview' || linkPathSegments[1] === 'galaxy'))) {
      return currentPathSegments[0] === linkPathSegments[0];
    }
  }
  
  // Para otras rutas
  return props.exact ? 
    route.path === props.to : 
    route.path === props.to || route.path.startsWith(`${props.to}/`);
});
```

### Estilos Condicionales

El componente aplica diferentes estilos según el modo y el estado:

1. **Enlaces Activos**:
   - **Navbar**: Fondo gris y texto azul
   - **PageNav**: Solo texto azul
   - **Sidebar Móvil**: Solo texto azul

2. **Enlaces Inactivos**:
   - **Navbar**: Texto gris que cambia a blanco al pasar el ratón
   - **PageNav**: Texto gris que cambia a blanco al pasar el ratón
   - **Sidebar Móvil**: Texto gris que cambia a blanco al pasar el ratón

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

En el navbar, los enlaces principales utilizan `VxvNavLink` con el estilo por defecto:

```vue
<VxvNavLink
  to="/pilot/overview"
  label="Piloto"
  :exact="false"
/>
```

Estos enlaces se consideran activos cuando se navega a cualquier ruta dentro de su sección.

### Menú Secundario (PageTitle)

En el PageTitle, los enlaces secundarios utilizan `VxvNavLink` con `pageNav=true`:

```vue
<VxvNavLink
  to="/pilot/skills"
  label="Habilidades"
  pageNav
  parentSegment="pilot"
/>
```

Estos enlaces solo muestran el texto en azul cuando están activos, sin fondo gris.

### Sidebar Móvil

En el sidebar móvil, los grupos utilizan `VxvSidebarGroup` y los enlaces utilizan `VxvNavLink`:

```vue
<VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/pilot">
  <VxvNavLink
    to="/pilot/overview"
    label="Vista General"
    :is-mobile="true"
    active-class=""
  />
</VxvSidebarGroup>
```

Los grupos muestran fondo gris y texto azul cuando están activos, mientras que los enlaces dentro de los grupos solo muestran el texto en azul.

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

1. **Uso de pageNav**: Utiliza `pageNav=true` para enlaces en el menú secundario (PageTitle)
2. **Uso de parentSegment**: Proporciona siempre `parentSegment` cuando uses `pageNav=true`
3. **Consistencia Visual**: Mantén una apariencia consistente en toda la aplicación
4. **Estructura Jerárquica**: Organiza los enlaces de manera lógica y jerárquica
5. **Prueba de Navegación**: Verifica que los enlaces se activen correctamente en diferentes escenarios

## Ejemplos de Uso

### Menú Principal

```vue
<VxvNavbar>
  <VxvNavLink to="/pilot/overview" label="Piloto" :exact="false" />
  <VxvNavLink to="/universe/galaxy" label="Universo" :exact="false" />
  <VxvNavLink to="/market" label="Mercado" />
  <VxvNavLink to="/ships" label="Naves" />
</VxvNavbar>
```

### Menú Secundario

```vue
<template #menu>
  <VxvNavLink
    v-for="item in pilotMenuItems"
    :key="item.to"
    :to="item.to"
    :label="item.label"
    :exact="item.exact"
    pageNav
    parentSegment="pilot"
    horizontal
  />
</template>
```

### Sidebar Móvil

```vue
<VxvSidebarGroup title="Piloto" :is-mobile="true" basePath="/pilot">
  <VxvNavLink
    v-for="item in pilotMenuItems"
    :key="item.to"
    :to="item.to"
    :label="item.label"
    :exact="item.exact"
    :is-mobile="true"
    active-class=""
  />
</VxvSidebarGroup>
```

## Conclusión

El sistema de navegación de VAXAV proporciona una experiencia de usuario coherente y flexible, adaptándose a diferentes contextos y dispositivos. La combinación de `VxvNavLink` y `VxvSidebarGroup` permite crear menús jerárquicos con estados activos claros y consistentes.
