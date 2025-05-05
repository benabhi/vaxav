# VxvClearState

El componente `VxvClearState` es un elemento visual que muestra un estado vacío o sin resultados, ideal para tablas, listas o filtros que no devuelven datos. Incluye un icono opcional y un mensaje personalizable.

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| message | String | `'No hay datos disponibles'` | Mensaje a mostrar cuando no hay datos |
| icon | Object | `null` | Componente de icono a mostrar (opcional) |
| variant | String | `'default'` | Variante de estilo (default, primary, secondary, danger, warning, success, info) |
| containerClass | String | `''` | Clases CSS adicionales para el contenedor |
| iconClass | String | `''` | Clases CSS adicionales para el icono |
| messageClass | String | `''` | Clases CSS adicionales para el mensaje |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido personalizado que reemplaza el mensaje por defecto |
| icon | Contenido personalizado que reemplaza el icono por defecto |
| action | Contenido adicional para acciones (botones, enlaces, etc.) |

## Ejemplos de uso

### Estado vacío básico

```vue
<VxvClearState message="No se encontraron resultados" />
```

### Con icono personalizado

```vue
<template>
  <VxvClearState message="No hay elementos en la lista">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </template>
  </VxvClearState>
</template>
```

### Con variante de color

```vue
<VxvClearState 
  message="No se encontraron resultados para tu búsqueda" 
  variant="info" 
/>
```

### Con acción adicional

```vue
<VxvClearState message="No hay elementos en la lista">
  <template #action>
    <VxvButton variant="primary" size="sm">Crear nuevo</VxvButton>
  </template>
</VxvClearState>
```

### En una tabla vacía

```vue
<template>
  <div>
    <VxvTable
      :columns="columns"
      :items="items"
      :loading="loading"
    >
      <template #empty>
        <VxvClearState 
          message="No se encontraron registros que coincidan con los filtros aplicados" 
          variant="secondary"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
          <template #action>
            <VxvButton variant="secondary" size="sm" @click="resetFilters">
              Limpiar filtros
            </VxvButton>
          </template>
        </VxvClearState>
      </template>
    </VxvTable>
  </div>
</template>
```

### En una vista de filtros sin resultados

```vue
<template>
  <div>
    <VxvFilters v-model:filters="filters" @filter-change="applyFilters" />
    
    <div v-if="items.length === 0 && !loading" class="mt-6">
      <VxvClearState 
        message="No se encontraron resultados para los filtros aplicados" 
        variant="warning"
      >
        <template #action>
          <VxvButton variant="secondary" size="sm" @click="resetFilters">
            Restablecer filtros
          </VxvButton>
        </template>
      </VxvClearState>
    </div>
    
    <div v-else>
      <!-- Contenido cuando hay resultados -->
    </div>
  </div>
</template>
```

### Con contenido personalizado

```vue
<VxvClearState variant="primary">
  <p class="text-blue-300 font-medium">No se encontraron resultados para tu búsqueda.</p>
  <p class="text-blue-400 text-sm mt-2">Intenta con otros términos o ajusta los filtros.</p>
</VxvClearState>
```
