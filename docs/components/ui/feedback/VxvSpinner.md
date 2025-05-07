# VxvSpinner

El componente `VxvSpinner` muestra un indicador de carga animado, útil para indicar a los usuarios que una operación está en progreso.

## Importación

```javascript
import VxvSpinner from '@/components/ui/feedback/VxvSpinner.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `size` | `String` | `'md'` | Tamaño del spinner. Valores posibles: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `color` | `String` | `'primary'` | Color del spinner. Valores posibles: `'primary'`, `'secondary'`, `'success'`, `'danger'`, `'warning'`, `'info'`, `'light'`, `'dark'`, `'white'` |
| `label` | `String` | `''` | Texto que se muestra junto al spinner |
| `hideText` | `Boolean` | `false` | Ocultar el texto para lectores de pantalla |

## Ejemplos de Uso

### Spinner básico

```vue
<VxvSpinner />
```

### Spinner con etiqueta

```vue
<VxvSpinner label="Cargando..." />
```

### Spinner con tamaño personalizado

```vue
<VxvSpinner size="lg" />
```

### Spinner con color personalizado

```vue
<VxvSpinner color="success" />
```

### Spinner en un botón

```vue
<button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
  <VxvSpinner size="sm" color="white" class="mr-2" hideText />
  <span>Cargando...</span>
</button>
```

### Spinner centrado en un contenedor

```vue
<div class="flex items-center justify-center h-64">
  <VxvSpinner size="xl" label="Cargando contenido..." />
</div>
```

## Tamaños disponibles

- `xs`: Extra pequeño (12px)
- `sm`: Pequeño (16px)
- `md`: Mediano (24px, por defecto)
- `lg`: Grande (32px)
- `xl`: Extra grande (48px)

## Colores disponibles

- `primary`: Azul (tema principal)
- `secondary`: Gris
- `success`: Verde
- `danger`: Rojo
- `warning`: Amarillo
- `info`: Cian
- `light`: Gris claro
- `dark`: Gris oscuro
- `white`: Blanco

## Accesibilidad

El componente incluye:
- Un atributo `role="status"` para indicar a los lectores de pantalla que es un indicador de estado
- Un atributo `aria-label="Cargando"` para proporcionar un texto descriptivo
- Un texto oculto visualmente pero disponible para lectores de pantalla cuando no se proporciona una etiqueta

## Casos de uso comunes

### Carga de página completa

```vue
<div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
  <VxvSpinner size="xl" color="white" label="Cargando página..." />
</div>
```

### Carga de sección

```vue
<div class="relative min-h-[200px]">
  <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <VxvSpinner color="white" />
  </div>
  <div v-else>
    <!-- Contenido cargado -->
  </div>
</div>
```

### Carga de tabla

```vue
<div>
  <table class="w-full">
    <!-- Encabezados de tabla -->
    <tbody v-if="loading">
      <tr>
        <td colspan="4" class="py-8 text-center">
          <VxvSpinner label="Cargando datos..." />
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <!-- Filas de datos -->
    </tbody>
  </table>
</div>
```

### Botón de envío de formulario

```vue
<form @submit.prevent="submitForm">
  <!-- Campos del formulario -->
  <button 
    type="submit" 
    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center"
    :disabled="submitting"
  >
    <VxvSpinner v-if="submitting" size="sm" color="white" class="mr-2" hideText />
    <span>{{ submitting ? 'Enviando...' : 'Enviar' }}</span>
  </button>
</form>
```
