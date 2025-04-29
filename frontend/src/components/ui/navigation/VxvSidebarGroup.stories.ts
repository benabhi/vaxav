import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvSidebarGroup from './VxvSidebarGroup.vue';

/**
 * VxvSidebarGroup es un componente que agrupa elementos de navegación bajo un título colapsable.
 * Se utiliza dentro de VxvSidebar para organizar los enlaces de navegación.
 */
const meta: Meta<typeof VxvSidebarGroup> = {
  title: 'UI/Navigation/VxvSidebarGroup',
  component: VxvSidebarGroup,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título del grupo',
      control: { type: 'text' },
    },
    defaultCollapsed: {
      description: 'Si el grupo debe estar colapsado por defecto',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
VxvSidebarGroup es un componente que agrupa elementos de navegación bajo un título colapsable.
Se utiliza dentro de VxvSidebar para organizar los enlaces de navegación.

\`\`\`vue
<template>
  <VxvSidebarGroup title="Gestión de Usuarios" :default-collapsed="false">
    <VxvNavLink to="/admin/users" label="Usuarios" />
    <VxvNavLink to="/admin/roles" label="Roles" />
  </VxvSidebarGroup>
</template>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvSidebarGroup>;

// Componente simplificado para Storybook
const NavLinkStub = {
  props: ['to', 'label', 'icon'],
  template: `
    <a 
      :href="to" 
      class="block px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
    >
      <div class="flex items-center">
        <component
          v-if="icon"
          :is="icon"
          class="mr-2 h-5 w-5 text-gray-400"
        />
        <span>{{ label }}</span>
      </div>
    </a>
  `
};

// Iconos de ejemplo
const UsersIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `
};

const ChartIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  `
};

/**
 * Grupo de navegación expandido
 */
export const Default: Story = {
  args: {
    title: 'Gestión de Usuarios',
    defaultCollapsed: false,
  },
  render: (args) => ({
    components: { 
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return { 
        args,
        UsersIcon
      };
    },
    template: `
      <div class="w-64 bg-gray-800 p-4">
        <VxvSidebarGroup v-bind="args">
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/roles" label="Roles" />
          <VxvNavLink to="/permissions" label="Permisos" />
        </VxvSidebarGroup>
      </div>
    `,
  }),
};

/**
 * Grupo de navegación colapsado
 */
export const Collapsed: Story = {
  args: {
    title: 'Gestión de Usuarios',
    defaultCollapsed: true,
  },
  render: (args) => ({
    components: { 
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return { 
        args,
        UsersIcon
      };
    },
    template: `
      <div class="w-64 bg-gray-800 p-4">
        <VxvSidebarGroup v-bind="args">
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/roles" label="Roles" />
          <VxvNavLink to="/permissions" label="Permisos" />
        </VxvSidebarGroup>
      </div>
    `,
  }),
};

/**
 * Múltiples grupos de navegación
 */
export const MultipleGroups: Story = {
  render: () => ({
    components: { 
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return { 
        UsersIcon,
        ChartIcon
      };
    },
    template: `
      <div class="w-64 bg-gray-800 p-4">
        <VxvSidebarGroup title="Gestión de Usuarios">
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/roles" label="Roles" />
          <VxvNavLink to="/permissions" label="Permisos" />
        </VxvSidebarGroup>
        
        <VxvSidebarGroup title="Reportes" :default-collapsed="true">
          <VxvNavLink to="/reports/sales" label="Ventas" :icon="ChartIcon" />
          <VxvNavLink to="/reports/traffic" label="Tráfico" />
          <VxvNavLink to="/reports/users" label="Usuarios" />
        </VxvSidebarGroup>
      </div>
    `,
  }),
};

/**
 * Grupo de navegación interactivo
 */
export const Interactive: Story = {
  render: () => ({
    components: { 
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      const isCollapsed = ref(false);
      
      const toggleCollapsed = () => {
        isCollapsed.value = !isCollapsed.value;
      };
      
      return { 
        UsersIcon,
        isCollapsed,
        toggleCollapsed
      };
    },
    template: `
      <div class="w-64 bg-gray-800 p-4">
        <div class="mb-4">
          <button 
            @click="toggleCollapsed" 
            class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            {{ isCollapsed ? 'Expandir' : 'Colapsar' }} grupo
          </button>
        </div>
        
        <VxvSidebarGroup title="Gestión de Usuarios" :default-collapsed="isCollapsed">
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/roles" label="Roles" />
          <VxvNavLink to="/permissions" label="Permisos" />
        </VxvSidebarGroup>
      </div>
    `,
  }),
};

/**
 * Grupo de navegación con muchos elementos
 */
export const WithManyItems: Story = {
  args: {
    title: 'Configuración del Sistema',
    defaultCollapsed: false,
  },
  render: (args) => ({
    components: { 
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return { 
        args
      };
    },
    template: `
      <div class="w-64 bg-gray-800 p-4">
        <VxvSidebarGroup v-bind="args">
          <VxvNavLink to="/settings/general" label="General" />
          <VxvNavLink to="/settings/security" label="Seguridad" />
          <VxvNavLink to="/settings/appearance" label="Apariencia" />
          <VxvNavLink to="/settings/notifications" label="Notificaciones" />
          <VxvNavLink to="/settings/integrations" label="Integraciones" />
          <VxvNavLink to="/settings/billing" label="Facturación" />
          <VxvNavLink to="/settings/users" label="Usuarios" />
          <VxvNavLink to="/settings/roles" label="Roles" />
          <VxvNavLink to="/settings/permissions" label="Permisos" />
          <VxvNavLink to="/settings/logs" label="Registros" />
        </VxvSidebarGroup>
      </div>
    `,
  }),
};
