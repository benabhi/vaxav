# Componentes de Tablas

Esta documentación describe los componentes de tabla disponibles en Vaxav.

## BaseTable

`BaseTable` es un componente para mostrar datos tabulares con un estilo consistente en toda la aplicación.

**Archivo**: `/components/ui/tables/BaseTable.vue`

### Props

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

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `sort` | `key` | Emitido cuando se hace clic en una columna ordenable |
| `row-click` | `item` | Emitido cuando se hace clic en una fila (si `clickable` es `true`) |

### Slots

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `loading` | - | Contenido a mostrar cuando `loading` es `true` |
| `empty` | - | Contenido a mostrar cuando no hay elementos |
| `cell(column-key)` | `{ item, value, index }` | Personalización de una celda específica |
| `actions` | `{ item, index }` | Acciones para cada fila |

### Formato de columnas

Cada objeto de columna debe tener las siguientes propiedades:

```js
{
  key: 'name', // Clave para acceder al valor en el objeto item
  label: 'Nombre', // Etiqueta a mostrar en el encabezado
  sortable: true, // Opcional: si la columna es ordenable
  class: 'w-1/4', // Opcional: clases CSS para el encabezado
  tdClass: 'font-bold', // Opcional: clases CSS para las celdas
  nowrap: true, // Opcional: si el contenido no debe ajustarse
  html: false // Opcional: si el contenido debe interpretarse como HTML
}
```

### Ejemplos de Uso

#### Tabla Básica

```vue
<template>
  <BaseTable
    :columns="columns"
    :items="users"
    row-key="id"
  />
</template>

<script setup>
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

#### Tabla con Celdas Personalizadas

```vue
<template>
  <BaseTable
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
  </BaseTable>
</template>
```

#### Tabla con Ordenación

```vue
<template>
  <BaseTable
    :columns="columns"
    :items="sortedItems"
    :sort-key="sortKey"
    :sort-order="sortOrder"
    @sort="handleSort"
    row-key="id"
  />
</template>

<script setup>
import { ref, computed } from 'vue';

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

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const sortedItems = computed(() => {
  return [...users].sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});
</script>
```

#### Tabla con Estado de Carga

```vue
<template>
  <BaseTable
    :columns="columns"
    :items="users"
    :loading="loading"
    row-key="id"
  >
    <template #loading>
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-2">Cargando datos...</span>
      </div>
    </template>
  </BaseTable>
</template>
```

#### Tabla con Filas Clickeables

```vue
<template>
  <BaseTable
    :columns="columns"
    :items="users"
    row-key="id"
    clickable
    @row-click="handleRowClick"
  />
</template>

<script setup>
const handleRowClick = (item) => {
  console.log('Fila clickeada:', item);
  // Navegar a la página de detalles, abrir un modal, etc.
};
</script>
```

### Estilo

El componente `BaseTable` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro para la tabla (`bg-gray-800`)
- Bordes sutiles entre filas (`divide-y divide-gray-700`)
- Efecto hover en las filas (`hover:bg-gray-700`)
- Encabezados en mayúsculas con espaciado de tracking (`uppercase tracking-wider`)
- Esquinas redondeadas (`rounded-lg`)
- Sombra sutil (`shadow-sm`)

### Accesibilidad

El componente `BaseTable` está diseñado teniendo en cuenta la accesibilidad:

- Uso adecuado de elementos semánticos (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- Atributos `scope="col"` en los encabezados de columna
- Texto alternativo para los iconos de ordenación
- Mensajes claros para estados de carga y vacío
- Contraste de color adecuado para la legibilidad

### Mejores Prácticas

1. Proporciona siempre una clave única para las filas con `row-key`
2. Usa slots personalizados para celdas con contenido complejo
3. Implementa la ordenación para tablas con muchos datos
4. Proporciona estados de carga y vacío claros
5. Limita el número de columnas para evitar el desplazamiento horizontal
6. Considera usar paginación para conjuntos de datos grandes
