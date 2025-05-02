<template>
  <router-link
    :to="to"
    :class="[
      simple ? (isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white') : (isActive ? activeClass : inactiveClass),
      'block text-base font-medium transition-all duration-150',
      !simple ? 'px-4 py-2 rounded-md hover:bg-gray-700' : 'px-3 py-1',
      horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
      isSidebarCollapsed && !isMobile ? 'px-2 py-2 text-center' : '',
      className
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

  // Para la ruta raíz ("/"), necesitamos un manejo especial
  if (props.to === '/') {
    // Si es exacto, solo coincide con la ruta raíz
    if (props.exact) {
      return route.path === '/';
    }

    // Si no es exacto y es la ruta de Piloto, también debe activarse para /skills
    // Verificamos si la ruta actual es / o /skills (o cualquier otra ruta de piloto)
    return route.path === '/' ||
           route.path === '/skills' ||
           route.path.startsWith('/skills/');
  }

  // Para otras rutas, usamos la lógica normal
  if (props.exact) {
    return route.path === props.to;
  }

  return route.path === props.to || route.path.startsWith(`${props.to}/`);
});
</script>
