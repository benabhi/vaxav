# Componentes Documentados en Storybook

Este documento proporciona un resumen de los componentes que tienen documentación interactiva en Storybook.

## ¿Qué es Storybook?

Storybook es una herramienta para desarrollar componentes de UI de forma aislada. Permite visualizar diferentes estados de los componentes y proporciona una documentación interactiva que facilita el desarrollo y la prueba de componentes.

## Cómo Acceder a Storybook

Para iniciar Storybook, ejecuta el siguiente comando en la carpeta `frontend`:

```bash
npm run storybook
```

Esto iniciará Storybook en `http://localhost:6006`.

## Componentes Documentados

### Botones

#### VxvButton

El componente `VxvButton` está completamente documentado en Storybook con ejemplos interactivos de:

- Variantes de estilo (primary, secondary, danger, success, warning, info, ghost)
- Tamaños (sm, md, lg, xl)
- Estados (disabled, loading)
- Botones con iconos
- Botones de ancho completo
- Botones redondeados

**Archivo**: `/components/ui/buttons/VxvButton.vue`
**Story**: `/components/ui/buttons/VxvButton.stories.ts`

### Formularios

#### VxvInput

El componente `VxvInput` está documentado en Storybook con ejemplos interactivos de:

- Input básico
- Input con etiqueta y campo requerido
- Input con mensaje de error
- Input con texto de ayuda
- Input deshabilitado
- Input de solo lectura
- Diferentes tamaños de input
- Input con iconos de prefijo y sufijo
- Diferentes tipos de input (text, email, password, number, date)

**Archivo**: `/components/ui/forms/VxvInput.vue`
**Story**: `/components/ui/forms/VxvInput.stories.ts`

### Feedback

#### VxvAlert

El componente `VxvAlert` está documentado en Storybook con ejemplos interactivos de:

- Alerta por defecto
- Alerta de éxito
- Alerta de error
- Alerta de advertencia
- Alerta informativa
- Alerta sin título
- Alerta no descartable
- Alerta con cierre automático
- Alerta con contenido personalizado

**Archivo**: `/components/ui/feedback/VxvAlert.vue`
**Story**: `/components/ui/feedback/VxvAlert.stories.ts`

### Tablas

#### VxvTable

El componente `VxvTable` está documentado en Storybook con ejemplos interactivos de:

- Tabla básica con datos
- Tabla con ordenación activa
- Tabla con filas clickeables
- Tabla en estado de carga
- Tabla sin datos
- Tabla con mensaje personalizado cuando está vacía
- Tabla con acciones por fila
- Tabla con celdas personalizadas

**Archivo**: `/components/ui/tables/VxvTable.vue`
**Story**: `/components/ui/tables/VxvTable.stories.ts`

#### VxvDataTable

El componente `VxvDataTable` está documentado en Storybook con ejemplos interactivos de:

- DataTable básica
- DataTable con celdas personalizadas
- DataTable en estado de carga
- DataTable sin datos
- DataTable con filas clickeables
- DataTable sin filtros
- DataTable con filtros personalizados
- DataTable interactiva

**Archivo**: `/components/ui/tables/VxvDataTable.vue`
**Story**: `/components/ui/tables/VxvDataTable.stories.ts`

### Paginación

#### VxvPaginator

El componente `VxvPaginator` está documentado en Storybook con ejemplos interactivos de:

- Paginador básico
- Paginador con muchas páginas
- Paginador en la primera página
- Paginador en la última página
- Paginador con pocas páginas
- Paginador sin información
- Paginador con nombre de elemento personalizado
- Paginador con diferentes cantidades de botones visibles
- Paginador interactivo

**Archivo**: `/components/ui/pagination/VxvPaginator.vue`
**Story**: `/components/ui/pagination/VxvPaginator.stories.ts`

### Navegación

#### VxvNavLink

El componente `VxvNavLink` está documentado en Storybook con ejemplos interactivos de:

- Enlace de navegación básico
- Enlace de navegación con icono
- Enlace de navegación activo
- Enlace de navegación inactivo
- Enlace de navegación horizontal
- Múltiples enlaces de navegación
- Barra de navegación horizontal
- Estilos personalizados

**Archivo**: `/components/ui/navigation/VxvNavLink.vue`
**Story**: `/components/ui/navigation/VxvNavLink.stories.ts`

#### VxvBreadcrumb

El componente `VxvBreadcrumb` está documentado en Storybook con ejemplos interactivos de:

- Ejemplo básico de migas de pan
- Migas de pan con ruta corta
- Migas de pan con ruta larga
- Migas de pan con texto personalizado para el inicio
- Migas de pan con enlace de inicio personalizado
- Migas de pan en diferentes contextos

**Archivo**: `/components/ui/navigation/VxvBreadcrumb.vue`
**Story**: `/components/ui/navigation/VxvBreadcrumb.stories.ts`

### Navegación

#### VxvNavLink

El componente `VxvNavLink` está documentado en Storybook con ejemplos interactivos de:

- Enlace de navegación básico
- Enlace de navegación con icono
- Enlace de navegación activo
- Enlace de navegación inactivo
- Enlace de navegación horizontal
- Múltiples enlaces de navegación
- Barra de navegación horizontal
- Estilos personalizados

**Archivo**: `/components/ui/navigation/VxvNavLink.vue`
**Story**: `/components/ui/navigation/VxvNavLink.stories.ts`

#### VxvBreadcrumb

El componente `VxvBreadcrumb` está documentado en Storybook con ejemplos interactivos de:

- Ejemplo básico de migas de pan
- Migas de pan con ruta corta
- Migas de pan con ruta larga
- Migas de pan con texto personalizado para el inicio
- Migas de pan con enlace de inicio personalizado
- Migas de pan en diferentes contextos

**Archivo**: `/components/ui/navigation/VxvBreadcrumb.vue`
**Story**: `/components/ui/navigation/VxvBreadcrumb.stories.ts`

#### VxvSidebar

El componente `VxvSidebar` está documentado en Storybook con ejemplos interactivos de:

- Barra lateral básica sin título
- Barra lateral con título
- Barra lateral con grupos
- Barra lateral con grupos colapsados
- Barra lateral con enlaces activos
- Barra lateral en un layout de aplicación

**Archivo**: `/components/ui/navigation/VxvSidebar.vue`
**Story**: `/components/ui/navigation/VxvSidebar.stories.ts`

#### VxvSidebarGroup

El componente `VxvSidebarGroup` está documentado en Storybook con ejemplos interactivos de:

- Grupo de navegación expandido
- Grupo de navegación colapsado
- Múltiples grupos de navegación
- Grupo de navegación interactivo
- Grupo de navegación con muchos elementos

**Archivo**: `/components/ui/navigation/VxvSidebarGroup.vue`
**Story**: `/components/ui/navigation/VxvSidebarGroup.stories.ts`

### Formularios

#### VxvForm

El componente `VxvForm` está documentado en Storybook con ejemplos interactivos de:

- Formulario básico
- Formulario en estado de carga
- Formulario sin botón de cancelar
- Formulario con textos personalizados
- Formulario con ancho personalizado
- Formulario con validación
- Formulario con múltiples columnas

**Archivo**: `/components/ui/forms/VxvForm.vue`
**Story**: `/components/ui/forms/VxvForm.stories.ts`

### Layout

#### VxvPageTitle

El componente `VxvPageTitle` está documentado en Storybook con ejemplos interactivos de:

- Título de página básico
- Título de página sin botón de menú móvil
- Título de página con breadcrumbs
- Título de página con título largo
- Título de página en un layout de aplicación

**Archivo**: `/components/ui/layout/VxvPageTitle.vue`
**Story**: `/components/ui/layout/VxvPageTitle.stories.ts`

### Filtros

#### VxvFilters

El componente `VxvFilters` está documentado en Storybook con ejemplos interactivos de:

- Filtros básicos con búsqueda
- Filtros sin búsqueda
- Filtros con búsqueda y filtros personalizados
- Filtros con cambios inmediatos
- Filtros avanzados

**Archivo**: `/components/ui/filters/VxvFilters.vue`
**Story**: `/components/ui/filters/VxvFilters.stories.ts`

### Branding

#### VxvLogo

El componente `VxvLogo` está documentado en Storybook con ejemplos interactivos de:

- Logo básico con tamaño mediano
- Logo pequeño
- Logo grande
- Logo extra grande
- Logo en un header
- Logo en un footer
- Logo con diferentes fondos

**Archivo**: `/components/ui/branding/VxvLogo.vue`
**Story**: `/components/ui/branding/VxvLogo.stories.ts`

### Notificaciones

#### VxvNotification

El componente `VxvNotification` está documentado en Storybook con ejemplos interactivos de:

- Ejemplo básico de notificaciones
- Notificaciones con diferentes duraciones
- Múltiples notificaciones
- Notificaciones en un layout de aplicación

**Archivo**: `/components/ui/feedback/VxvNotification.vue`
**Story**: `/components/ui/feedback/VxvNotification.stories.ts`

## Todos los Componentes Documentados en Storybook

¡Felicidades! Todos los componentes UI de Vaxav ahora están documentados en Storybook con ejemplos interactivos. Esto proporciona una referencia completa para los desarrolladores que trabajen en el proyecto.

## Plan de Documentación

Se recomienda crear stories para todos los componentes restantes siguiendo el mismo patrón que los componentes ya documentados. Cada story debe incluir:

1. Una descripción general del componente
2. Documentación de todas las props, slots y eventos
3. Ejemplos de los diferentes estados y variantes del componente
4. Ejemplos de uso común

## Beneficios de Usar Storybook

- **Desarrollo aislado**: Permite desarrollar y probar componentes de forma aislada.
- **Documentación interactiva**: Proporciona una documentación viva que muestra cómo funcionan los componentes.
- **Pruebas visuales**: Facilita la detección de problemas visuales.
- **Colaboración**: Mejora la comunicación entre desarrolladores y diseñadores.
- **Catálogo de componentes**: Sirve como un inventario de todos los componentes disponibles.

## Mejores Prácticas para Stories

1. **Nombrar claramente**: Usar nombres descriptivos para las stories.
2. **Documentar props**: Incluir descripciones para todas las props.
3. **Mostrar variantes**: Crear stories para diferentes estados y variantes.
4. **Incluir ejemplos complejos**: Mostrar cómo se comporta el componente en situaciones reales.
5. **Mantener actualizado**: Actualizar las stories cuando el componente cambie.
