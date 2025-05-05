<template>
  <router-link
    :to="to"
    :class="[
      // Estilo para enlaces
      simple ? (isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white') :
      (isActive ? (isMobile ? 'text-blue-400' : activeClass) : inactiveClass),

      // Clase personalizada (siempre se aplica, independientemente del estado)
      className,

      // Clases base
      'block text-base font-medium transition-all duration-150',

      // Estilos condicionales según tipo
      !simple ? 'px-4 py-2 rounded-md hover:bg-gray-700' : 'px-3 py-1',

      // Estilos para horizontal
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',

      // Estilos para sidebar colapsado
      isSidebarCollapsed && !isMobile ? 'px-2 py-2 text-center' : '',
      isActive && isSidebarCollapsed && !isMobile ? 'bg-gray-700' : ''
    ]"
    :title="label"
  >
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

  // Si la ruta actual coincide exactamente con la ruta del enlace
  if (route.path === props.to) {
    return true;
  }

  // Si se requiere coincidencia exacta, solo devolver true si las rutas son idénticas
  if (props.exact) {
    return false;
  }

  // Para enlaces no exactos, verificar si la ruta actual comienza con la ruta del enlace
  return route.path.startsWith(`${props.to}/`);
});
</script>
