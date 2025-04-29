import type { Meta, StoryObj } from '@storybook/vue3';
import VxvLogo from './VxvLogo.vue';

// Componente simplificado para Storybook que no depende de Vue Router
const VxvLogoStub = {
  props: ['to', 'size'],
  setup(props) {
    const sizeClasses = {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl'
    };

    // Inyectar los estilos CSS en el DOM
    if (typeof document !== 'undefined' && !document.getElementById('vxv-logo-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'vxv-logo-styles';
      styleEl.textContent = `
        @keyframes neonPulse {
          0% {
            text-shadow:
              0 0 5px rgba(59, 130, 246, 0.5),
              0 0 10px rgba(59, 130, 246, 0.5),
              0 0 15px rgba(59, 130, 246, 0.5);
          }
          50% {
            text-shadow:
              0 0 5px rgba(59, 130, 246, 0.6),
              0 0 10px rgba(59, 130, 246, 0.6),
              0 0 15px rgba(59, 130, 246, 0.6),
              0 0 20px rgba(59, 130, 246, 0.4);
          }
          100% {
            text-shadow:
              0 0 5px rgba(59, 130, 246, 0.5),
              0 0 10px rgba(59, 130, 246, 0.5),
              0 0 15px rgba(59, 130, 246, 0.5);
          }
        }

        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            color: #60a5fa;
            text-shadow:
              0 0 5px rgba(96, 165, 250, 0.8),
              0 0 10px rgba(96, 165, 250, 0.8),
              0 0 15px rgba(96, 165, 250, 0.8),
              0 0 20px rgba(96, 165, 250, 0.8),
              0 0 30px rgba(96, 165, 250, 0.6),
              0 0 40px rgba(96, 165, 250, 0.4);
          }
          20%, 24%, 55% {
            color: #1e40af;
            text-shadow: none;
          }
        }

        .neon-logo {
          color: #3b82f6; /* Azul base (blue-500) */
          text-shadow:
            0 0 5px rgba(59, 130, 246, 0.5),
            0 0 10px rgba(59, 130, 246, 0.5),
            0 0 15px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
          letter-spacing: 2px;
          font-family: 'Orbitron', 'Rajdhani', 'Audiowide', sans-serif;
          animation: neonPulse 2s infinite;
          -webkit-text-stroke: 0.5px rgba(96, 165, 250, 0.5);
        }

        .neon-logo:hover {
          color: #60a5fa; /* Azul más claro (blue-400) */
          text-shadow:
            0 0 5px rgba(96, 165, 250, 0.8),
            0 0 10px rgba(96, 165, 250, 0.8),
            0 0 15px rgba(96, 165, 250, 0.8),
            0 0 20px rgba(96, 165, 250, 0.8),
            0 0 30px rgba(96, 165, 250, 0.6),
            0 0 40px rgba(96, 165, 250, 0.4);
          transform: scale(1.05);
          animation: neonFlicker 1.5s forwards;
          -webkit-text-stroke: 1px rgba(96, 165, 250, 0.8);
        }
      `;
      document.head.appendChild(styleEl);
    }

    return { sizeClasses };
  },
  template: `
    <a :href="to" class="block">
      <h1
        :class="[
          'font-bold neon-logo',
          sizeClasses[size]
        ]"
      >
        VAXAV
      </h1>
    </a>
  `
};

/**
 * VxvLogo es un componente que muestra el logo de VAXAV con un efecto neón.
 * El logo es un enlace que lleva al home por defecto.
 *
 * Nota: En Storybook, se utiliza una versión simplificada del componente que no depende de Vue Router,
 * pero mantiene el mismo aspecto visual y efectos de animación.
 */
const meta: Meta<typeof VxvLogo> = {
  title: 'UI/Branding/VxvLogo',
  component: VxvLogo,
  tags: ['autodocs'],
  argTypes: {
    to: {
      description: 'Ruta de destino para el enlace del logo',
      control: { type: 'text' },
    },
    size: {
      description: 'Tamaño del logo',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1f2937' }, // bg-gray-800
        { name: 'darker', value: '#111827' }, // bg-gray-900
        { name: 'light', value: '#f9fafb' }, // bg-gray-50
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvLogo>;

/**
 * Logo básico con tamaño mediano
 */
export const Default: Story = {
  args: {
    to: '/',
    size: 'md',
  },
  render: (args) => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-8 bg-gray-800">
        <VxvLogo v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Logo pequeño
 */
export const Small: Story = {
  args: {
    to: '/',
    size: 'sm',
  },
  render: (args) => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-8 bg-gray-800">
        <VxvLogo v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Logo grande
 */
export const Large: Story = {
  args: {
    to: '/',
    size: 'lg',
  },
  render: (args) => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-8 bg-gray-800">
        <VxvLogo v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Logo extra grande
 */
export const ExtraLarge: Story = {
  args: {
    to: '/',
    size: 'xl',
  },
  render: (args) => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    setup() {
      return { args };
    },
    template: `
      <div class="p-8 bg-gray-800">
        <VxvLogo v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Logo en un header
 */
export const InHeader: Story = {
  render: () => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    template: `
      <header class="bg-gray-800 shadow-md border-b border-gray-700">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
          <div class="flex items-center">
            <VxvLogo size="md" />
            <nav class="ml-8 hidden md:block">
              <ul class="flex space-x-6">
                <li>
                  <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Universo</a>
                </li>
                <li>
                  <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Mercado</a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-300">
              <span class="mr-2">Usuario</span>
              <span class="text-blue-400">1,000 ISK</span>
            </div>
            <button class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
    `,
  }),
};

/**
 * Logo en un footer
 */
export const InFooter: Story = {
  render: () => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    template: `
      <footer class="bg-gray-900 py-8">
        <div class="container mx-auto text-center">
          <VxvLogo size="lg" />
          <p class="mt-4 text-gray-400">© 2023 VAXAV. Todos los derechos reservados.</p>
        </div>
      </footer>
    `,
  }),
};

/**
 * Logo con diferentes fondos
 */
export const WithDifferentBackgrounds: Story = {
  render: () => ({
    components: {
      VxvLogo: VxvLogoStub
    },
    template: `
      <div class="space-y-8">
        <div class="p-8 bg-gray-900">
          <h3 class="text-white mb-4">Fondo oscuro (bg-gray-900)</h3>
          <VxvLogo size="md" />
        </div>

        <div class="p-8 bg-gray-800">
          <h3 class="text-white mb-4">Fondo medio (bg-gray-800)</h3>
          <VxvLogo size="md" />
        </div>

        <div class="p-8 bg-gray-700">
          <h3 class="text-white mb-4">Fondo claro (bg-gray-700)</h3>
          <VxvLogo size="md" />
        </div>
      </div>
    `,
  }),
};
