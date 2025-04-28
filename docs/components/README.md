# Sistema de Componentes de Vaxav

Este documento describe el sistema de componentes utilizado en Vaxav, su organización, principios de diseño y guías de uso.

## Estructura de Componentes

Los componentes están organizados en categorías según su función y nivel de abstracción:

```
/components
├── ui/                  # Componentes de interfaz de usuario básicos
│   ├── buttons/         # Botones y controles de acción
│   ├── forms/           # Campos de formulario y controles relacionados
│   ├── navigation/      # Componentes de navegación (menús, tabs, etc.)
│   ├── data-display/    # Componentes para mostrar datos (tablas, listas, etc.)
│   ├── feedback/        # Componentes de retroalimentación (alertas, notificaciones)
│   └── overlays/        # Componentes superpuestos (modales, popovers, etc.)
├── layout/              # Componentes de estructura y layout
└── admin/               # Componentes específicos para el panel de administración
```

## Principios de Diseño

1. **Componentes Atómicos**: Seguimos una metodología de diseño atómico donde los componentes más pequeños y simples se combinan para crear componentes más complejos.

2. **Reutilización**: Cada componente debe ser diseñado para ser reutilizable en diferentes contextos.

3. **Consistencia**: Los componentes deben mantener una apariencia y comportamiento consistentes en toda la aplicación.

4. **Accesibilidad**: Todos los componentes deben ser accesibles y cumplir con las pautas WCAG.

5. **Responsividad**: Los componentes deben adaptarse a diferentes tamaños de pantalla.

## Convenciones de Nomenclatura

- **Nombres de Componentes**: PascalCase (ej. `BaseButton.vue`)
- **Props**: camelCase (ej. `buttonSize`)
- **Eventos**: kebab-case con prefijo (ej. `@click`, `@update:modelValue`)
- **Clases CSS**: kebab-case con prefijo según el componente (ej. `btn-primary`)

## Documentación de Componentes

Cada componente debe incluir:

1. **Descripción**: Qué hace el componente y cuándo usarlo
2. **Props**: Propiedades que acepta el componente
3. **Eventos**: Eventos que emite el componente
4. **Slots**: Slots disponibles para personalización
5. **Ejemplos**: Ejemplos de uso básico y avanzado

## Categorías de Componentes

### Componentes UI

Componentes básicos de interfaz de usuario que sirven como bloques de construcción para la aplicación.

- [Buttons](./ui/buttons.md) - Botones y controles de acción
- [Forms](./ui/forms.md) - Campos de formulario y controles relacionados
- [Navigation](./ui/navigation.md) - Componentes de navegación
- [Data Display](./ui/data-display.md) - Componentes para mostrar datos
- [Feedback](./ui/feedback.md) - Componentes de retroalimentación
- [Overlays](./ui/overlays.md) - Componentes superpuestos

### Componentes de Layout

Componentes que definen la estructura y disposición de la aplicación.

- [Layout](./layout/layout.md) - Componentes de estructura y layout

### Componentes de Administración

Componentes específicos para el panel de administración.

- [Admin](./admin/admin.md) - Componentes específicos para administración

## Uso de Tailwind CSS

Vaxav utiliza Tailwind CSS para los estilos. Seguimos estas prácticas:

1. **Clases Utilitarias**: Usamos clases utilitarias de Tailwind directamente en los componentes para estilos básicos.

2. **Componentes Personalizados**: Para patrones de diseño repetitivos, creamos componentes Vue reutilizables.

3. **Extensiones**: Extendemos Tailwind según sea necesario para colores de marca, tamaños, etc.

4. **Temas**: Soportamos temas claro y oscuro mediante las clases de Tailwind.

## Contribución

Al crear nuevos componentes:

1. Sigue la estructura de directorios existente
2. Documenta el componente según las pautas anteriores
3. Crea pruebas para el componente
4. Actualiza este documento si es necesario
