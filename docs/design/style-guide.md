# Guía de Estilo de Vaxav

Esta guía de estilo define los principios de diseño, componentes, estructura y paleta de colores para mantener una experiencia de usuario coherente en toda la aplicación Vaxav.

## Índice

1. [Principios de Diseño](#principios-de-diseño)
2. [Estructura de Componentes](#estructura-de-componentes)
3. [Componentes Principales](#componentes-principales)
4. [Paleta de Colores](#paleta-de-colores)
5. [Tipografía](#tipografía)
6. [Espaciado y Layout](#espaciado-y-layout)
7. [Iconografía](#iconografía)
8. [Formularios y Controles](#formularios-y-controles)
9. [Tablas y Visualización de Datos](#tablas-y-visualización-de-datos)
10. [Modales y Diálogos](#modales-y-diálogos)
11. [Navegación](#navegación)
12. [Mejores Prácticas](#mejores-prácticas)

## Principios de Diseño

### Estética Sci-Fi Retro

Vaxav utiliza una estética sci-fi retro con interfaces que recuerdan a los sistemas informáticos de las décadas de 1980 y 1990, pero con usabilidad moderna.

### Consistencia

Mantener una experiencia coherente en toda la aplicación utilizando los mismos componentes, patrones y estilos.

### Accesibilidad

Diseñar para todos los usuarios, asegurando que la aplicación sea accesible para personas con diferentes capacidades.

### Rendimiento

Priorizar el rendimiento para garantizar una experiencia fluida, especialmente en dispositivos de gama baja.

### Minimalismo Funcional

Mantener la interfaz limpia y enfocada en la funcionalidad, evitando elementos decorativos innecesarios.

## Estructura de Componentes

Los componentes están organizados en una estructura jerárquica para facilitar la reutilización y mantener la coherencia:

```
/components
├── ui/                  # Componentes de interfaz de usuario básicos
│   ├── buttons/         # Botones y controles de acción
│   ├── forms/           # Campos de formulario y controles relacionados
│   ├── modals/          # Componentes de ventanas modales
│   ├── navigation/      # Componentes de navegación (menús, tabs, etc.)
│   ├── data-display/    # Componentes para mostrar datos (tablas, listas, etc.)
│   └── feedback/        # Componentes de retroalimentación (alertas, notificaciones)
├── layout/              # Componentes de estructura y layout
└── admin/               # Componentes específicos para el panel de administración
```

### Convenciones de Nomenclatura

- **Nombres de Componentes**: PascalCase (ej. `BaseButton.vue`)
- **Props**: camelCase (ej. `buttonSize`)
- **Eventos**: kebab-case con prefijo (ej. `@click`, `@update:modelValue`)
- **Clases CSS**: kebab-case con prefijo según el componente (ej. `btn-primary`)

## Componentes Principales

### Botones

Utilizar siempre el componente `BaseButton` para todos los botones de la aplicación. Este componente proporciona estilos consistentes y funcionalidades como estados de carga, deshabilitado, y variantes de color.

[Documentación de BaseButton](../components/ui/buttons.md)

#### Variantes de Botones

- **Primary**: Para acciones principales o de confirmación (azul)
- **Secondary**: Para acciones secundarias o de cancelación (gris)
- **Danger**: Para acciones destructivas o de eliminación (rojo)

#### Propiedades Importantes

- `variant`: Define el estilo visual del botón (`primary`, `secondary`, `danger`, etc.)
- `size`: Tamaño del botón (`sm`, `md`, `lg`, `xl`)
- `fullWidth`: Si el botón debe ocupar todo el ancho disponible (adaptativo)
- `loading`: Para mostrar un estado de carga
- `disabled`: Para deshabilitar el botón

#### Ejemplo de Uso

```vue
<BaseButton variant="primary" @click="saveData">
  Guardar
</BaseButton>

<BaseButton variant="secondary" @click="cancel">
  Cancelar
</BaseButton>

<BaseButton variant="danger" @click="confirmDelete">
  Eliminar
</BaseButton>

<BaseButton variant="primary" :loading="isLoading" :full-width="true">
  Procesar
</BaseButton>
```

### Formularios

Utilizar los componentes de formulario estandarizados para mantener la coherencia en toda la aplicación.

[Documentación de Componentes de Formulario](../components/ui/forms.md)

#### Componentes de Formulario

- `BaseInput`: Para campos de texto, email, número, etc.
- `BaseSelect`: Para selecciones de una lista de opciones
- `BaseCheckbox`: Para opciones de selección múltiple
- `BaseRadio`: Para opciones de selección única
- `BaseTextarea`: Para texto multilínea

#### Ejemplo de Uso

```vue
<form @submit.prevent="submitForm">
  <BaseInput
    v-model="form.name"
    label="Nombre"
    placeholder="Ingrese su nombre"
    required
  />
  
  <BaseSelect
    v-model="form.role"
    label="Rol"
    :options="roleOptions"
    required
  />
  
  <BaseButton type="submit" variant="primary" :loading="isSubmitting">
    Guardar
  </BaseButton>
</form>
```

### Modales

Utilizar el componente `BaseModal` para todas las ventanas modales de la aplicación.

[Documentación de BaseModal](../components/ui/modals.md)

#### Propiedades Importantes

- `show`: Controla la visibilidad del modal
- `title`: Título del modal
- `color`: Color del borde y elementos del modal (`blue`, `red`, `green`, etc.)

#### Ejemplo de Uso

```vue
<BaseModal :show="showModal" title="Crear Usuario" color="blue" @close="closeModal">
  <form @submit.prevent="saveUser">
    <!-- Contenido del formulario -->
    
    <div class="flex space-x-3 mt-4">
      <BaseButton type="submit" variant="primary" :full-width="true">
        Guardar
      </BaseButton>
      <BaseButton type="button" variant="secondary" :full-width="true" @click="closeModal">
        Cancelar
      </BaseButton>
    </div>
  </form>
</BaseModal>
```

### Tablas

Utilizar un estilo consistente para todas las tablas de la aplicación.

#### Ejemplo de Estructura

```vue
<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-700">
    <thead>
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
          Nombre
        </th>
        <!-- Más encabezados -->
      </tr>
    </thead>
    <tbody class="bg-gray-800 divide-y divide-gray-700">
      <tr v-for="item in items" :key="item.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {{ item.name }}
        </td>
        <!-- Más celdas -->
      </tr>
    </tbody>
  </table>
</div>
```

## Paleta de Colores

Vaxav utiliza una paleta de colores oscura con acentos de colores brillantes, inspirada en interfaces de computadora retro-futuristas.

### Colores Principales

| Nombre | Hex | Tailwind | Uso |
|--------|-----|----------|-----|
| Negro Espacial | `#0f172a` | `bg-slate-900` | Fondo principal |
| Gris Oscuro | `#1e293b` | `bg-slate-800` | Elementos de fondo secundarios |
| Gris Medio | `#334155` | `bg-slate-700` | Bordes, separadores |
| Gris Claro | `#94a3b8` | `text-slate-400` | Texto secundario |
| Blanco | `#f8fafc` | `text-slate-50` | Texto principal |
| Azul Neón | `#3b82f6` | `text-blue-500` | Acentos primarios, enlaces |
| Verde Neón | `#10b981` | `text-emerald-500` | Éxito, confirmación |
| Rojo Neón | `#ef4444` | `text-red-500` | Error, eliminación |
| Amarillo Neón | `#f59e0b` | `text-amber-500` | Advertencia, destacado |
| Púrpura Neón | `#8b5cf6` | `text-violet-500` | Elementos especiales |

### Variantes de Botones

| Variante | Color de Fondo | Color de Texto | Hover | Uso |
|----------|----------------|----------------|-------|-----|
| Primary | `bg-blue-600` | `text-white` | `hover:bg-blue-700` | Acciones principales |
| Secondary | `bg-gray-600` | `text-white` | `hover:bg-gray-700` | Acciones secundarias |
| Danger | `bg-red-600` | `text-white` | `hover:bg-red-700` | Acciones destructivas |
| Success | `bg-emerald-600` | `text-white` | `hover:bg-emerald-700` | Acciones de confirmación |
| Warning | `bg-amber-600` | `text-white` | `hover:bg-amber-700` | Acciones de precaución |

### Estados

| Estado | Color | Tailwind | Uso |
|--------|-------|----------|-----|
| Activo | Verde | `bg-green-100 text-green-800` | Elementos activos |
| Inactivo | Gris | `bg-gray-100 text-gray-800` | Elementos inactivos |
| Error | Rojo | `bg-red-100 text-red-800` | Errores |
| Advertencia | Amarillo | `bg-yellow-100 text-yellow-800` | Advertencias |
| Información | Azul | `bg-blue-100 text-blue-800` | Información |

## Tipografía

Vaxav utiliza una combinación de fuentes sans-serif modernas para una legibilidad óptima.

### Fuentes

- **Principal**: Inter (sans-serif)
- **Monoespaciada**: JetBrains Mono (para código, datos técnicos)

### Tamaños de Fuente

| Nombre | Tamaño | Tailwind | Uso |
|--------|--------|----------|-----|
| XS | 12px | `text-xs` | Texto muy pequeño, notas al pie |
| SM | 14px | `text-sm` | Texto secundario, etiquetas |
| Base | 16px | `text-base` | Texto principal del cuerpo |
| LG | 18px | `text-lg` | Subtítulos, texto destacado |
| XL | 20px | `text-xl` | Títulos pequeños |
| 2XL | 24px | `text-2xl` | Títulos de sección |
| 3XL | 30px | `text-3xl` | Títulos principales |
| 4XL | 36px | `text-4xl` | Títulos de página |

### Pesos de Fuente

| Nombre | Peso | Tailwind | Uso |
|--------|------|----------|-----|
| Normal | 400 | `font-normal` | Texto regular |
| Medium | 500 | `font-medium` | Énfasis leve |
| Semibold | 600 | `font-semibold` | Subtítulos, etiquetas |
| Bold | 700 | `font-bold` | Títulos, texto destacado |

## Espaciado y Layout

Vaxav utiliza un sistema de espaciado consistente basado en múltiplos de 4px.

### Unidades de Espaciado

| Nombre | Tamaño | Tailwind | Uso |
|--------|--------|----------|-----|
| XS | 4px | `p-1`, `m-1` | Espaciado mínimo |
| SM | 8px | `p-2`, `m-2` | Espaciado pequeño |
| MD | 16px | `p-4`, `m-4` | Espaciado estándar |
| LG | 24px | `p-6`, `m-6` | Espaciado grande |
| XL | 32px | `p-8`, `m-8` | Espaciado muy grande |
| 2XL | 48px | `p-12`, `m-12` | Espaciado extremo |

### Contenedores

- Usar `container` de Tailwind para contenedores principales
- Máximo ancho de contenido: 1280px (`max-w-7xl`)
- Padding horizontal en contenedores: 16px en móvil, 24px en tablet, 32px en desktop

### Grids y Flexbox

- Usar CSS Grid para layouts bidimensionales complejos
- Usar Flexbox para alineaciones simples en una dimensión
- Mantener consistencia en los gaps: 16px (`gap-4`) para la mayoría de los casos

## Iconografía

Vaxav utiliza iconos consistentes en toda la aplicación.

### Biblioteca de Iconos

- Utilizar [Heroicons](https://heroicons.com/) como biblioteca principal de iconos
- Tamaños estándar: 16px, 20px, 24px

### Uso de Iconos en Botones

```vue
<BaseButton variant="primary">
  Guardar
  <template #icon-right>
    <SaveIcon class="w-5 h-5" />
  </template>
</BaseButton>
```

## Formularios y Controles

### Estructura de Formularios

- Agrupar campos relacionados
- Usar etiquetas claras para cada campo
- Mostrar mensajes de error debajo de cada campo
- Botones de acción alineados a la derecha o con ancho completo

### Estilos de Campos

- Altura estándar de campos: 40px
- Radio de borde: 6px
- Padding horizontal: 12px
- Color de fondo: `bg-gray-700`
- Color de borde: `border-gray-600`
- Color de texto: `text-white`

## Tablas y Visualización de Datos

### Estructura de Tablas

- Encabezados con fondo más oscuro
- Filas alternadas para mejor legibilidad
- Padding consistente en celdas
- Alineación de texto: izquierda para texto, derecha para números
- Acciones en la última columna

### Paginación

- Mostrar número de página actual y total
- Botones para primera, anterior, siguiente y última página
- Indicador de total de elementos

## Modales y Diálogos

### Tipos de Modales

- **Informativos**: Para mostrar información
- **Confirmación**: Para confirmar acciones
- **Formulario**: Para entrada de datos
- **Alerta**: Para mensajes importantes

### Estructura de Modales

- Título claro en la parte superior
- Contenido principal en el centro
- Botones de acción en la parte inferior
- Botón de cierre en la esquina superior derecha

## Navegación

### Barra de Navegación Superior

- Logo en la esquina superior izquierda
- Enlaces principales en el centro
- Perfil de usuario y acciones en la esquina superior derecha

### Menú Lateral

- Enlaces agrupados por categoría
- Indicador visual para la página actual
- Posibilidad de colapsar/expandir secciones

## Mejores Prácticas

### Consistencia

- Utilizar siempre los componentes estándar definidos en esta guía
- Mantener la paleta de colores y tipografía consistentes
- Seguir los patrones de espaciado establecidos

### Reutilización

- Crear componentes para patrones de UI que se repiten
- Documentar nuevos componentes siguiendo el formato existente
- Actualizar esta guía cuando se creen nuevos estándares

### Accesibilidad

- Asegurar suficiente contraste entre texto y fondo
- Proporcionar textos alternativos para imágenes
- Asegurar que la navegación funciona con teclado
- Usar etiquetas semánticas apropiadas

### Responsive Design

- Diseñar primero para móvil (mobile-first)
- Probar en múltiples tamaños de pantalla
- Usar puntos de quiebre consistentes:
  - SM: 640px
  - MD: 768px
  - LG: 1024px
  - XL: 1280px
  - 2XL: 1536px

### Performance

- Optimizar imágenes y assets
- Minimizar el número de componentes en una página
- Usar lazy loading para componentes pesados
- Evitar animaciones complejas que puedan afectar el rendimiento

## Ejemplos Visuales

Para ejemplos visuales de los componentes y patrones descritos en esta guía, consulta la documentación específica de cada componente:

- [Documentación de Botones](../components/ui/buttons.md)
- [Documentación de Formularios](../components/ui/forms.md)
- [Documentación de Modales](../components/ui/modals.md)
- [Documentación de Tablas](../components/ui/data-display.md)

## Contribución a la Guía de Estilo

Esta guía de estilo es un documento vivo que debe evolucionar con el proyecto. Si tienes sugerencias para mejorarla:

1. Discute los cambios propuestos con el equipo
2. Documenta los nuevos estándares siguiendo el formato existente
3. Actualiza los ejemplos y la documentación relacionada
4. Asegúrate de que los cambios sean coherentes con el diseño general
