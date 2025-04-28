# Componentes de Botones

Los botones son componentes interactivos que permiten a los usuarios realizar acciones. Vaxav proporciona varios tipos de botones para diferentes contextos y necesidades.

## Componentes Disponibles

### BaseButton

`BaseButton` es el componente base para todos los botones en la aplicación. Proporciona funcionalidad básica y estilos que son heredados por otros componentes de botón.

**Archivo**: `/components/ui/buttons/BaseButton.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `variant` | `String` | `'primary'` | Variante visual del botón (`'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'info'`, `'ghost'`) |
| `size` | `String` | `'md'` | Tamaño del botón (`'sm'`, `'md'`, `'lg'`, `'xl'`) |
| `disabled` | `Boolean` | `false` | Si el botón está deshabilitado |
| `loading` | `Boolean` | `false` | Si el botón está en estado de carga |
| `fullWidth` | `Boolean` | `false` | Si el botón debe ocupar todo el ancho disponible |
| `rounded` | `Boolean` | `false` | Si el botón debe tener bordes completamente redondeados |
| `icon` | `Boolean` | `false` | Si el botón es solo un icono (forma circular) |
| `type` | `String` | `'button'` | Tipo de botón HTML (`'button'`, `'submit'`, `'reset'`) |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal del botón |
| `icon-left` | Icono a la izquierda del texto |
| `icon-right` | Icono a la derecha del texto |
| `loading` | Contenido personalizado para el estado de carga |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `click` | Se emite cuando se hace clic en el botón |

#### Ejemplos de Uso

**Botón Básico**:
```vue
<BaseButton>Botón Primario</BaseButton>
```

**Botón con Variante**:
```vue
<BaseButton variant="danger">Eliminar</BaseButton>
```

**Botón con Icono**:
```vue
<BaseButton>
  Guardar
  <template #icon-right>
    <SaveIcon class="w-4 h-4" />
  </template>
</BaseButton>
```

**Botón de Carga**:
```vue
<BaseButton :loading="isLoading" @click="submitForm">
  Enviar
</BaseButton>
```

### IconButton

`IconButton` es un componente especializado para botones que solo contienen un icono.

**Archivo**: `/components/ui/buttons/IconButton.vue`

#### Props

Hereda todas las props de `BaseButton` y añade:

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `tooltip` | `String` | `''` | Texto de tooltip para el botón |
| `tooltipPosition` | `String` | `'top'` | Posición del tooltip (`'top'`, `'right'`, `'bottom'`, `'left'`) |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Icono del botón |

#### Ejemplos de Uso

```vue
<IconButton variant="secondary" tooltip="Editar">
  <EditIcon class="w-5 h-5" />
</IconButton>
```

### LinkButton

`LinkButton` es un componente que se parece a un botón pero funciona como un enlace.

**Archivo**: `/components/ui/buttons/LinkButton.vue`

#### Props

Hereda todas las props de `BaseButton` y añade:

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `to` | `[String, Object]` | `''` | Destino del enlace (para router-link) |
| `href` | `String` | `''` | URL del enlace (para enlaces externos) |
| `target` | `String` | `'_self'` | Atributo target del enlace |

#### Ejemplos de Uso

```vue
<LinkButton to="/dashboard" variant="ghost">
  Dashboard
</LinkButton>

<LinkButton href="https://example.com" target="_blank" variant="secondary">
  Sitio Externo
</LinkButton>
```

## Guía de Estilos

### Colores

Los botones utilizan los siguientes colores según su variante:

- **Primary**: Azul principal de la marca (#3B82F6)
- **Secondary**: Gris neutro (#6B7280)
- **Danger**: Rojo para acciones destructivas (#EF4444)
- **Success**: Verde para acciones exitosas (#10B981)
- **Warning**: Amarillo para advertencias (#F59E0B)
- **Info**: Azul claro para información (#60A5FA)
- **Ghost**: Transparente con bordes sutiles

### Tamaños

Los botones tienen los siguientes tamaños:

- **Small (sm)**: Padding 0.5rem 1rem, texto sm
- **Medium (md)**: Padding 0.625rem 1.25rem, texto base
- **Large (lg)**: Padding 0.75rem 1.5rem, texto lg
- **Extra Large (xl)**: Padding 1rem 1.75rem, texto xl

### Estados

Los botones tienen los siguientes estados visuales:

- **Normal**: Estado predeterminado
- **Hover**: Cuando el cursor está sobre el botón
- **Focus**: Cuando el botón tiene el foco (por teclado)
- **Active**: Cuando se está presionando el botón
- **Disabled**: Cuando el botón está deshabilitado
- **Loading**: Cuando el botón está en estado de carga

## Mejores Prácticas

1. Usa `BaseButton` para la mayoría de los casos.
2. Usa `IconButton` para botones que solo contienen un icono.
3. Usa `LinkButton` para enlaces que deben parecer botones.
4. Usa la variante `primary` para la acción principal en un formulario o sección.
5. Usa la variante `danger` para acciones destructivas que requieren atención.
6. Proporciona siempre un estado de carga para acciones asíncronas.
7. Incluye texto descriptivo en los botones; evita términos ambiguos como "OK" o "Cancelar".
8. Para botones de solo icono, siempre proporciona un tooltip para accesibilidad.
