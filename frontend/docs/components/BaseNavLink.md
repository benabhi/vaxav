# BaseNavLink

El componente `BaseNavLink` es un enlace de navegación que utiliza `router-link` de Vue Router y proporciona estilos consistentes para los enlaces de navegación en la aplicación.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| to | String | *Requerido* | Ruta de destino para el enlace |
| label | String | *Requerido* | Texto a mostrar en el enlace |
| icon | Object/Function | `null` | Componente de icono opcional |
| exact | Boolean | `false` | Si es `true`, la ruta debe coincidir exactamente para considerarse activa |
| horizontal | Boolean | `false` | Si es `true`, el enlace se mostrará con altura fija de 38px para coincidir con otros componentes de formulario |
| activeClass | String | `'bg-gray-700 text-blue-400'` | Clases CSS a aplicar cuando el enlace está activo |
| inactiveClass | String | `'text-gray-300 hover:text-white'` | Clases CSS a aplicar cuando el enlace está inactivo |
| activeIconClass | String | `'text-blue-400'` | Clases CSS a aplicar al icono cuando el enlace está activo |
| inactiveIconClass | String | `'text-gray-400'` | Clases CSS a aplicar al icono cuando el enlace está inactivo |
| className | String | `''` | Clases CSS adicionales para el enlace |

## Ejemplos de uso

### Enlace básico

```vue
<BaseNavLink to="/dashboard" label="Dashboard" />
```

### Enlace con icono

```vue
<BaseNavLink 
  to="/settings" 
  label="Configuración" 
  :icon="SettingsIcon"
/>
```

### Enlace horizontal (para barras de navegación)

```vue
<BaseNavLink 
  to="/profile" 
  label="Perfil" 
  :horizontal="true"
/>
```

### Enlace con clases personalizadas

```vue
<BaseNavLink 
  to="/messages" 
  label="Mensajes" 
  activeClass="bg-blue-600 text-white" 
  inactiveClass="text-gray-400 hover:text-blue-300"
/>
```

### Uso en menú lateral

```vue
<BaseSidebar title="Panel Admin">
  <BaseSidebarGroup title="Gestión de Usuarios">
    <BaseNavLink to="/admin/users" label="Usuarios" />
    <BaseNavLink to="/admin/roles" label="Roles" />
  </BaseSidebarGroup>
</BaseSidebar>
```

### Uso en barra de navegación horizontal

```vue
<nav class="flex space-x-4">
  <BaseNavLink 
    to="/" 
    label="Inicio" 
    :horizontal="true"
  />
  <BaseNavLink 
    to="/features" 
    label="Características" 
    :horizontal="true"
  />
  <BaseNavLink 
    to="/pricing" 
    label="Precios" 
    :horizontal="true"
  />
</nav>
```

## Notas de implementación

- Cuando se usa en menús horizontales (como la barra de navegación superior), añadir la propiedad `:horizontal="true"` para que tenga la misma altura que los componentes de formulario (38px).
- Cuando se usa en menús verticales (como el menú lateral), no añadir esta propiedad para mantener el comportamiento estándar.
- El componente detecta automáticamente si la ruta actual coincide con la ruta del enlace y aplica las clases activas o inactivas según corresponda.
