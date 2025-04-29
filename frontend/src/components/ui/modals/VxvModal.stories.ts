import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvModal from './VxvModal.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvModal es un componente para mostrar contenido en una ventana modal superpuesta.
 * Se utiliza para interacciones que requieren atención del usuario antes de continuar.
 */
const meta: Meta<typeof VxvModal> = {
  title: 'UI/Modals/VxvModal',
  component: VxvModal,
  tags: ['autodocs'],
  argTypes: {
    show: {
      description: 'Controla la visibilidad del modal',
      control: { type: 'boolean' },
    },
    title: {
      description: 'Título del modal',
      control: { type: 'text' },
    },
    color: {
      description: 'Color del borde y la línea decorativa',
      control: { type: 'select' },
      options: ['blue', 'red', 'green', 'yellow', 'gray'],
    },
    closeOnClickOutside: {
      description: 'Permite cerrar el modal al hacer clic fuera de él',
      control: { type: 'boolean' },
    },
    onClose: { action: 'close' },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof VxvModal>;

/**
 * Modal básico
 */
export const Default: Story = {
  args: {
    show: true,
    title: 'Título del Modal',
    color: 'blue',
    closeOnClickOutside: true,
  },
  render: (args) => ({
    components: { VxvModal, VxvButton },
    setup() {
      const showModal = ref(args.show);

      const closeModal = () => {
        showModal.value = false;
        args.onClose();
      };

      return { args, showModal, closeModal };
    },
    template: `
      <div>
        <vxv-button @click="showModal = true">Abrir Modal</vxv-button>

        <vxv-modal
          :show="showModal"
          :title="args.title"
          :color="args.color"
          :close-on-click-outside="args.closeOnClickOutside"
          @close="closeModal"
        >
          <p class="text-white">Este es el contenido del modal. Puedes incluir cualquier tipo de contenido aquí.</p>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <vxv-button variant="secondary" @click="closeModal">Cancelar</vxv-button>
              <vxv-button variant="primary" @click="closeModal">Aceptar</vxv-button>
            </div>
          </template>
        </vxv-modal>
      </div>
    `,
  }),
};

/**
 * Modal de confirmación
 */
export const ConfirmationModal: Story = {
  render: () => ({
    components: { VxvModal, VxvButton },
    setup() {
      const showModal = ref(false);

      const openModal = () => {
        showModal.value = true;
      };

      const closeModal = () => {
        showModal.value = false;
      };

      return { showModal, openModal, closeModal };
    },
    template: `
      <div>
        <vxv-button variant="danger" @click="openModal">Eliminar elemento</vxv-button>

        <vxv-modal
          :show="showModal"
          title="Confirmar eliminación"
          color="red"
          @close="closeModal"
        >
          <p class="text-white">¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.</p>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <vxv-button variant="secondary" @click="closeModal">Cancelar</vxv-button>
              <vxv-button variant="danger" @click="closeModal">Eliminar</vxv-button>
            </div>
          </template>
        </vxv-modal>
      </div>
    `,
  }),
};

/**
 * Modal con formulario
 */
export const FormModal: Story = {
  render: () => ({
    components: { VxvModal, VxvButton },
    setup() {
      const showModal = ref(false);

      const openModal = () => {
        showModal.value = true;
      };

      const closeModal = () => {
        showModal.value = false;
      };

      return { showModal, openModal, closeModal };
    },
    template: `
      <div>
        <vxv-button variant="primary" @click="openModal">Crear nuevo usuario</vxv-button>

        <vxv-modal
          :show="showModal"
          title="Crear usuario"
          color="green"
          @close="closeModal"
        >
          <form @submit.prevent="closeModal" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300">Nombre</label>
              <input type="text" id="name" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
              <input type="email" id="email" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" />
            </div>

            <div>
              <label for="role" class="block text-sm font-medium text-gray-300">Rol</label>
              <select id="role" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white">
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="user">Usuario</option>
              </select>
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <vxv-button type="button" variant="secondary" @click="closeModal">Cancelar</vxv-button>
              <vxv-button @click="closeModal" variant="success">Guardar</vxv-button>
            </div>
          </template>
        </vxv-modal>
      </div>
    `,
  }),
};

/**
 * Modal con diferentes colores
 */
export const ColorVariants: Story = {
  render: () => ({
    components: { VxvModal, VxvButton },
    setup() {
      const activeModal = ref('');

      const openModal = (color) => {
        activeModal.value = color;
      };

      const closeModal = () => {
        activeModal.value = '';
      };

      return { activeModal, openModal, closeModal };
    },
    template: `
      <div class="space-x-2">
        <vxv-button variant="primary" @click="openModal('blue')">Modal Azul</vxv-button>
        <vxv-button variant="danger" @click="openModal('red')">Modal Rojo</vxv-button>
        <vxv-button variant="success" @click="openModal('green')">Modal Verde</vxv-button>
        <vxv-button variant="warning" @click="openModal('yellow')">Modal Amarillo</vxv-button>
        <vxv-button variant="secondary" @click="openModal('gray')">Modal Gris</vxv-button>

        <vxv-modal
          v-for="color in ['blue', 'red', 'green', 'yellow', 'gray']"
          :key="color"
          :show="activeModal === color"
          :title="'Modal ' + color.charAt(0).toUpperCase() + color.slice(1)"
          :color="color"
          @close="closeModal"
        >
          <p class="text-white">Este es un modal con el color {{ color }}.</p>

          <template #footer>
            <div class="flex justify-end">
              <vxv-button @click="closeModal">Cerrar</vxv-button>
            </div>
          </template>
        </vxv-modal>
      </div>
    `,
  }),
};

/**
 * Modal sin cerrar al hacer clic fuera
 */
export const NoCloseOnClickOutside: Story = {
  render: () => ({
    components: { VxvModal, VxvButton },
    setup() {
      const showModal = ref(false);

      const openModal = () => {
        showModal.value = true;
      };

      const closeModal = () => {
        showModal.value = false;
      };

      return { showModal, openModal, closeModal };
    },
    template: `
      <div>
        <vxv-button variant="warning" @click="openModal">Abrir Modal Persistente</vxv-button>

        <vxv-modal
          :show="showModal"
          title="Modal Persistente"
          color="yellow"
          :close-on-click-outside="false"
          @close="closeModal"
        >
          <p class="text-white">Este modal no se cerrará al hacer clic fuera de él. Debes usar el botón de cerrar.</p>

          <template #footer>
            <div class="flex justify-end">
              <vxv-button variant="primary" @click="closeModal">Cerrar</vxv-button>
            </div>
          </template>
        </vxv-modal>
      </div>
    `,
  }),
};
