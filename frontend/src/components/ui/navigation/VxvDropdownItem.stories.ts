import type { Meta, StoryObj } from '@storybook/vue3';
import VxvDropdownItem from './VxvDropdownItem.vue';
import { UserIcon, CogIcon, ArrowRightOnRectangleIcon as LogoutIcon } from '@heroicons/vue/24/outline';

const meta = {
  title: 'UI/Navigation/VxvDropdownItem',
  component: VxvDropdownItem,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    to: { control: 'text' },
    href: { control: 'text' },
    disabled: { control: 'boolean' },
    className: { control: 'text' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4 bg-gray-800 w-64"><story /></div>'
    }),
  ],
} satisfies Meta<typeof VxvDropdownItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Elemento básico del dropdown
 */
export const Default: Story = {
  args: {
    label: 'Elemento del menú',
  },
};

/**
 * Elemento con icono
 */
export const WithIcon: Story = {
  args: {
    label: 'Perfil de usuario',
    icon: UserIcon,
  },
};

/**
 * Elemento deshabilitado
 */
export const Disabled: Story = {
  args: {
    label: 'Opción deshabilitada',
    disabled: true,
  },
};

/**
 * Elemento con enlace
 */
export const WithLink: Story = {
  args: {
    label: 'Ir a configuración',
    to: '/settings',
    icon: CogIcon,
  },
};

/**
 * Elemento con enlace externo
 */
export const WithExternalLink: Story = {
  args: {
    label: 'Documentación',
    href: 'https://example.com',
    className: 'text-blue-400',
  },
};

/**
 * Múltiples elementos
 */
export const MultipleItems: Story = {
  render: () => ({
    components: {
      VxvDropdownItem,
      UserIcon,
      CogIcon,
      LogoutIcon,
    },
    setup() {
      return {
        UserIcon,
        CogIcon,
        LogoutIcon,
      };
    },
    template: `
      <div>
        <VxvDropdownItem label="Perfil" :icon="UserIcon" />
        <VxvDropdownItem label="Configuración" :icon="CogIcon" />
        <VxvDropdownItem label="Cerrar sesión" :icon="LogoutIcon" />
      </div>
    `,
  }),
};
