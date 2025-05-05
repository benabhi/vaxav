<template>
  <router-link
    :to="to"
    :class="[
      // Estilo para enlaces de página (pageNav)
      pageNav ? (isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white') :
      // Estilo para enlaces simples
      simple ? (isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white') :
      // Estilo para enlaces normales (en el sidebar móvil, solo texto azul)
      (isActive ? (isMobile ? 'text-blue-400' : activeClass) : inactiveClass),

      // Clases base
      'block text-base font-medium transition-all duration-150',

      // Estilos condicionales según tipo
      pageNav ? 'px-3 py-1 text-sm' :
      !simple ? 'px-4 py-2 rounded-md hover:bg-gray-700' : 'px-3 py-1',

      // Estilos para horizontal
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',

      // Estilos para sidebar colapsado
      isSidebarCollapsed && !isMobile ? 'px-2 py-2 text-center' : '',
      isActive && isSidebarCollapsed && !isMobile && !pageNav ? 'bg-gray-700' : '',
      // Ya no aplicamos fondo gris para enlaces activos en el sidebar móvil
      '',

      // Clase personalizada
      className
    ]"
    :title="label"
  >
    <!-- Contenido para enlaces de página (solo texto) -->
    <template v-if="pageNav">
      {{ label }}
    </template>

    <!-- Contenido para enlaces normales (con posible icono) -->
    <template v-else>
      <div
        class="flex items-center"
        :class="{ 'justify-center': isSidebarCollapsed && !isMobile }"
      >
        <component
          v-if="icon"
          :is="icon"
          class="h-5 w-5"
          :class="[
            isActive ? activeIconClass : inactiveIconClass,
            { 'mr-0': isSidebarCollapsed && !isMobile, 'mr-2': !isSidebarCollapsed || isMobile }
          ]"
        />
        <span
          :class="{ 'sr-only': isSidebarCollapsed && !isMobile }"
        >
          {{ label }}
        </span>
      </div>
    </template>
  </router-link>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';



// Para Storybook, podemos recibir una ruta simulada
const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  exact: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  simple: {
    type: Boolean,
    default: false
  },
  // Propiedad para indicar si es un enlace de página (estilo de submenú)
  pageNav: {
    type: Boolean,
    default: false
  },
  // Segmento principal al que pertenece este enlace (ej: 'pilot', 'universe')
  parentSegment: {
    type: String,
    default: ''
  },
  activeClass: {
    type: String,
    default: null
  },
  inactiveClass: {
    type: String,
    default: null
  },
  activeIconClass: {
    type: String,
    default: 'text-blue-400'
  },
  inactiveIconClass: {
    type: String,
    default: 'text-gray-400'
  },
  className: {
    type: String,
    default: ''
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  // Para Storybook, podemos simular si el enlace está activo
  active: {
    type: Boolean,
    default: undefined
  },
  // Ruta actual simulada para Storybook
  currentPath: {
    type: String,
    default: ''
  }
});

// Intentar obtener la ruta del router o usar la ruta simulada
let route;
try {
  route = useRoute();
} catch (e) {
  // En Storybook, useRoute() puede fallar
  route = { path: props.currentPath || '' };
}

// Check if the current route matches this link
const isActive = computed(() => {
  // Si se proporciona la propiedad active, usarla directamente (útil para Storybook)
  if (props.active !== undefined) {
    return props.active;
  }

  // Extraer segmentos de la ruta actual y del enlace
  const currentPathSegments = route.path.split('/').filter(Boolean);
  const linkPathSegments = props.to.split('/').filter(Boolean);

  // Si es un enlace de página (pageNav) con parentSegment
  if (props.pageNav && props.parentSegment && linkPathSegments.length >= 2) {
    // Verificar si la ruta actual coincide exactamente con este enlace
    if (route.path === props.to) {
      return true;
    }

    // Verificar si estamos en la misma sección y si este es el enlace específico dentro de esa sección
    if (currentPathSegments.length >= 2) {
      return currentPathSegments[0] === props.parentSegment &&
             currentPathSegments[1] === linkPathSegments[1];
    }
  }

  // Si es un enlace principal (como /pilot, /universe, etc.) o un enlace a una vista principal
  if (!props.exact) {
    // Si es un enlace a una subsección específica, verificar si la ruta actual coincide exactamente
    if (route.path === props.to) {
      return true;
    }

    // Para enlaces en el navbar (/pilot, /universe, etc.) o enlaces principales (/pilot/overview, /universe/galaxy, /admin/users, etc.)
    // verificar si la ruta actual comienza con el mismo segmento principal
    if (linkPathSegments.length === 1 ||
        (linkPathSegments.length > 1 &&
         (linkPathSegments[1] === 'overview' ||
          linkPathSegments[1] === 'galaxy' ||
          linkPathSegments[0] === 'admin'))) { // Incluir todos los enlaces de administración
      return currentPathSegments.length > 0 && currentPathSegments[0] === linkPathSegments[0];
    }
  }

  // Para otras rutas, usamos la lógica normal
  if (props.exact) {
    return route.path === props.to;
  }

  return route.path === props.to || route.path.startsWith(`${props.to}/`);
});
</script>
