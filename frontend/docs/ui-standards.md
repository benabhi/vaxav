# Estándares de UI

## Alturas de componentes

Para mantener una interfaz de usuario consistente, los siguientes componentes comparten la misma altura estándar:

| Componente | Tamaño | Altura |
|------------|--------|--------|
| BaseButton | md | 38px |
| BaseInput | md | 38px |
| BaseSelect | md | 38px |
| BaseNavLink | - | 38px |

### Detalles de implementación

- **BaseButton**: Usa `px-4 py-[9px]` para el tamaño `md` (38px de altura total).
- **BaseInput**: Usa `py-[9px]` para el tamaño `md`, con bordes que suman a una altura total de 38px (2px de bordes + 18px de texto + 18px de padding).
- **BaseSelect**: Usa `py-[9px]` para el tamaño `md`, con bordes que suman a una altura total de 38px (2px de bordes + 18px de texto + 18px de padding).
- **BaseNavLink**: Usa la propiedad `:horizontal="true"` y clases específicas para mantener la misma altura que los demás componentes (38px) cuando se usa en navegación horizontal.

### Cálculo de altura

La altura total de los componentes se calcula teniendo en cuenta:
- Padding vertical (arriba y abajo)
- Altura del texto base (~18-20px)
- Bordes (cuando aplica, 1px arriba y 1px abajo)

### Uso consistente

- El botón "Cerrar Sesión" en la barra superior usa el tamaño `md`.
- Los botones en los filtros (BaseFilters) usan el tamaño `md`.
- Los enlaces de navegación en la barra superior usan la propiedad `:horizontal="true"` para mantener la altura correcta.
- Para mantener la consistencia, se recomienda usar el tamaño `md` como predeterminado para todos estos componentes en la aplicación.

### Consideraciones especiales para BaseNavLink

- Cuando se usa en menús horizontales (como la barra de navegación superior), añadir la propiedad `:horizontal="true"`.
- Cuando se usa en menús verticales (como el menú lateral), no añadir esta propiedad para mantener el comportamiento estándar.

## Otros tamaños disponibles

Todos los componentes mencionados también soportan los siguientes tamaños:

| Tamaño | Altura aproximada |
|--------|-------------------|
| sm | 32px |
| md | 38px |
| lg | 42px |

Estos tamaños deben usarse de manera consistente en toda la aplicación para mantener una interfaz de usuario coherente.
