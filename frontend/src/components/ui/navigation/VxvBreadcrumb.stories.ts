import type { Meta, StoryObj } from '@storybook/vue3';
import VxvBreadcrumb from './VxvBreadcrumb.vue';

/**
 * VxvBreadcrumb es un componente de navegación que muestra la ruta de navegación actual.
 * Ayuda a los usuarios a entender su ubicación actual en la aplicación y facilita la navegación hacia atrás.
 */
const meta: Meta<typeof VxvBreadcrumb> = {
  title: 'UI/Navigation/VxvBreadcrumb',
  component: VxvBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array de elementos de la ruta de navegación',
      control: { type: 'object' },
    },
    homeLink: {
      description: 'Enlace para el icono de inicio',
      control: { type: 'text' },
    },
    homeText: {
      description: 'Texto para el icono de inicio (para lectores de pantalla)',
      control: { type: 'text' },
    },
  },
  parameters: {
    // Simular Vue Router para los enlaces
    docs: {
      source: {
        code: `
<template>
  <VxvBreadcrumb :items="items" />
</template>

<script setup>
const items = [
  { text: 'Dashboard', to: '/dashboard' },
  { text: 'Usuarios', to: '/dashboard/users' },
  { text: 'Detalles de usuario' }
];
</script>
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvBreadcrumb>;

/**
 * Ejemplo básico de migas de pan
 */
export const Default: Story = {
  args: {
    items: [
      { text: 'Dashboard', to: '/dashboard' },
      { text: 'Usuarios', to: '/dashboard/users' },
      { text: 'Detalles de usuario' },
    ],
    homeLink: '/',
    homeText: 'Inicio',
  },
  render: (args) => ({
    components: { VxvBreadcrumb },
    setup() {
      // Simular Vue Router para los enlaces
      const RouterLink = {
        props: ['to'],
        template: '<a :href="to"><slot /></a>',
      };
      
      return { args, RouterLink };
    },
    template: `
      <VxvBreadcrumb v-bind="args" />
    `,
  }),
};

/**
 * Migas de pan con ruta corta
 */
export const ShortPath: Story = {
  args: {
    items: [
      { text: 'Configuración' },
    ],
    homeLink: '/',
    homeText: 'Inicio',
  },
  render: (args) => ({
    components: { VxvBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <VxvBreadcrumb v-bind="args" />
    `,
  }),
};

/**
 * Migas de pan con ruta larga
 */
export const LongPath: Story = {
  args: {
    items: [
      { text: 'Dashboard', to: '/dashboard' },
      { text: 'Administración', to: '/dashboard/admin' },
      { text: 'Usuarios', to: '/dashboard/admin/users' },
      { text: 'Perfiles', to: '/dashboard/admin/users/profiles' },
      { text: 'Configuración', to: '/dashboard/admin/users/profiles/settings' },
      { text: 'Permisos' },
    ],
    homeLink: '/',
    homeText: 'Inicio',
  },
  render: (args) => ({
    components: { VxvBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <VxvBreadcrumb v-bind="args" />
    `,
  }),
};

/**
 * Migas de pan con texto personalizado para el inicio
 */
export const CustomHomeText: Story = {
  args: {
    items: [
      { text: 'Productos', to: '/products' },
      { text: 'Categorías', to: '/products/categories' },
      { text: 'Electrónica' },
    ],
    homeLink: '/',
    homeText: 'Tienda',
  },
  render: (args) => ({
    components: { VxvBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <VxvBreadcrumb v-bind="args" />
    `,
  }),
};

/**
 * Migas de pan con enlace de inicio personalizado
 */
export const CustomHomeLink: Story = {
  args: {
    items: [
      { text: 'Productos', to: '/products' },
      { text: 'Categorías', to: '/products/categories' },
      { text: 'Electrónica' },
    ],
    homeLink: '/dashboard',
    homeText: 'Dashboard',
  },
  render: (args) => ({
    components: { VxvBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <VxvBreadcrumb v-bind="args" />
    `,
  }),
};

/**
 * Migas de pan en diferentes contextos
 */
export const DifferentContexts: Story = {
  render: () => ({
    components: { VxvBreadcrumb },
    setup() {
      const adminItems = [
        { text: 'Panel de administración', to: '/admin' },
        { text: 'Usuarios', to: '/admin/users' },
        { text: 'Editar usuario' },
      ];
      
      const shopItems = [
        { text: 'Tienda', to: '/shop' },
        { text: 'Categorías', to: '/shop/categories' },
        { text: 'Productos', to: '/shop/categories/products' },
        { text: 'Detalles del producto' },
      ];
      
      const settingsItems = [
        { text: 'Configuración', to: '/settings' },
        { text: 'Perfil', to: '/settings/profile' },
        { text: 'Seguridad' },
      ];
      
      return { 
        adminItems,
        shopItems,
        settingsItems
      };
    },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-white mb-2">Contexto de administración:</h3>
          <VxvBreadcrumb :items="adminItems" />
        </div>
        
        <div>
          <h3 class="text-white mb-2">Contexto de tienda:</h3>
          <VxvBreadcrumb :items="shopItems" />
        </div>
        
        <div>
          <h3 class="text-white mb-2">Contexto de configuración:</h3>
          <VxvBreadcrumb :items="settingsItems" />
        </div>
      </div>
    `,
  }),
};
