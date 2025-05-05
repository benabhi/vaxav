# Componentes de Administración

Los componentes de administración son específicos para el panel de administración de Vaxav. Estos componentes proporcionan interfaces para gestionar usuarios, roles, configuraciones y otros aspectos del sistema.

## Componentes de Gestión de Usuarios y Roles

Estos componentes se utilizan para la gestión de usuarios y roles en el sistema de autenticación y autorización.

### UserModal

`UserModal` es un componente modal para crear y editar usuarios.

**Archivo**: `/components/admin/UserModal.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `false` | Controla la visibilidad del modal |
| `user` | `Object` | `null` | Usuario a editar (null para creación) |
| `roles` | `Array` | `[]` | Lista de roles disponibles |
| `loading` | `Boolean` | `false` | Estado de carga |
| `errors` | `Object` | `{}` | Errores de validación |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal |
| `submit` | Emitido cuando se envía el formulario, con los datos del usuario |

#### Ejemplo de Uso

```vue
<UserModal
  :show="showUserModal"
  :user="editingUser"
  :roles="availableRoles"
  :loading="saving"
  :errors="formErrors"
  @close="closeUserModal"
  @submit="saveUser"
/>
```

### DeleteUserModal

`DeleteUserModal` es un componente modal para confirmar la eliminación de usuarios.

**Archivo**: `/components/admin/DeleteUserModal.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `false` | Controla la visibilidad del modal |
| `user` | `Object` | `null` | Usuario a eliminar |
| `loading` | `Boolean` | `false` | Estado de carga |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal |
| `confirm` | Emitido cuando se confirma la eliminación |

#### Ejemplo de Uso

```vue
<DeleteUserModal
  :show="showDeleteModal"
  :user="userToDelete"
  :loading="deleting"
  @close="closeDeleteModal"
  @confirm="deleteUser"
/>
```

### RoleModal

`RoleModal` es un componente modal para crear y editar roles.

**Archivo**: `/components/admin/RoleModal.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `false` | Controla la visibilidad del modal |
| `role` | `Object` | `null` | Rol a editar (null para creación) |
| `permissions` | `Array` | `[]` | Lista de permisos disponibles |
| `loading` | `Boolean` | `false` | Estado de carga |
| `errors` | `Object` | `{}` | Errores de validación |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal |
| `submit` | Emitido cuando se envía el formulario, con los datos del rol |

#### Ejemplo de Uso

```vue
<RoleModal
  :show="showRoleModal"
  :role="editingRole"
  :permissions="availablePermissions"
  :loading="saving"
  :errors="formErrors"
  @close="closeRoleModal"
  @submit="saveRole"
/>
```

### DeleteRoleModal

`DeleteRoleModal` es un componente modal para confirmar la eliminación de roles.

**Archivo**: `/components/admin/DeleteRoleModal.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `show` | `Boolean` | `false` | Controla la visibilidad del modal |
| `role` | `Object` | `null` | Rol a eliminar |
| `loading` | `Boolean` | `false` | Estado de carga |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `close` | Emitido cuando se cierra el modal |
| `confirm` | Emitido cuando se confirma la eliminación |

#### Ejemplo de Uso

```vue
<DeleteRoleModal
  :show="showDeleteModal"
  :role="roleToDelete"
  :loading="deleting"
  @close="closeDeleteModal"
  @confirm="deleteRole"
/>
```

## Componentes de Interfaz de Administración

### AdminSidebar

`AdminSidebar` es el componente de barra lateral para el panel de administración.

**Archivo**: `/components/admin/AdminSidebar.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `items` | `Array` | `[]` | Elementos del menú |
| `collapsed` | `Boolean` | `false` | Si la barra lateral está colapsada |
| `activeItem` | `String` | `''` | ID del elemento activo |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `toggle-collapse` | Se emite cuando se cambia el estado de colapso |
| `select` | Se emite cuando se selecciona un elemento |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `header` | Personalización del encabezado |
| `footer` | Personalización del pie |
| `item` | Personalización de un elemento del menú |

#### Ejemplos de Uso

```vue
<AdminSidebar
  :items="sidebarItems"
  :collapsed="sidebarCollapsed"
  @toggle-collapse="toggleSidebar"
/>
```

Ejemplo de estructura de `items`:

```javascript
const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: 'users',
    to: '/admin/users'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings',
    children: [
      {
        id: 'general',
        label: 'General',
        to: '/admin/settings/general'
      },
      {
        id: 'security',
        label: 'Seguridad',
        to: '/admin/settings/security'
      }
    ]
  }
]
```

### AdminHeader

`AdminHeader` es el componente de encabezado para el panel de administración.

**Archivo**: `/components/admin/AdminHeader.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Panel de Administración'` | Título del encabezado |
| `showBreadcrumbs` | `Boolean` | `true` | Si se deben mostrar las migas de pan |
| `breadcrumbs` | `Array` | `[]` | Elementos de las migas de pan |
| `showSearch` | `Boolean` | `true` | Si se debe mostrar la búsqueda |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `title` | Personalización del título |
| `breadcrumbs` | Personalización de las migas de pan |
| `actions` | Acciones adicionales |
| `search` | Personalización del campo de búsqueda |

#### Ejemplos de Uso

```vue
<AdminHeader
  title="Gestión de Usuarios"
  :breadcrumbs="[
    { label: 'Inicio', to: '/admin' },
    { label: 'Usuarios', to: '/admin/users' }
  ]"
>
  <template #actions>
    <BaseButton variant="primary" size="sm">Nuevo Usuario</BaseButton>
  </template>
</AdminHeader>
```

### AdminTable

`AdminTable` es un componente para mostrar y gestionar datos tabulares en el panel de administración.

**Archivo**: `/components/admin/AdminTable.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `columns` | `Array` | `[]` | Definición de columnas |
| `data` | `Array` | `[]` | Datos a mostrar |
| `loading` | `Boolean` | `false` | Si la tabla está cargando datos |
| `sortable` | `Boolean` | `true` | Si las columnas son ordenables |
| `filterable` | `Boolean` | `true` | Si se pueden filtrar los datos |
| `pagination` | `Object` | `{ enabled: true, perPage: 10 }` | Configuración de paginación |
| `selectable` | `Boolean` | `false` | Si se pueden seleccionar filas |
| `actions` | `Array` | `[]` | Acciones disponibles para cada fila |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `sort` | Se emite cuando cambia el orden |
| `filter` | Se emite cuando se aplica un filtro |
| `page-change` | Se emite cuando cambia la página |
| `row-click` | Se emite cuando se hace clic en una fila |
| `selection-change` | Se emite cuando cambia la selección |
| `action` | Se emite cuando se ejecuta una acción |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `header` | Personalización del encabezado de la tabla |
| `empty` | Contenido cuando no hay datos |
| `loading` | Personalización del estado de carga |
| `column-[name]` | Personalización de una columna específica |
| `actions` | Personalización de las acciones |
| `pagination` | Personalización de la paginación |

#### Ejemplos de Uso

```vue
<AdminTable
  :columns="[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'email', label: 'Correo', sortable: true, filterable: true },
    { key: 'role', label: 'Rol', sortable: true, filterable: true },
    { key: 'createdAt', label: 'Creado', sortable: true, type: 'date' }
  ]"
  :data="users"
  :loading="loading"
  :actions="[
    { key: 'edit', label: 'Editar', icon: 'edit' },
    { key: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' }
  ]"
  @action="handleAction"
/>
```

### AdminCard

`AdminCard` es un componente para mostrar información en tarjetas en el panel de administración.

**Archivo**: `/components/admin/AdminCard.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `''` | Título de la tarjeta |
| `subtitle` | `String` | `''` | Subtítulo de la tarjeta |
| `icon` | `String` | `''` | Icono de la tarjeta |
| `loading` | `Boolean` | `false` | Si la tarjeta está cargando |
| `collapsible` | `Boolean` | `false` | Si la tarjeta puede colapsarse |
| `defaultCollapsed` | `Boolean` | `false` | Si la tarjeta debe estar colapsada por defecto |
| `actions` | `Array` | `[]` | Acciones disponibles en la tarjeta |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal |
| `title` | Personalización del título |
| `subtitle` | Personalización del subtítulo |
| `icon` | Personalización del icono |
| `actions` | Personalización de las acciones |
| `footer` | Pie de la tarjeta |

#### Ejemplos de Uso

```vue
<AdminCard
  title="Estadísticas de Usuarios"
  icon="users"
  :loading="loading"
>
  <UserStats :stats="userStats" />

  <template #footer>
    <BaseButton variant="link" size="sm">Ver todos los usuarios</BaseButton>
  </template>
</AdminCard>
```

### AdminForm

`AdminForm` es un componente para crear formularios en el panel de administración.

**Archivo**: `/components/admin/AdminForm.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `''` | Título del formulario |
| `description` | `String` | `''` | Descripción del formulario |
| `submitLabel` | `String` | `'Guardar'` | Etiqueta del botón de envío |
| `cancelLabel` | `String` | `'Cancelar'` | Etiqueta del botón de cancelar |
| `loading` | `Boolean` | `false` | Si el formulario está procesando |
| `error` | `String` | `''` | Mensaje de error general |
| `success` | `String` | `''` | Mensaje de éxito |
| `layout` | `String` | `'vertical'` | Disposición del formulario (`'vertical'`, `'horizontal'`) |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `submit` | Se emite cuando se envía el formulario |
| `cancel` | Se emite cuando se cancela |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Campos del formulario |
| `title` | Personalización del título |
| `description` | Personalización de la descripción |
| `actions` | Personalización de los botones de acción |
| `error` | Personalización del mensaje de error |
| `success` | Personalización del mensaje de éxito |

#### Ejemplos de Uso

```vue
<AdminForm
  title="Crear Usuario"
  description="Ingresa la información del nuevo usuario"
  :loading="isSubmitting"
  :error="error"
  @submit="createUser"
  @cancel="$router.back()"
>
  <BaseInput v-model="form.name" label="Nombre" required />
  <BaseInput v-model="form.email" label="Correo electrónico" type="email" required />
  <BaseSelect v-model="form.role" label="Rol" :options="roles" required />
  <BaseInput v-model="form.password" label="Contraseña" type="password" required />
</AdminForm>
```

### AdminTabs

`AdminTabs` es un componente para organizar contenido en pestañas en el panel de administración.

**Archivo**: `/components/admin/AdminTabs.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `tabs` | `Array` | `[]` | Definición de pestañas |
| `activeTab` | `String` | `''` | ID de la pestaña activa |
| `vertical` | `Boolean` | `false` | Si las pestañas deben mostrarse verticalmente |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `change` | Se emite cuando cambia la pestaña activa |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `tab-[id]` | Contenido de una pestaña específica |
| `tab-header-[id]` | Personalización del encabezado de una pestaña |

#### Ejemplos de Uso

```vue
<AdminTabs
  :tabs="[
    { id: 'general', label: 'Información General' },
    { id: 'security', label: 'Seguridad' },
    { id: 'notifications', label: 'Notificaciones' }
  ]"
  v-model:activeTab="activeTab"
>
  <template #tab-general>
    <UserGeneralForm :user="user" @save="saveGeneral" />
  </template>

  <template #tab-security>
    <UserSecurityForm :user="user" @save="saveSecurity" />
  </template>

  <template #tab-notifications>
    <UserNotificationsForm :user="user" @save="saveNotifications" />
  </template>
</AdminTabs>
```

### AdminFilter

`AdminFilter` es un componente para filtrar datos en el panel de administración.

**Archivo**: `/components/admin/AdminFilter.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `filters` | `Array` | `[]` | Definición de filtros disponibles |
| `modelValue` | `Object` | `{}` | Valores de los filtros (v-model) |
| `collapsible` | `Boolean` | `true` | Si el panel de filtros puede colapsarse |
| `defaultCollapsed` | `Boolean` | `false` | Si el panel debe estar colapsado por defecto |

#### Eventos

| Nombre | Descripción |
|--------|-------------|
| `update:modelValue` | Se emite cuando cambian los valores de los filtros |
| `apply` | Se emite cuando se aplican los filtros |
| `reset` | Se emite cuando se restablecen los filtros |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Filtros personalizados |
| `actions` | Personalización de los botones de acción |

#### Ejemplos de Uso

```vue
<AdminFilter
  :filters="[
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'role', label: 'Rol', type: 'select', options: roles },
    { key: 'status', label: 'Estado', type: 'select', options: statuses },
    { key: 'createdAt', label: 'Fecha de creación', type: 'daterange' }
  ]"
  v-model="filters"
  @apply="applyFilters"
/>
```

## Componentes de Layout

### AdminLayout

`AdminLayout` es el componente principal de layout para el panel de administración.

**Archivo**: `/components/layout/AdminLayout.vue`

#### Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `title` | `String` | `'Panel de Administración'` | Título del panel de administración |

#### Slots

| Nombre | Descripción |
|--------|-------------|
| `default` | Contenido principal |
| `breadcrumbs` | Migas de pan |
| `footer` | Pie de página |

#### Características

- **Sidebar Lateral**: Incluye un sidebar fijo en el lado izquierdo con enlaces de navegación.
- **Sidebar Móvil**: En dispositivos móviles, el sidebar se muestra como un panel deslizable.
- **Integración con Navbar**: El botón hamburguesa del navbar principal abre el sidebar móvil del AdminLayout cuando se está en una ruta de administración.
- **Menús VAXAV**: El sidebar móvil incluye tanto los menús de administración como los menús principales de VAXAV.

#### Ejemplo de Uso

```vue
<AdminLayout title="Gestión de Usuarios">
  <template #breadcrumbs>
    <VxvBreadcrumb :items="breadcrumbItems" />
  </template>

  <div class="py-6">
    <!-- Contenido principal -->
  </div>
</AdminLayout>
```

## Patrones de Uso

### Página de Listado

```vue
<template>
  <AdminLayout title="Usuarios">
    <template #breadcrumbs>
      <VxvBreadcrumb :items="breadcrumbItems" />
    </template>

    <div class="py-6">
      <VxvDataTable
        title="Usuarios"
        :columns="columns"
        :items="users"
        :loading="loading"
      >
        <!-- Contenido de la tabla -->
      </VxvDataTable>
    </div>
  </AdminLayout>
</template>
```

### Página con Filtros y Tabla

```vue
<template>
  <AdminLayout title="Usuarios">
    <template #breadcrumbs>
      <VxvBreadcrumb :items="breadcrumbItems" />
    </template>

    <div class="py-6">
      <AdminFilter :filters="filters" v-model="filterValues" @apply="fetchUsers" />

      <AdminTable
      :columns="columns"
      :data="users"
      :loading="loading"
      :actions="actions"
      @action="handleAction"
    />
  </AdminLayout>
</template>
```

### Página de Detalle

```vue
<template>
  <AdminLayout :title="`Usuario: ${user.name}`">
    <AdminHeader :title="user.name">
      <template #breadcrumbs>
        <Breadcrumbs :items="[
          { label: 'Inicio', to: '/admin' },
          { label: 'Usuarios', to: '/admin/users' },
          { label: user.name }
        ]" />
      </template>
    </AdminHeader>

    <AdminTabs :tabs="tabs" v-model:activeTab="activeTab">
      <template #tab-info>
        <AdminCard title="Información del Usuario">
          <UserInfo :user="user" />
        </AdminCard>
      </template>

      <template #tab-activity>
        <AdminCard title="Actividad Reciente">
          <ActivityLog :activities="activities" />
        </AdminCard>
      </template>
    </AdminTabs>
  </AdminLayout>
</template>
```

### Página de Formulario

```vue
<template>
  <AdminLayout :title="isEditing ? `Editar Usuario: ${user.name}` : 'Crear Usuario'">
    <AdminHeader :title="isEditing ? `Editar Usuario: ${user.name}` : 'Crear Usuario'">
      <template #breadcrumbs>
        <Breadcrumbs :items="[
          { label: 'Inicio', to: '/admin' },
          { label: 'Usuarios', to: '/admin/users' },
          { label: isEditing ? `Editar: ${user.name}` : 'Crear Usuario' }
        ]" />
      </template>
    </AdminHeader>

    <AdminForm
      :title="isEditing ? 'Editar Usuario' : 'Crear Usuario'"
      :loading="loading"
      :error="error"
      @submit="saveUser"
      @cancel="$router.back()"
    >
      <BaseInput v-model="form.name" label="Nombre" required />
      <BaseInput v-model="form.email" label="Correo electrónico" type="email" required />
      <BaseSelect v-model="form.role" label="Rol" :options="roles" required />
      <BaseInput
        v-if="!isEditing"
        v-model="form.password"
        label="Contraseña"
        type="password"
        required
      />
    </AdminForm>
  </AdminLayout>
</template>
```

## Mejores Prácticas

### Estructura y Diseño

1. Usa `AdminLayout` como contenedor principal para todas las páginas de administración
2. Usa `AdminHeader` para proporcionar contexto y navegación consistente
3. Usa `AdminTable` para mostrar y gestionar datos tabulares
4. Usa `AdminForm` para crear formularios consistentes
5. Usa `AdminCard` para agrupar información relacionada
6. Usa `AdminTabs` para organizar contenido extenso
7. Usa `AdminFilter` para proporcionar capacidades de filtrado avanzadas
8. Mantén la jerarquía y estructura de componentes consistente en todo el panel de administración

### Gestión de Usuarios y Roles

9. Usa `UserModal` para crear y editar usuarios de forma consistente
10. Usa `RoleModal` para crear y editar roles de forma consistente
11. Usa `DeleteUserModal` y `DeleteRoleModal` para confirmar acciones destructivas
12. Implementa validación tanto en el frontend como en el backend
13. Proporciona mensajes de error específicos para cada campo del formulario
14. No permitas la eliminación o modificación de roles predefinidos del sistema

### Seguridad y Experiencia de Usuario

15. Implementa permisos y roles para controlar el acceso a diferentes secciones
16. Verifica los permisos del usuario antes de mostrar acciones o secciones restringidas
17. Proporciona retroalimentación clara para todas las acciones del usuario
18. Muestra estados de carga durante operaciones asíncronas
19. Implementa protección contra ataques CSRF en todas las solicitudes POST, PUT y DELETE
20. Registra todas las acciones administrativas para fines de auditoría

## Integración con el Sistema de Autenticación

Los componentes de administración están estrechamente integrados con el sistema de autenticación y autorización. Para más detalles sobre este sistema, consulte la [documentación de autenticación y autorización](../../auth/README.md).
