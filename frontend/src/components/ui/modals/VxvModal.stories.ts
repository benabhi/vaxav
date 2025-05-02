import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvModal from './VxvModal.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvModal es un componente para mostrar contenido en una ventana modal superpuesta.
 * Se utiliza para interacciones que requieren atención del usuario antes de continuar.
 *
 * Características:
 * - Overlay translúcido con blur que permite ver el contenido detrás
 * - Diseño centrado en la pantalla
 * - Colores personalizables para el borde y elementos decorativos
 * - Opción para cerrar al hacer clic fuera o solo mediante botones
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
      <div class="min-h-[500px] flex flex-col">
        <vxv-button @click="showModal = true" class="mb-4">Abrir Modal</vxv-button>

        <div class="flex-grow"></div>

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
      <div class="min-h-[500px] flex flex-col">
        <vxv-button variant="danger" @click="openModal" class="mb-4">Eliminar elemento</vxv-button>

        <div class="flex-grow"></div>

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
      <div class="min-h-[500px] flex flex-col">
        <vxv-button variant="primary" @click="openModal" class="mb-4">Crear nuevo usuario</vxv-button>

        <div class="flex-grow"></div>

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
      <div class="min-h-[500px] flex flex-col">
        <div class="space-x-2 mb-4">
          <vxv-button variant="primary" @click="openModal('blue')">Modal Azul</vxv-button>
          <vxv-button variant="danger" @click="openModal('red')">Modal Rojo</vxv-button>
          <vxv-button variant="success" @click="openModal('green')">Modal Verde</vxv-button>
          <vxv-button variant="warning" @click="openModal('yellow')">Modal Amarillo</vxv-button>
          <vxv-button variant="secondary" @click="openModal('gray')">Modal Gris</vxv-button>
        </div>

        <div class="flex-grow"></div>

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
 * Modal con overlay opaco y efecto blur
 */
export const WithBlurredOverlay: Story = {
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
      <div class="p-8 min-h-[600px] flex flex-col bg-gray-800" style="background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px); background-size: 20px 20px;">
        <div class="mb-4">
          <h3 class="text-xl font-bold text-white mb-2">Contenido detrás del modal</h3>
          <p class="text-gray-300 mb-2">Este contenido será visible a través del overlay translúcido con blur.</p>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="bg-blue-500 h-20 rounded-md flex items-center justify-center text-white font-bold">Elemento 1</div>
            <div class="bg-green-500 h-20 rounded-md flex items-center justify-center text-white font-bold">Elemento 2</div>
            <div class="bg-purple-500 h-20 rounded-md flex items-center justify-center text-white font-bold">Elemento 3</div>
          </div>

          <div class="flex space-x-4 mb-4">
            <div class="w-1/2 bg-gray-700 p-4 rounded-md">
              <h4 class="text-lg font-bold text-white mb-2">Panel de información</h4>
              <p class="text-gray-300">Este contenido será visible a través del overlay con blur, demostrando cómo el usuario puede mantener el contexto de la página.</p>
            </div>
            <div class="w-1/2 bg-gray-700 p-4 rounded-md">
              <h4 class="text-lg font-bold text-white mb-2">Estadísticas</h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-blue-900/50 p-2 rounded">
                  <div class="text-2xl font-bold text-white">128</div>
                  <div class="text-xs text-gray-300">Usuarios</div>
                </div>
                <div class="bg-green-900/50 p-2 rounded">
                  <div class="text-2xl font-bold text-white">85%</div>
                  <div class="text-xs text-gray-300">Completado</div>
                </div>
                <div class="bg-yellow-900/50 p-2 rounded">
                  <div class="text-2xl font-bold text-white">42</div>
                  <div class="text-xs text-gray-300">Pendientes</div>
                </div>
                <div class="bg-red-900/50 p-2 rounded">
                  <div class="text-2xl font-bold text-white">7</div>
                  <div class="text-xs text-gray-300">Errores</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <vxv-button variant="primary" @click="openModal" class="mb-4">Abrir Modal con Overlay Blur</vxv-button>

        <div class="flex-grow"></div>

        <vxv-modal
          :show="showModal"
          title="Modal con Overlay Blur"
          color="blue"
          @close="closeModal"
        >
          <p class="text-white mb-4">
            Este modal tiene un overlay con alta opacidad y efecto de blur que reduce la visibilidad del contenido detrás.
            Este diseño mejora el contraste visual y ayuda al usuario a enfocarse en el contenido del modal.
          </p>

          <p class="text-gray-300 mb-4">
            El efecto se implementa usando un pseudo-elemento <code class="bg-gray-700 px-1 py-0.5 rounded">::before</code> con
            <code class="bg-gray-700 px-1 py-0.5 rounded">backdrop-filter: blur(3px)</code> y un fondo con opacidad alta
            <code class="bg-gray-700 px-1 py-0.5 rounded">rgba(17, 24, 39, 0.75)</code> para reducir las distracciones.
          </p>

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
      <div class="min-h-[500px] flex flex-col">
        <vxv-button variant="warning" @click="openModal" class="mb-4">Abrir Modal Persistente</vxv-button>

        <div class="flex-grow"></div>

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
