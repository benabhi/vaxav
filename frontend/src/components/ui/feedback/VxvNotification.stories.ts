import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvNotification from './VxvNotification.vue';
import VxvAlert from './VxvAlert.vue';
import VxvButton from '../buttons/VxvButton.vue';

/**
 * VxvNotification es un componente que gestiona múltiples alertas en forma de notificaciones.
 * Utiliza el componente VxvAlert para mostrar cada notificación y el store notification para gestionar el estado.
 */
const meta: Meta<typeof VxvNotification> = {
  title: 'UI/Feedback/VxvNotification',
  component: VxvNotification,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
VxvNotification es un componente que gestiona múltiples alertas en forma de notificaciones.
Utiliza el componente VxvAlert para mostrar cada notificación y el store notification para gestionar el estado.

En una aplicación real, este componente se utiliza junto con el store de notificaciones:

\`\`\`javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// Mostrar una notificación de éxito
notificationStore.success('Los cambios se han guardado correctamente.', 'Operación exitosa');

// Mostrar una notificación de error
notificationStore.error('No se pudieron guardar los cambios.', 'Error');

// Mostrar una notificación de advertencia
notificationStore.warning('Esta acción no se puede deshacer.', 'Advertencia');

// Mostrar una notificación de información
notificationStore.info('Hay actualizaciones disponibles.', 'Información');
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VxvNotification>;

/**
 * Para demostrar el funcionamiento del componente VxvNotification en Storybook,
 * creamos una versión simplificada del store de notificaciones.
 */
const createMockNotificationStore = () => {
  const notifications = ref([]);
  let nextId = 1;

  const addNotification = ({ type = 'info', title = '', message = '', duration = 5000 }) => {
    const id = nextId++;

    notifications.value.push({
      id,
      type,
      title,
      message,
      duration
    });

    return id;
  };

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(notification => notification.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  // Métodos de conveniencia
  const success = (message, title = 'Éxito', duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const error = (message, title = 'Error', duration = 8000) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const warning = (message, title = 'Advertencia', duration = 7000) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  const info = (message, title = 'Información', duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  };
};

/**
 * Ejemplo básico de notificaciones
 */
export const Default: Story = {
  render: () => ({
    components: { VxvNotification, VxvAlert, VxvButton },
    setup() {
      const mockStore = createMockNotificationStore();
      
      return { 
        notifications: mockStore.notifications,
        removeNotification: mockStore.removeNotification,
        showSuccess: () => mockStore.success('Los cambios se han guardado correctamente.', 'Operación exitosa'),
        showError: () => mockStore.error('No se pudieron guardar los cambios.', 'Error'),
        showWarning: () => mockStore.warning('Esta acción no se puede deshacer.', 'Advertencia'),
        showInfo: () => mockStore.info('Hay actualizaciones disponibles.', 'Información'),
        clearAll: () => mockStore.clearNotifications()
      };
    },
    template: `
      <div class="p-6 bg-gray-900 min-h-screen">
        <h1 class="text-2xl font-bold text-white mb-6">Sistema de Notificaciones</h1>
        
        <div class="flex flex-wrap gap-4 mb-8">
          <VxvButton variant="success" @click="showSuccess">
            Mostrar éxito
          </VxvButton>
          
          <VxvButton variant="danger" @click="showError">
            Mostrar error
          </VxvButton>
          
          <VxvButton variant="warning" @click="showWarning">
            Mostrar advertencia
          </VxvButton>
          
          <VxvButton variant="info" @click="showInfo">
            Mostrar información
          </VxvButton>
          
          <VxvButton variant="secondary" @click="clearAll">
            Limpiar todas
          </VxvButton>
        </div>
        
        <!-- Componente de notificaciones -->
        <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
            <VxvAlert
              v-for="notification in notifications"
              :key="notification.id"
              :variant="notification.type"
              :title="notification.title"
              :message="notification.message"
              :duration="notification.duration"
              :dismissible="true"
              class="w-full max-w-sm pointer-events-auto"
              @dismiss="removeNotification(notification.id)"
            />
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Notificaciones con diferentes duraciones
 */
export const WithDifferentDurations: Story = {
  render: () => ({
    components: { VxvNotification, VxvAlert, VxvButton },
    setup() {
      const mockStore = createMockNotificationStore();
      
      return { 
        notifications: mockStore.notifications,
        removeNotification: mockStore.removeNotification,
        showShort: () => mockStore.success('Esta notificación desaparecerá en 2 segundos.', 'Corta duración', 2000),
        showMedium: () => mockStore.info('Esta notificación desaparecerá en 5 segundos.', 'Media duración', 5000),
        showLong: () => mockStore.warning('Esta notificación desaparecerá en 10 segundos.', 'Larga duración', 10000),
        showPermanent: () => mockStore.error('Esta notificación no desaparecerá automáticamente.', 'Permanente', 0),
        clearAll: () => mockStore.clearNotifications()
      };
    },
    template: `
      <div class="p-6 bg-gray-900 min-h-screen">
        <h1 class="text-2xl font-bold text-white mb-6">Notificaciones con diferentes duraciones</h1>
        
        <div class="flex flex-wrap gap-4 mb-8">
          <VxvButton variant="primary" @click="showShort">
            Corta (2s)
          </VxvButton>
          
          <VxvButton variant="primary" @click="showMedium">
            Media (5s)
          </VxvButton>
          
          <VxvButton variant="primary" @click="showLong">
            Larga (10s)
          </VxvButton>
          
          <VxvButton variant="primary" @click="showPermanent">
            Permanente
          </VxvButton>
          
          <VxvButton variant="secondary" @click="clearAll">
            Limpiar todas
          </VxvButton>
        </div>
        
        <!-- Componente de notificaciones -->
        <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
            <VxvAlert
              v-for="notification in notifications"
              :key="notification.id"
              :variant="notification.type"
              :title="notification.title"
              :message="notification.message"
              :duration="notification.duration"
              :dismissible="true"
              class="w-full max-w-sm pointer-events-auto"
              @dismiss="removeNotification(notification.id)"
            />
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Múltiples notificaciones
 */
export const MultipleNotifications: Story = {
  render: () => ({
    components: { VxvNotification, VxvAlert, VxvButton },
    setup() {
      const mockStore = createMockNotificationStore();
      
      const showMultiple = () => {
        mockStore.success('Usuario creado correctamente.', 'Éxito', 5000);
        setTimeout(() => {
          mockStore.info('Se ha enviado un correo de confirmación.', 'Información', 7000);
        }, 1000);
        setTimeout(() => {
          mockStore.warning('Recuerda completar tu perfil.', 'Recordatorio', 9000);
        }, 2000);
      };
      
      return { 
        notifications: mockStore.notifications,
        removeNotification: mockStore.removeNotification,
        showMultiple,
        clearAll: () => mockStore.clearNotifications()
      };
    },
    template: `
      <div class="p-6 bg-gray-900 min-h-screen">
        <h1 class="text-2xl font-bold text-white mb-6">Múltiples notificaciones</h1>
        
        <div class="flex flex-wrap gap-4 mb-8">
          <VxvButton variant="primary" @click="showMultiple">
            Mostrar múltiples notificaciones
          </VxvButton>
          
          <VxvButton variant="secondary" @click="clearAll">
            Limpiar todas
          </VxvButton>
        </div>
        
        <!-- Componente de notificaciones -->
        <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
            <VxvAlert
              v-for="notification in notifications"
              :key="notification.id"
              :variant="notification.type"
              :title="notification.title"
              :message="notification.message"
              :duration="notification.duration"
              :dismissible="true"
              class="w-full max-w-sm pointer-events-auto"
              @dismiss="removeNotification(notification.id)"
            />
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Notificaciones en un layout de aplicación
 */
export const InAppLayout: Story = {
  render: () => ({
    components: { VxvNotification, VxvAlert, VxvButton },
    setup() {
      const mockStore = createMockNotificationStore();
      
      return { 
        notifications: mockStore.notifications,
        removeNotification: mockStore.removeNotification,
        showSuccess: () => mockStore.success('Los cambios se han guardado correctamente.', 'Operación exitosa'),
        showError: () => mockStore.error('No se pudieron guardar los cambios.', 'Error'),
        showWarning: () => mockStore.warning('Esta acción no se puede deshacer.', 'Advertencia'),
        showInfo: () => mockStore.info('Hay actualizaciones disponibles.', 'Información'),
        clearAll: () => mockStore.clearNotifications()
      };
    },
    template: `
      <div class="flex flex-col min-h-screen bg-gray-900 text-white">
        <!-- Header -->
        <header class="bg-gray-800 shadow-md border-b border-gray-700">
          <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-blue-400">VAXAV</h1>
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

        <!-- Main content -->
        <main class="flex-grow p-6">
          <h1 class="text-2xl font-bold text-white mb-6">Panel de Control</h1>
          
          <div class="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 class="text-xl font-semibold text-white mb-4">Acciones</h2>
            <div class="flex flex-wrap gap-4">
              <VxvButton variant="success" @click="showSuccess">
                Mostrar éxito
              </VxvButton>
              
              <VxvButton variant="danger" @click="showError">
                Mostrar error
              </VxvButton>
              
              <VxvButton variant="warning" @click="showWarning">
                Mostrar advertencia
              </VxvButton>
              
              <VxvButton variant="info" @click="showInfo">
                Mostrar información
              </VxvButton>
              
              <VxvButton variant="secondary" @click="clearAll">
                Limpiar todas
              </VxvButton>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-white mb-2">Estadísticas</h3>
              <p class="text-3xl font-bold text-blue-400">1,234</p>
              <p class="text-gray-400 text-sm">Usuarios activos</p>
            </div>
            
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-white mb-2">Transacciones</h3>
              <p class="text-3xl font-bold text-green-400">5,678</p>
              <p class="text-gray-400 text-sm">Completadas hoy</p>
            </div>
            
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-white mb-2">Recursos</h3>
              <p class="text-3xl font-bold text-purple-400">9,012</p>
              <p class="text-gray-400 text-sm">Disponibles</p>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 border-t border-gray-700 py-4">
          <div class="container mx-auto px-4 text-center text-gray-400">
            &copy; 2023 VAXAV. Todos los derechos reservados.
          </div>
        </footer>

        <!-- Componente de notificaciones -->
        <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
            <VxvAlert
              v-for="notification in notifications"
              :key="notification.id"
              :variant="notification.type"
              :title="notification.title"
              :message="notification.message"
              :duration="notification.duration"
              :dismissible="true"
              class="w-full max-w-sm pointer-events-auto"
              @dismiss="removeNotification(notification.id)"
            />
          </div>
        </div>
      </div>
    `,
  }),
};
