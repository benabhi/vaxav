# VxvTable

El componente `VxvTable` es una tabla de datos que permite mostrar información tabular con funcionalidades como ordenamiento, estados de carga y personalización de celdas.

## Casos de Uso

- Mostrar listas de datos estructurados
- Permitir ordenamiento de datos por columnas
- Mostrar información detallada con celdas personalizadas
- Proporcionar acciones para cada fila de datos

## Ejemplos

### Tabla Básica

Una tabla simple que muestra datos sin funcionalidades adicionales.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvTable
      :columns="columns"
      :items="items"
      row-key="id"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'role', label: 'Rol' }
];

const items = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', role: 'Editor' }
]);
</script>
```

### Tabla con Ordenamiento

Una tabla que permite ordenar los datos haciendo clic en los encabezados de columna.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvTable
      :columns="columns"
      :items="items"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      @sort="handleSort"
      @update:sortKey="sortKey = $event"
      @update:sortOrder="sortOrder = $event"
      row-key="id"
    />
    <div class="mt-4 text-gray-300">
      Ordenado por: {{ sortKey }} ({{ sortOrder }})
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo electrónico', sortable: true },
  { key: 'role', label: 'Rol', sortable: true }
];

const items = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', role: 'Editor' }
]);

const sortKey = ref('name');
const sortOrder = ref('asc');

const handleSort = (sortData) => {
  console.log('Ordenando por:', sortData.key, 'en orden:', sortData.order);
};
</script>
```

### Tabla con Estado de Carga

Una tabla que muestra un indicador de carga mientras se obtienen los datos.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <div class="mb-4">
      <VxvButton @click="toggleLoading">
        {{ loading ? 'Detener carga' : 'Simular carga' }}
      </VxvButton>
    </div>
    <VxvTable
      :columns="columns"
      :items="items"
      :loading="loading"
      row-key="id"
    >
      <template #loading>
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span class="ml-2 text-gray-300">Cargando datos...</span>
        </div>
      </template>
    </VxvTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';
import VxvButton from '@/components/ui/buttons/VxvButton.vue';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'role', label: 'Rol' }
];

const items = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
  { id: 2, name: 'María López', email: 'maria@example.com', role: 'Usuario' },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', role: 'Editor' }
]);

const loading = ref(false);

const toggleLoading = () => {
  loading.value = !loading.value;
};
</script>
```

### Tabla con Celdas Personalizadas

Una tabla con celdas personalizadas para mostrar información más compleja.

```vue
<template>
  <div class="p-4 bg-gray-900 rounded-lg">
    <VxvTable
      :columns="columns"
      :items="items"
      row-key="id"
    >
      <template #cell(name)="{ item }">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
            {{ item.name.charAt(0) }}
          </div>
          <span class="font-medium">{{ item.name }}</span>
        </div>
      </template>
      
      <template #cell(status)="{ item }">
        <div class="flex items-center">
          <span
            class="inline-block w-2 h-2 rounded-full mr-2"
            :class="item.active ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span>{{ item.active ? 'Activo' : 'Inactivo' }}</span>
        </div>
      </template>
      
      <template #actions="{ item }">
        <div class="flex space-x-2">
          <button class="text-blue-400 hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button class="text-red-400 hover:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </template>
    </VxvTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VxvTable from '@/components/ui/tables/VxvTable.vue';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'status', label: 'Estado' }
];

const items = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', active: true },
  { id: 2, name: 'María López', email: 'maria@example.com', active: false },
  { id: 3, name: 'Carlos Gómez', email: 'carlos@example.com', active: true }
]);
</script>
```

## Mejores Prácticas

- Proporciona siempre una clave única para las filas con `row-key`
- Usa slots personalizados para celdas con contenido complejo
- Implementa la ordenación para tablas con muchos datos
- Proporciona estados de carga y vacío claros
- Limita el número de columnas para evitar el desplazamiento horizontal
- Considera usar paginación para conjuntos de datos grandes (VxvDataTable)
