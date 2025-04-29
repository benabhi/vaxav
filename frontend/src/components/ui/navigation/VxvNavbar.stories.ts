import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvNavbar from './VxvNavbar.vue';
import VxvButton from '../buttons/VxvButton.vue';
import { HomeIcon, ShoppingCartIcon, UserIcon, CogIcon } from '@heroicons/vue/24/outline';

// Componente simplificado para Storybook que no depende de Vue Router
const VxvNavLinkStub = {
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
};

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
 * VxvNavbar es una barra de navegación flexible y personalizable que se utiliza para mostrar
 * el logo de la aplicación, enlaces de navegación y acciones como botones de inicio de sesión
 * o información del usuario.
 */
const meta: Meta<typeof VxvNavbar> = {
  title: 'UI/Navigation/VxvNavbar',
  component: VxvNavbar,
  tags: ['autodocs'],
  argTypes: {
    sticky: {
      description: 'Si la barra de navegación debe permanecer fija en la parte superior',
      control: { type: 'boolean' },
    },
    transparent: {
      description: 'Si la barra de navegación debe tener un fondo semi-transparente',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Clases CSS adicionales',
      control: { type: 'text' },
    },
    logoSize: {
      description: 'Tamaño del logo',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    logoLink: {
      description: 'Ruta de destino para el enlace del logo',
      control: { type: 'text' },
    },
    links: {
      description: 'Array de objetos con la configuración de los enlaces',
      control: { type: 'object' },
    },
    activeClass: {
      description: 'Clases CSS para enlaces activos',
      control: { type: 'text' },
    },
    inactiveClass: {
      description: 'Clases CSS para enlaces inactivos',
      control: { type: 'text' },
    },
    activeIconClass: {
      description: 'Clases CSS para iconos de enlaces activos',
      control: { type: 'text' },
    },
    inactiveIconClass: {
      description: 'Clases CSS para iconos de enlaces inactivos',
      control: { type: 'text' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof VxvNavbar>;

/**
 * Barra de navegación básica
 */
export const Default: Story = {
  args: {
    sticky: true,
    transparent: false,
    logoSize: 'md',
    logoLink: '/',
    links: [
      { to: '/', label: 'Inicio', exact: true },
      { to: '/features', label: 'Características' },
      { to: '/pricing', label: 'Precios' },
      { to: '/contact', label: 'Contacto' }
    ],
    activeClass: 'bg-gray-700 text-blue-400',
    inactiveClass: 'text-gray-300 hover:text-white',
    activeIconClass: 'text-blue-400',
    inactiveIconClass: 'text-gray-400',
  },
  render: (args) => ({
    components: { 
      VxvNavbar: {
        props: Object.keys(args),
        components: {
          VxvLogoStub,
          VxvNavLinkStub
        },
        template: `
          <nav :class="[
            'bg-gray-800 shadow-md border-b border-gray-700',
            sticky ? 'sticky top-0 z-50' : '',
            transparent ? 'bg-opacity-80 backdrop-blur-sm' : '',
            className
          ]">
            <div class="container mx-auto px-4 py-3 flex justify-between items-center">
              <!-- Logo y enlaces de navegación -->
              <div class="flex items-center">
                <!-- Logo -->
                <VxvLogoStub :size="logoSize" :to="logoLink" />

                <!-- Enlaces de navegación -->
                <div v-if="links && links.length > 0" class="ml-8 hidden md:block">
                  <ul class="flex space-x-6">
                    <li v-for="link in links" :key="link.to">
                      <VxvNavLinkStub
                        :to="link.to"
                        :label="link.label"
                        :icon="link.icon"
                        :horizontal="true"
                        :activeClass="activeClass"
                        :inactiveClass="inactiveClass"
                        :activeIconClass="activeIconClass"
                        :inactiveIconClass="inactiveIconClass"
                        :exact="link.exact"
                      />
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center space-x-4">
                <slot name="actions">
                  <!-- Contenido por defecto para acciones -->
                </slot>
              </div>
            </div>
          </nav>
        `
      },
      VxvButton
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 min-h-screen">
        <VxvNavbar v-bind="args" />
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold text-white mb-4">Contenido de la página</h1>
          <p class="text-gray-300">Esta es una página de ejemplo para mostrar la barra de navegación.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Barra de navegación con iconos
 */
export const WithIcons: Story = {
  args: {
    ...Default.args,
    links: [
      { to: '/', label: 'Inicio', icon: HomeIcon, exact: true },
      { to: '/market', label: 'Mercado', icon: ShoppingCartIcon },
      { to: '/profile', label: 'Perfil', icon: UserIcon },
      { to: '/settings', label: 'Configuración', icon: CogIcon }
    ],
  },
  render: Default.render,
};

/**
 * Barra de navegación con acciones
 */
export const WithActions: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => ({
    components: { 
      VxvNavbar: Default.render({...args}).components.VxvNavbar,
      VxvButton
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 min-h-screen">
        <VxvNavbar v-bind="args">
          <template #actions>
            <VxvButton variant="secondary" size="md">Iniciar Sesión</VxvButton>
            <VxvButton variant="primary" size="md">Registrarse</VxvButton>
          </template>
        </VxvNavbar>
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold text-white mb-4">Contenido de la página</h1>
          <p class="text-gray-300">Esta es una página de ejemplo para mostrar la barra de navegación con acciones.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Barra de navegación transparente
 */
export const Transparent: Story = {
  args: {
    ...Default.args,
    transparent: true,
  },
  render: Default.render,
};

/**
 * Barra de navegación con usuario autenticado
 */
export const LoggedIn: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => ({
    components: { 
      VxvNavbar: Default.render({...args}).components.VxvNavbar,
      VxvButton
    },
    setup() {
      const user = {
        name: 'John Doe',
        credits: '1,500'
      };
      
      return { args, user };
    },
    template: `
      <div class="bg-gray-900 min-h-screen">
        <VxvNavbar v-bind="args">
          <template #actions>
            <div class="text-sm text-gray-300">
              <span class="mr-2">{{ user.name }}</span>
              <span class="text-blue-400">{{ user.credits }} ISK</span>
            </div>
            <VxvButton variant="secondary" size="md">Cerrar Sesión</VxvButton>
          </template>
        </VxvNavbar>
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold text-white mb-4">Panel de Control</h1>
          <p class="text-gray-300">Bienvenido a tu panel de control, {{ user.name }}.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Barra de navegación con logo personalizado
 */
export const CustomLogo: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => ({
    components: { 
      VxvNavbar: Default.render({...args}).components.VxvNavbar,
    },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 min-h-screen">
        <VxvNavbar v-bind="args">
          <template #logo>
            <div class="text-2xl font-bold text-white">
              <span class="text-blue-400">V</span>AXAV
            </div>
          </template>
        </VxvNavbar>
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold text-white mb-4">Contenido de la página</h1>
          <p class="text-gray-300">Esta es una página de ejemplo para mostrar la barra de navegación con logo personalizado.</p>
        </div>
      </div>
    `,
  }),
};
