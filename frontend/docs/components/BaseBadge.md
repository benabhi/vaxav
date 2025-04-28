# BaseBadge

El componente `BaseBadge` es un elemento visual que muestra etiquetas o indicadores con colores sólidos y texto blanco, ideal para mostrar estados, categorías o información concisa.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| variant | String | `'default'` | Variante de color del badge (default, primary, success, warning, danger, info, purple, blue, green, yellow, red, gray) |
| size | String | `'md'` | Tamaño del badge (sm, md, lg) |
| clickable | Boolean | `false` | Si es `true`, el badge se puede hacer clic y emitirá un evento `click` |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| click | - | Se emite cuando se hace clic en el badge (solo si `clickable` es `true`) |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido del badge |

## Ejemplos de uso

### Badge básico

```vue
<BaseBadge>Default</BaseBadge>
```

### Diferentes variantes

```vue
<BaseBadge variant="primary">Primary</BaseBadge>
<BaseBadge variant="success">Success</BaseBadge>
<BaseBadge variant="warning">Warning</BaseBadge>
<BaseBadge variant="danger">Danger</BaseBadge>
<BaseBadge variant="info">Info</BaseBadge>
<BaseBadge variant="purple">Purple</BaseBadge>
<BaseBadge variant="blue">Blue</BaseBadge>
<BaseBadge variant="green">Green</BaseBadge>
<BaseBadge variant="yellow">Yellow</BaseBadge>
<BaseBadge variant="red">Red</BaseBadge>
<BaseBadge variant="gray">Gray</BaseBadge>
```

### Diferentes tamaños

```vue
<BaseBadge size="sm">Small</BaseBadge>
<BaseBadge size="md">Medium</BaseBadge>
<BaseBadge size="lg">Large</BaseBadge>
```

### Badge clickeable

```vue
<BaseBadge clickable @click="handleClick">Click me</BaseBadge>
```

### Uso en una lista de elementos

```vue
<div class="flex flex-wrap gap-2">
  <BaseBadge 
    v-for="tag in tags" 
    :key="tag.id"
    :variant="tag.color"
    clickable
    @click="selectTag(tag)"
  >
    {{ tag.name }}
  </BaseBadge>
</div>
```

### Uso para mostrar estados

```vue
<BaseBadge variant="success">Activo</BaseBadge>
<BaseBadge variant="danger">Inactivo</BaseBadge>
<BaseBadge variant="warning">Pendiente</BaseBadge>
```

### Uso para mostrar roles de usuario

```vue
<BaseBadge variant="purple">Super Admin</BaseBadge>
<BaseBadge variant="blue">Administrador</BaseBadge>
<BaseBadge variant="green">Moderador</BaseBadge>
<BaseBadge variant="gray">Usuario</BaseBadge>
```

### Uso con contador

```vue
<BaseBadge variant="danger">{{ unreadMessages }} nuevos</BaseBadge>
```
