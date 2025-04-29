# VxvDropdownItem

El componente `VxvDropdownItem` representa un elemento individual dentro de un menú desplegable `VxvDropdown`. Proporciona una interfaz consistente para opciones de menú, con soporte para iconos, enlaces y estados deshabilitados.

## Características

- **Versatilidad**: Puede funcionar como botón, enlace interno o enlace externo
- **Iconos**: Soporte para mostrar iconos junto al texto
- **Estados**: Soporte para estado deshabilitado
- **Estilo consistente**: Diseño uniforme para todos los elementos del menú
- **Personalizable**: Acepta clases CSS adicionales para personalización

## Propiedades

| Nombre | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| label | String | `''` | Texto del elemento |
| to | String/Object | `null` | Ruta para router-link |
| href | String | `null` | URL para enlaces externos |
| icon | Object/Function | `null` | Componente de icono |
| disabled | Boolean | `false` | Si el elemento está deshabilitado |
| className | String | `''` | Clases CSS adicionales |

## Eventos

| Nombre | Descripción |
|--------|-------------|
| click | Se emite cuando se hace clic en el elemento (no se emite si está deshabilitado) |

## Slots

| Nombre | Descripción |
|--------|-------------|
| default | Contenido del elemento (si no se proporciona, se usa la propiedad `label`) |

## Ejemplos de Uso

### Elemento Básico

```vue
<VxvDropdownItem label="Opción 1" />
```

### Elemento con Icono

```vue
<VxvDropdownItem label="Perfil" :icon="UserIcon" />
```

### Elemento con Enlace Interno

```vue
<VxvDropdownItem label="Configuración" :icon="SettingsIcon" to="/settings" />
```

### Elemento con Enlace Externo

```vue
<VxvDropdownItem label="Documentación" href="https://docs.example.com" />
```

### Elemento Deshabilitado

```vue
<VxvDropdownItem label="Opción no disponible" :disabled="true" />
```

### Elemento con Evento

```vue
<VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" @click="logout" />
```

### Elemento con Contenido Personalizado

```vue
<VxvDropdownItem>
  <span class="font-bold">Opción Personalizada</span>
  <span class="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Nuevo</span>
</VxvDropdownItem>
```

## Uso con VxvDropdown

El componente `VxvDropdownItem` está diseñado para ser utilizado dentro de un componente `VxvDropdown`:

```vue
<VxvDropdown>
  <template #trigger>
    <VxvButton>Usuario</VxvButton>
  </template>
  
  <VxvDropdownItem label="Perfil" :icon="UserIcon" to="/profile" />
  <VxvDropdownItem label="Configuración" :icon="SettingsIcon" to="/settings" />
  <VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" @click="logout" />
</VxvDropdown>
```

## Implementación en Menú de Usuario

Un caso de uso común es implementar un menú de usuario en la barra de navegación:

```vue
<VxvDropdown triggerClass="text-gray-300 hover:text-white flex items-center">
  <template #trigger>
    <span>{{ username }}</span>
    <ChevronDownIcon class="ml-1 h-4 w-4" />
  </template>
  
  <VxvDropdownItem label="Perfil" :icon="UserIcon" to="/profile" />
  <VxvDropdownItem label="Configuración" :icon="SettingsIcon" to="/settings" />
  <VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" @click="logout" />
</VxvDropdown>
```

## Notas de Implementación

1. **Renderizado condicional**: El componente utiliza renderizado condicional para determinar si debe renderizarse como un botón, un router-link o un enlace normal
2. **Accesibilidad**: Incluye soporte para estados deshabilitados y navegación por teclado
3. **Estilo**: Utiliza clases de Tailwind CSS para un estilo consistente con el resto de la aplicación
4. **Iconos**: Compatible con iconos de Heroicons y otros sistemas de iconos similares
5. **Eventos**: Maneja correctamente los eventos de clic, evitando que se emitan cuando el elemento está deshabilitado
