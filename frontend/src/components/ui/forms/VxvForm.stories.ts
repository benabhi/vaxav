import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvForm from './VxvForm.vue';
import VxvInput from './VxvInput.vue';
import VxvSelect from './VxvSelect.vue';
import VxvCheckbox from './VxvCheckbox.vue';
import VxvAlert from '../feedback/VxvAlert.vue';
import VxvTextarea from './VxvTextarea.vue';

/**
 * VxvForm es un componente contenedor para formularios que proporciona un diseño consistente
 * y botones de acción estándar.
 */
const meta: Meta<typeof VxvForm> = {
  title: 'UI/Forms/VxvForm',
  component: VxvForm,
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Título del formulario',
      control: { type: 'text' },
    },
    submitText: {
      description: 'Texto del botón de envío',
      control: { type: 'text' },
    },
    cancelText: {
      description: 'Texto del botón de cancelar',
      control: { type: 'text' },
    },
    showCancel: {
      description: 'Muestra el botón de cancelar',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Estado de carga del formulario',
      control: { type: 'boolean' },
    },
    maxWidth: {
      description: 'Ancho máximo del formulario',
      control: { type: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'full'] },
    },
    hasBorder: {
      description: 'Muestra el borde en el título del card',
      control: { type: 'boolean' },
    },
    fullWidthSubmit: {
      description: 'El botón de envío ocupa todo el ancho disponible',
      control: { type: 'boolean' },
    },
    showSubmit: {
      description: 'Muestra el botón de envío',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Deshabilita el botón de envío',
      control: { type: 'boolean' },
    },
    onSubmit: { action: 'submit' },
    onCancel: { action: 'cancel' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvForm>;

/**
 * Formulario básico
 */
export const Default: Story = {
  args: {
    title: 'Formulario de Contacto',
    submitText: 'Enviar',
    cancelText: 'Cancelar',
    showCancel: true,
    showSubmit: true,
    loading: false,
    disabled: false,
    maxWidth: '3xl',
    hasBorder: true,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvTextarea },
    setup() {
      const form = ref({
        name: '',
        email: '',
        message: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />

            <VxvTextarea
              v-model="form.message"
              label="Mensaje"
              placeholder="Escriba su mensaje aquí"
              rows="4"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario en estado de carga
 */
export const Loading: Story = {
  args: {
    title: 'Formulario de Contacto',
    submitText: 'Enviando...',
    cancelText: 'Cancelar',
    showCancel: true,
    loading: true,
    maxWidth: '3xl',
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvTextarea },
    setup() {
      const form = ref({
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        message: 'Este es un mensaje de prueba para el formulario de contacto.'
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />

            <VxvTextarea
              v-model="form.message"
              label="Mensaje"
              placeholder="Escriba su mensaje aquí"
              rows="4"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario sin botón de cancelar
 */
export const WithoutCancel: Story = {
  args: {
    title: 'Formulario de Suscripción',
    submitText: 'Suscribirse',
    showCancel: false,
    loading: false,
    maxWidth: '2xl',
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvCheckbox },
    setup() {
      const form = ref({
        email: '',
        acceptTerms: false
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />

            <VxvCheckbox
              v-model="form.acceptTerms"
              label="Acepto los términos y condiciones"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con textos personalizados
 */
export const CustomText: Story = {
  args: {
    title: 'Crear Nueva Cuenta',
    submitText: 'Registrarse',
    cancelText: 'Volver',
    showCancel: true,
    loading: false,
    maxWidth: '3xl',
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvSelect, VxvCheckbox },
    setup() {
      const form = ref({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        acceptTerms: false
      });

      const roles = [
        { value: 'user', label: 'Usuario' },
        { value: 'editor', label: 'Editor' },
        { value: 'admin', label: 'Administrador' }
      ];

      return { args, form, roles };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.username"
              label="Nombre de usuario"
              placeholder="Ingrese un nombre de usuario"
              required
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />

            <VxvInput
              v-model="form.password"
              label="Contraseña"
              type="password"
              placeholder="Ingrese una contraseña"
              required
            />

            <VxvInput
              v-model="form.confirmPassword"
              label="Confirmar contraseña"
              type="password"
              placeholder="Confirme su contraseña"
              required
            />

            <VxvSelect
              v-model="form.role"
              label="Rol"
              :options="roles"
              placeholder="Seleccione un rol"
              required
            />

            <VxvCheckbox
              v-model="form.acceptTerms"
              label="Acepto los términos y condiciones"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario sin borde en el título
 */
export const WithoutBorder: Story = {
  args: {
    title: 'Formulario sin Borde',
    submitText: 'Guardar',
    cancelText: 'Cancelar',
    showCancel: true,
    loading: false,
    maxWidth: '3xl',
    hasBorder: false,
    fullWidthSubmit: false,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput },
    setup() {
      const form = ref({
        name: '',
        email: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con ancho personalizado
 */
export const CustomWidth: Story = {
  args: {
    title: 'Formulario Compacto',
    submitText: 'Guardar',
    cancelText: 'Cancelar',
    showCancel: true,
    loading: false,
    maxWidth: 'sm',
  },
  render: (args) => ({
    components: { VxvForm, VxvInput },
    setup() {
      const form = ref({
        name: '',
        email: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con validación
 */
export const WithValidation: Story = {
  render: () => ({
    components: { VxvForm, VxvInput, VxvTextarea },
    setup() {
      const form = ref({
        name: '',
        email: '',
        message: ''
      });

      const errors = ref({
        name: '',
        email: '',
        message: ''
      });

      const validateForm = () => {
        let isValid = true;

        // Validar nombre
        if (!form.value.name) {
          errors.value.name = 'El nombre es requerido';
          isValid = false;
        } else if (form.value.name.length < 3) {
          errors.value.name = 'El nombre debe tener al menos 3 caracteres';
          isValid = false;
        } else {
          errors.value.name = '';
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.value.email) {
          errors.value.email = 'El correo electrónico es requerido';
          isValid = false;
        } else if (!emailRegex.test(form.value.email)) {
          errors.value.email = 'El correo electrónico no es válido';
          isValid = false;
        } else {
          errors.value.email = '';
        }

        // Validar mensaje
        if (!form.value.message) {
          errors.value.message = 'El mensaje es requerido';
          isValid = false;
        } else if (form.value.message.length < 10) {
          errors.value.message = 'El mensaje debe tener al menos 10 caracteres';
          isValid = false;
        } else {
          errors.value.message = '';
        }

        return isValid;
      };

      const handleSubmit = () => {
        if (validateForm()) {
          alert('Formulario enviado correctamente');
        }
      };

      return {
        form,
        errors,
        handleSubmit
      };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          title="Formulario con Validación"
          submitText="Enviar"
          @submit="handleSubmit"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.name"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
              :error="errors.name"
            />

            <VxvInput
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
              :error="errors.email"
            />

            <VxvTextarea
              v-model="form.message"
              label="Mensaje"
              placeholder="Escriba su mensaje aquí"
              rows="4"
              required
              :error="errors.message"
            />
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con botón de ancho completo y contenido en el footer
 */
export const WithFooterAndFullWidthButton: Story = {
  args: {
    title: 'Iniciar Sesión',
    submitText: 'Iniciar Sesión',
    showCancel: false,
    loading: false,
    maxWidth: '3xl',
    hasBorder: false,
    fullWidthSubmit: true,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput },
    setup() {
      const form = ref({
        email: '',
        password: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
        >
          <div class="space-y-4 mb-6">
            <VxvInput
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />

            <VxvInput
              v-model="form.password"
              label="Contraseña"
              type="password"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <template #footer>
            <div class="mt-4 text-center text-gray-400">
              ¿No tienes una cuenta?
              <a href="#" class="text-blue-400 hover:underline">Regístrate</a>
            </div>

            <div class="mt-2 text-center text-gray-400">
              <a href="#" class="text-blue-400 hover:underline text-sm">¿Olvidaste tu contraseña?</a>
            </div>
          </template>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con alerta de error
 */
export const WithErrorAlert: Story = {
  args: {
    title: 'Iniciar Sesión',
    submitText: 'Iniciar Sesión',
    showCancel: false,
    showSubmit: true,
    fullWidthSubmit: true,
    maxWidth: 'md',
    hasBorder: false,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvAlert },
    setup() {
      const form = ref({
        email: '',
        password: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
        >
          <template #alert>
            <div class="mb-6">
              <VxvAlert
                variant="error"
                message="Credenciales incorrectas. Por favor, verifica tu email y contraseña."
                :dismissible="false"
              />
            </div>
          </template>

          <div class="mb-4">
            <VxvInput
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="ejemplo@dominio.com"
              required
            />
          </div>

          <div class="mb-6">
            <VxvInput
              v-model="form.password"
              label="Contraseña"
              type="password"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <template #footer>
            <div class="mt-6 text-center text-gray-400">
              ¿No tienes una cuenta?
              <a href="#" class="text-blue-400 hover:underline">Regístrate</a>
            </div>

            <div class="mt-2 text-center text-gray-400">
              <a href="#" class="text-blue-400 hover:underline text-sm">¿Olvidaste tu contraseña?</a>
            </div>
          </template>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con botón deshabilitado
 */
export const WithDisabledButton: Story = {
  args: {
    title: 'Crear Piloto',
    submitText: 'Crear Piloto',
    showCancel: false,
    showSubmit: true,
    disabled: true,
    fullWidthSubmit: true,
    maxWidth: 'md',
    hasBorder: false,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvSelect },
    setup() {
      const form = ref({
        name: 'Nombre del Piloto',
        race: ''
      });

      return { args, form };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
        >
          <div class="mb-4">
            <VxvInput
              v-model="form.name"
              label="Nombre del Piloto"
              type="text"
              required
            />
          </div>

          <div class="mb-6">
            <VxvSelect
              v-model="form.race"
              label="Raza"
              required
              placeholder="Selecciona una raza"
              :options="[
                { value: 'Humano', label: 'Humano' },
                { value: 'Cyborg', label: 'Cyborg' },
                { value: 'Alienígena', label: 'Alienígena' },
                { value: 'Sintético', label: 'Sintético' }
              ]"
            />
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Bonificaciones de Raza</h3>
            <div class="text-gray-400 italic">
              Selecciona una raza para ver sus bonificaciones
            </div>
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario sin botón de envío
 */
export const WithoutSubmitButton: Story = {
  args: {
    title: 'Información',
    showSubmit: false,
    showCancel: false,
    maxWidth: '3xl',
    hasBorder: false,
  },
  render: (args) => ({
    components: { VxvForm, VxvInput },
    setup() {
      return { args };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
        >
          <div class="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 mb-6">
            <p class="text-green-400 font-semibold">¡Tu dirección de correo electrónico ha sido verificada!</p>
            <p class="text-gray-300 mt-2">Ahora puedes acceder a todas las funciones de VAXAV.</p>
          </div>

          <div class="text-center">
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Ir al inicio
            </button>
          </div>
        </VxvForm>
      </div>
    `,
  }),
};

/**
 * Formulario con múltiples columnas
 */
export const MultiColumn: Story = {
  args: {
    title: 'Información Personal',
    submitText: 'Guardar',
    cancelText: 'Cancelar',
    showCancel: true,
    loading: false,
    maxWidth: '4xl',
  },
  render: (args) => ({
    components: { VxvForm, VxvInput, VxvSelect },
    setup() {
      const form = ref({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });

      const states = [
        { value: 'madrid', label: 'Madrid' },
        { value: 'barcelona', label: 'Barcelona' },
        { value: 'valencia', label: 'Valencia' },
        { value: 'sevilla', label: 'Sevilla' }
      ];

      return { args, form, states };
    },
    template: `
      <div class="bg-gray-900 p-4">
        <VxvForm
          v-bind="args"
          @submit="args.onSubmit"
          @cancel="args.onCancel"
        >
          <div class="space-y-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VxvInput
                v-model="form.firstName"
                label="Nombre"
                placeholder="Ingrese su nombre"
                required
              />

              <VxvInput
                v-model="form.lastName"
                label="Apellidos"
                placeholder="Ingrese sus apellidos"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VxvInput
                v-model="form.email"
                label="Correo electrónico"
                type="email"
                placeholder="ejemplo@dominio.com"
                required
              />

              <VxvInput
                v-model="form.phone"
                label="Teléfono"
                placeholder="+34 600 000 000"
              />
            </div>

            <VxvInput
              v-model="form.address"
              label="Dirección"
              placeholder="Calle, número, piso"
              required
            />

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VxvInput
                v-model="form.city"
                label="Ciudad"
                placeholder="Ingrese su ciudad"
                required
              />

              <VxvSelect
                v-model="form.state"
                label="Provincia"
                :options="states"
                placeholder="Seleccione una provincia"
                required
              />

              <VxvInput
                v-model="form.zipCode"
                label="Código Postal"
                placeholder="28000"
                required
              />
            </div>
          </div>
        </VxvForm>
      </div>
    `,
  }),
};
