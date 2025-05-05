# VxvTable

`VxvTable` es un componente para mostrar datos tabulares con un estilo consistente en toda la aplicación. Incluye funcionalidades como ordenamiento, estados de carga y personalización de celdas.

## Ubicación

```
frontend/src/components/ui/tables/VxvTable.vue
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `columns` | `Array` | `[]` | Array de definiciones de columnas |
| `items` | `Array` | `[]` | Array de elementos a mostrar |
| `rowKey` | `String` | `null` | Propiedad a usar como clave única para las filas |
| `rowClass` | `String`, `Function` | `null` | Clase CSS o función que devuelve una clase para las filas |
| `loading` | `Boolean` | `false` | Si la tabla está en estado de carga |
| `clickable` | `Boolean` | `false` | Si las filas son clickeables |
| `sortKey` | `String` | `null` | Clave de ordenación actual |
| `sortOrder` | `String` | `'asc'` | Orden de ordenación actual (`'asc'` o `'desc'`) |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `sort` | `{ key: string, order: string }` | Emitido cuando se hace clic en una columna ordenable |
| `update:sortKey` | `string` | Emitido cuando cambia la clave de ordenación (para v-model) |
| `update:sortOrder` | `string` | Emitido cuando cambia el orden de ordenación (para v-model) |
| `row-click` | `item` | Emitido cuando se hace clic en una fila (si `clickable` es `true`) |

## Slots

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `loading` | - | Contenido a mostrar cuando `loading` es `true` |
| `empty` | - | Contenido a mostrar cuando no hay elementos |
| `cell(column-key)` | `{ item, value, index }` | Personalización de una celda específica |
| `actions` | `{ item, index }` | Acciones para cada fila |

## Formato de columnas

Cada objeto de columna debe tener las siguientes propiedades:

```js
{
  key: 'name', // Clave para acceder al valor en el objeto item
  label: 'Nombre', // Etiqueta a mostrar en el encabezado
  sortable: true, // Opcional: si la columna es ordenable
  class: 'w-1/4', // Opcional: clases CSS para el encabezado
  tdClass: 'font-bold', // Opcional: clases CSS para las celdas
  nowrap: true, // Opcional: si el contenido no debe ajustarse
  html: false, // Opcional: si el contenido debe interpretarse como HTML
  width: '200px' // Opcional: ancho de la columna
}
```

## Ejemplos de Uso

### Tabla Básica

```vue
<template>
  <VxvTable
    :columns="columns"
    :items="users"
    row-key="id"
  />
</template>

<script setup>
import VxvTable from '@/components/ui/tables/VxvTable.vue';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'role', label: 'Rol' }
];

const users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' }
];
</script>
```

### Tabla con Ordenamiento

```vue
<template>
  <VxvTable
    :columns="columns"
    :items="users"
    :sort-key="sortKey"
    :sort-order="sortOrder"
    @sort="handleSort"
    @update:sortKey="sortKey = $event"
    @update:sortOrder="sortOrder = $event"
    row-key="id"
  />
</template>

<script setup>
import { ref } from 'vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol' }
];

const users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' }
];

const sortKey = ref('name');
const sortOrder = ref('asc');

const handleSort = (sortData) => {
  console.log('Ordenando por:', sortData.key, 'en orden:', sortData.order);
  // Aquí puedes implementar la lógica de ordenamiento o hacer una llamada a la API
};
</script>
```

### Tabla con Celdas Personalizadas

```vue
<template>
  <VxvTable
    :columns="columns"
    :items="users"
    row-key="id"
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
  </VxvTable>
</template>
```

## Notas de Implementación

- El componente maneja internamente el estado de ordenamiento y emite eventos para sincronizarlo con el componente padre.
- Soporta ordenamiento de columnas haciendo clic en los encabezados de columna.
- Proporciona indicadores visuales para el estado de ordenamiento actual.
- Puede ser utilizado de forma independiente o como parte de VxvDataTable para funcionalidades más avanzadas.

## Implementación del Ordenamiento

Para que el ordenamiento funcione correctamente, es necesario implementar la lógica de ordenamiento en el componente padre. El componente VxvTable solo maneja el estado visual del ordenamiento y emite eventos cuando cambia, pero no ordena los datos por sí mismo.

Ejemplo de implementación de ordenamiento en el componente padre:

```js
// Computed para ordenar los datos
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    const sortField = sortKey.value;
    const sortDirection = sortOrder.value;

    // Obtener los valores a comparar
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Comparar valores
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
});

// Función para manejar el evento de ordenamiento
const handleSort = (sortData) => {
  sortKey.value = sortData.key;
  sortOrder.value = sortData.order;
};
```

Luego, pasa `sortedItems` al componente VxvTable en lugar de los datos sin ordenar:

```vue
<VxvTable
  :columns="columns"
  :items="sortedItems"
  :sort-key="sortKey"
  :sort-order="sortOrder"
  @sort="handleSort"
  @update:sortKey="sortKey = $event"
  @update:sortOrder="sortOrder = $event"
/>
```
