# Composable useSkillCategories

El composable `useSkillCategories` proporciona funcionalidad para gestionar las categorías de habilidades en el frontend de VAXAV.

## Importación

```javascript
import { useSkillCategories } from '@/composables/useSkillCategories';
```

## Estado

El composable proporciona el siguiente estado:

- `categories`: Array de objetos que contiene las categorías de habilidades cargadas.
- `loading`: Booleano que indica si hay una operación de carga en curso.
- `pagination`: Objeto con información de paginación:
  - `currentPage`: Número de página actual.
  - `totalPages`: Número total de páginas.
  - `perPage`: Número de elementos por página.
- `filters`: Objeto con los filtros aplicados:
  - `search`: Cadena de búsqueda.
  - `sort_field`: Campo por el que se ordena.
  - `sort_direction`: Dirección de ordenación ('asc' o 'desc').

## Métodos

### fetchCategories

Obtiene la lista de categorías de habilidades con filtros y paginación.

```javascript
const { fetchCategories } = useSkillCategories();

// Cargar categorías
await fetchCategories();
```

### createCategory

Crea una nueva categoría de habilidad.

```javascript
const { createCategory } = useSkillCategories();

// Datos de la categoría
const categoryData = {
  name: 'Navegación',
  description: 'Habilidades relacionadas con la navegación espacial.'
};

// Crear categoría
const result = await createCategory(categoryData);
```

### updateCategory

Actualiza una categoría de habilidad existente.

```javascript
const { updateCategory } = useSkillCategories();

// Datos actualizados de la categoría
const categoryData = {
  name: 'Navegación Espacial',
  description: 'Habilidades relacionadas con la navegación en el espacio profundo.'
};

// Actualizar categoría
const result = await updateCategory(categoryId, categoryData);
```

### deleteCategory

Elimina una categoría de habilidad.

```javascript
const { deleteCategory } = useSkillCategories();

// Eliminar categoría
const success = await deleteCategory(categoryId);
```

### getCategory

Obtiene una categoría de habilidad específica por su ID.

```javascript
const { getCategory } = useSkillCategories();

// Obtener categoría
const category = await getCategory(categoryId);
```

### changePage

Cambia la página actual y recarga los datos.

```javascript
const { changePage } = useSkillCategories();

// Cambiar a la página 2
changePage(2);
```

### changePerPage

Cambia el número de elementos por página y recarga los datos.

```javascript
const { changePerPage } = useSkillCategories();

// Mostrar 20 elementos por página
changePerPage(20);
```

### updateFilters

Actualiza los filtros aplicados y recarga los datos.

```javascript
const { updateFilters } = useSkillCategories();

// Aplicar filtros
updateFilters({
  search: 'navegación'
});
```

### updateSort

Actualiza la ordenación y recarga los datos.

```javascript
const { updateSort } = useSkillCategories();

// Ordenar por nombre en orden ascendente
updateSort({
  key: 'name',
  order: 'asc'
});
```

### resetFilters

Restablece todos los filtros a sus valores por defecto y recarga los datos.

```javascript
const { resetFilters } = useSkillCategories();

// Restablecer filtros
resetFilters();
```

## Ejemplo de Uso Completo

```javascript
<script setup>
import { onMounted } from 'vue';
import { useSkillCategories } from '@/composables/useSkillCategories';

// Obtener estado y métodos del composable
const {
  categories,
  loading,
  pagination,
  filters,
  fetchCategories,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  resetFilters
} = useSkillCategories();

// Manejar cambio de filtro de búsqueda
const handleSearchChange = (searchText) => {
  updateFilters({ search: searchText });
};

// Manejar reset de filtros
const handleReset = () => {
  resetFilters();
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div>
    <!-- Filtros -->
    <div class="filters">
      <input 
        v-model="filters.search" 
        @input="handleSearchChange(filters.search)" 
        placeholder="Buscar categorías..." 
      />
      
      <button @click="handleReset">Restablecer</button>
    </div>
    
    <!-- Tabla de categorías -->
    <table v-if="!loading && categories.length > 0">
      <!-- Cabecera de la tabla -->
      <thead>
        <tr>
          <th @click="updateSort({ key: 'name', order: filters.sort_direction === 'asc' ? 'desc' : 'asc' })">
            Nombre
          </th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      
      <!-- Cuerpo de la tabla -->
      <tbody>
        <tr v-for="category in categories" :key="category.id">
          <td>{{ category.name }}</td>
          <td>{{ category.description }}</td>
          <td>
            <button @click="editCategory(category)">Editar</button>
            <button @click="deleteCategory(category.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Estado de carga -->
    <div v-if="loading">Cargando...</div>
    
    <!-- Mensaje de no resultados -->
    <div v-if="!loading && categories.length === 0">No se encontraron categorías.</div>
    
    <!-- Paginación -->
    <div class="pagination">
      <button 
        :disabled="pagination.currentPage === 1" 
        @click="changePage(pagination.currentPage - 1)"
      >
        Anterior
      </button>
      
      <span>Página {{ pagination.currentPage }} de {{ pagination.totalPages }}</span>
      
      <button 
        :disabled="pagination.currentPage === pagination.totalPages" 
        @click="changePage(pagination.currentPage + 1)"
      >
        Siguiente
      </button>
      
      <select v-model="pagination.perPage" @change="changePerPage(pagination.perPage)">
        <option value="10">10 por página</option>
        <option value="20">20 por página</option>
        <option value="50">50 por página</option>
        <option value="100">100 por página</option>
      </select>
    </div>
  </div>
</template>
```

## Notas Importantes

- El composable maneja automáticamente las notificaciones de éxito y error utilizando el store `useNotificationStore`.
- El método `resetFilters` restablece todos los filtros a sus valores por defecto, pero mantiene la ordenación actual.
- Las categorías de habilidades son utilizadas principalmente en el formulario de creación y edición de habilidades, así como en el filtro de categorías en la vista de habilidades.
