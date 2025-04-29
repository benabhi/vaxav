# Componentes de Navegación

Los componentes de navegación proporcionan interfaces para la navegación dentro de la aplicación, como barras laterales, enlaces de navegación y grupos de navegación.

## BaseSidebar

`BaseSidebar` es un componente que proporciona una barra lateral para la navegación.

**Archivo**: `/components/ui/navigation/BaseSidebar.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `''` | Título opcional para la barra lateral |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal de la barra lateral (normalmente elementos de navegación) |

### Ejemplo de Uso

```vue
<BaseSidebar title="Panel Admin">
  <BaseSidebarGroup title="Gestión de Usuarios">
    <BaseNavLink to="/admin/users" label="Usuarios" />
    <BaseNavLink to="/admin/roles" label="Roles" />
  </BaseSidebarGroup>

  <BaseNavLink to="/admin/settings" label="Configuración" />
</BaseSidebar>
```

## BaseSidebarGroup

`BaseSidebarGroup` es un componente que agrupa elementos de navegación bajo un título colapsable.

**Archivo**: `/components/ui/navigation/BaseSidebarGroup.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | Requerido | Título del grupo |
| `defaultCollapsed` | `Boolean` | `false` | Si el grupo debe estar colapsado por defecto |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Elementos de navegación dentro del grupo |

### Ejemplo de Uso

```vue
<BaseSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
  <BaseNavLink to="/admin/users" label="Usuarios" />
  <BaseNavLink to="/admin/roles" label="Roles" />
</BaseSidebarGroup>
```

## BaseNavLink

`BaseNavLink` es un componente que proporciona un enlace de navegación estilizado que se integra con vue-router.

**Archivo**: `/components/ui/navigation/BaseNavLink.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `to` | `String` | Requerido | Ruta de destino para el enlace |
| `label` | `String` | Requerido | Texto del enlace |
| `icon` | `Object/Function` | `null` | Componente de icono opcional |
| `exact` | `Boolean` | `false` | Si la ruta debe coincidir exactamente para considerarse activa |
| `activeClass` | `String` | `'bg-gray-700 text-blue-400'` | Clase CSS aplicada cuando el enlace está activo |
| `inactiveClass` | `String` | `'text-gray-300 hover:bg-gray-700 hover:text-white'` | Clase CSS aplicada cuando el enlace está inactivo |
| `activeIconClass` | `String` | `'text-blue-400'` | Clase CSS aplicada al icono cuando el enlace está activo |
| `inactiveIconClass` | `String` | `'text-gray-400'` | Clase CSS aplicada al icono cuando el enlace está inactivo |
| `className` | `String` | `''` | Clases CSS adicionales para el enlace |

### Ejemplo de Uso

```vue
<BaseNavLink
  to="/admin/users"
  label="Usuarios"
  :icon="UserIcon"
/>
```

Con clases personalizadas:

```vue
<BaseNavLink
  to="/admin/settings"
  label="Configuración"
  :icon="CogIcon"
  activeClass="bg-blue-600 text-white"
  inactiveClass="text-gray-400 hover:text-white"
  className="font-bold"
/>
```

## BaseBreadcrumb

`BaseBreadcrumb` es un componente que muestra una ruta de navegación jerárquica (breadcrumb) para indicar la ubicación actual del usuario dentro de la aplicación.

**Archivo**: `/components/ui/navigation/BaseBreadcrumb.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `items` | `Array` | Requerido | Array de elementos del breadcrumb. Cada elemento debe tener una propiedad `text` y opcionalmente una propiedad `to` para el enlace |
| `homeLink` | `String` | `'/'` | Ruta para el icono de inicio |
| `homeText` | `String` | `'Inicio'` | Texto para el icono de inicio (para lectores de pantalla) |

### Ejemplo de Uso

```vue
<BaseBreadcrumb
  :items="[
    { text: 'Administración', to: '/admin' },
    { text: 'Usuarios' }
  ]"
/>
```

Con enlace de inicio personalizado:

```vue
<BaseBreadcrumb
  :items="[
    { text: 'Usuarios' }
  ]"
  homeLink="/admin"
  homeText="Panel de Administración"
/>
```

## Uso en el Layout de Administración

Estos componentes se utilizan en el layout de administración para proporcionar una barra lateral de navegación y breadcrumbs:

```vue
<!-- Sidebar -->
<BaseSidebar title="Panel Admin">
  <BaseSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
    <BaseNavLink to="/admin/users" label="Usuarios" />
    <BaseNavLink to="/admin/roles" label="Roles" />
  </BaseSidebarGroup>

  <BaseNavLink to="/admin/settings" label="Configuración" />
</BaseSidebar>

<!-- Breadcrumbs -->
<BaseBreadcrumb
  :items="[
    { text: 'Usuarios' }
  ]"
  homeLink="/admin"
/>
```

## Uso en el Header Principal

El componente `BaseNavLink` también puede utilizarse en el header principal para los enlaces de navegación:

```vue
<nav class="flex space-x-4">
  <BaseNavLink
    to="/"
    label="Dashboard"
    activeClass="text-blue-400"
    inactiveClass="text-gray-300 hover:text-white"
  />
  <BaseNavLink
    to="/universe"
    label="Universo"
    activeClass="text-blue-400"
    inactiveClass="text-gray-300 hover:text-white"
  />
</nav>
```

## Mejores Prácticas

1. **Estructura Jerárquica**: Utiliza `BaseSidebarGroup` para agrupar enlaces relacionados bajo un título descriptivo.
2. **Iconos Consistentes**: Si utilizas iconos, mantén un estilo consistente en toda la aplicación.
3. **Estados Activos Claros**: Asegúrate de que los enlaces activos sean claramente distinguibles de los inactivos.
4. **Navegación Intuitiva**: Organiza los enlaces de navegación de manera lógica e intuitiva.
5. **Accesibilidad**: Asegúrate de que la navegación sea accesible para todos los usuarios, incluyendo aquellos que utilizan lectores de pantalla.
6. **Breadcrumbs Claros**: Utiliza `BaseBreadcrumb` para proporcionar una ruta de navegación clara y consistente en toda la aplicación.

## Personalización

Estos componentes pueden ser personalizados mediante props y clases CSS adicionales. Por ejemplo:

- `BaseSidebar` puede tener un título personalizado o ningún título.
- `BaseSidebarGroup` puede estar colapsado o expandido por defecto.
- `BaseNavLink` puede tener diferentes estilos para los estados activo e inactivo, así como iconos personalizados.
- `BaseBreadcrumb` puede tener un enlace de inicio personalizado y elementos con o sin enlaces.
