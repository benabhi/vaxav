import type { Meta, StoryObj } from '@storybook/vue3';
import { provide } from 'vue';
import VxvPageTitle from './VxvPageTitle.vue';
import VxvBreadcrumb from '../navigation/VxvBreadcrumb.vue';
import VxvNavLink from '../navigation/VxvNavLink.vue';

/**
 * VxvPageTitle es un componente que muestra el título de la página y opcionalmente breadcrumbs y menús de navegación.
 * También puede mostrar un botón de menú móvil en pantallas pequeñas.
 *
 * El componente está diseñado para adaptarse a diferentes contextos:
 * - Sin breadcrumbs ni menús: Muestra solo el título y el botón de menú móvil en una sola fila
 * - Con breadcrumbs: Muestra el título y el botón en la primera fila, y los breadcrumbs en una segunda fila
 * - Con menús: Muestra el título y los menús de navegación en la misma fila, y el botón de menú móvil en pantallas pequeñas
 * - Con breadcrumbs y menús: Muestra el título, los menús y el botón en la primera fila, y los breadcrumbs en una segunda fila
 */
const meta: Meta<typeof VxvPageTitle> = {
  title: 'UI/Layout/VxvPageTitle',
  component: VxvPageTitle,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título de la página',
      control: { type: 'text' },
    },
    showMobileMenuButton: {
      description: 'Muestra el botón de menú móvil en pantallas pequeñas',
      control: { type: 'boolean' },
    },
    onMobileMenuClick: { action: 'mobile-menu-click' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvPageTitle>;

/**
 * Título de página básico
 */
export const Default: Story = {
  args: {
    title: 'Dashboard',
    showMobileMenuButton: true,
  },
  render: (args) => ({
    components: { VxvPageTitle },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
          @mobile-menu-click="args.onMobileMenuClick"
        />
      </div>
    `,
  }),
};

/**
 * Título de página sin botón de menú móvil
 */
export const WithoutMobileMenu: Story = {
  args: {
    title: 'Configuración',
    showMobileMenuButton: false,
  },
  render: (args) => ({
    components: { VxvPageTitle },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
        />
      </div>
    `,
  }),
};

/**
 * Título de página con breadcrumbs
 */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'Detalles de Usuario',
    showMobileMenuButton: true,
  },
  render: (args) => ({
    components: { VxvPageTitle, VxvBreadcrumb },
    setup() {
      const breadcrumbItems = [
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Usuarios', to: '/dashboard/users' },
        { text: 'Detalles de Usuario' },
      ];

      return { args, breadcrumbItems };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
          @mobile-menu-click="args.onMobileMenuClick"
        >
          <template #breadcrumbs>
            <VxvBreadcrumb :items="breadcrumbItems" />
          </template>
        </VxvPageTitle>
      </div>
    `,
  }),
};

/**
 * Título de página con título largo
 */
export const WithLongTitle: Story = {
  args: {
    title: 'Configuración Avanzada del Sistema de Administración de Usuarios y Permisos',
    showMobileMenuButton: true,
  },
  render: (args) => ({
    components: { VxvPageTitle },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
          @mobile-menu-click="args.onMobileMenuClick"
        />
      </div>
    `,
  }),
};

/**
 * Título de página con menús de navegación
 */
export const WithMenu: Story = {
  args: {
    title: 'Piloto',
    showMobileMenuButton: true,
  },
  render: (args) => ({
    components: { VxvPageTitle, VxvNavLink },
    setup() {
      const menuItems = [
        { to: '/', label: 'Vista General', exact: true, active: true },
        { to: '/skills', label: 'Habilidades', active: false }
      ];

      return { args, menuItems };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
          @mobile-menu-click="args.onMobileMenuClick"
        >
          <template #menu>
            <VxvNavLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :active="item.active"
              :current-path="'/'"
              simple
              horizontal
            />
          </template>
        </VxvPageTitle>
      </div>
    `,
  }),
};

/**
 * Título de página con breadcrumbs y menús
 */
export const WithBreadcrumbsAndMenu: Story = {
  args: {
    title: 'Universo',
    showMobileMenuButton: true,
  },
  render: (args) => ({
    components: { VxvPageTitle, VxvBreadcrumb, VxvNavLink },
    setup() {
      const breadcrumbItems = [
        { text: 'Inicio', to: '/' },
        { text: 'Universo' }
      ];

      const menuItems = [
        { to: '/universe', label: 'Galaxia', exact: true, active: true },
        { to: '/universe/solar-system', label: 'Sistema Solar', active: false }
      ];

      return { args, breadcrumbItems, menuItems };
    },
    template: `
      <div class="bg-gray-900">
        <VxvPageTitle
          v-bind="args"
          @mobile-menu-click="args.onMobileMenuClick"
        >
          <template #breadcrumbs>
            <VxvBreadcrumb :items="breadcrumbItems" />
          </template>
          <template #menu>
            <VxvNavLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :active="item.active"
              :current-path="'/universe'"
              simple
              horizontal
            />
          </template>
        </VxvPageTitle>
      </div>
    `,
  }),
};

/**
 * Título de página en un layout de aplicación completo
 */
export const InAppLayout: Story = {
  render: () => ({
    components: { VxvPageTitle, VxvBreadcrumb, VxvNavLink },
    setup() {
      const breadcrumbItems = [
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Usuarios', to: '/dashboard/users' },
        { text: 'Detalles de Usuario' },
      ];

      const menuItems = [
        { to: '/dashboard/users/1/profile', label: 'Perfil', exact: true, active: true },
        { to: '/dashboard/users/1/security', label: 'Seguridad', active: false },
        { to: '/dashboard/users/1/permissions', label: 'Permisos', active: false }
      ];

      return { breadcrumbItems, menuItems };
    },
    template: `
      <div class="flex flex-col h-[600px] bg-gray-900">
        <!-- Header -->
        <VxvPageTitle
          title="Detalles de Usuario"
          @mobile-menu-click="() => {}"
        >
          <template #breadcrumbs>
            <VxvBreadcrumb :items="breadcrumbItems" />
          </template>
          <template #menu>
            <VxvNavLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :label="item.label"
              :exact="item.exact"
              :active="item.active"
              :current-path="'/dashboard/users/1/profile'"
              simple
              horizontal
            />
          </template>
        </VxvPageTitle>

        <!-- Main content -->
        <div class="flex-1 p-6 bg-gray-800">
          <div class="bg-gray-700 p-6 rounded-lg">
            <h2 class="text-xl font-semibold text-white mb-4">Información del Usuario</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-400">Nombre</h3>
                <p class="text-white">Juan Pérez</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-400">Correo electrónico</h3>
                <p class="text-white">juan@ejemplo.com</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-400">Rol</h3>
                <p class="text-white">Administrador</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-400">Estado</h3>
                <p class="text-white">Activo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
