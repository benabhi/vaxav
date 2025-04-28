# usePermissions

El composable `usePermissions` proporciona funcionalidad para gestionar permisos en la aplicación.

## Importación

```javascript
import { usePermissions } from '@/composables/usePermissions';
```

## Uso Básico

```javascript
const {
  permissions,
  loading,
  pagination,
  filters,
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  getAllPermissions
} = usePermissions();

// Cargar permisos al montar el componente
onMounted(() => {
  fetchPermissions();
});
```

## Estado

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `permissions` | `Ref<Array>` | Lista de permisos |
| `loading` | `Ref<Boolean>` | Indica si se están cargando los permisos |
| `pagination` | `Reactive<Object>` | Estado de paginación |
| `filters` | `Reactive<Object>` | Filtros aplicados |

## Métodos

### fetchPermissions

Obtiene la lista de permisos con filtros y paginación.

```javascript
await fetchPermissions();
```

### createPermission

Crea un nuevo permiso.

```javascript
const permissionData = {
  name: 'Crear usuarios',
  slug: 'create-users',
  description: 'Permite crear nuevos usuarios'
};

const result = await createPermission(permissionData);
```

### updatePermission

Actualiza un permiso existente.

```javascript
const permissionId = 1;
const permissionData = {
  name: 'Crear usuarios',
  slug: 'create-users',
  description: 'Permite crear nuevos usuarios'
};

const result = await updatePermission(permissionId, permissionData);
```

### deletePermission

Elimina un permiso.

```javascript
const permissionId = 1;
const success = await deletePermission(permissionId);
```

### changePage

Cambia la página actual.

```javascript
changePage(2);
```

### changePerPage

Cambia el número de elementos por página.

```javascript
changePerPage(20);
```

### updateFilters

Actualiza los filtros y recarga los datos.

```javascript
updateFilters({
  search: 'crear',
  sort_field: 'name',
  sort_direction: 'asc'
});
```

### updateSort

Actualiza la ordenación y recarga los datos.

```javascript
updateSort({
  key: 'name',
  order: 'desc'
});
```

### getAllPermissions

Obtiene todos los permisos sin paginación.

```javascript
const allPermissions = await getAllPermissions();
```

## Ejemplo Completo

```vue
<template>
  <AdminCrudView
    title="Gestión de Permisos"
    tableTitle="Permisos"
    :breadcrumbItems="[{ text: 'Permisos' }]"
    :columns="columns"
    :items="permissions"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    createButtonLabel="Nuevo Permiso"
    searchPlaceholder="Buscar permisos..."
    itemName="permisos"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="openCreateModal"
  >
    <!-- Slots personalizados -->
  </AdminCrudView>
</template>

<script setup>
import { onMounted } from 'vue';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import { usePermissions } from '@/composables/usePermissions';

// Usar el composable de permisos
const {
  permissions,
  loading,
  pagination,
  filters,
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = usePermissions();

// Definir columnas
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'description', label: 'Descripción' }
];

// Cargar permisos al montar el componente
onMounted(() => {
  fetchPermissions();
});
</script>
```
