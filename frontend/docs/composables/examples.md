# Ejemplos de Uso de Composables Tipados

Este documento proporciona ejemplos de uso de los composables tipados disponibles en la aplicación.

## Índice

- [useForm](#useform)
- [useUsers](#useusers)
- [useFilters](#usefilters)
- [usePagination](#usepagination)
- [useSorting](#usesorting)
- [useDataTable](#usedatatable)
- [useSkillCategories](#useskillcategories)
- [useSkills](#useskills)
- [useConfirmation](#useconfirmation)

## useForm

El composable `useForm` proporciona funcionalidad para gestionar formularios con validación.

### Ejemplo básico

```typescript
import { useForm } from '@/composables/useForm';

// Definir el tipo de los valores del formulario
interface LoginForm {
  email: string;
  password: string;
}

// Usar el composable con el tipo genérico
const {
  values,
  errors,
  touched,
  submitting,
  handleChange,
  handleBlur,
  handleSubmit
} = useForm<LoginForm>({
  initialValues: {
    email: '',
    password: ''
  },
  validationRules: {
    email: [
      value => !value ? 'El email es obligatorio' : null,
      value => value && !/\S+@\S+\.\S+/.test(value) ? 'El email no es válido' : null
    ],
    password: [
      value => !value ? 'La contraseña es obligatoria' : null,
      value => value && value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : null
    ]
  },
  onSubmit: async (formValues) => {
    try {
      // Enviar datos al servidor
      await api.post('/auth/login', formValues);
      
      // Mostrar notificación de éxito
      notificationStore.success('Sesión iniciada correctamente');
      
      // Redirigir a la página principal
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
});
```

### Uso en un componente Vue

```vue
<template>
  <form @submit="handleSubmit">
    <div>
      <label for="email">Email</label>
      <input
        id="email"
        v-model="values.email"
        type="email"
        @blur="() => handleBlur('email')"
      />
      <div v-if="touched.email && errors.email" class="error">
        {{ errors.email }}
      </div>
    </div>
    
    <div>
      <label for="password">Contraseña</label>
      <input
        id="password"
        v-model="values.password"
        type="password"
        @blur="() => handleBlur('password')"
      />
      <div v-if="touched.password && errors.password" class="error">
        {{ errors.password }}
      </div>
    </div>
    
    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Enviando...' : 'Iniciar sesión' }}
    </button>
  </form>
</template>
```

## useUsers

El composable `useUsers` proporciona funcionalidad para gestionar usuarios.

### Ejemplo básico

```typescript
import { useUsers } from '@/composables/useUsers';

// Usar el composable
const {
  users,
  loading,
  pagination,
  filters,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  changePage,
  changePerPage,
  updateFilters,
  updateSort
} = useUsers();

// Cargar usuarios
await fetchUsers();

// Crear un nuevo usuario
const newUser = await createUser({
  name: 'Nuevo Usuario',
  email: 'nuevo@ejemplo.com',
  password: 'Contraseña123!'
});

// Actualizar un usuario
await updateUser(1, {
  name: 'Usuario Actualizado'
});

// Eliminar un usuario
await deleteUser(1);

// Cambiar página
changePage(2);

// Cambiar elementos por página
changePerPage(20);

// Actualizar filtros
updateFilters({
  search: 'usuario',
  role: 'admin'
});

// Actualizar ordenación
updateSort({
  key: 'name',
  order: 'asc'
});
```

## useFilters

El composable `useFilters` proporciona funcionalidad para gestionar filtros.

### Ejemplo básico

```typescript
import { useFilters } from '@/composables/useFilters';

// Definir el tipo de los filtros
interface UserFilters {
  search: string;
  role: string;
  status: 'active' | 'inactive';
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

// Usar el composable con el tipo genérico
const {
  filters,
  updateFilters,
  resetFilters,
  getFilterParams
} = useFilters<UserFilters>(
  {
    search: '',
    role: '',
    status: 'active',
    sort_field: 'name',
    sort_direction: 'asc'
  },
  (newFilters) => {
    // Callback cuando cambian los filtros
    console.log('Filtros actualizados:', newFilters);
    // Aquí podrías cargar datos con los nuevos filtros
    fetchData(newFilters);
  }
);

// Actualizar filtros
updateFilters({
  search: 'usuario',
  role: 'admin'
});

// Resetear filtros
resetFilters();

// Obtener parámetros para una solicitud API
const params = getFilterParams();
```

## usePagination

El composable `usePagination` proporciona funcionalidad para gestionar la paginación.

### Ejemplo básico

```typescript
import { usePagination } from '@/composables/usePagination';

// Usar el composable
const {
  pagination,
  changePage,
  changePerPage,
  updatePaginationFromResponse,
  getPerPageOptions
} = usePagination({
  initialPage: 1,
  initialPerPage: 10,
  perPageOptions: [10, 20, 50, 100],
  onPageChange: (page) => {
    // Callback cuando cambia la página
    console.log('Página cambiada:', page);
    // Aquí podrías cargar datos con la nueva página
    fetchData(page);
  },
  onPerPageChange: (perPage) => {
    // Callback cuando cambian los elementos por página
    console.log('Elementos por página cambiados:', perPage);
    // Aquí podrías cargar datos con los nuevos elementos por página
    fetchData(1, perPage);
  }
});

// Cambiar página
changePage(2);

// Cambiar elementos por página
changePerPage(20);

// Actualizar paginación desde una respuesta de API
updatePaginationFromResponse({
  total: 100,
  last_page: 10,
  current_page: 2
});

// Obtener opciones de elementos por página para un select
const perPageOptions = getPerPageOptions();
```

## useSorting

El composable `useSorting` proporciona funcionalidad para gestionar la ordenación.

### Ejemplo básico

```typescript
import { useSorting } from '@/composables/useSorting';

// Usar el composable
const {
  sortKey,
  sortOrder,
  sort,
  handleSort,
  getSortParams,
  updateSort
} = useSorting({
  initialSortKey: 'name',
  initialSortOrder: 'asc',
  onSortChange: (sortData) => {
    // Callback cuando cambia la ordenación
    console.log('Ordenación cambiada:', sortData);
    // Aquí podrías cargar datos con la nueva ordenación
    fetchData(sortData);
  }
});

// Manejar cambio de ordenación
handleSort('email');

// Obtener parámetros de ordenación para una solicitud API
const params = getSortParams();

// Actualizar ordenación
updateSort({
  key: 'created_at',
  order: 'desc'
});
```

## useDataTable

El composable `useDataTable` combina `usePagination`, `useFilters` y `useSorting` para gestionar tablas de datos.

### Ejemplo básico

```typescript
import { useDataTable } from '@/composables/useDataTable';

// Definir el tipo de los filtros
interface UserFilters {
  search: string;
  role: string;
  status: 'active' | 'inactive';
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

// Usar el composable con el tipo genérico
const {
  pagination,
  filters,
  sortKey,
  sortOrder,
  changePage,
  changePerPage,
  updateFilters,
  resetFilters,
  handleSort,
  updateSort,
  updateFromResponse,
  getRequestParams
} = useDataTable<UserFilters>({
  pagination: {
    initialPage: 1,
    initialPerPage: 10,
    perPageOptions: [10, 20, 50, 100]
  },
  filters: {
    search: '',
    role: '',
    status: 'active',
    sort_field: 'name',
    sort_direction: 'asc'
  },
  sorting: {
    initialSortKey: 'name',
    initialSortOrder: 'asc'
  },
  onDataChange: async (params) => {
    // Callback cuando cambian los datos
    console.log('Parámetros cambiados:', params);
    // Aquí podrías cargar datos con los nuevos parámetros
    const response = await api.get('/users', { params });
    updateFromResponse(response.data);
  }
});

// Obtener parámetros para una solicitud API
const params = getRequestParams();
```

## useSkillCategories

El composable `useSkillCategories` proporciona funcionalidad para gestionar categorías de habilidades.

### Ejemplo básico

```typescript
import { useSkillCategories } from '@/composables/useSkillCategories';

// Usar el composable
const {
  categories,
  loading,
  pagination,
  filters,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  resetFilters
} = useSkillCategories();

// Cargar categorías
await fetchCategories();

// Crear una nueva categoría
const newCategory = await createCategory({
  name: 'Nueva Categoría',
  description: 'Descripción de la categoría'
});

// Actualizar una categoría
await updateCategory(1, {
  name: 'Categoría Actualizada'
});

// Eliminar una categoría
await deleteCategory(1);

// Obtener una categoría por su ID
const category = await getCategory(1);
```

## useSkills

El composable `useSkills` proporciona funcionalidad para gestionar habilidades.

### Ejemplo básico

```typescript
import { useSkills } from '@/composables/useSkills';

// Usar el composable
const {
  skills,
  loading,
  pagination,
  filters,
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkill,
  getSkillsForDropdown,
  changePage,
  changePerPage,
  updateFilters,
  updateSort,
  resetFilters
} = useSkills();

// Cargar habilidades
await fetchSkills();

// Crear una nueva habilidad
const newSkill = await createSkill({
  name: 'Nueva Habilidad',
  description: 'Descripción de la habilidad',
  category_id: 1,
  multiplier: 1
});

// Actualizar una habilidad
await updateSkill(1, {
  name: 'Habilidad Actualizada'
});

// Eliminar una habilidad
await deleteSkill(1);

// Obtener una habilidad por su ID
const skill = await getSkill(1);

// Obtener habilidades para dropdown
const skillsForDropdown = await getSkillsForDropdown();
```

## useConfirmation

El composable `useConfirmation` proporciona funcionalidad para gestionar diálogos de confirmación.

### Ejemplo básico

```typescript
import { useConfirmation } from '@/composables/useConfirmation';

// Usar el composable
const {
  isOpen,
  isLoading,
  config,
  confirm,
  confirmDelete,
  confirmSave,
  handleConfirm,
  handleCancel,
  close
} = useConfirmation();

// Mostrar un diálogo de confirmación
const handleDeleteItem = async () => {
  const result = await confirmDelete({
    title: 'Eliminar elemento',
    message: '¿Estás seguro de que deseas eliminar este elemento?',
    data: { id: 1, name: 'Elemento 1' }
  });

  if (result.confirmed) {
    // El usuario confirmó la eliminación
    console.log('Elemento a eliminar:', result.data);
    // Aquí podrías eliminar el elemento
    await deleteItem(result.data.id);
  }
};

// Mostrar un diálogo de confirmación de guardado
const handleSaveItem = async () => {
  const result = await confirmSave({
    title: 'Guardar cambios',
    message: '¿Estás seguro de que deseas guardar los cambios?',
    data: { id: 1, name: 'Elemento 1' }
  });

  if (result.confirmed) {
    // El usuario confirmó el guardado
    console.log('Elemento a guardar:', result.data);
    // Aquí podrías guardar el elemento
    await saveItem(result.data);
  }
};
```
