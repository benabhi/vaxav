# Storybook en Vaxav

Vaxav utiliza [Storybook](https://storybook.js.org/) para documentar, visualizar y testear sus componentes de UI de forma aislada.

## ¿Qué es Storybook?

Storybook es una herramienta de desarrollo para UI que permite visualizar, desarrollar y probar componentes de forma aislada. Esto facilita el desarrollo de componentes complejos sin necesidad de navegar por toda la aplicación.

## Ejecutar Storybook

### Desarrollo local

Para ejecutar Storybook en tu entorno de desarrollo local:

```bash
cd frontend
npm run storybook
```

Esto iniciará Storybook en [http://localhost:6006](http://localhost:6006).

### Usando PM2

Vaxav está configurado para ejecutar Storybook como un servicio de PM2. Para iniciar todos los servicios, incluyendo Storybook:

```bash
pm2 start ecosystem.config.js
```

Para iniciar solo Storybook:

```bash
pm2 start ecosystem.config.js --only vaxav-storybook
```

## Estructura de las historias

Las historias se organizan siguiendo la estructura de componentes de la aplicación:

- `UI/Buttons/VxvButton`: Componente de botón principal
- `UI/Forms/VxvInput`: Componente de entrada de texto
- `UI/Forms/VxvSelect`: Componente de selección
- etc.

## Crear nuevas historias

Para crear una historia para un componente, crea un archivo `.stories.ts` junto al componente. Por ejemplo:

```typescript
// VxvInput.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import VxvInput from './VxvInput.vue';

const meta: Meta<typeof VxvInput> = {
  title: 'UI/Forms/VxvInput',
  component: VxvInput,
  tags: ['autodocs'],
  argTypes: {
    // Define los controles para las props del componente
  },
};

export default meta;
type Story = StoryObj<typeof VxvInput>;

export const Default: Story = {
  args: {
    // Props por defecto
  },
};

// Más variantes...
```

## Testing con Storybook

Vaxav utiliza Storybook para testear componentes de UI de forma aislada, mientras que las vistas y la lógica de negocio se testean con las herramientas nativas de Vue (Vitest).

### Configuración de testing

El proyecto está configurado para usar:
- `@testing-library/vue` para renderizar y manipular componentes
- `@testing-library/jest-dom` para aserciones específicas del DOM
- `@storybook/test` para interacciones de usuario
- `vitest` como framework de testing

### Ejemplo de test con Storybook

Para testear un componente usando sus historias de Storybook:

```typescript
// VxvButton.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/vue';
import { composeStory } from '@storybook/vue3';

// Importamos las historias del componente
import meta, { Primary } from '../VxvButton.stories';

// Componemos la historia para usarla en los tests
const PrimaryButton = composeStory(Primary, meta);

describe('VxvButton', () => {
  it('renderiza correctamente el botón primario', async () => {
    // Renderiza la historia
    await PrimaryButton.run();

    // Verifica que el botón se renderiza con el texto correcto
    const button = screen.getByText('Botón Primario');
    expect(button).toBeInTheDocument();
  });

  // Más tests...
});
```

### Ejecutar los tests

Para ejecutar los tests:

```bash
cd frontend
npm run test:unit
```

## Documentación de componentes

Storybook genera automáticamente documentación para los componentes basándose en:

1. Los comentarios JSDoc en el código del componente
2. Los `argTypes` definidos en el archivo de historia
3. Las historias que muestran diferentes variantes del componente

Para mejorar la documentación, asegúrate de:

- Añadir comentarios JSDoc a las props del componente
- Definir `argTypes` con descripciones claras
- Crear historias que muestren diferentes estados y variantes del componente

## Integración con Tailwind CSS

Storybook está configurado para utilizar los estilos de Tailwind CSS de la aplicación. Esto asegura que los componentes se vean exactamente igual en Storybook que en la aplicación real.
