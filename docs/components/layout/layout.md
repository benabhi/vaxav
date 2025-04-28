# Componentes de Layout

Los componentes de layout definen la estructura y organización de la aplicación. Estos componentes proporcionan una base consistente para construir las diferentes vistas y secciones de Vaxav.

## Componentes Disponibles

### AppLayout

`AppLayout` es el componente principal de layout que envuelve toda la aplicación.

**Archivo**: `/components/layout/AppLayout.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `showHeader` | `Boolean` | `true` | Si se debe mostrar el encabezado |
| `showFooter` | `Boolean` | `true` | Si se debe mostrar el pie de página |
| `fullWidth` | `Boolean` | `false` | Si el contenido debe ocupar todo el ancho |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal de la página |
| `header` | Personalización del encabezado (reemplaza el predeterminado) |
| `footer` | Personalización del pie de página (reemplaza el predeterminado) |

#### Ejemplos de Uso

```vue
<AppLayout>
  <template #default>
    <h1>Bienvenido a Vaxav</h1>
    <p>Contenido principal de la página</p>
  </template>
</AppLayout>
```

### AppHeader

`AppHeader` es el componente de encabezado principal que contiene el logo, navegación y controles de usuario.

**Archivo**: `/components/layout/AppHeader.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `transparent` | `Boolean` | `false` | Si el encabezado debe ser transparente |
| `sticky` | `Boolean` | `true` | Si el encabezado debe permanecer fijo en la parte superior |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `logo` | Personalización del logo |
| `navigation` | Personalización de la navegación |
| `actions` | Acciones adicionales (botones, etc.) |
| `user-menu` | Menú de usuario personalizado |

#### Ejemplos de Uso

```vue
<AppHeader :transparent="isHomePage">
  <template #actions>
    <BaseButton variant="secondary" size="sm">Contacto</BaseButton>
  </template>
</AppHeader>
```

### AppFooter

`AppFooter` es el componente de pie de página que contiene enlaces, información de copyright y otros elementos.

**Archivo**: `/components/layout/AppFooter.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `simple` | `Boolean` | `false` | Si se debe mostrar una versión simplificada |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `links` | Enlaces personalizados |
| `social` | Iconos de redes sociales |
| `copyright` | Texto de copyright personalizado |
| `logo` | Logo personalizado |

#### Ejemplos de Uso

```vue
<AppFooter>
  <template #copyright>
    © {{ new Date().getFullYear() }} Vaxav. Todos los derechos reservados.
  </template>
</AppFooter>
```

### Container

`Container` es un componente para contener y centrar el contenido con márgenes consistentes.

**Archivo**: `/components/layout/Container.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `maxWidth` | `String` | `'6xl'` | Ancho máximo (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`, `'4xl'`, `'5xl'`, `'6xl'`, `'7xl'`, `'full'`) |
| `padding` | `Boolean` | `true` | Si se debe aplicar padding horizontal |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido del contenedor |

#### Ejemplos de Uso

```vue
<Container maxWidth="4xl">
  <h1>Contenido centrado</h1>
  <p>Este contenido está centrado y tiene un ancho máximo.</p>
</Container>
```

### Grid

`Grid` es un componente para crear layouts de cuadrícula responsivos.

**Archivo**: `/components/layout/Grid.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `cols` | `[Number, Object]` | `12` | Número de columnas o objeto con breakpoints |
| `gap` | `[Number, String]` | `4` | Espacio entre elementos |
| `rowGap` | `[Number, String]` | `null` | Espacio entre filas |
| `colGap` | `[Number, String]` | `null` | Espacio entre columnas |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Elementos de la cuadrícula |

#### Ejemplos de Uso

```vue
<Grid :cols="{ default: 1, sm: 2, md: 3, lg: 4 }" gap="6">
  <Card v-for="item in items" :key="item.id" :item="item" />
</Grid>
```

### GridItem

`GridItem` es un componente para definir elementos dentro de un Grid.

**Archivo**: `/components/layout/GridItem.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `span` | `[Number, Object]` | `1` | Número de columnas que ocupa o objeto con breakpoints |
| `start` | `[Number, Object]` | `null` | Columna de inicio |
| `order` | `[Number, Object]` | `null` | Orden del elemento |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido del elemento |

#### Ejemplos de Uso

```vue
<Grid cols="12" gap="4">
  <GridItem :span="{ default: 12, md: 8 }">
    <MainContent />
  </GridItem>
  <GridItem :span="{ default: 12, md: 4 }">
    <Sidebar />
  </GridItem>
</Grid>
```

### Section

`Section` es un componente para definir secciones de contenido con espaciado consistente.

**Archivo**: `/components/layout/Section.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `id` | `String` | `null` | ID de la sección para navegación |
| `title` | `String` | `''` | Título de la sección |
| `subtitle` | `String` | `''` | Subtítulo de la sección |
| `centered` | `Boolean` | `false` | Si el contenido debe estar centrado |
| `padding` | `[String, Object]` | `'y-16'` | Padding de la sección |
| `background` | `String` | `'transparent'` | Color de fondo |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal |
| `title` | Personalización del título |
| `subtitle` | Personalización del subtítulo |
| `header` | Encabezado completo personalizado |
| `footer` | Pie de sección personalizado |

#### Ejemplos de Uso

```vue
<Section 
  id="features" 
  title="Características" 
  subtitle="Descubre todo lo que Vaxav puede hacer por ti"
  background="gray-50"
>
  <FeatureGrid :features="features" />
</Section>
```

### AdminLayout

`AdminLayout` es un layout especializado para el panel de administración.

**Archivo**: `/components/layout/AdminLayout.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Panel de Administración'` | Título de la página |
| `collapsibleSidebar` | `Boolean` | `true` | Si la barra lateral puede colapsarse |
| `defaultCollapsed` | `Boolean` | `false` | Si la barra lateral debe estar colapsada por defecto |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal |
| `sidebar` | Personalización de la barra lateral |
| `header` | Personalización del encabezado |
| `breadcrumbs` | Migas de pan personalizadas |

#### Ejemplos de Uso

```vue
<AdminLayout title="Gestión de Usuarios">
  <UserTable :users="users" @edit="editUser" @delete="deleteUser" />
</AdminLayout>
```

## Patrones de Layout

### Layout Básico

```vue
<AppLayout>
  <Container>
    <h1>Título de la página</h1>
    <p>Contenido de la página...</p>
  </Container>
</AppLayout>
```

### Layout con Secciones

```vue
<AppLayout>
  <Section title="Sección 1">
    <p>Contenido de la sección 1...</p>
  </Section>
  
  <Section title="Sección 2" background="gray-50">
    <p>Contenido de la sección 2...</p>
  </Section>
</AppLayout>
```

### Layout de Dos Columnas

```vue
<AppLayout>
  <Container>
    <Grid cols="12" gap="6">
      <GridItem :span="{ default: 12, md: 8 }">
        <h1>Contenido Principal</h1>
        <p>Contenido principal de la página...</p>
      </GridItem>
      
      <GridItem :span="{ default: 12, md: 4 }">
        <h2>Barra Lateral</h2>
        <p>Contenido de la barra lateral...</p>
      </GridItem>
    </Grid>
  </Container>
</AppLayout>
```

### Layout de Administración

```vue
<AdminLayout title="Panel de Administración">
  <template #sidebar>
    <AdminSidebar :items="sidebarItems" />
  </template>
  
  <Section title="Dashboard">
    <AdminDashboard :stats="stats" />
  </Section>
</AdminLayout>
```

## Responsividad

Todos los componentes de layout están diseñados para ser completamente responsivos. Utilizamos los breakpoints estándar de Tailwind CSS:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Mejores Prácticas

1. Usa `AppLayout` como contenedor principal para todas las páginas
2. Usa `Container` para centrar y limitar el ancho del contenido
3. Usa `Section` para dividir el contenido en secciones lógicas
4. Usa `Grid` y `GridItem` para layouts complejos y responsivos
5. Usa `AdminLayout` para todas las páginas del panel de administración
6. Mantén la jerarquía de componentes de layout consistente en toda la aplicación
7. Aprovecha los slots para personalizar partes específicas de los layouts
8. Usa props para configurar el comportamiento de los layouts en lugar de modificar los componentes
