# Guía de Refactorización de Vistas

Esta guía explica cómo se han refactorizado las vistas de administración en la aplicación Vaxav para mejorar la separación de responsabilidades y la reutilización de código.

## Cambios Realizados

Se han realizado los siguientes cambios:

1. **Creación de Composables**: Se han creado composables para extraer la lógica de negocio de las vistas.
2. **Creación de Componente de Vista Reutilizable**: Se ha creado un componente `AdminCrudView` para encapsular la estructura común de las vistas CRUD.
3. **Refactorización de Vistas**: Se han refactorizado las vistas `UsersView` y `RolesView` para utilizar los nuevos composables y componentes.

## Composables

### useUsers.js

Este composable encapsula toda la lógica relacionada con la gestión de usuarios:

```javascript
// Importar el composable
import { useUsers } from '@/composables/useUsers';

// Usar el composable
const {
  users,
  totalUsers,
  loading,
  pagination,
  filters,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useUsers();
```

### useRoles.js

Este composable encapsula toda la lógica relacionada con la gestión de roles:

```javascript
// Importar el composable
import { useRoles } from '@/composables/useRoles';

// Usar el composable
const {
  roles,
  loading,
  pagination,
  filters,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useRoles();
```

### Otros Composables Genéricos

También se han creado composables genéricos para funcionalidades comunes:

- **usePagination.js**: Para la gestión de paginación.
- **useFilters.js**: Para la gestión de filtros.
- **useSorting.js**: Para la gestión de ordenación.
- **useDataTable.js**: Combina los composables anteriores para proporcionar una solución completa para tablas de datos.

## Componente AdminCrudView

El componente `AdminCrudView` encapsula la estructura común de las vistas CRUD:

```vue
<AdminCrudView
  title="Gestión de Usuarios"
  tableTitle="Usuarios"
  :breadcrumbItems="[{ text: 'Usuarios' }]"
  :columns="columns"
  :items="users"
  :loading="loading"
  :total="totalUsers"
  :pagination="pagination"
  :filters="filters"
  createButtonLabel="Nuevo Usuario"
  searchPlaceholder="Buscar por nombre o email"
  itemName="usuarios"
  @page-change="changePage"
  @per-page-change="changePerPage"
  @filter-change="updateFilters"
  @sort-change="updateSort"
  @create="goToCreateUser"
>
  <!-- Slots personalizados -->
</AdminCrudView>
```

## Vistas Refactorizadas

### UsersView.vue

La vista de usuarios ahora utiliza el componente `AdminCrudView` y el composable `useUsers`:

```vue
<template>
  <AdminCrudView
    title="Gestión de Usuarios"
    tableTitle="Usuarios"
    :breadcrumbItems="[{ text: 'Usuarios' }]"
    :columns="columns"
    :items="users"
    :loading="loading"
    :total="totalUsers"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nuevo Usuario"
    searchPlaceholder="Buscar por nombre o email"
    itemName="usuarios"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="goToCreateUser"
  >
    <!-- Slots personalizados -->
  </AdminCrudView>
</template>

<script setup>
import { useUsers } from '@/composables/useUsers';

// Usar el composable de usuarios
const {
  users,
  totalUsers,
  loading,
  pagination,
  filters,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useUsers();

// Resto del código...
</script>
```

### RolesView.vue

La vista de roles ahora utiliza el componente `AdminCrudView` y el composable `useRoles`:

```vue
<template>
  <AdminCrudView
    title="Gestión de Roles"
    tableTitle="Roles"
    :breadcrumbItems="[{ text: 'Roles' }]"
    :columns="columns"
    :items="roles"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    row-key="id"
    create-button-label="Nuevo Rol"
    search-placeholder="Buscar roles..."
    item-name="roles"
    @create="goToCreateRole"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
  >
    <!-- Slots personalizados -->
  </AdminCrudView>
</template>

<script setup>
import { useRoles } from '@/composables/useRoles';

// Usar el composable de roles
const {
  roles,
  loading,
  pagination,
  filters,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useRoles();

// Resto del código...
</script>
```

## Beneficios

La refactorización de las vistas ha proporcionado los siguientes beneficios:

1. **Código más Limpio**: Las vistas ahora están más enfocadas en la presentación, mientras que la lógica de negocio está encapsulada en composables.

2. **Menos Duplicación**: La lógica común como paginación, filtros y ordenación ahora está centralizada en composables reutilizables.

3. **Mayor Reutilización**: Los componentes y composables pueden ser reutilizados en diferentes partes de la aplicación.

4. **Mejor Mantenibilidad**: Es más fácil mantener y actualizar la aplicación cuando la lógica está bien organizada y separada.

5. **Consistencia**: Es más fácil mantener un enfoque consistente en toda la aplicación cuando se utilizan los mismos componentes y patrones.

## Próximos Pasos

Para seguir mejorando la aplicación, se pueden realizar los siguientes pasos:

1. **Refactorizar Otras Vistas**: Aplicar el mismo enfoque a otras vistas administrativas.

2. **Crear Más Composables**: Crear composables para otras entidades como permisos, configuraciones, etc.

3. **Mejorar la Documentación**: Añadir más ejemplos y detalles a la documentación.

4. **Pruebas Unitarias**: Crear pruebas unitarias para los composables y componentes.

5. **Refactorizar Vistas No Administrativas**: Cuando las vistas no administrativas estén más desarrolladas, aplicar el mismo enfoque de separación de responsabilidades.
