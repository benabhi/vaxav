# Composable useSkills

El composable `useSkills` proporciona funcionalidad para gestionar las habilidades en el frontend de VAXAV.

## Importación

```javascript
import { useSkills } from '@/composables/useSkills';
```

## Estado

El composable proporciona el siguiente estado:

- `skills`: Array de objetos que contiene las habilidades cargadas.
- `loading`: Booleano que indica si hay una operación de carga en curso.
- `pagination`: Objeto con información de paginación:
  - `currentPage`: Número de página actual.
  - `totalPages`: Número total de páginas.
  - `perPage`: Número de elementos por página.
- `filters`: Objeto con los filtros aplicados:
  - `search`: Cadena de búsqueda.
  - `category_id`: ID de la categoría seleccionada.
  - `multiplier`: Multiplicador seleccionado.
  - `sort_field`: Campo por el que se ordena.
  - `sort_direction`: Dirección de ordenación ('asc' o 'desc').

## Métodos

### fetchSkills

Obtiene la lista de habilidades con filtros y paginación.

```javascript
const { fetchSkills } = useSkills();

// Cargar habilidades
await fetchSkills();
```

### createSkill

Crea una nueva habilidad.

```javascript
const { createSkill } = useSkills();

// Datos de la habilidad
const skillData = {
  name: 'Navegación Espacial',
  description: 'Permite navegar eficientemente por el espacio.',
  skill_category_id: 1,
  multiplier: 2,
  prerequisites: [
    { prerequisite_id: 3, prerequisite_level: 2 }
  ]
};

// Crear habilidad
const result = await createSkill(skillData);
```

### updateSkill

Actualiza una habilidad existente.

```javascript
const { updateSkill } = useSkills();

// Datos actualizados de la habilidad
const skillData = {
  name: 'Navegación Espacial Avanzada',
  description: 'Permite navegar eficientemente por el espacio en condiciones adversas.',
  skill_category_id: 1,
  multiplier: 3,
  prerequisites: [
    { prerequisite_id: 3, prerequisite_level: 3 },
    { prerequisite_id: 5, prerequisite_level: 2 }
  ]
};

// Actualizar habilidad
const result = await updateSkill(skillId, skillData);
```

### deleteSkill

Elimina una habilidad.

```javascript
const { deleteSkill } = useSkills();

// Eliminar habilidad
const success = await deleteSkill(skillId);
```

### getSkill

Obtiene una habilidad específica por su ID.

```javascript
const { getSkill } = useSkills();

// Obtener habilidad
const skill = await getSkill(skillId);
```

### getSkillsForDropdown

Obtiene una lista simplificada de habilidades para usar en dropdowns.

```javascript
const { getSkillsForDropdown } = useSkills();

// Obtener habilidades para dropdown
const dropdownSkills = await getSkillsForDropdown();
```

### changePage

Cambia la página actual y recarga los datos.

```javascript
const { changePage } = useSkills();

// Cambiar a la página 2
changePage(2);
```

### changePerPage

Cambia el número de elementos por página y recarga los datos.

```javascript
const { changePerPage } = useSkills();

// Mostrar 20 elementos por página
changePerPage(20);
```

### updateFilters

Actualiza los filtros aplicados y recarga los datos.

```javascript
const { updateFilters } = useSkills();

// Aplicar filtros
updateFilters({
  search: 'navegación',
  category_id: 1,
  multiplier: 2
});
```

### updateSort

Actualiza la ordenación y recarga los datos.

```javascript
const { updateSort } = useSkills();

// Ordenar por nombre en orden ascendente
updateSort({
  key: 'name',
  order: 'asc'
});
```

### resetFilters

Restablece todos los filtros a sus valores por defecto y recarga los datos.

```javascript
const { resetFilters } = useSkills();

// Restablecer filtros
resetFilters();
```

## Ejemplo de Uso Completo

```javascript
<script setup>
import { onMounted } from 'vue';
import { useSkills } from '@/composables/useSkills';

// Obtener estado y métodos del composable
const {
  skills,
  loading,
  pagination,
  filters,
  fetchSkills,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  resetFilters
} = useSkills();

// Manejar cambio de filtro de búsqueda
const handleSearchChange = (searchText) => {
  updateFilters({ search: searchText });
};

// Manejar cambio de filtro de categoría
const handleCategoryChange = (categoryId) => {
  updateFilters({ category_id: categoryId });
};

// Manejar cambio de filtro de multiplicador
const handleMultiplierChange = (multiplier) => {
  updateFilters({ multiplier });
};

// Manejar reset de filtros
const handleReset = () => {
  resetFilters();
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchSkills();
});
</script>

<template>
  <div>
    <!-- Filtros -->
    <div class="filters">
      <input 
        v-model="filters.search" 
        @input="handleSearchChange(filters.search)" 
        placeholder="Buscar habilidades..." 
      />
      
      <select 
        v-model="filters.category_id" 
        @change="handleCategoryChange(filters.category_id)"
      >
        <option value="">Todas las categorías</option>
        <!-- Opciones de categorías -->
      </select>
      
      <select 
        v-model="filters.multiplier" 
        @change="handleMultiplierChange(filters.multiplier)"
      >
        <option value="">Todos los multiplicadores</option>
        <option value="1">x1 (Básico)</option>
        <option value="2">x2 (Intermedio)</option>
        <option value="3">x3 (Avanzado)</option>
        <option value="4">x4 (Experto)</option>
        <option value="5">x5 (Maestro)</option>
      </select>
      
      <button @click="handleReset">Restablecer</button>
    </div>
    
    <!-- Tabla de habilidades -->
    <table v-if="!loading && skills.length > 0">
      <!-- Cabecera de la tabla -->
      <thead>
        <tr>
          <th @click="updateSort({ key: 'name', order: filters.sort_direction === 'asc' ? 'desc' : 'asc' })">
            Nombre
          </th>
          <th @click="updateSort({ key: 'category', order: filters.sort_direction === 'asc' ? 'desc' : 'asc' })">
            Categoría
          </th>
          <th @click="updateSort({ key: 'multiplier', order: filters.sort_direction === 'asc' ? 'desc' : 'asc' })">
            Multiplicador
          </th>
          <th>Descripción</th>
          <th>Prerrequisitos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      
      <!-- Cuerpo de la tabla -->
      <tbody>
        <tr v-for="skill in skills" :key="skill.id">
          <td>{{ skill.name }}</td>
          <td>{{ skill.category?.name || 'Sin categoría' }}</td>
          <td>x{{ skill.multiplier }}</td>
          <td>{{ skill.description }}</td>
          <td>
            <div v-if="skill.prerequisites && skill.prerequisites.length > 0">
              <span v-for="prereq in skill.prerequisites" :key="prereq.prerequisite_id">
                {{ prereq.prerequisite?.name }} (Nv.{{ prereq.prerequisite_level }})
              </span>
            </div>
            <span v-else>Sin prerrequisitos</span>
          </td>
          <td>
            <button @click="editSkill(skill)">Editar</button>
            <button @click="deleteSkill(skill.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Estado de carga -->
    <div v-if="loading">Cargando...</div>
    
    <!-- Mensaje de no resultados -->
    <div v-if="!loading && skills.length === 0">No se encontraron habilidades.</div>
    
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
- Los prerrequisitos se procesan automáticamente para asegurar que tengan la información completa.
- Al filtrar por multiplicador, se cargan también los prerrequisitos necesarios para mostrar correctamente los nombres de los prerrequisitos.
- El método `resetFilters` restablece todos los filtros a sus valores por defecto, pero mantiene la ordenación actual.
