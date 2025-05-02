# Componentes de Layout

Los componentes de layout proporcionan estructuras para organizar el contenido de la aplicación, como títulos de página, barras de estado, contenedores, etc.

## VxvPageTitle

El componente `VxvPageTitle` es una versión mejorada del `BasePageTitle` que incluye soporte para menús de navegación secundarios. Este componente solo se muestra cuando hay un usuario autenticado con un piloto creado.

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | Requerido | Título de la página |
| `showMobileMenuButton` | `Boolean` | `true` | Si se debe mostrar el botón de menú móvil |
| `isMobile` | `Boolean` | `false` | Si la vista actual es móvil |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `breadcrumbs` | Contenido del breadcrumb |
| `menu` | Menús de navegación secundarios |

### Eventos

| Nombre | Descripción |
|--------|-------------|
| `mobile-menu-click` | Se emite cuando se hace clic en el botón de menú móvil |

### Ejemplo de Uso

```vue
<VxvPageTitle
  title="Detalles de Usuario"
  @mobile-menu-click="openMobileMenu"
>
  <template #breadcrumbs>
    <VxvBreadcrumb :items="breadcrumbItems" />
  </template>
  <template #menu>
    <VxvNavLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :exact="item.exact"
      simple
      horizontal
    />
  </template>
</VxvPageTitle>
```

## VxvStatusBar

El componente `VxvStatusBar` es una barra de estado que se coloca encima del footer y es visible solo cuando hay un usuario autenticado con un piloto creado. Permanece fija en la parte inferior de la pantalla mientras se hace scroll, pero se acopla automáticamente encima del footer cuando este es visible. Proporciona un espacio para mostrar información de estado y un cronómetro de acción en el centro.

### Props

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `showActionTimer` | `Boolean` | `true` | Si se debe mostrar el cronómetro de acción en el centro |
| `timerDuration` | `Number` | `60` | Duración total del cronómetro en segundos |
| `timerRemainingTime` | `Number` | `null` | Tiempo restante en segundos. Si es null, se usa `timerDuration` |
| `timerAction` | `String` | `'Cargando...'` | Texto que describe la acción en curso |
| `timerIsActive` | `Boolean` | `true` | Si el cronómetro está activo y contando |

### Slots

| Nombre | Descripción |
|--------|-------------|
| `left` | Contenido para la sección izquierda de la barra de estado |
| `center` | Contenido para la sección central (reemplaza el cronómetro de acción si se proporciona) |
| `right` | Contenido para la sección derecha de la barra de estado |

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `timer-complete` | - | Se emite cuando el cronómetro llega a cero |
| `update:timer-remaining-time` | `(time: number)` | Se emite cuando cambia el tiempo restante |

### Ejemplo de Uso

```vue
<VxvStatusBar
  :timer-duration="timerDuration"
  :timer-remaining-time="timerRemainingTime"
  :timer-action="timerAction"
  :timer-is-active="timerIsActive"
  @timer-complete="onTimerComplete"
  @update:timer-remaining-time="updateTimerRemainingTime"
>
  <!-- Contenido personalizado para la sección izquierda -->
  <template #left>
    <div class="status-item">
      <span class="status-label">Créditos:</span>
      <span class="status-value">1,250,000 ISK</span>
    </div>
  </template>

  <!-- Contenido personalizado para la sección derecha -->
  <template #right>
    <div class="status-item">
      <span class="status-label">Sistema:</span>
      <span class="status-value">Alpha Centauri</span>
    </div>
  </template>
</VxvStatusBar>
```

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
