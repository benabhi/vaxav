import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConfirmation } from '@/composables/useConfirmation';

describe('useConfirmation', () => {
  let confirmation;

  beforeEach(() => {
    // Inicializar el composable
    confirmation = useConfirmation();
  });

  describe('initial state', () => {
    it('should have the correct initial state', () => {
      expect(confirmation.isOpen.value).toBe(false);
      expect(confirmation.isLoading.value).toBe(false);
      expect(confirmation.config).toEqual({
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        color: 'blue',
        icon: null,
        data: null
      });
    });
  });

  describe('confirm', () => {
    it('should open a confirmation dialog with default options', () => {
      // Llamar al método
      const promise = confirmation.confirm();

      // Verificar que el diálogo está abierto
      expect(confirmation.isOpen.value).toBe(true);

      // Verificar que la configuración tiene los valores por defecto
      expect(confirmation.config.title).toBe('Confirmar');
      expect(confirmation.config.message).toBe('¿Estás seguro?');
      expect(confirmation.config.confirmText).toBe('Confirmar');
      expect(confirmation.config.cancelText).toBe('Cancelar');
      expect(confirmation.config.color).toBe('blue');
      expect(confirmation.config.icon).toBe(null);
      expect(confirmation.config.data).toBe(null);

      // Verificar que se devolvió una promesa
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should open a confirmation dialog with custom options', () => {
      // Opciones personalizadas
      const options = {
        title: 'Título personalizado',
        message: 'Mensaje personalizado',
        confirmText: 'Aceptar',
        cancelText: 'Rechazar',
        color: 'green',
        icon: 'check',
        data: { id: 1, name: 'Test' }
      };

      // Llamar al método
      confirmation.confirm(options);

      // Verificar que la configuración tiene los valores personalizados
      expect(confirmation.config.title).toBe(options.title);
      expect(confirmation.config.message).toBe(options.message);
      expect(confirmation.config.confirmText).toBe(options.confirmText);
      expect(confirmation.config.cancelText).toBe(options.cancelText);
      expect(confirmation.config.color).toBe(options.color);
      expect(confirmation.config.icon).toBe(options.icon);
      expect(confirmation.config.data).toEqual(options.data);
    });
  });

  describe('confirmDelete', () => {
    it('should open a delete confirmation dialog with default options', () => {
      // Llamar al método
      confirmation.confirmDelete();

      // Verificar que el diálogo está abierto
      expect(confirmation.isOpen.value).toBe(true);

      // Verificar que la configuración tiene los valores por defecto para eliminación
      expect(confirmation.config.title).toBe('Eliminar');
      expect(confirmation.config.message).toBe('¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.');
      expect(confirmation.config.confirmText).toBe('Eliminar');
      expect(confirmation.config.cancelText).toBe('Cancelar');
      expect(confirmation.config.color).toBe('red');
      expect(confirmation.config.icon).toBe('trash');
      expect(confirmation.config.data).toBe(null);
    });

    it('should open a delete confirmation dialog with custom options', () => {
      // Opciones personalizadas
      const options = {
        title: 'Eliminar usuario',
        message: '¿Estás seguro de que deseas eliminar este usuario?',
        confirmText: 'Sí, eliminar',
        cancelText: 'No, cancelar',
        data: { id: 1, name: 'Usuario 1' }
      };

      // Llamar al método
      confirmation.confirmDelete(options);

      // Verificar que la configuración tiene los valores personalizados
      expect(confirmation.config.title).toBe(options.title);
      expect(confirmation.config.message).toBe(options.message);
      expect(confirmation.config.confirmText).toBe(options.confirmText);
      expect(confirmation.config.cancelText).toBe(options.cancelText);
      expect(confirmation.config.color).toBe('red'); // Siempre rojo para eliminación
      expect(confirmation.config.icon).toBe('trash'); // Siempre icono de papelera para eliminación
      expect(confirmation.config.data).toEqual(options.data);
    });
  });

  describe('confirmSave', () => {
    it('should open a save confirmation dialog with default options', () => {
      // Llamar al método
      confirmation.confirmSave();

      // Verificar que el diálogo está abierto
      expect(confirmation.isOpen.value).toBe(true);

      // Verificar que la configuración tiene los valores por defecto para guardado
      expect(confirmation.config.title).toBe('Guardar cambios');
      expect(confirmation.config.message).toBe('¿Estás seguro de que deseas guardar los cambios?');
      expect(confirmation.config.confirmText).toBe('Guardar');
      expect(confirmation.config.cancelText).toBe('Cancelar');
      expect(confirmation.config.color).toBe('green');
      expect(confirmation.config.icon).toBe('save');
      expect(confirmation.config.data).toBe(null);
    });

    it('should open a save confirmation dialog with custom options', () => {
      // Opciones personalizadas
      const options = {
        title: 'Guardar usuario',
        message: '¿Estás seguro de que deseas guardar los cambios del usuario?',
        confirmText: 'Sí, guardar',
        cancelText: 'No, cancelar',
        data: { id: 1, name: 'Usuario 1' }
      };

      // Llamar al método
      confirmation.confirmSave(options);

      // Verificar que la configuración tiene los valores personalizados
      expect(confirmation.config.title).toBe(options.title);
      expect(confirmation.config.message).toBe(options.message);
      expect(confirmation.config.confirmText).toBe(options.confirmText);
      expect(confirmation.config.cancelText).toBe(options.cancelText);
      expect(confirmation.config.color).toBe('green'); // Siempre verde para guardado
      expect(confirmation.config.icon).toBe('save'); // Siempre icono de guardar para guardado
      expect(confirmation.config.data).toEqual(options.data);
    });
  });

  describe('handleConfirm', () => {
    it('should resolve the promise with confirmed=true when confirmed', async () => {
      // Crear una promesa y capturar el resultado
      let result;
      const promise = confirmation.confirm()
        .then(res => {
          result = res;
        });

      // Confirmar el diálogo
      await confirmation.handleConfirm();

      // Esperar a que se resuelva la promesa
      await promise;

      // Verificar que el diálogo está cerrado
      expect(confirmation.isOpen.value).toBe(false);

      // Verificar que la promesa se resolvió con confirmed=true
      expect(result).toEqual({ confirmed: true, data: null });
    });

    it('should include custom data in the resolved promise', async () => {
      // Datos personalizados
      const customData = { id: 1, name: 'Test' };

      // Crear una promesa y capturar el resultado
      let result;
      const promise = confirmation.confirm({ data: customData })
        .then(res => {
          result = res;
        });

      // Confirmar el diálogo
      await confirmation.handleConfirm();

      // Esperar a que se resuelva la promesa
      await promise;

      // Verificar que la promesa se resolvió con confirmed=true y los datos personalizados
      expect(result).toEqual({ confirmed: true, data: customData });
    });

    it('should handle loading state during confirmation', async () => {
      // Crear una promesa
      const promise = confirmation.confirm();

      // Verificar que isLoading es false inicialmente
      expect(confirmation.isLoading.value).toBe(false);

      // Simular que isLoading se establece a true durante la confirmación
      confirmation.isLoading.value = true;
      expect(confirmation.isLoading.value).toBe(true);

      // Confirmar el diálogo
      await confirmation.handleConfirm();

      // Esperar a que se resuelva la promesa original
      await promise;

      // Verificar que el diálogo está cerrado
      expect(confirmation.isOpen.value).toBe(false);
    });
  });

  describe('handleCancel', () => {
    it('should resolve the promise with confirmed=false when cancelled', async () => {
      // Crear una promesa y capturar el resultado
      let result;
      const promise = confirmation.confirm()
        .then(res => {
          result = res;
        });

      // Cancelar el diálogo
      confirmation.handleCancel();

      // Esperar a que se resuelva la promesa
      await promise;

      // Verificar que el diálogo está cerrado
      expect(confirmation.isOpen.value).toBe(false);

      // Verificar que la promesa se resolvió con confirmed=false
      expect(result).toEqual({ confirmed: false, data: null });
    });

    it('should include custom data in the resolved promise when cancelled', async () => {
      // Datos personalizados
      const customData = { id: 1, name: 'Test' };

      // Crear una promesa y capturar el resultado
      let result;
      const promise = confirmation.confirm({ data: customData })
        .then(res => {
          result = res;
        });

      // Cancelar el diálogo
      confirmation.handleCancel();

      // Esperar a que se resuelva la promesa
      await promise;

      // Verificar que la promesa se resolvió con confirmed=false y los datos personalizados
      expect(result).toEqual({ confirmed: false, data: customData });
    });
  });

  describe('close', () => {
    it('should close the dialog and resolve the promise with confirmed=false', async () => {
      // Crear una promesa y capturar el resultado
      let result;
      const promise = confirmation.confirm()
        .then(res => {
          result = res;
        });

      // Cerrar el diálogo
      confirmation.close();

      // Esperar a que se resuelva la promesa
      await promise;

      // Verificar que el diálogo está cerrado
      expect(confirmation.isOpen.value).toBe(false);

      // Verificar que la promesa se resolvió con confirmed=false
      expect(result).toEqual({ confirmed: false, data: null });
    });
  });
});
