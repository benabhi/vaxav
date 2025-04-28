# Componentes de Tablas de Datos

Esta documentación describe los componentes de tablas de datos disponibles en Vaxav.

## BaseDataTable

`BaseDataTable` es un componente completo para mostrar, filtrar, ordenar y paginar datos tabulares.

**Archivo**: `/components/ui/tables/BaseDataTable.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `id` | `String` | Generado automáticamente | Identificador único para el componente |
| `columns` | `Array` | `[]` | Array de definiciones de columnas |
| `items` | `Array` | `[]` | Array de elementos a mostrar |
| `rowKey` | `String` | `'id'` | Propiedad a usar como clave única para las filas |
| `rowClass` | `String`, `Function` | `null` | Clase CSS o función que devuelve una clase para las filas |
| `loading` | `Boolean` | `false` | Si la tabla está en estado de carga |
| `clickable` | `Boolean` | `false` | Si las filas son clickeables |
| `initialSortKey` | `String` | `null` | Clave de ordenación inicial |
| `initialSortOrder` | `String` | `'asc'` | Orden de ordenación inicial (`'asc'` o `'desc'`) |
| `filters` | `Object` | `{}` | Filtros iniciales |
| `showFilters` | `Boolean` | `true` | Si se muestran los filtros |
| `showSearch` | `Boolean` | `true` | Si se muestra el campo de búsqueda |
| `searchLabel` | `String` | `''` | Etiqueta para el campo de búsqueda |
| `searchPlaceholder` | `String` | `'Buscar...'` | Placeholder para el campo de búsqueda |
| `immediateSearch` | `Boolean` | `true` | Si se emiten los cambios de búsqueda inmediatamente |
| `showPagination` | `Boolean` | `true` | Si se muestra la paginación |
| `currentPage` | `Number` | `1` | Número de página actual |
| `totalPages` | `Number` | `1` | Número total de páginas |
| `total` | `Number` | `0` | Número total de elementos |
| `showPerPage` | `Boolean` | `true` | Si se muestra el selector de elementos por página |
| `perPageLabel` | `String` | `'Mostrar'` | Etiqueta para el selector de elementos por página |
| `perPage` | `Number` | `10` | Número inicial de elementos por página |
| `perPageOptions` | `Array` | `[10, 20, 50, 100]` | Opciones disponibles para elementos por página |
| `itemName` | `String` | `'elementos'` | Nombre de los elementos que se están mostrando |

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:currentPage` | `page` | Emitido cuando cambia la página actual |
| `update:perPage` | `perPage` | Emitido cuando cambia el número de elementos por página |
| `update:sortKey` | `sortKey` | Emitido cuando cambia la clave de ordenación |
| `update:sortOrder` | `sortOrder` | Emitido cuando cambia el orden de ordenación |
| `update:filters` | `filters` | Emitido cuando cambian los filtros |
| `page-change` | `page` | Emitido cuando se cambia de página |
| `per-page-change` | `perPage` | Emitido cuando se cambia el número de elementos por página |
| `sort-change` | `{ key, order }` | Emitido cuando se cambia la ordenación |
| `filter-change` | `filters` | Emitido cuando se cambian los filtros |
| `row-click` | `item` | Emitido cuando se hace clic en una fila |

### Slots

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `filters` | - | Contenido adicional para la sección de filtros |
| `loading` | - | Contenido a mostrar cuando `loading` es `true` |
| `empty` | - | Contenido a mostrar cuando no hay elementos |
| `cell(column-key)` | `{ item, value, index }` | Personalización de una celda específica |
| `actions` | `{ item, index }` | Acciones para cada fila |

### Ejemplos de Uso

#### Tabla de Datos Básica

```vue
<template>
  <BaseDataTable
    :columns="columns"
    :items="users"
    :loading="loading"
    :total="totalUsers"
    :total-pages="totalPages"
    :current-page="currentPage"
    @page-change="fetchUsers"
    @sort-change="handleSort"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseDataTable from '@/components/ui/tables/BaseDataTable.vue';

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol' },
  { key: 'created_at', label: 'Fecha de registro', sortable: true }
];

const users = ref([]);
const loading = ref(false);
const totalUsers = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);

const fetchUsers = async (page = 1) => {
  loading.value = true;
  try {
    // Llamada a la API para obtener usuarios
    const response = await api.get('/users', {
      params: {
        page,
        per_page: 10
      }
    });
    
    users.value = response.data.data;
    totalUsers.value = response.data.total;
    totalPages.value = response.data.last_page;
    currentPage.value = page;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const handleSort = ({ key, order }) => {
  // Implementar lógica de ordenación
};

const handleFilterChange = (filters) => {
  // Implementar lógica de filtrado
};

// Cargar datos iniciales
fetchUsers();
</script>
```

#### Tabla de Datos con Celdas Personalizadas

```vue
<template>
  <BaseDataTable
    :columns="columns"
    :items="users"
    :loading="loading"
    :total="totalUsers"
    :total-pages="totalPages"
    :current-page="currentPage"
    @page-change="fetchUsers"
  >
    <template #cell(name)="{ item }">
      <div class="flex items-center">
        <img :src="item.avatar" class="w-8 h-8 rounded-full mr-2" />
        <span>{{ item.name }}</span>
      </div>
    </template>
    
    <template #cell(status)="{ item }">
      <span
        class="px-2 py-1 rounded-full text-xs"
        :class="item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ item.active ? 'Activo' : 'Inactivo' }}
      </span>
    </template>
    
    <template #actions="{ item }">
      <button class="text-blue-500 hover:text-blue-700 mr-2">Editar</button>
      <button class="text-red-500 hover:text-red-700">Eliminar</button>
    </template>
  </BaseDataTable>
</template>
```

#### Tabla de Datos con Filtros Personalizados

```vue
<template>
  <BaseDataTable
    :columns="columns"
    :items="users"
    :loading="loading"
    :filters="filters"
    @filter-change="handleFilterChange"
  >
    <template #filters>
      <div class="w-full md:w-auto">
        <label for="role-filter" class="block text-sm font-medium text-gray-300 mb-1">
          Rol
        </label>
        <select
          id="role-filter"
          v-model="filters.role"
          class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
          @change="handleFilterChange(filters)"
        >
          <option value="">Todos</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
          <option value="guest">Invitado</option>
        </select>
      </div>
      
      <div class="w-full md:w-auto">
        <label for="status-filter" class="block text-sm font-medium text-gray-300 mb-1">
          Estado
        </label>
        <select
          id="status-filter"
          v-model="filters.status"
          class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
          @change="handleFilterChange(filters)"
        >
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
    </template>
  </BaseDataTable>
</template>

<script setup>
import { reactive } from 'vue';

const filters = reactive({
  search: '',
  role: '',
  status: ''
});

const handleFilterChange = (newFilters) => {
  // Implementar lógica de filtrado
};
</script>
```

## BaseFilters

`BaseFilters` es un componente para crear formularios de filtrado con un diseño consistente.

**Archivo**: `/components/ui/filters/BaseFilters.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `id` | `String` | Generado automáticamente | Identificador único para el componente |
| `filters` | `Object` | `{}` | Filtros iniciales |
| `showSearch` | `Boolean` | `true` | Si se muestra el campo de búsqueda |
| `searchLabel` | `String` | `''` | Etiqueta para el campo de búsqueda |
| `searchPlaceholder` | `String` | `'Buscar...'` | Placeholder para el campo de búsqueda |
| `showApply` | `Boolean` | `true` | Si se muestra el botón de aplicar |
| `applyLabel` | `String` | `'Aplicar'` | Etiqueta para el botón de aplicar |
| `showReset` | `Boolean` | `true` | Si se muestra el botón de restablecer |
| `resetLabel` | `String` | `'Restablecer'` | Etiqueta para el botón de restablecer |
| `debounce` | `Number` | `300` | Tiempo de debounce para el campo de búsqueda en milisegundos |
| `immediate` | `Boolean` | `false` | Si se emiten los cambios inmediatamente |

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:filters` | `filters` | Emitido cuando cambian los filtros |
| `filter-change` | `filters` | Emitido cuando se aplican los filtros |
| `reset` | - | Emitido cuando se restablecen los filtros |

### Slots

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `filters` | - | Contenido adicional para la sección de filtros |

### Ejemplos de Uso

#### Filtros Básicos

```vue
<template>
  <BaseFilters
    v-model:filters="filters"
    search-label="Buscar usuarios"
    search-placeholder="Nombre, correo electrónico..."
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { reactive } from 'vue';
import BaseFilters from '@/components/ui/filters/BaseFilters.vue';

const filters = reactive({
  search: ''
});

const handleFilterChange = (newFilters) => {
  // Implementar lógica de filtrado
};
</script>
```

#### Filtros Personalizados

```vue
<template>
  <BaseFilters
    v-model:filters="filters"
    @filter-change="handleFilterChange"
    @reset="handleReset"
  >
    <template #filters>
      <div class="w-full md:w-auto">
        <label for="role-filter" class="block text-sm font-medium text-gray-300 mb-1">
          Rol
        </label>
        <select
          id="role-filter"
          v-model="filters.role"
          class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
          <option value="guest">Invitado</option>
        </select>
      </div>
      
      <div class="w-full md:w-auto">
        <label for="date-filter" class="block text-sm font-medium text-gray-300 mb-1">
          Fecha de registro
        </label>
        <input
          id="date-filter"
          v-model="filters.date"
          type="date"
          class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </template>
  </BaseFilters>
</template>
```

## Integración de Componentes

Los componentes `BaseDataTable`, `BaseTable`, `BasePaginator` y `BaseFilters` están diseñados para trabajar juntos de manera integrada. El componente `BaseDataTable` encapsula esta integración, proporcionando una solución completa para mostrar, filtrar, ordenar y paginar datos tabulares.

### Flujo de Datos

1. El usuario interactúa con los filtros en `BaseFilters`
2. `BaseDataTable` emite eventos de cambio de filtros
3. La aplicación realiza una llamada a la API con los filtros actualizados
4. Los datos filtrados se muestran en `BaseTable`
5. El usuario puede ordenar los datos haciendo clic en los encabezados de columna
6. El usuario puede navegar entre páginas usando `BasePaginator`

### Ejemplo de Integración con API

```vue
<template>
  <BaseDataTable
    :columns="columns"
    :items="items"
    :loading="loading"
    :total="total"
    :total-pages="totalPages"
    :current-page="currentPage"
    :per-page="perPage"
    :filters="filters"
    @page-change="handlePageChange"
    @per-page-change="handlePerPageChange"
    @sort-change="handleSortChange"
    @filter-change="handleFilterChange"
  >
    <!-- Slots personalizados aquí -->
  </BaseDataTable>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseDataTable from '@/components/ui/tables/BaseDataTable.vue';
import api from '@/services/api';

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol' },
  { key: 'created_at', label: 'Fecha de registro', sortable: true }
];

const items = ref([]);
const loading = ref(false);
const total = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const perPage = ref(10);
const sortKey = ref('created_at');
const sortOrder = ref('desc');
const filters = reactive({
  search: '',
  role: '',
  status: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/users', {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        sort_by: sortKey.value,
        sort_order: sortOrder.value,
        search: filters.search,
        role: filters.role,
        status: filters.status
      }
    });
    
    items.value = response.data.data;
    total.value = response.data.total;
    totalPages.value = response.data.last_page;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage;
  currentPage.value = 1; // Reset to first page
  fetchData();
};

const handleSortChange = ({ key, order }) => {
  sortKey.value = key;
  sortOrder.value = order;
  fetchData();
};

const handleFilterChange = (newFilters) => {
  Object.assign(filters, newFilters);
  currentPage.value = 1; // Reset to first page
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
```

## Mejores Prácticas

1. **Columnas Ordenables**: Marca las columnas como ordenables solo cuando sea necesario y tenga sentido para el usuario.
2. **Filtros Relevantes**: Incluye solo los filtros que sean relevantes para el conjunto de datos.
3. **Paginación Adecuada**: Ajusta el número de elementos por página según el contexto y el tamaño de los datos.
4. **Estado de Carga**: Muestra siempre un estado de carga claro durante las operaciones asíncronas.
5. **Manejo de Errores**: Implementa un manejo adecuado de errores para las llamadas a la API.
6. **Rendimiento**: Considera el rendimiento al trabajar con grandes conjuntos de datos, utilizando paginación del lado del servidor.
7. **Accesibilidad**: Asegúrate de que los componentes sean accesibles, con etiquetas adecuadas y navegación por teclado.
8. **Responsividad**: Diseña la interfaz para que sea utilizable en dispositivos móviles y de escritorio.
9. **Persistencia de Estado**: Considera persistir el estado de filtros y ordenación entre navegaciones.
10. **Feedback Visual**: Proporciona feedback visual claro para las acciones del usuario.
