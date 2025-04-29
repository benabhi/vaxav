import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvDropdown from './VxvDropdown.vue';
import VxvDropdownItem from './VxvDropdownItem.vue';
import VxvButton from '../buttons/VxvButton.vue';

// Icons
import {
  UserIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

const meta = {
  title: 'UI/Navigation/VxvDropdown',
  component: VxvDropdown,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right'],
    },
    triggerClass: { control: 'text' },
    menuClass: { control: 'text' },
    closeOnClickOutside: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
  },
} satisfies Meta<typeof VxvDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Dropdown básico con botón como trigger
 */
export const Default: Story = {
  args: {
    position: 'bottom-right',
    closeOnClickOutside: true,
    closeOnEsc: true,
  },
  render: (args) => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      VxvButton,
      ChevronDownIcon
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-16 flex justify-center bg-gray-900">
        <VxvDropdown v-bind="args">
          <template #trigger>
            <VxvButton>
              Opciones
              <template #icon-right>
                <ChevronDownIcon class="h-5 w-5" />
              </template>
            </VxvButton>
          </template>

          <VxvDropdownItem label="Opción 1" />
          <VxvDropdownItem label="Opción 2" />
          <VxvDropdownItem label="Opción 3" />
        </VxvDropdown>
      </div>
    `,
  }),
};

/**
 * Dropdown con iconos
 */
export const WithIcons: Story = {
  args: {
    position: 'bottom-right',
    closeOnClickOutside: true,
    closeOnEsc: true,
  },
  render: (args) => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      VxvButton,
      ChevronDownIcon,
      UserIcon,
      SettingsIcon,
      LogoutIcon
    },
    setup() {
      return {
        args,
        UserIcon,
        SettingsIcon,
        LogoutIcon
      };
    },
    template: `
      <div class="p-16 flex justify-center bg-gray-900">
        <VxvDropdown v-bind="args">
          <template #trigger>
            <VxvButton>
              Usuario
              <template #icon-right>
                <ChevronDownIcon class="h-5 w-5" />
              </template>
            </VxvButton>
          </template>

          <VxvDropdownItem label="Perfil" :icon="UserIcon" />
          <VxvDropdownItem label="Configuración" :icon="SettingsIcon" />
          <VxvDropdownItem label="Cerrar Sesión" :icon="LogoutIcon" />
        </VxvDropdown>
      </div>
    `,
  }),
};

/**
 * Dropdown con diferentes posiciones
 */
export const Positions: Story = {
  render: () => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      VxvButton,
    },
    setup() {
      return {};
    },
    template: `
      <div class="p-16 grid grid-cols-3 gap-8 bg-gray-900">
        <div class="flex justify-center items-center">
          <VxvDropdown position="top-left">
            <template #trigger>
              <VxvButton>Top Left</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>

        <div class="flex justify-center items-center">
          <VxvDropdown position="top-right">
            <template #trigger>
              <VxvButton>Top Right</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>

        <div class="flex justify-center items-center">
          <VxvDropdown position="left">
            <template #trigger>
              <VxvButton>Left</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>

        <div class="flex justify-center items-center">
          <VxvDropdown position="bottom-left">
            <template #trigger>
              <VxvButton>Bottom Left</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>

        <div class="flex justify-center items-center">
          <VxvDropdown position="bottom-right">
            <template #trigger>
              <VxvButton>Bottom Right</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>

        <div class="flex justify-center items-center">
          <VxvDropdown position="right">
            <template #trigger>
              <VxvButton>Right</VxvButton>
            </template>
            <VxvDropdownItem label="Opción 1" />
            <VxvDropdownItem label="Opción 2" />
          </VxvDropdown>
        </div>
      </div>
    `,
  }),
};

/**
 * Dropdown con texto como trigger
 */
export const TextTrigger: Story = {
  args: {
    position: 'bottom-right',
    triggerClass: 'text-blue-400 hover:text-blue-300 flex items-center',
  },
  render: (args) => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      ChevronDownIcon
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-16 flex justify-center bg-gray-900">
        <VxvDropdown v-bind="args">
          <template #trigger>
            <span>Usuario</span>
            <ChevronDownIcon class="ml-1 h-4 w-4" />
          </template>

          <VxvDropdownItem label="Perfil" />
          <VxvDropdownItem label="Cerrar Sesión" />
        </VxvDropdown>
      </div>
    `,
  }),
};

/**
 * Dropdown con elementos deshabilitados
 */
export const DisabledItems: Story = {
  args: {
    position: 'bottom-right',
  },
  render: (args) => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      VxvButton,
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-16 flex justify-center bg-gray-900">
        <VxvDropdown v-bind="args">
          <template #trigger>
            <VxvButton>Opciones</VxvButton>
          </template>

          <VxvDropdownItem label="Opción 1" />
          <VxvDropdownItem label="Opción 2 (Deshabilitada)" :disabled="true" />
          <VxvDropdownItem label="Opción 3" />
        </VxvDropdown>
      </div>
    `,
  }),
};

/**
 * Dropdown con eventos
 */
export const WithEvents: Story = {
  args: {
    position: 'bottom-right',
  },
  render: (args) => ({
    components: {
      VxvDropdown,
      VxvDropdownItem,
      VxvButton,
    },
    setup() {
      const message = ref('Haz clic en una opción');

      const handleClick = (option: string) => {
        message.value = `Seleccionaste: ${option}`;
      };

      return {
        args,
        message,
        handleClick
      };
    },
    template: `
      <div class="p-16 flex flex-col items-center bg-gray-900">
        <VxvDropdown v-bind="args">
          <template #trigger>
            <VxvButton>Opciones</VxvButton>
          </template>

          <VxvDropdownItem @click="handleClick('Opción 1')">Opción 1</VxvDropdownItem>
          <VxvDropdownItem @click="handleClick('Opción 2')">Opción 2</VxvDropdownItem>
          <VxvDropdownItem @click="handleClick('Opción 3')">Opción 3</VxvDropdownItem>
        </VxvDropdown>

        <div class="mt-8 text-white">{{ message }}</div>
      </div>
    `,
  }),
};
