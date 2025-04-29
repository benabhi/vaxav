import type { Preview } from '@storybook/vue3'
import '../src/assets/main.css'; // Importar estilos globales de Tailwind CSS

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a', // Fondo oscuro para coincidir con el tema de la aplicación
        },
        {
          name: 'light',
          value: '#f8f8f8',
        },
      ],
    },
  },
};

export default preview;