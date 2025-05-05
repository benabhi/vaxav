# VxvFilters

El componente `VxvFilters` proporciona una interfaz de filtrado flexible con soporte para búsqueda, filtros personalizados y botones de acción.

## Importación

```javascript
import VxvFilters from '@/components/ui/filters/VxvFilters.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `id` | `String` | Generado aleatoriamente | Identificador único para el componente |
| `filters` | `Object` | `{}` | Filtros iniciales |
| `defaultFilters` | `Object` | `{}` | Valores por defecto para los filtros al restablecer |
| `showSearch` | `Boolean` | `true` | Si se debe mostrar el campo de búsqueda |
| `searchLabel` | `String` | `''` | Etiqueta para el campo de búsqueda |
| `searchPlaceholder` | `String` | `'Buscar...'` | Placeholder para el campo de búsqueda |
| `showApply` | `Boolean` | `true` | Si se debe mostrar el botón de aplicar |
| `applyLabel` | `String` | `'Aplicar'` | Etiqueta para el botón de aplicar |
| `showReset` | `Boolean` | `true` | Si se debe mostrar el botón de restablecer |
| `resetLabel` | `String` | `'Restablecer'` | Etiqueta para el botón de restablecer |
| `debounce` | `Number` | `300` | Tiempo de debounce para el campo de búsqueda en milisegundos |
| `immediate` | `Boolean` | `false` | Si se deben emitir los cambios inmediatamente |
| `showLabels` | `Boolean` | `true` | Si se deben mostrar las etiquetas en una fila separada encima de los inputs |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:filters` | `Object` | Se emite cuando cambian los filtros (para v-model) |
| `filter-change` | `Object` | Se emite cuando cambian los filtros |
| `reset` | - | Se emite cuando se restablecen los filtros |

## Slots

| Nombre | Descripción |
|--------|-------------|
| `filters` | Contenido para los filtros personalizados |

## Ejemplos de Uso

### Filtros básicos con búsqueda

```vue
<template>
  <VxvFilters
    v-model:filters="filters"
    @filter-change="loadData"
  />
</template>

<script setup>
import { ref } from 'vue';

const filters = ref({
  search: ''
});

const loadData = (filters) => {
  console.log('Filtros aplicados:', filters);
  // Cargar datos con los filtros
};
</script>
```

### Filtros personalizados con valores por defecto

```vue
<template>
  <VxvFilters
    v-model:filters="filters"
    :defaultFilters="defaultFilters"
    searchLabel="Buscar usuario"
    @filter-change="loadData"
  >
    <template #filters>
      <div class="w-full md:w-48">
        <label for="status" class="block text-sm font-medium text-gray-300 mb-1">Estado</label>
        <VxvSelect
          id="status"
          v-model="filters.status"
          :options="statusOptions"
          @update:modelValue="loadData"
        />
      </div>
      
      <div class="w-full md:w-48">
        <label for="role" class="block text-sm font-medium text-gray-300 mb-1">Rol</label>
        <VxvSelect
          id="role"
          v-model="filters.role"
          :options="roleOptions"
          @update:modelValue="loadData"
        />
      </div>
    </template>
  </VxvFilters>
</template>

<script setup>
import { ref } from 'vue';
import VxvSelect from '@/components/ui/forms/VxvSelect.vue';

const filters = ref({
  search: '',
  status: 'active',
  role: ''
});

const defaultFilters = {
  search: '',
  status: 'active', // Valor por defecto para status
  role: ''
};

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'pending', label: 'Pendiente' }
];

const roleOptions = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
  { value: 'guest', label: 'Invitado' }
];

const loadData = (filters) => {
  console.log('Filtros aplicados:', filters);
  // Cargar datos con los filtros
};
</script>
```

### Filtros con aplicación manual

```vue
<template>
  <VxvFilters
    v-model:filters="filters"
    :immediate="false"
    @filter-change="loadData"
  >
    <template #filters>
      <div class="w-full md:w-48">
        <label for="date-from" class="block text-sm font-medium text-gray-300 mb-1">Desde</label>
        <VxvInput
          id="date-from"
          v-model="filters.dateFrom"
          type="date"
        />
      </div>
      
      <div class="w-full md:w-48">
        <label for="date-to" class="block text-sm font-medium text-gray-300 mb-1">Hasta</label>
        <VxvInput
          id="date-to"
          v-model="filters.dateTo"
          type="date"
        />
      </div>
    </template>
  </VxvFilters>
</template>
```

## Notas de Uso

### Valores por defecto para los filtros

El componente `VxvFilters` ahora soporta valores por defecto para los filtros a través de la propiedad `defaultFilters`. Estos valores se utilizan cuando:

1. Se inicializa el componente y no hay valores iniciales en `filters`
2. Se presiona el botón "Restablecer"

Ejemplo de uso con valores por defecto:

```vue
<template>
  <VxvFilters
    v-model:filters="filters"
    :defaultFilters="defaultFilters"
    @filter-change="loadData"
  />
</template>

<script setup>
import { ref } from 'vue';

const filters = ref({
  search: '',
  status: 'all',
  sortBy: 'created_at'
});

const defaultFilters = {
  search: '',
  status: 'active', // Valor por defecto diferente al inicial
  sortBy: 'created_at'
};
</script>
```

En este ejemplo, cuando se presione "Restablecer", el filtro `status` cambiará a `'active'` en lugar de vaciarse.

### Comportamiento del botón "Restablecer"

Cuando se presiona el botón "Restablecer":

1. Si hay un valor en `defaultFilters` para un filtro, se utilizará ese valor
2. Si no hay un valor en `defaultFilters`, el filtro se restablecerá según su tipo:
   - Strings: `''` (cadena vacía)
   - Arrays: `[]` (array vacío)
   - Objects: `{}` (objeto vacío)
   - Numbers: `0` (cero)
   - Booleans: `false`
   - Otros: `null`
3. Los campos `sort_field` y `sort_direction` se mantienen sin cambios

### Integración con VxvDataTable

El componente `VxvFilters` emite un evento `reset` cuando se presiona el botón "Restablecer". Este evento es utilizado por `VxvDataTable` para restablecer la paginación y otros valores internos.

```vue
<template>
  <VxvFilters
    v-model:filters="filters"
    @filter-change="loadData"
    @reset="handleReset"
  />
  
  <VxvDataTable
    :data="data"
    :columns="columns"
    :filters="filters"
  />
</template>

<script setup>
const handleReset = () => {
  // Acciones adicionales al restablecer los filtros
  // Por ejemplo, volver a la primera página
  currentPage.value = 1;
};
</script>
```
