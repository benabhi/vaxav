# VxvToggleSwitch

`VxvToggleSwitch` es un componente de interruptor de palanca (toggle switch) que permite al usuario alternar entre dos estados: activo e inactivo. Está diseñado con la estética sci-fi retro de Vaxav.

## Ubicación

```
frontend/src/components/ui/forms/VxvToggleSwitch.vue
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `modelValue` | `Boolean` | - | Estado actual del toggle (true = activo, false = inactivo) |
| `activeText` | `String` | `'Activo'` | Texto para el estado activo |
| `inactiveText` | `String` | `'Inactivo'` | Texto para el estado inactivo |
| `activeColor` | `String` | `'bg-green-500'` | Color de fondo para el estado activo |
| `inactiveColor` | `String` | `'bg-gray-600'` | Color de fondo para el estado inactivo |
| `activeTextColor` | `String` | `'text-green-400'` | Color del texto para el estado activo |
| `inactiveTextColor` | `String` | `'text-gray-400'` | Color del texto para el estado inactivo |
| `label` | `String` | `'Toggle'` | Etiqueta para accesibilidad |
| `disabled` | `Boolean` | `false` | Si el toggle está deshabilitado |
| `showLabel` | `Boolean` | `true` | Si se debe mostrar la etiqueta de texto |

## Eventos

| Nombre | Parámetros | Descripción |
|--------|------------|-------------|
| `update:modelValue` | `(value: Boolean)` | Se emite cuando cambia el valor del toggle |
| `change` | `(value: Boolean)` | Se emite cuando el usuario cambia el estado del toggle |

## Ejemplos de Uso

### Toggle Básico

```vue
<VxvToggleSwitch v-model="isActive" />
```

### Toggle con Texto Personalizado

```vue
<VxvToggleSwitch
  v-model="isEnabled"
  activeText="Habilitado"
  inactiveText="Deshabilitado"
/>
```

### Toggle con Colores Personalizados

```vue
<VxvToggleSwitch
  v-model="isOnline"
  activeColor="bg-blue-500"
  inactiveColor="bg-red-500"
  activeTextColor="text-blue-400"
  inactiveTextColor="text-red-400"
/>
```

### Toggle Deshabilitado

```vue
<VxvToggleSwitch
  v-model="isFeatureEnabled"
  disabled
/>
```

### Toggle sin Etiqueta

```vue
<VxvToggleSwitch
  v-model="darkMode"
  :showLabel="false"
/>
```

### Toggle con Manejo de Eventos

```vue
<VxvToggleSwitch
  v-model="notificationsEnabled"
  @change="handleNotificationChange"
/>
```

## Accesibilidad

El componente incluye atributos ARIA para mejorar la accesibilidad:

- `aria-checked`: Indica si el toggle está activado o desactivado
- `aria-label`: Proporciona una etiqueta descriptiva para lectores de pantalla

## Diseño Responsivo

El componente está diseñado para funcionar bien en dispositivos móviles y de escritorio, con un tamaño adecuado para la interacción táctil.

## Notas de Implementación

- El componente utiliza Tailwind CSS para los estilos
- La animación de transición proporciona retroalimentación visual al usuario
- El estado deshabilitado reduce la opacidad para indicar que no está disponible
