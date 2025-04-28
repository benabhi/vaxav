# useRoles

El composable `useRoles` proporciona estado y métodos para gestionar operaciones CRUD de roles en la aplicación.

## Estado

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| roles | `Ref<Array>` | Lista de roles obtenidos de la API |
| loading | `Ref<Boolean>` | Indica si se está cargando la lista de roles |
| pagination | `Reactive<Object>` | Estado de la paginación (currentPage, totalPages, perPage) |
| filters | `Reactive<Object>` | Filtros aplicados a la lista de roles (search, sort_field, sort_direction) |

## Métodos

### fetchRoles

```typescript
fetchRoles(): Promise<void>
```

Obtiene la lista de roles con filtros y paginación.

### createRole

```typescript
createRole(roleData: Object): Promise<Object|null>
```

Crea un nuevo rol.

**Parámetros:**
- `roleData`: Datos del rol a crear

**Retorna:**
- El rol creado o `null` si hay error

### updateRole

```typescript
updateRole(roleId: number, roleData: Object): Promise<Object|null>
```

Actualiza un rol existente.

**Parámetros:**
- `roleId`: ID del rol a actualizar
- `roleData`: Datos actualizados del rol

**Retorna:**
- El rol actualizado o `null` si hay error

### deleteRole

```typescript
deleteRole(roleId: number): Promise<boolean>
```

Elimina un rol.

**Parámetros:**
- `roleId`: ID del rol a eliminar

**Retorna:**
- `true` si se eliminó correctamente, `false` en caso contrario

### changePage

```typescript
changePage(page: number): void
```

Cambia la página actual.

**Parámetros:**
- `page`: Número de página

### changePerPage

```typescript
changePerPage(perPage: number): void
```

Cambia el número de elementos por página.

**Parámetros:**
- `perPage`: Elementos por página

### updateFilters

```typescript
updateFilters(newFilters: Object): void
```

Actualiza los filtros y recarga los datos.

**Parámetros:**
- `newFilters`: Nuevos filtros a aplicar

### updateSort

```typescript
updateSort(sortData: { key: string, order: string }): void
```

Actualiza la ordenación y recarga los datos.

**Parámetros:**
- `sortData`: Datos de ordenación (key, order)

## Ejemplo de uso

```vue
<template>
  <div>
    <h1>Roles</h1>
    
    <!-- Filtros -->
    <div class="mb-4">
      <input 
        v-model="filters.search" 
        @input="updateFilters({ search: filters.search })"
        placeholder="Buscar roles..."
      />
    </div>
    
    <!-- Tabla de roles -->
    <table v-if="!loading">
      <thead>
        <tr>
          <th @click="updateSort({ key: 'name', order: filters.sort_direction === 'asc' ? 'desc' : 'asc' })">
            Nombre
          </th>
          <th>Slug</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in roles" :key="role.id">
          <td>{{ role.name }}</td>
          <td>{{ role.slug }}</td>
          <td>
            <button @click="editRole(role)">Editar</button>
            <button @click="confirmDeleteRole(role)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Paginación -->
    <div class="mt-4">
      <button 
        v-for="page in pagination.totalPages" 
        :key="page"
        @click="changePage(page)"
        :class="{ 'active': page === pagination.currentPage }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoles } from '@/composables/useRoles';

// Obtener estado y métodos del composable
const { 
  roles, 
  loading, 
  pagination, 
  filters, 
  fetchRoles, 
  updateFilters, 
  updateSort, 
  changePage, 
  deleteRole 
} = useRoles();

// Cargar roles al montar el componente
fetchRoles();

// Editar un rol
const editRole = (role) => {
  // Navegar a la página de edición
  router.push(`/admin/roles/${role.id}/edit`);
};

// Confirmar eliminación de un rol
const confirmDeleteRole = async (role) => {
  if (confirm(`¿Estás seguro de eliminar el rol ${role.name}?`)) {
    await deleteRole(role.id);
  }
};
</script>
```
