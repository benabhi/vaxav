# Guía de Uso de Composables

Esta guía explica cómo utilizar los composables en la aplicación Vaxav para mejorar la reutilización de código y la separación de responsabilidades.

## ¿Qué son los Composables?

Los composables son funciones que encapsulan y reutilizan la lógica con estado en aplicaciones Vue. Permiten extraer la lógica de los componentes para que pueda ser reutilizada en diferentes partes de la aplicación.

## Beneficios de los Composables

- **Reutilización de código**: Evita la duplicación de código entre componentes.
- **Separación de responsabilidades**: Separa la lógica de negocio de la lógica de presentación.
- **Mejor mantenibilidad**: Facilita el mantenimiento y la actualización del código.
- **Pruebas más sencillas**: Permite probar la lógica de negocio de forma aislada.

## Composables Disponibles

### Composables de Entidades

Estos composables encapsulan la lógica relacionada con entidades específicas:

- [useUsers](../composables/useUsers.md): Gestión de usuarios
- [useRoles](../composables/useRoles.md): Gestión de roles
- [usePermissions](../composables/usePermissions.md): Gestión de permisos

### Composables Genéricos

Estos composables proporcionan funcionalidad genérica que puede ser utilizada en diferentes contextos:

- [usePagination](../composables/usePagination.md): Gestión de paginación
- [useFilters](../composables/useFilters.md): Gestión de filtros
- [useSorting](../composables/useSorting.md): Gestión de ordenación
- [useDataTable](../composables/useDataTable.md): Gestión de tablas de datos
- [useForm](../composables/useForm.md): Gestión de formularios
- [useConfirmation](../composables/useConfirmation.md): Gestión de diálogos de confirmación

## Patrones de Uso

### Patrón Básico

```javascript
// Importar el composable
import { useUsers } from '@/composables/useUsers';

// Usar el composable
const {
  users,
  loading,
  fetchUsers
} = useUsers();

// Cargar datos al montar el componente
onMounted(() => {
  fetchUsers();
});
```

### Composición de Composables

Los composables pueden ser combinados para crear funcionalidad más compleja:

```javascript
// Importar composables
import { usePagination } from '@/composables/usePagination';
import { useFilters } from '@/composables/useFilters';
import { useSorting } from '@/composables/useSorting';
import api from '@/services/api';

// Crear un composable personalizado
function useCustomData() {
  const { pagination, changePage, changePerPage } = usePagination();
  const { filters, updateFilters, resetFilters } = useFilters();
  const { sortKey, sortOrder, handleSort } = useSorting();
  
  const items = ref([]);
  const loading = ref(false);
  
  const fetchData = async () => {
    loading.value = true;
    try {
      const params = {
        ...filters,
        sort_field: sortKey.value,
        sort_direction: sortOrder.value,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };
      
      const response = await api.get('/api/custom-data', { params });
      items.value = response.data.data;
      
      // Actualizar paginación
      pagination.totalPages = response.data.last_page || 1;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loading.value = false;
    }
  };
  
  return {
    items,
    loading,
    pagination,
    filters,
    sortKey,
    sortOrder,
    changePage,
    changePerPage,
    updateFilters,
    resetFilters,
    handleSort,
    fetchData
  };
}
```

### Uso con Componentes

Los composables se integran fácilmente con los componentes de la aplicación:

```vue
<template>
  <AdminCrudView
    title="Gestión de Usuarios"
    tableTitle="Usuarios"
    :breadcrumbItems="[{ text: 'Usuarios' }]"
    :columns="columns"
    :items="users"
    :loading="loading"
    :pagination="pagination"
    :filters="filters"
    @page-change="changePage"
    @per-page-change="changePerPage"
    @filter-change="updateFilters"
    @sort-change="updateSort"
    @create="createUser"
  >
    <!-- Slots personalizados -->
  </AdminCrudView>
</template>

<script setup>
import { onMounted } from 'vue';
import AdminCrudView from '@/components/admin/AdminCrudView.vue';
import { useUsers } from '@/composables/useUsers';

// Usar el composable de usuarios
const {
  users,
  loading,
  pagination,
  filters,
  fetchUsers,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useUsers();

// Definir columnas
const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'roles', label: 'Roles' }
];

// Cargar usuarios al montar el componente
onMounted(() => {
  fetchUsers();
});
</script>
```

## Mejores Prácticas

### 1. Nombrado Consistente

Utiliza un prefijo `use` para todos los composables, siguiendo la convención de Vue 3:

```javascript
// Correcto
export function useUsers() { ... }

// Incorrecto
export function getUsers() { ... }
```

### 2. Documentación Clara

Documenta cada composable con JSDoc para facilitar su uso:

```javascript
/**
 * Composable para gestionar usuarios
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y métodos para gestionar usuarios
 */
export function useUsers(options = {}) {
  // Implementación
}
```

### 3. Separación de Responsabilidades

Cada composable debe tener una responsabilidad clara y bien definida:

```javascript
// Correcto: Composable con responsabilidad única
export function usePagination() { ... }
export function useFilters() { ... }

// Incorrecto: Composable con múltiples responsabilidades
export function useTableData() {
  // Paginación, filtros, ordenación, etc.
}
```

### 4. Composición sobre Herencia

Prefiere componer composables más pequeños en lugar de crear composables monolíticos:

```javascript
// Correcto: Composición de composables
export function useDataTable() {
  const pagination = usePagination();
  const filters = useFilters();
  const sorting = useSorting();
  
  // Combinar funcionalidad
  
  return {
    ...pagination,
    ...filters,
    ...sorting,
    // Funcionalidad adicional
  };
}
```

### 5. Estado Reactivo

Utiliza `ref`, `reactive` y `computed` para crear estado reactivo:

```javascript
export function useCounter() {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  
  const increment = () => {
    count.value++;
  };
  
  return {
    count,
    doubled,
    increment
  };
}
```

### 6. Manejo de Efectos Secundarios

Utiliza funciones asíncronas para manejar efectos secundarios:

```javascript
export function useUsers() {
  const users = ref([]);
  const loading = ref(false);
  
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const response = await api.get('/users');
      users.value = response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      loading.value = false;
    }
  };
  
  return {
    users,
    loading,
    fetchUsers
  };
}
```

## Conclusión

Los composables son una herramienta poderosa para mejorar la reutilización de código y la separación de responsabilidades en aplicaciones Vue. Siguiendo los patrones y mejores prácticas descritos en esta guía, podrás crear composables efectivos y mantenibles para tu aplicación.
