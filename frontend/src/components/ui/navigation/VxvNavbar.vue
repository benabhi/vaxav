<template>
  <nav :class="[
    'bg-gray-800 shadow-md border-b border-gray-700',
    sticky ? 'sticky top-0 z-50' : '',
    transparent ? 'bg-opacity-80 backdrop-blur-sm' : '',
    className
  ]">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <!-- Logo y enlaces de navegación -->
      <div class="flex items-center">
        <!-- Logo (slot o componente por defecto) -->
        <slot name="logo">
          <VxvLogo :size="logoSize" :to="logoLink" />
        </slot>

        <!-- Enlaces de navegación (slot o componente por defecto) -->
        <slot name="links">
          <div v-if="links && links.length > 0" class="ml-8 hidden md:block">
            <ul class="flex space-x-6">
              <li v-for="link in links" :key="link.to">
                <VxvNavLink
                  :to="link.to"
                  :label="link.label"
                  :icon="link.icon"
                  :horizontal="true"
                  :activeClass="activeClass"
                  :inactiveClass="inactiveClass"
                  :activeIconClass="activeIconClass"
                  :inactiveIconClass="inactiveIconClass"
                  :exact="link.exact"
                />
              </li>
            </ul>
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
import { defineProps } from 'vue';
import VxvLogo from '@/components/ui/branding/VxvLogo.vue';
import VxvNavLink from '@/components/ui/navigation/VxvNavLink.vue';

// Definición de la interfaz para los enlaces
interface NavLink {
  to: string;
  label: string;
  icon?: any;
  exact?: boolean;
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
    default: 'bg-gray-700 text-blue-400'
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
  }
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
