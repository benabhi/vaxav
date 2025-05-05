# VxvBreadcrumb

El componente `VxvBreadcrumb` proporciona una navegación de migas de pan (breadcrumb) que muestra la ruta de navegación actual, con un icono de inicio y separadores visuales entre los elementos.

## Importación

```javascript
import VxvBreadcrumb from '@/components/ui/navigation/VxvBreadcrumb.vue';
```

## Props

| Nombre | Tipo | Valor por defecto | Descripción |
|--------|------|------------------|-------------|
| `items` | `Array<{ text: string; to?: string }>` | - | Array de elementos de migas de pan (requerido) |
| `homeLink` | `String` | `'/'` | Enlace para el icono de inicio |
| `homeText` | `String` | `'Inicio'` | Texto para el icono de inicio (para lectores de pantalla) |

## Estructura de los items

Cada elemento en el array `items` debe tener la siguiente estructura:

```javascript
{
  text: 'Nombre del elemento', // Texto a mostrar
  to: '/ruta/del/elemento'     // Ruta para el enlace (opcional)
}
```

Si no se proporciona la propiedad `to`, el elemento se mostrará como texto sin enlace.

## Ejemplos de Uso

### Migas de pan básicas

```vue
<VxvBreadcrumb 
  :items="[
    { text: 'Usuarios', to: '/usuarios' },
    { text: 'Detalles' }
  ]" 
/>
```

### Migas de pan con enlace de inicio personalizado

```vue
<VxvBreadcrumb 
  :items="[
    { text: 'Proyectos', to: '/proyectos' },
    { text: 'Proyecto A', to: '/proyectos/a' },
    { text: 'Tareas' }
  ]" 
  homeLink="/dashboard" 
  homeText="Dashboard" 
/>
```

### Migas de pan dinámicas

```vue
<template>
  <VxvBreadcrumb :items="breadcrumbItems" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbItems = computed(() => {
  const items = [];
  
  if (route.meta.breadcrumb) {
    // Usar metadatos de la ruta para generar las migas de pan
    route.meta.breadcrumb.forEach(item => {
      items.push({
        text: item.text,
        to: item.to
      });
    });
  } else {
    // Generar migas de pan basadas en la ruta actual
    const pathSegments = route.path.split('/').filter(segment => segment);
    let currentPath = '';
    
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      items.push({
        text: segment.charAt(0).toUpperCase() + segment.slice(1),
        to: currentPath
      });
    });
    
    // El último elemento no tiene enlace
    if (items.length > 0) {
      const lastItem = items.pop();
      items.push({ text: lastItem.text });
    }
  }
  
  return items;
});
</script>
```

### Migas de pan en VxvPageTitle

```vue
<VxvPageTitle title="Detalles de Usuario">
  <template #breadcrumbs>
    <VxvBreadcrumb 
      :items="[
        { text: 'Usuarios', to: '/usuarios' },
        { text: 'Detalles' }
      ]" 
    />
  </template>
</VxvPageTitle>
```

## Notas de Uso

- El componente siempre muestra un icono de inicio como primer elemento.
- Los elementos se separan visualmente con un icono de flecha diagonal.
- El último elemento generalmente no tiene enlace, ya que representa la página actual.
- El componente utiliza `router-link` para la navegación, por lo que es compatible con Vue Router.
- El componente es accesible, con etiquetas semánticas `<nav>` y `<ol>` y texto alternativo para el icono de inicio.
- Los colores están adaptados al tema oscuro de la aplicación, con enlaces en gris claro que cambian a blanco al pasar el cursor.
- El componente es responsive y se adapta a diferentes tamaños de pantalla.
- Para una mejor experiencia de usuario, limita el número de elementos a un máximo de 3-4 para evitar que las migas de pan ocupen demasiado espacio en pantallas pequeñas.
