<template>
  <nav :class="[
    'bg-gray-800 shadow-md border-b border-gray-700',
    sticky ? 'sticky top-0 z-50' : '',
    transparent ? 'bg-opacity-80 backdrop-blur-sm' : '',
    className
  ]">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <!-- Logo, botón hamburguesa y enlaces de navegación -->
      <div class="flex items-center">
        <!-- Botón hamburguesa para móvil -->
        <button
          v-if="showMobileMenuButton"
          type="button"
          class="md:hidden text-gray-300 hover:text-white p-2 mr-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="$emit('mobile-menu-click')"
        >
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo (slot o componente por defecto) -->
        <slot name="logo">
          <VxvLogo :size="logoSize" :to="logoLink" />
        </slot>

        <!-- Enlaces de navegación (slot o componente por defecto) -->
        <slot name="links">
          <div v-if="links && links.length > 0" class="ml-8 hidden md:flex items-center space-x-6">
            <template v-for="link in links" :key="link.to">
              <!-- Si el enlace tiene submenú, usar dropdown -->
              <VxvDropdown v-if="link.children && link.children.length > 0" position="bottom-left">
                <template #trigger>
                  <div class="flex items-center text-base font-medium cursor-pointer px-3 py-1"
                       :class="isLinkActive(link) ? 'text-blue-400' : 'text-gray-300 hover:text-white'">
                    {{ link.label }}
                    <svg class="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </template>

                <VxvDropdownItem
                  v-for="child in link.children"
                  :key="child.to"
                  :to="child.to"
                  :label="child.label"
                />
              </VxvDropdown>

              <!-- Si el enlace no tiene submenú, usar NavLink normal -->
              <VxvNavLink
                v-else
                :to="link.to"
                :label="link.label"
                :icon="link.icon"
                :horizontal="true"
                :activeClass="activeClass"
                :inactiveClass="inactiveClass"
                :activeIconClass="activeIconClass"
                :inactiveIconClass="inactiveIconClass"
                :exact="link.exact"
                :className="link.className"
              />
            </template>
          </div>
        </slot>
      </div>

      <!-- Acciones (slot o componente por defecto) -->
      <div class="flex items-center space-x-4">
        <slot name="actions">
          <!-- Contenido por defecto para acciones -->
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { useRoute } from 'vue-router';
import VxvLogo from '@/components/ui/branding/VxvLogo.vue';
import VxvNavLink from '@/components/ui/navigation/VxvNavLink.vue';
import VxvDropdown from '@/components/ui/navigation/VxvDropdown.vue';
import VxvDropdownItem from '@/components/ui/navigation/VxvDropdownItem.vue';

// Definición de la interfaz para los enlaces
interface NavLinkChild {
  to: string;
  label: string;
  icon?: any;
  exact?: boolean;
}

interface NavLink {
  to: string;
  label: string;
  icon?: any;
  exact?: boolean;
  children?: NavLinkChild[];
  className?: string;
}

const props = defineProps({
  // Propiedades de configuración
  sticky: {
    type: Boolean,
    default: true
  },
  transparent: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },

  // Propiedades del logo
  logoSize: {
    type: String,
    default: 'md'
  },
  logoLink: {
    type: String,
    default: '/'
  },

  // Propiedades de los enlaces
  links: {
    type: Array as () => NavLink[],
    default: () => []
  },

  // Clases para los enlaces
  activeClass: {
    type: String,
    default: 'text-blue-400'
  },
  inactiveClass: {
    type: String,
    default: 'text-gray-300 hover:text-white'
  },
  activeIconClass: {
    type: String,
    default: 'text-blue-400'
  },
  inactiveIconClass: {
    type: String,
    default: 'text-gray-400'
  },

  // Botón de menú móvil
  showMobileMenuButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['mobile-menu-click']);

// Obtener la ruta actual
const route = useRoute();

// Método para verificar si un enlace está activo (incluyendo sus hijos)
const isLinkActive = (link: NavLink) => {
  // Si la ruta actual coincide exactamente con la ruta del enlace
  if (route.path === link.to) {
    return true;
  }

  // Si el enlace tiene hijos, verificar si alguno está activo
  if (link.children && link.children.length > 0) {
    return link.children.some(child => route.path === child.to || route.path.startsWith(child.to + '/'));
  }

  // Verificar si la ruta actual comienza con la ruta del enlace
  return !link.exact && route.path.startsWith(link.to + '/');
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
