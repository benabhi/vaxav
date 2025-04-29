# Componentes de Layout

Los componentes de layout proporcionan estructuras para organizar el contenido de la aplicación, como títulos de página, contenedores, etc.

## BasePageTitle

`BasePageTitle` es un componente que muestra el título de una página y opcionalmente incluye un breadcrumb.

**Archivo**: `/components/ui/layout/BasePageTitle.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | Requerido | Título de la página |
| `showMobileMenuButton` | `Boolean` | `true` | Si se debe mostrar el botón de menú móvil |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `breadcrumbs` | Contenido del breadcrumb |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `mobile-menu-click` | Se emite cuando se hace clic en el botón de menú móvil |

### Ejemplo de Uso

```vue
<BasePageTitle
  title="Gestión de Usuarios"
  @mobile-menu-click="openMobileMenu"
>
  <template #breadcrumbs>
    <BaseBreadcrumb
      :items="[
        { text: 'Usuarios' }
      ]"
      homeLink="/admin"
    />
  </template>
</BasePageTitle>
```

## Uso en la Aplicación

El componente `BasePageTitle` se utiliza en el layout de administración para proporcionar un título de página consistente y un breadcrumb:

```vue
<BasePageTitle
  :title="title"
  @mobile-menu-click="openMobileMenu"
>
  <template #breadcrumbs>
    <slot name="breadcrumbs"></slot>
  </template>
</BasePageTitle>
```

## Mejores Prácticas

1. **Títulos Descriptivos**: Utiliza títulos descriptivos que indiquen claramente el propósito de la página.
2. **Breadcrumbs Claros**: Si utilizas breadcrumbs, asegúrate de que proporcionen una ruta de navegación clara y consistente.
3. **Consistencia Visual**: Mantén una consistencia visual en toda la aplicación utilizando este componente para todos los títulos de página.

## Personalización

El componente `BasePageTitle` puede ser personalizado mediante props y slots:

- Puedes mostrar u ocultar el botón de menú móvil con la prop `showMobileMenuButton`.
- Puedes personalizar el breadcrumb utilizando el slot `breadcrumbs`.
