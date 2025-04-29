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
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('Botón Primario');
  });

  it('llama al evento click cuando se hace clic en el botón', async () => {
    // Crea un mock para el evento click
    const onClickMock = vi.fn();
    
    // Renderiza la historia con el mock del evento click
    await PrimaryButton.run({ 
      args: { 
        ...PrimaryButton.args,
        onClick: onClickMock 
      } 
    });
    
    // Busca el botón y hace clic en él
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    
    // Verifica que el mock fue llamado
    expect(onClickMock).toHaveBeenCalled();
  });
});
