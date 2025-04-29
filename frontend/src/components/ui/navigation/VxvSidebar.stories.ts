import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvSidebar from './VxvSidebar.vue';
import VxvSidebarGroup from './VxvSidebarGroup.vue';
import VxvNavLink from './VxvNavLink.vue';

/**
 * VxvSidebar es un componente que proporciona una barra lateral para la navegación.
 * Se utiliza principalmente para la navegación principal de la aplicación.
 */
const meta: Meta<typeof VxvSidebar> = {
  title: 'UI/Navigation/VxvSidebar',
  component: VxvSidebar,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título opcional para la barra lateral',
      control: { type: 'text' },
    },
    collapsible: {
      description: 'Si la barra lateral puede colapsarse',
      control: { type: 'boolean' },
    },
    defaultCollapsed: {
      description: 'Si la barra lateral debe estar colapsada por defecto',
      control: { type: 'boolean' },
    },
    isMobile: {
      description: 'Si la barra lateral está en modo móvil',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Clases CSS adicionales',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
VxvSidebar es un componente que proporciona una barra lateral para la navegación.
Se utiliza principalmente para la navegación principal de la aplicación.

\`\`\`vue
<template>
  <VxvSidebar title="Panel Admin">
    <VxvSidebarGroup title="Gestión de Usuarios">
      <VxvNavLink to="/admin/users" label="Usuarios" />
      <VxvNavLink to="/admin/roles" label="Roles" />
    </VxvSidebarGroup>

    <VxvNavLink to="/admin/settings" label="Configuración" />
  </VxvSidebar>
</template>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvSidebar>;

// Componentes simplificados para Storybook
const NavLinkStub = {
  props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className', 'isSidebarCollapsed', 'isMobile'],
  template: `
    <a
      :href="to"
      :class="[
        to === '/dashboard' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:text-white',
        'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
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
            to === '/dashboard' ? 'text-blue-400' : 'text-gray-400',
            { 'mr-0': isSidebarCollapsed && !isMobile, 'mr-2': !isSidebarCollapsed || isMobile }
          ]"
        />
        <span
          :class="{ 'sr-only': isSidebarCollapsed && !isMobile }"
        >
          {{ label }}
        </span>
      </div>
    </a>
  `
};

// Iconos de ejemplo
const HomeIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `
};

const UsersIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `
};

const SettingsIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
 * Barra lateral básica sin título
 */
export const Default: Story = {
  args: {
    title: '',
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="h-[500px] w-64 bg-gray-900 p-4">
        <VxvSidebar v-bind="args">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </VxvSidebar>
      </div>
    `,
  }),
};

/**
 * Barra lateral con título
 */
export const WithTitle: Story = {
  args: {
    title: 'Panel de Administración',
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="h-[500px] w-64 bg-gray-900 p-4">
        <VxvSidebar v-bind="args">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </VxvSidebar>
      </div>
    `,
  }),
};

/**
 * Barra lateral con grupos
 */
export const WithGroups: Story = {
  args: {
    title: 'Panel de Administración',
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ChartIcon
      };
    },
    template: `
      <div class="h-[500px] w-64 bg-gray-900 p-4">
        <VxvSidebar v-bind="args">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />

          <VxvSidebarGroup title="Gestión de Usuarios">
            <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
            <VxvNavLink to="/roles" label="Roles" />
            <VxvNavLink to="/permissions" label="Permisos" />
          </VxvSidebarGroup>

          <VxvSidebarGroup title="Reportes">
            <VxvNavLink to="/reports/sales" label="Ventas" :icon="ChartIcon" />
            <VxvNavLink to="/reports/traffic" label="Tráfico" />
            <VxvNavLink to="/reports/users" label="Usuarios" />
          </VxvSidebarGroup>

          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </VxvSidebar>
      </div>
    `,
  }),
};

/**
 * Barra lateral con grupos colapsados
 */
export const WithCollapsedGroups: Story = {
  args: {
    title: 'Panel de Administración',
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ChartIcon
      };
    },
    template: `
      <div class="h-[500px] w-64 bg-gray-900 p-4">
        <VxvSidebar v-bind="args">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />

          <VxvSidebarGroup title="Gestión de Usuarios" :default-collapsed="true">
            <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
            <VxvNavLink to="/roles" label="Roles" />
            <VxvNavLink to="/permissions" label="Permisos" />
          </VxvSidebarGroup>

          <VxvSidebarGroup title="Reportes" :default-collapsed="true">
            <VxvNavLink to="/reports/sales" label="Ventas" :icon="ChartIcon" />
            <VxvNavLink to="/reports/traffic" label="Tráfico" />
            <VxvNavLink to="/reports/users" label="Usuarios" />
          </VxvSidebarGroup>

          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </VxvSidebar>
      </div>
    `,
  }),
};

/**
 * Barra lateral con enlaces activos
 */
export const WithActiveLinks: Story = {
  args: {
    title: 'Panel de Administración',
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="h-[500px] w-64 bg-gray-900 p-4">
        <VxvSidebar v-bind="args">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />

          <VxvSidebarGroup title="Gestión de Usuarios">
            <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
            <VxvNavLink to="/roles" label="Roles" />
            <VxvNavLink to="/permissions" label="Permisos" />
          </VxvSidebarGroup>

          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </VxvSidebar>
      </div>
    `,
  }),
};

/**
 * Barra lateral en un layout de aplicación
 */
export const InAppLayout: Story = {
  render: () => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      return {
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ChartIcon
      };
    },
    template: `
      <div class="flex h-[600px] w-full bg-gray-900">
        <!-- Sidebar -->
        <div class="w-64 h-full">
          <VxvSidebar title="Panel de Administración">
            <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />

            <VxvSidebarGroup title="Gestión de Usuarios">
              <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
              <VxvNavLink to="/roles" label="Roles" />
              <VxvNavLink to="/permissions" label="Permisos" />
            </VxvSidebarGroup>

            <VxvSidebarGroup title="Reportes">
              <VxvNavLink to="/reports/sales" label="Ventas" :icon="ChartIcon" />
              <VxvNavLink to="/reports/traffic" label="Tráfico" />
              <VxvNavLink to="/reports/users" label="Usuarios" />
            </VxvSidebarGroup>

            <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
          </VxvSidebar>
        </div>

        <!-- Main content -->
        <div class="flex-1 p-6 bg-gray-800">
          <h1 class="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p class="text-gray-300">Bienvenido al panel de administración.</p>

          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-white">Usuarios</h3>
              <p class="text-3xl font-bold text-blue-400 mt-2">1,234</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-white">Ventas</h3>
              <p class="text-3xl font-bold text-green-400 mt-2">$5,678</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-white">Tráfico</h3>
              <p class="text-3xl font-bold text-purple-400 mt-2">9,012</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Barra lateral colapsable
 */
export const Collapsible: Story = {
  args: {
    title: 'Panel de Administración',
    collapsible: true,
    defaultCollapsed: false,
    isMobile: false
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      const isCollapsed = ref(args.defaultCollapsed);

      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ChartIcon,
        isCollapsed
      };
    },
    template: `
      <div class="flex h-[600px] w-full bg-gray-900">
        <!-- Sidebar -->
        <div
          class="h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out"
          :class="[isCollapsed ? 'w-16' : 'w-64']"
        >
          <VxvSidebar
            v-bind="args"
            :default-collapsed="isCollapsed"
            @collapse="isCollapsed = true"
            @expand="isCollapsed = false"
          >
            <VxvNavLink
              to="/dashboard"
              label="Dashboard"
              :icon="HomeIcon"
              :is-sidebar-collapsed="isCollapsed"
              :is-mobile="false"
            />

            <VxvSidebarGroup
              title="Gestión de Usuarios"
              :is-sidebar-collapsed="isCollapsed"
              :is-mobile="false"
            >
              <VxvNavLink
                to="/users"
                label="Usuarios"
                :icon="UsersIcon"
                :is-sidebar-collapsed="isCollapsed"
                :is-mobile="false"
              />
              <VxvNavLink
                to="/roles"
                label="Roles"
                :icon="UsersIcon"
                :is-sidebar-collapsed="isCollapsed"
                :is-mobile="false"
              />
            </VxvSidebarGroup>

            <VxvNavLink
              to="/settings"
              label="Configuración"
              :icon="SettingsIcon"
              :is-sidebar-collapsed="isCollapsed"
              :is-mobile="false"
            />
          </VxvSidebar>
        </div>

        <!-- Main content -->
        <div class="flex-1 p-6 bg-gray-800">
          <h1 class="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p class="text-gray-300">Bienvenido al panel de administración.</p>
          <p class="text-gray-300 mt-4">La barra lateral es colapsable. Haga clic en el botón de colapsar para cambiar su estado.</p>
          <p class="text-gray-300 mt-4">Estado actual: <span class="font-bold text-blue-400">{{ isCollapsed ? 'Colapsada' : 'Expandida' }}</span></p>
        </div>
      </div>
    `,
  }),
};

/**
 * Barra lateral móvil
 */
export const Mobile: Story = {
  args: {
    title: 'Panel de Administración',
    collapsible: false,
    isMobile: true
  },
  render: (args) => ({
    components: {
      VxvSidebar,
      VxvSidebarGroup,
      VxvNavLink: NavLinkStub
    },
    setup() {
      const isMobileMenuOpen = ref(false);

      const closeMobileMenu = () => {
        isMobileMenuOpen.value = false;
      };

      const openMobileMenu = () => {
        isMobileMenuOpen.value = true;
      };

      return {
        args,
        HomeIcon,
        UsersIcon,
        SettingsIcon,
        ChartIcon,
        isMobileMenuOpen,
        closeMobileMenu,
        openMobileMenu
      };
    },
    template: `
      <div class="h-[600px] w-full bg-gray-900 relative overflow-hidden">
        <style>
          /* Estilo para el overlay del sidebar móvil */
          .mobile-sidebar-container::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: rgba(17, 24, 39, 0.25); /* bg-gray-900 con opacidad media */
            backdrop-filter: blur(1px); /* Ligero desenfoque para mejorar el contraste */
            pointer-events: none; /* Permite que los clics pasen a través del overlay */
            z-index: 0; /* Asegura que esté detrás del sidebar */
          }
        </style>

        <!-- Main content -->
        <div class="p-6 bg-gray-800 h-full">
          <h1 class="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p class="text-gray-300">Bienvenido al panel de administración.</p>
          <p class="text-gray-300 mt-4">Este es un ejemplo de la barra lateral en modo móvil.</p>
          <p class="text-gray-300 mt-4">La barra lateral se muestra con un overlay semi-translúcido que permite ver el contenido detrás.</p>
          <button
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            @click="openMobileMenu"
          >
            Abrir menú móvil
          </button>
        </div>

        <!-- Mobile sidebar con overlay mejorado -->
        <div
          v-if="isMobileMenuOpen"
          class="absolute inset-0 z-50 mobile-sidebar-container"
          @click="closeMobileMenu"
        >
          <!-- Sidebar container -->
          <div
            class="absolute inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out border-r border-gray-700 z-10"
            @click.stop
          >
            <VxvSidebar
              v-bind="args"
              @close="closeMobileMenu"
            >
              <VxvNavLink
                to="/dashboard"
                label="Dashboard"
                :icon="HomeIcon"
                :is-sidebar-collapsed="false"
                :is-mobile="true"
              />

              <VxvSidebarGroup
                title="Gestión de Usuarios"
                :is-sidebar-collapsed="false"
                :is-mobile="true"
              >
                <VxvNavLink
                  to="/users"
                  label="Usuarios"
                  :icon="UsersIcon"
                  :is-sidebar-collapsed="false"
                  :is-mobile="true"
                />
                <VxvNavLink
                  to="/roles"
                  label="Roles"
                  :icon="UsersIcon"
                  :is-sidebar-collapsed="false"
                  :is-mobile="true"
                />
              </VxvSidebarGroup>

              <VxvNavLink
                to="/settings"
                label="Configuración"
                :icon="SettingsIcon"
                :is-sidebar-collapsed="false"
                :is-mobile="true"
              />
            </VxvSidebar>
          </div>
        </div>
      </div>
    `,
  }),
};
