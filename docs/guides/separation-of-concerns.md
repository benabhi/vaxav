# Guía de Separación de Responsabilidades

Esta guía explica cómo se ha implementado la separación de responsabilidades en la aplicación Vaxav, con un enfoque en la distinción entre la lógica de componentes y la lógica de vistas.

## Principios Generales

1. **Componentes Reutilizables**: Los componentes deben ser diseñados para ser reutilizables en diferentes contextos.
2. **Separación de Responsabilidades**: La lógica de negocio debe estar separada de la lógica de presentación.
3. **Composición**: Preferir la composición de componentes pequeños sobre componentes monolíticos.
4. **Consistencia**: Mantener un enfoque consistente en toda la aplicación.

## Estructura de Composables

Los composables son funciones que encapsulan y reutilizan la lógica con estado. Hemos implementado varios composables para manejar diferentes aspectos de la aplicación:

### useUsers.js

Encapsula toda la lógica relacionada con la gestión de usuarios:

```javascript
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

### usePagination.js

Maneja la lógica de paginación:

```javascript
const { 
  pagination, 
  changePage, 
  changePerPage, 
  updatePaginationFromResponse 
} = usePagination({
  initialPage: 1,
  initialPerPage: 10,
  onPageChange: () => fetchData()
});
```

### useFilters.js

Maneja la lógica de filtrado:

```javascript
const { 
  filters, 
  updateFilters, 
  resetFilters 
} = useFilters(
  { search: '', status: 'active' },
  (newFilters) => fetchData()
);
```

### useSorting.js

Maneja la lógica de ordenación:

```javascript
const { 
  sortKey, 
  sortOrder, 
  handleSort 
} = useSorting({
  initialSortKey: 'name',
  initialSortOrder: 'asc',
  onSortChange: (sort) => fetchData()
});
```

### useDataTable.js

Combina los composables anteriores para proporcionar una solución completa para tablas de datos:

```javascript
const {
  pagination,
  filters,
  sortKey,
  sortOrder,
  changePage,
  changePerPage,
  updateFilters,
  resetFilters,
  handleSort,
  updateFromResponse,
  getRequestParams
} = useDataTable({
  pagination: { initialPage: 1, initialPerPage: 10 },
  filters: { search: '', status: 'active' },
  sorting: { initialSortKey: 'name', initialSortOrder: 'asc' },
  onDataChange: (params) => fetchData(params)
});
```

## Componentes Reutilizables

### AdminCrudView

Un componente de vista reutilizable para operaciones CRUD en el panel de administración:

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

## Ejemplos de Uso

### Ejemplo 1: Vista de Usuarios con Composables

```vue
<script setup>
import { onMounted } from 'vue';
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

// Cargar datos al montar el componente
onMounted(() => {
  fetchUsers();
});
</script>
```

### Ejemplo 2: Tabla de Datos Personalizada

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import api from '@/services/api';

const items = ref([]);
const loading = ref(false);

// Usar el composable de tabla de datos
const dataTable = useDataTable({
  onDataChange: fetchData
});

// Función para cargar datos
async function fetchData(params) {
  loading.value = true;
  try {
    const response = await api.get('/api/items', { params });
    items.value = response.data.data;
    dataTable.updateFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchData(dataTable.getRequestParams());
});
</script>
```

## Mejores Prácticas

1. **Extraer Lógica de Negocio**: Siempre extraer la lógica de negocio a composables para mantener las vistas limpias y enfocadas en la presentación.

2. **Reutilizar Composables**: Crear composables genéricos para funcionalidades comunes como paginación, filtros y ordenación.

3. **Componentes de Vista**: Crear componentes de vista reutilizables para patrones comunes como CRUD.

4. **Consistencia**: Mantener un enfoque consistente en todas las vistas, utilizando los mismos componentes y patrones.

5. **Documentación**: Documentar los composables y componentes para facilitar su uso por otros desarrolladores.

## Conclusión

La separación de responsabilidades entre vistas y componentes es fundamental para crear una aplicación mantenible y escalable. Utilizando composables para la lógica de negocio y componentes reutilizables para la presentación, podemos lograr un código más limpio, más fácil de mantener y con menos duplicación.

Los composables nos permiten extraer y reutilizar la lógica con estado, mientras que los componentes de vista nos permiten crear interfaces consistentes y reutilizables. Esta combinación nos proporciona una base sólida para el desarrollo de la aplicación Vaxav.
