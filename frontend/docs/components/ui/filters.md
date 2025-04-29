# VxvFilters

El componente `VxvFilters` proporciona una interfaz para filtrar datos, con un campo de búsqueda y slots para filtros personalizados.

## Propiedades

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|-------------------|-------------|
| id | String | Generado automáticamente | Identificador único para el componente |
| filters | Object | `{}` | Filtros iniciales |
| showSearch | Boolean | `true` | Muestra el campo de búsqueda |
| searchLabel | String | `''` | Etiqueta para el campo de búsqueda |
| searchPlaceholder | String | `'Buscar...'` | Placeholder para el campo de búsqueda |
| showApply | Boolean | `true` | Muestra el botón de aplicar |
| applyLabel | String | `'Aplicar'` | Etiqueta para el botón de aplicar |
| showReset | Boolean | `true` | Muestra el botón de restablecer |
| resetLabel | String | `'Restablecer'` | Etiqueta para el botón de restablecer |
| showLabels | Boolean | `true` | Muestra las etiquetas de los filtros |
| debounce | Number | `300` | Tiempo de debounce para el campo de búsqueda en milisegundos |
| immediate | Boolean | `false` | Emite cambios inmediatamente |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| filter-change | `(filters: Object)` | Se emite cuando cambian los filtros |
| reset | - | Se emite cuando se restablecen los filtros |

## Slots

| Nombre | Descripción |
|--------|-------------|
| filters | Slot para filtros personalizados |

## Ejemplos

### Filtros básicos con búsqueda

```vue
<VxvFilters
  v-model:filters="filters"
  search-placeholder="Buscar..."
  @filter-change="handleFilterChange"
  @reset="handleReset"
/>
```

### Filtros con búsqueda y filtros personalizados

```vue
<VxvFilters
  v-model:filters="filters"
  search-placeholder="Buscar usuarios..."
  @filter-change="handleFilterChange"
  @reset="handleReset"
>
  <template #filters>
    <div class="w-[180px] flex-shrink-0">
      <label class="block text-sm font-medium text-gray-300 mb-1">
        Rol
      </label>
      <div class="flex items-center space-x-2">
        <VxvSelect
          v-model="filters.role"
          :options="roleOptions"
          size="sm"
        />
        <button
          v-if="filters.role"
          @click="clearRoleFilter"
          class="text-gray-400 hover:text-white flex-shrink-0"
          title="Quitar filtro"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </template>
</VxvFilters>
```

### Filtros con cambios inmediatos

```vue
<VxvFilters
  v-model:filters="filters"
  search-placeholder="Buscar..."
  :show-apply="false"
  :immediate="true"
  @filter-change="handleFilterChange"
  @reset="handleReset"
>
  <template #filters>
    <VxvSelect
      v-model="filters.category"
      label="Categoría"
      :options="categoryOptions"
      size="sm"
    />
  </template>
</VxvFilters>
```

## Notas de Uso

- El componente `VxvFilters` está diseñado para ser utilizado con el componente `VxvDataTable`.
- Los filtros personalizados deben ser colocados en el slot `filters`.
- Cuando `immediate` es `true`, los cambios en los filtros se emiten inmediatamente, sin necesidad de hacer clic en el botón de aplicar.
- Cuando `showLabels` es `true`, las etiquetas se muestran encima de sus respectivos inputs.
- En pantallas pequeñas, cada filtro ocupa todo el ancho disponible y se apila verticalmente.

## Manejo de Múltiples Filtros

El componente está diseñado para manejar múltiples filtros con scroll horizontal cuando hay muchos:

```vue
<VxvFilters v-model:filters="filters" @filter-change="handleFilterChange">
  <template #filters>
    <!-- Primer filtro -->
    <div class="w-[180px] flex-shrink-0">
      <label v-if="showLabels" class="block text-sm font-medium text-gray-300 mb-1">
        Fecha desde
      </label>
      <VxvInput
        v-model="filters.dateFrom"
        :label="showLabels ? '' : 'Fecha desde'"
        type="date"
        size="sm"
        class="w-full"
      />
    </div>

    <!-- Segundo filtro -->
    <div class="w-[180px] flex-shrink-0">
      <label v-if="showLabels" class="block text-sm font-medium text-gray-300 mb-1">
        Categoría
      </label>
      <div class="flex items-center space-x-2">
        <VxvSelect
          v-model="filters.category"
          :label="showLabels ? '' : 'Categoría'"
          :options="categoryOptions"
          size="sm"
          class="w-full"
        />
        <button
          v-if="filters.category"
          @click="clearCategoryFilter"
          class="text-gray-400 hover:text-white flex-shrink-0"
          title="Quitar filtro"
        >
          <!-- Icono para quitar filtro -->
        </button>
      </div>
    </div>

    <!-- Más filtros... -->
  </template>
</VxvFilters>
```

Esta estructura permite:

1. Mostrar filtros en una línea horizontal con scroll cuando hay muchos
2. Mantener la consistencia visual con etiquetas alineadas
3. Soportar un número variable de filtros sin problemas de espacio
4. Incluir botones para quitar filtros individuales
5. En pantallas pequeñas, los filtros se apilan verticalmente
