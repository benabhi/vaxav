# Componentes de Administración de Pilotos

Este documento describe los componentes utilizados para la administración de pilotos en el panel de administración de VAXAV.

## Índice

1. [PilotsView](#pilotsview)
2. [PilotEditView](#piloteditview)
3. [PilotSkillsView](#pilotskillsview)
4. [Composable useAdminPilots](#composable-useadminpilots)
5. [Servicio SkillService](#servicio-skillservice)
6. [Controlador PilotController](#controlador-pilotcontroller)

## PilotsView

El componente `PilotsView` muestra una tabla de pilotos con funcionalidad para filtrar, ordenar y paginar.

### Ubicación

```
frontend/src/views/admin/pilots/PilotsView.vue
```

### Dependencias

- `AdminCrudView`: Componente base para vistas CRUD en el panel de administración.
- `VxvButton`: Componente de botón.
- `VxvSelect`: Componente de selección.
- `VxvModal`: Componente de modal.
- `VxvBadge`: Componente de badge.
- `useAdminPilots`: Composable para gestionar pilotos.

### Características

- Tabla con columnas para nombre, raza, usuario y créditos.
- Filtro de búsqueda y raza.
- Ordenación por nombre, raza y créditos.
- Paginación.
- Botones para editar, gestionar habilidades y eliminar pilotos.
- Modal de confirmación para eliminar pilotos.
- Visualización de razas con badges de colores.

### Métodos Principales

- `editPilot`: Navega a la vista de edición del piloto.
- `editPilotSkills`: Navega a la vista de gestión de habilidades del piloto.
- `confirmDeletePilot`: Muestra el modal de confirmación para eliminar un piloto.
- `deletePilotConfirmed`: Elimina el piloto después de la confirmación.
- `handleRaceChange`: Actualiza el filtro de raza.
- `handleReset`: Restablece todos los filtros.

## PilotEditView

El componente `PilotEditView` proporciona un formulario para editar la información básica de un piloto.

### Ubicación

```
frontend/src/views/admin/pilots/PilotEditView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvForm`: Componente de formulario.
- `VxvInput`: Componente de entrada de texto.
- `VxvSelect`: Componente de selección.
- `VxvButton`: Componente de botón.
- `VxvBreadcrumb`: Componente de migas de pan.
- `useAdminPilots`: Composable para gestionar pilotos.

### Características

- Formulario para editar nombre, raza y créditos del piloto.
- Validación de formulario en tiempo real.
- Visualización de información del usuario asociado.
- Botón para navegar a la gestión de habilidades.
- Migas de pan para navegación.

### Métodos Principales

- `loadPilot`: Carga los datos del piloto.
- `handleSubmit`: Valida y envía el formulario.
- `goBack`: Navega de vuelta a la lista de pilotos.
- `goToSkills`: Navega a la vista de gestión de habilidades.

## PilotSkillsView

El componente `PilotSkillsView` proporciona una interfaz para gestionar las habilidades de un piloto.

### Ubicación

```
frontend/src/views/admin/pilots/PilotSkillsView.vue
```

### Dependencias

- `AdminLayout`: Componente de layout para el panel de administración.
- `VxvSelect`: Componente de selección.
- `VxvButton`: Componente de botón.
- `VxvBadge`: Componente de badge.
- `VxvBreadcrumb`: Componente de migas de pan.
- `VxvModal`: Componente de modal.
- `useAdminPilots`: Composable para gestionar pilotos.

### Características

- Tabla de habilidades con información detallada.
- Filtros por nombre, categoría, estado y nivel.
- Selector de nivel para cada habilidad.
- Toggle para activar/desactivar habilidades.
- Visualización de prerrequisitos con indicadores de estado.
- Modal de error para mostrar problemas con prerrequisitos o dependencias.
- Migas de pan para navegación.

### Métodos Principales

- `loadPilotData`: Carga los datos del piloto y sus habilidades.
- `updateSkillLevel`: Actualiza el nivel de una habilidad.
- `activateSkill`: Activa una habilidad.
- `deactivateSkill`: Desactiva una habilidad.
- `toggleSkillActive`: Alterna el estado activo de una habilidad.
- `getPrerequisiteBadgeVariant`: Determina el color del badge para un prerrequisito.
- `canToggleActive`: Verifica si una habilidad puede ser activada o desactivada.

## Composable useAdminPilots

El composable `useAdminPilots` proporciona estado y métodos para gestionar pilotos desde el panel de administración.

### Ubicación

```
frontend/src/composables/useAdminPilots.ts
```

### Características

- Estado reactivo para pilotos, carga, paginación y filtros.
- Métodos para obtener, actualizar y eliminar pilotos.
- Métodos para gestionar las habilidades de los pilotos.
- Integración con el sistema de notificaciones.

### Métodos Principales

- `fetchPilots`: Obtiene la lista de pilotos con filtros y paginación.
- `getPilot`: Obtiene un piloto específico.
- `updatePilot`: Actualiza un piloto existente.
- `deletePilot`: Elimina un piloto.
- `getPilotSkills`: Obtiene las habilidades de un piloto.
- `updatePilotSkill`: Actualiza una habilidad de un piloto.
- `changePage`, `changePerPage`, `updateFilters`, `updateSort`: Métodos para gestionar la paginación, filtros y ordenación.

## Servicio SkillService

El servicio `SkillService` proporciona métodos para verificar las reglas de negocio relacionadas con las habilidades.

### Ubicación

```
backend/app/Services/SkillService.php
```

### Características

- Métodos para verificar si un piloto puede activar una habilidad.
- Métodos para verificar si un piloto puede desactivar una habilidad.
- Métodos para verificar si un piloto puede reducir el nivel de una habilidad.
- Métodos para calcular el nivel máximo posible para una habilidad.

### Métodos Principales

- `canActivateSkill`: Verifica si un piloto puede activar una habilidad.
- `canDeactivateSkill`: Verifica si un piloto puede desactivar una habilidad.
- `canReduceSkillLevel`: Verifica si un piloto puede reducir el nivel de una habilidad.
- `getMaxPossibleLevel`: Calcula el nivel máximo posible para una habilidad.
- `getDependentSkills`: Obtiene todas las habilidades que dependen de una habilidad específica.

## Controlador PilotController

El controlador `PilotController` maneja las operaciones relacionadas con pilotos en el panel de administración.

### Ubicación

```
backend/app/Http/Controllers/Admin/PilotController.php
```

### Características

- Métodos para listar, ver, editar y eliminar pilotos.
- Métodos para gestionar las habilidades de los pilotos.
- Integración con el servicio SkillService para validar reglas de negocio.
- Middleware de autenticación y autorización.

### Métodos Principales

- `index`: Lista todos los pilotos con filtros y paginación.
- `show`: Muestra un piloto específico.
- `update`: Actualiza un piloto existente.
- `destroy`: Elimina un piloto.
- `getSkills`: Obtiene las habilidades de un piloto.
- `updateSkill`: Actualiza una habilidad de un piloto.

## Flujo de Trabajo

El flujo de trabajo para la administración de pilotos es el siguiente:

1. **Listar Pilotos**: El administrador accede a la vista de lista de pilotos.
2. **Filtrar y Ordenar**: El administrador puede filtrar y ordenar la lista según sus necesidades.
3. **Editar Piloto**: El administrador puede editar la información básica de un piloto.
4. **Gestionar Habilidades**: El administrador puede gestionar las habilidades de un piloto.
5. **Eliminar Piloto**: El administrador puede eliminar un piloto si no tiene naves asociadas.

## Reglas de Negocio

Las principales reglas de negocio para la administración de pilotos son:

1. **Prerrequisitos de Habilidades**: Una habilidad solo puede ser activada si el piloto cumple con todos los prerrequisitos.
2. **Dependencias de Habilidades**: Una habilidad no puede ser desactivada si otras habilidades activas dependen de ella.
3. **Reducción de Nivel**: El nivel de una habilidad no puede ser reducido si otras habilidades activas dependen de ese nivel.
4. **Eliminación de Pilotos**: Un piloto no puede ser eliminado si tiene naves asociadas.

## Consideraciones de Seguridad

- Todos los endpoints requieren autenticación mediante token.
- Los endpoints están protegidos por middleware de permisos específicos.
- La validación de datos se realiza tanto en el frontend como en el backend.
- Las reglas de negocio se validan en el backend para garantizar la integridad de los datos.

## Futuras Mejoras

La administración de pilotos se expandirá en el futuro para incluir:

- Gestión de naves de pilotos.
- Gestión de corporaciones de pilotos.
- Gestión de ubicaciones de pilotos.
- Estadísticas y métricas de pilotos.
- Historial de actividades de pilotos.
