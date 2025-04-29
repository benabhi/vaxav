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
    const button = screen.getByText('Botón Primario');
    await fireEvent.click(button);
    
    // Verifica que el mock fue llamado
    expect(onClickMock).toHaveBeenCalled();
  });

  it('muestra el estado de carga cuando loading=true', async () => {
    // Renderiza la historia con loading=true
    await PrimaryButton.run({ 
      args: { 
        ...PrimaryButton.args,
        loading: true 
      } 
    });
    
    // Verifica que el botón tiene la clase de carga
    const button = screen.getByRole('button');
    
    // Verifica que el SVG de carga está presente
    const loadingIcon = button.querySelector('svg.animate-spin');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('está deshabilitado cuando disabled=true', async () => {
    // Renderiza la historia con disabled=true
    await PrimaryButton.run({ 
      args: { 
        ...PrimaryButton.args,
        disabled: true 
      } 
    });
    
    // Verifica que el botón está deshabilitado
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
