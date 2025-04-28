# Componentes de Paginación

Esta documentación describe los componentes de paginación disponibles en Vaxav.

## BasePaginator

`BasePaginator` es un componente para la navegación entre páginas de datos, diseñado con la estética sci-fi retro de Vaxav.

**Archivo**: `/components/ui/pagination/BasePaginator.vue`

### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `currentPage` | `Number` | `1` | Número de página actual |
| `totalPages` | `Number` | `1` | Número total de páginas |
| `total` | `Number` | `0` | Número total de elementos |
| `perPage` | `Number` | `10` | Número de elementos por página |
| `maxVisibleButtons` | `Number` | `5` | Número máximo de botones de página visibles |
| `showInfo` | `Boolean` | `true` | Si se muestra el texto informativo |
| `itemName` | `String` | `'elementos'` | Nombre de los elementos que se están paginando |

### Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `page-change` | `page` | Emitido cuando se cambia de página |

### Slots

El componente no tiene slots personalizables.

### Características

- Diseño responsive con versión móvil y de escritorio
- Muestra información sobre el rango de elementos que se están mostrando
- Botones de navegación para la página anterior y siguiente
- Botones numerados para las páginas
- Elipsis para indicar páginas ocultas
- Resaltado de la página actual

### Ejemplos de Uso

#### Paginador Básico

```vue
<template>
  <BasePaginator
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="totalItems"
    :per-page="itemsPerPage"
    @page-change="handlePageChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import BasePaginator from '@/components/ui/pagination/BasePaginator.vue';

const currentPage = ref(1);
const totalPages = ref(10);
const totalItems = ref(100);
const itemsPerPage = ref(10);

const handlePageChange = (page) => {
  currentPage.value = page;
  // Cargar datos para la nueva página
};
</script>
```

#### Paginador con Nombre de Elemento Personalizado

```vue
<template>
  <BasePaginator
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="totalUsers"
    :per-page="usersPerPage"
    item-name="usuarios"
    @page-change="handlePageChange"
  />
</template>
```

#### Paginador sin Información

```vue
<template>
  <BasePaginator
    :current-page="currentPage"
    :total-pages="totalPages"
    :show-info="false"
    @page-change="handlePageChange"
  />
</template>
```

#### Paginador con Número Limitado de Botones

```vue
<template>
  <BasePaginator
    :current-page="currentPage"
    :total-pages="totalPages"
    :max-visible-buttons="3"
    @page-change="handlePageChange"
  />
</template>
```

### Integración con API

El componente `BasePaginator` está diseñado para integrarse fácilmente con APIs que devuelven datos paginados. A continuación se muestra un ejemplo de cómo integrarlo con una API:

```vue
<template>
  <div>
    <BaseTable :columns="columns" :items="items" :loading="loading" />
    
    <BasePaginator
      :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages"
      :total="totalItems"
      :per-page="pagination.perPage"
      @page-change="changePage"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import BaseTable from '@/components/ui/tables/BaseTable.vue';
import BasePaginator from '@/components/ui/pagination/BasePaginator.vue';
import api from '@/services/api';

const items = ref([]);
const totalItems = ref(0);
const loading = ref(true);

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  perPage: 10
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      per_page: pagination.perPage
    };
    
    const response = await api.get('/api/items', { params });
    
    items.value = response.data.data;
    totalItems.value = response.data.total;
    pagination.totalPages = response.data.last_page;
    pagination.currentPage = response.data.current_page;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  pagination.currentPage = page;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
```

### Estilo

El componente `BasePaginator` sigue la guía de estilo de Vaxav, con un diseño oscuro que se integra perfectamente con el resto de la interfaz:

- Fondo oscuro para los botones (`bg-gray-700`)
- Bordes sutiles (`border-gray-600`)
- Efecto hover en los botones (`hover:bg-gray-600`)
- Resaltado de la página actual (`bg-gray-600`)
- Esquinas redondeadas para los botones de los extremos (`rounded-l-md`, `rounded-r-md`)
- Iconos de flechas para los botones de anterior y siguiente

### Accesibilidad

El componente `BasePaginator` está diseñado teniendo en cuenta la accesibilidad:

- Uso de elementos semánticos (`<nav>`, `<button>`)
- Atributo `aria-label="Pagination"` para el elemento `<nav>`
- Texto alternativo para los botones de anterior y siguiente
- Contraste de color adecuado para la legibilidad
- Versión móvil simplificada para pantallas pequeñas

### Mejores Prácticas

1. Actualiza siempre el estado de la paginación después de cargar datos
2. Muestra un estado de carga mientras se cargan los datos
3. Maneja los errores de carga de datos adecuadamente
4. Ajusta el número de elementos por página según el contexto
5. Considera usar un número impar de botones visibles para que la página actual esté centrada
6. Reinicia la paginación cuando cambien los filtros
