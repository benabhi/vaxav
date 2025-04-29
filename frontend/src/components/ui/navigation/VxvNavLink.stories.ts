import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvNavLink from './VxvNavLink.vue';

/**
 * VxvNavLink es un componente para enlaces de navegación estilizados.
 * Se utiliza principalmente en barras de navegación y menús laterales.
 *
 * Nota: Este componente requiere Vue Router para funcionar correctamente.
 * En Storybook, se muestra una versión simplificada.
 */
const meta: Meta<typeof VxvNavLink> = {
  title: 'UI/Navigation/VxvNavLink',
  component: VxvNavLink,
  tags: ['autodocs'],
  argTypes: {
    to: {
      description: 'Ruta de destino del enlace',
      control: { type: 'text' },
    },
    label: {
      description: 'Texto del enlace',
      control: { type: 'text' },
    },
    icon: {
      description: 'Componente de icono',
      control: { type: 'object' },
    },
    exact: {
      description: 'Si es true, la ruta debe coincidir exactamente para considerarse activa',
      control: { type: 'boolean' },
    },
    horizontal: {
      description: 'Si es true, el enlace se muestra horizontalmente (para barras de navegación)',
      control: { type: 'boolean' },
    },
    activeClass: {
      description: 'Clases CSS para el estado activo',
      control: { type: 'text' },
    },
    inactiveClass: {
      description: 'Clases CSS para el estado inactivo',
      control: { type: 'text' },
    },
    activeIconClass: {
      description: 'Clases CSS para el icono en estado activo',
      control: { type: 'text' },
    },
    inactiveIconClass: {
      description: 'Clases CSS para el icono en estado inactivo',
      control: { type: 'text' },
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
Este componente requiere Vue Router para funcionar correctamente.
En Storybook, se muestra una versión simplificada.

\`\`\`vue
<template>
  <VxvNavLink
    to="/dashboard"
    label="Dashboard"
    :icon="DashboardIcon"
  />
</template>

<script setup>
import { DashboardIcon } from '@heroicons/vue/outline';
</script>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvNavLink>;

// Icono de ejemplo
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

/**
 * Nota: Este componente requiere Vue Router para funcionar correctamente.
 * En Storybook, se muestra una versión simplificada que no incluye la funcionalidad
 * de detección de ruta activa.
 */
export const Default: Story = {
  args: {
    to: '/dashboard',
    label: 'Dashboard',
    icon: null,
    exact: false,
    horizontal: false,
    activeClass: 'bg-gray-700 text-blue-400',
    inactiveClass: 'text-gray-300 hover:text-white',
    activeIconClass: 'text-blue-400',
    inactiveIconClass: 'text-gray-400',
    className: '',
  },
  render: (args) => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              inactiveClass,
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="inactiveIconClass"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-800 p-4 w-64">
        <VxvNavLink v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Enlace de navegación con icono
 */
export const WithIcon: Story = {
  args: {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    exact: false,
    horizontal: false,
    activeClass: 'bg-gray-700 text-blue-400',
    inactiveClass: 'text-gray-300 hover:text-white',
    activeIconClass: 'text-blue-400',
    inactiveIconClass: 'text-gray-400',
    className: '',
  },
  render: (args) => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              inactiveClass,
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="inactiveIconClass"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-800 p-4 w-64">
        <VxvNavLink v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Enlace de navegación activo (simulado)
 */
export const Active: Story = {
  args: {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    exact: false,
    horizontal: false,
    activeClass: 'bg-gray-700 text-blue-400',
    inactiveClass: 'text-gray-300 hover:text-white',
    activeIconClass: 'text-blue-400',
    inactiveIconClass: 'text-gray-400',
    className: '',
  },
  render: (args) => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              activeClass, // Simulamos que está activo
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="activeIconClass" // Simulamos que está activo
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-800 p-4 w-64">
        <VxvNavLink v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Enlace de navegación horizontal
 */
export const Horizontal: Story = {
  args: {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    exact: false,
    horizontal: true,
    activeClass: 'bg-gray-700 text-blue-400',
    inactiveClass: 'text-gray-300 hover:text-white',
    activeIconClass: 'text-blue-400',
    inactiveIconClass: 'text-gray-400',
    className: '',
  },
  render: (args) => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              inactiveClass,
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="inactiveIconClass"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-800 p-4">
        <VxvNavLink v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Múltiples enlaces de navegación
 */
export const MultipleLinks: Story = {
  render: () => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              to === '/dashboard' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:text-white',
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="to === '/dashboard' ? 'text-blue-400' : 'text-gray-400'"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return {
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="bg-gray-800 p-4 w-64">
        <div class="space-y-1">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" />
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" />
          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" />
        </div>
      </div>
    `,
  }),
};

/**
 * Barra de navegación horizontal
 */
export const HorizontalNavbar: Story = {
  render: () => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              to === '/dashboard' ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:text-white',
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="to === '/dashboard' ? 'text-blue-400' : 'text-gray-400'"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return {
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="bg-gray-800 p-4">
        <div class="flex space-x-2">
          <VxvNavLink to="/dashboard" label="Dashboard" :icon="HomeIcon" horizontal />
          <VxvNavLink to="/users" label="Usuarios" :icon="UsersIcon" horizontal />
          <VxvNavLink to="/settings" label="Configuración" :icon="SettingsIcon" horizontal />
        </div>
      </div>
    `,
  }),
};

/**
 * Estilos personalizados
 */
export const CustomStyles: Story = {
  render: () => ({
    components: {
      VxvNavLink: {
        props: ['to', 'label', 'icon', 'horizontal', 'activeClass', 'inactiveClass', 'activeIconClass', 'inactiveIconClass', 'className'],
        template: `
          <a
            :href="to"
            :class="[
              to === '/dashboard' ? activeClass : inactiveClass,
              'block px-4 py-2 text-base font-medium rounded-md transition-all duration-150 hover:bg-gray-700',
              horizontal ? 'inline-flex items-center h-[38px] py-0 leading-[38px]' : '',
              className
            ]"
          >
            <div class="flex items-center">
              <component
                v-if="icon"
                :is="icon"
                class="mr-2 h-5 w-5"
                :class="to === '/dashboard' ? activeIconClass : inactiveIconClass"
              />
              <span>{{ label }}</span>
            </div>
          </a>
        `
      }
    },
    setup() {
      return {
        HomeIcon,
        UsersIcon,
        SettingsIcon
      };
    },
    template: `
      <div class="bg-gray-800 p-4 w-64">
        <div class="space-y-4">
          <VxvNavLink
            to="/dashboard"
            label="Dashboard"
            :icon="HomeIcon"
            activeClass="bg-blue-600 text-white"
            inactiveClass="text-gray-300 hover:bg-blue-500 hover:text-white"
            activeIconClass="text-white"
          />

          <VxvNavLink
            to="/users"
            label="Usuarios"
            :icon="UsersIcon"
            activeClass="bg-green-600 text-white"
            inactiveClass="text-gray-300 hover:bg-green-500 hover:text-white"
            activeIconClass="text-white"
          />

          <VxvNavLink
            to="/settings"
            label="Configuración"
            :icon="SettingsIcon"
            activeClass="bg-purple-600 text-white"
            inactiveClass="text-gray-300 hover:bg-purple-500 hover:text-white"
            activeIconClass="text-white"
          />
        </div>
      </div>
    `,
  }),
};
