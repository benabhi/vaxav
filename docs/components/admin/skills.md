# Componentes de Administración de Habilidades

Este documento describe los componentes utilizados para la administración de habilidades en el panel de administración de VAXAV.

## Índice

1. [SkillsView](#skillsview)
2. [SkillCreateView](#skillcreateview)
3. [SkillEditView](#skilleditview)
4. [SkillCategoriesView](#skillcategoriesview)
5. [SkillCategoryCreateView](#skillcategorycreateview)
6. [SkillCategoryEditView](#skillcategoryeditview)

## SkillsView

El componente `SkillsView` muestra una tabla de habilidades con funcionalidad para filtrar, ordenar y paginar.

### Ubicación

```
frontend/src/views/admin/skills/SkillsView.vue
```

### Dependencias

- `AdminCrudView`: Componente base para vistas CRUD en el panel de administración.
- `VxvButton`: Componente de botón.
- `VxvSelect`: Componente de selección.
- `VxvModal`: Componente de modal.
- `VxvBadge`: Componente de badge.
- `useSkills`: Composable para gestionar habilidades.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.

### Características

- Tabla con columnas para nombre, categoría, multiplicador, descripción y prerrequisitos.
- Filtros de búsqueda, categoría y multiplicador.
- Ordenación por nombre, categoría y multiplicador.
- Paginación.
- Botones para crear, editar y eliminar habilidades.
- Modal de confirmación para eliminar habilidades.
- Visualización de prerrequisitos como badges.

### Métodos Principales

- `handleCategoryChange`: Maneja el cambio del filtro de categoría.
- `handleMultiplierChange`: Maneja el cambio del filtro de multiplicador.
- `handleReset`: Maneja el evento de reset de filtros.
- `goToCreateSkill`: Navega a la página de creación de habilidades.
- `editSkill`: Navega a la página de edición de una habilidad específica.
- `confirmDeleteSkill`: Muestra el modal de confirmación para eliminar una habilidad.
- `deleteSkill`: Elimina una habilidad.
- `isValidPrerequisite`: Verifica si un prerrequisito es válido para mostrar.
- `getPrerequisiteName`: Obtiene el nombre del prerrequisito con su nivel.
- `getMultiplierVariant`: Obtiene la variante de color para el multiplicador.

### Ejemplo de Uso

```vue
<template>
  <SkillsView />
</template>

<script setup>
import SkillsView from '@/views/admin/skills/SkillsView.vue';
</script>
```

## SkillCreateView

El componente `SkillCreateView` proporciona un formulario para crear nuevas habilidades.

### Ubicación

```
frontend/src/views/admin/skills/SkillCreateView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvBreadcrumb`: Componente de breadcrumb.
- `VxvForm`: Componente de formulario.
- `VxvInput`: Componente de input.
- `VxvSelect`: Componente de selección.
- `VxvTextarea`: Componente de textarea.
- `VxvButton`: Componente de botón.
- `useSkills`: Composable para gestionar habilidades.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.
- `useForm`: Composable para gestionar formularios.

### Características

- Formulario con campos para nombre, descripción, categoría y multiplicador.
- Sección para añadir prerrequisitos con selección de habilidad y nivel requerido.
- Validación de campos.
- Botones para guardar y cancelar.

### Métodos Principales

- `handleSubmit`: Maneja el envío del formulario.
- `goBack`: Navega de vuelta a la lista de habilidades.
- `addPrerequisite`: Añade un nuevo prerrequisito al formulario.
- `removePrerequisite`: Elimina un prerrequisito del formulario.

### Ejemplo de Uso

```vue
<template>
  <SkillCreateView />
</template>

<script setup>
import SkillCreateView from '@/views/admin/skills/SkillCreateView.vue';
</script>
```

## SkillEditView

El componente `SkillEditView` proporciona un formulario para editar habilidades existentes.

### Ubicación

```
frontend/src/views/admin/skills/SkillEditView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvBreadcrumb`: Componente de breadcrumb.
- `VxvForm`: Componente de formulario.
- `VxvInput`: Componente de input.
- `VxvSelect`: Componente de selección.
- `VxvTextarea`: Componente de textarea.
- `VxvButton`: Componente de botón.
- `useSkills`: Composable para gestionar habilidades.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.
- `useForm`: Composable para gestionar formularios.

### Características

- Formulario con campos para nombre, descripción, categoría y multiplicador.
- Sección para añadir y editar prerrequisitos con selección de habilidad y nivel requerido.
- Validación de campos.
- Botones para guardar y cancelar.
- Carga automática de los datos de la habilidad a editar.

### Métodos Principales

- `fetchSkill`: Carga los datos de la habilidad a editar.
- `handleSubmit`: Maneja el envío del formulario.
- `goBack`: Navega de vuelta a la lista de habilidades.
- `addPrerequisite`: Añade un nuevo prerrequisito al formulario.
- `removePrerequisite`: Elimina un prerrequisito del formulario.

### Ejemplo de Uso

```vue
<template>
  <SkillEditView />
</template>

<script setup>
import SkillEditView from '@/views/admin/skills/SkillEditView.vue';
</script>
```

## SkillCategoriesView

El componente `SkillCategoriesView` muestra una tabla de categorías de habilidades con funcionalidad para filtrar, ordenar y paginar.

### Ubicación

```
frontend/src/views/admin/skills/SkillCategoriesView.vue
```

### Dependencias

- `AdminCrudView`: Componente base para vistas CRUD en el panel de administración.
- `VxvButton`: Componente de botón.
- `VxvModal`: Componente de modal.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.

### Características

- Tabla con columnas para nombre y descripción.
- Filtro de búsqueda.
- Ordenación por nombre.
- Paginación.
- Botones para crear, editar y eliminar categorías.
- Modal de confirmación para eliminar categorías.

### Métodos Principales

- `handleReset`: Maneja el evento de reset de filtros.
- `goToCreateCategory`: Navega a la página de creación de categorías.
- `editCategory`: Navega a la página de edición de una categoría específica.
- `confirmDeleteCategory`: Muestra el modal de confirmación para eliminar una categoría.
- `deleteCategory`: Elimina una categoría.

### Ejemplo de Uso

```vue
<template>
  <SkillCategoriesView />
</template>

<script setup>
import SkillCategoriesView from '@/views/admin/skills/SkillCategoriesView.vue';
</script>
```

## SkillCategoryCreateView

El componente `SkillCategoryCreateView` proporciona un formulario para crear nuevas categorías de habilidades.

### Ubicación

```
frontend/src/views/admin/skills/SkillCategoryCreateView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvBreadcrumb`: Componente de breadcrumb.
- `VxvForm`: Componente de formulario.
- `VxvInput`: Componente de input.
- `VxvTextarea`: Componente de textarea.
- `VxvButton`: Componente de botón.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.
- `useForm`: Composable para gestionar formularios.

### Características

- Formulario con campos para nombre y descripción.
- Validación de campos.
- Botones para guardar y cancelar.

### Métodos Principales

- `handleSubmit`: Maneja el envío del formulario.
- `goBack`: Navega de vuelta a la lista de categorías.

### Ejemplo de Uso

```vue
<template>
  <SkillCategoryCreateView />
</template>

<script setup>
import SkillCategoryCreateView from '@/views/admin/skills/SkillCategoryCreateView.vue';
</script>
```

## SkillCategoryEditView

El componente `SkillCategoryEditView` proporciona un formulario para editar categorías de habilidades existentes.

### Ubicación

```
frontend/src/views/admin/skills/SkillCategoryEditView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvBreadcrumb`: Componente de breadcrumb.
- `VxvForm`: Componente de formulario.
- `VxvInput`: Componente de input.
- `VxvTextarea`: Componente de textarea.
- `VxvButton`: Componente de botón.
- `useSkillCategories`: Composable para gestionar categorías de habilidades.
- `useForm`: Composable para gestionar formularios.

### Características

- Formulario con campos para nombre y descripción.
- Validación de campos.
- Botones para guardar y cancelar.
- Carga automática de los datos de la categoría a editar.

### Métodos Principales

- `fetchCategory`: Carga los datos de la categoría a editar.
- `handleSubmit`: Maneja el envío del formulario.
- `goBack`: Navega de vuelta a la lista de categorías.

### Ejemplo de Uso

```vue
<template>
  <SkillCategoryEditView />
</template>

<script setup>
import SkillCategoryEditView from '@/views/admin/skills/SkillCategoryEditView.vue';
</script>
```

## Flujo de Navegación

El flujo de navegación entre los componentes de administración de habilidades es el siguiente:

1. **SkillsView**: Vista principal que muestra la lista de habilidades.
   - Al hacer clic en "Nueva Habilidad", navega a **SkillCreateView**.
   - Al hacer clic en "Editar" para una habilidad, navega a **SkillEditView** con el ID de la habilidad.
   - Al hacer clic en "Eliminar" para una habilidad, muestra un modal de confirmación y elimina la habilidad si se confirma.

2. **SkillCreateView**: Vista para crear una nueva habilidad.
   - Al hacer clic en "Guardar", crea la habilidad y navega de vuelta a **SkillsView**.
   - Al hacer clic en "Cancelar", navega de vuelta a **SkillsView** sin crear la habilidad.

3. **SkillEditView**: Vista para editar una habilidad existente.
   - Al hacer clic en "Guardar", actualiza la habilidad y navega de vuelta a **SkillsView**.
   - Al hacer clic en "Cancelar", navega de vuelta a **SkillsView** sin actualizar la habilidad.

4. **SkillCategoriesView**: Vista que muestra la lista de categorías de habilidades.
   - Al hacer clic en "Nueva Categoría", navega a **SkillCategoryCreateView**.
   - Al hacer clic en "Editar" para una categoría, navega a **SkillCategoryEditView** con el ID de la categoría.
   - Al hacer clic en "Eliminar" para una categoría, muestra un modal de confirmación y elimina la categoría si se confirma.

5. **SkillCategoryCreateView**: Vista para crear una nueva categoría de habilidad.
   - Al hacer clic en "Guardar", crea la categoría y navega de vuelta a **SkillCategoriesView**.
   - Al hacer clic en "Cancelar", navega de vuelta a **SkillCategoriesView** sin crear la categoría.

6. **SkillCategoryEditView**: Vista para editar una categoría de habilidad existente.
   - Al hacer clic en "Guardar", actualiza la categoría y navega de vuelta a **SkillCategoriesView**.
   - Al hacer clic en "Cancelar", navega de vuelta a **SkillCategoriesView** sin actualizar la categoría.
