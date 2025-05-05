# VxvPageTitle

El componente `VxvPageTitle` proporciona un encabezado de página con título, menú secundario opcional y soporte para migas de pan (breadcrumbs), adaptándose a diferentes tamaños de pantalla.

## Importación

```javascript
import VxvPageTitle from '@/components/ui/layout/VxvPageTitle.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | - | Título de la página (requerido) |
| `showMobileMenuButton` | `Boolean` | `true` | Si se debe mostrar el botón de menú móvil |
| `isMobile` | `Boolean` | `false` | Si la vista actual está en modo móvil |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `mobile-menu-click` | - | Se emite cuando se hace clic en el botón de menú móvil |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `menu` | Contenido para el menú secundario |
| `breadcrumbs` | Contenido para las migas de pan |

## Ejemplos de Uso

### Título de página básico

```vue
<VxvPageTitle title="Dashboard" />
```

### Título de página con menú secundario

```vue
<VxvPageTitle title="Usuarios">
  <template #menu>
    <VxvButton size="sm" variant="primary">Añadir Usuario</VxvButton>
    <VxvButton size="sm" variant="secondary">Exportar</VxvButton>
  </template>
</VxvPageTitle>
```

### Título de página con migas de pan

```vue
<VxvPageTitle title="Detalles de Usuario">
  <template #breadcrumbs>
    <VxvBreadcrumb>
      <VxvBreadcrumbItem to="/dashboard">Dashboard</VxvBreadcrumbItem>
      <VxvBreadcrumbItem to="/users">Usuarios</VxvBreadcrumbItem>
      <VxvBreadcrumbItem>Detalles</VxvBreadcrumbItem>
    </VxvBreadcrumb>
  </template>
</VxvPageTitle>
```

### Título de página completo

```vue
<VxvPageTitle 
  title="Editar Usuario" 
  :isMobile="isMobileView" 
  @mobile-menu-click="toggleMobileMenu"
>
  <template #menu>
    <VxvButton size="sm" variant="primary">Guardar</VxvButton>
    <VxvButton size="sm" variant="danger">Eliminar</VxvButton>
    <VxvButton size="sm" variant="secondary">Cancelar</VxvButton>
  </template>
  <template #breadcrumbs>
    <VxvBreadcrumb>
      <VxvBreadcrumbItem to="/dashboard">Dashboard</VxvBreadcrumbItem>
      <VxvBreadcrumbItem to="/users">Usuarios</VxvBreadcrumbItem>
      <VxvBreadcrumbItem>Editar</VxvBreadcrumbItem>
    </VxvBreadcrumb>
  </template>
</VxvPageTitle>
```

## Notas de Uso

- El componente se adapta automáticamente a diferentes tamaños de pantalla.
- En pantallas grandes (md y superiores), el menú secundario se muestra en la misma línea que el título.
- En pantallas pequeñas, el menú secundario se muestra debajo del título si `isMobile` es `true`.
- El botón de menú móvil solo se muestra en pantallas pequeñas y cuando `showMobileMenuButton` es `true`.
- Las migas de pan se muestran debajo del título, independientemente del tamaño de la pantalla.
- Si no hay menú secundario ni migas de pan, el componente solo muestra el título.
- El componente tiene un borde inferior para separarlo visualmente del contenido de la página.
- Para que el menú secundario se muestre correctamente en dispositivos móviles, es necesario establecer la propiedad `isMobile` según el estado de la aplicación.
- El evento `mobile-menu-click` se puede utilizar para mostrar/ocultar un menú lateral en dispositivos móviles.
