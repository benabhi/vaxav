/**
 * @file Composable para gestionar diálogos de confirmación
 * @description Proporciona estado y métodos para gestionar diálogos de confirmación
 * @module composables/useConfirmation
 */

import { ref, reactive } from 'vue';
import type { Ref } from 'vue';

export interface ConfirmationOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'blue' | 'red' | 'green' | 'yellow';
  icon?: string | null;
  data?: any;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  color: 'blue' | 'red' | 'green' | 'yellow';
  icon: string | null;
  data: any;
}

export interface ConfirmationResult {
  confirmed: boolean;
  data: any;
}

/**
 * Composable para gestionar diálogos de confirmación
 * 
 * @returns Estado y métodos para gestionar diálogos de confirmación
 */
export function useConfirmation() {
  // Estado del diálogo
  const isOpen: Ref<boolean> = ref(false);
  const isLoading: Ref<boolean> = ref(false);
  const config: ConfirmationConfig = reactive({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    color: 'blue',
    icon: null,
    data: null
  });
  
  // Promesa actual
  let resolvePromise: ((value: ConfirmationResult) => void) | null = null;
  let rejectPromise: ((reason?: any) => void) | null = null;

  /**
   * Abre un diálogo de confirmación
   * @param options - Opciones del diálogo
   * @returns Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirm = (options: ConfirmationOptions = {}): Promise<ConfirmationResult> => {
    // Configurar el diálogo
    config.title = options.title || 'Confirmar';
    config.message = options.message || '¿Estás seguro?';
    config.confirmText = options.confirmText || 'Confirmar';
    config.cancelText = options.cancelText || 'Cancelar';
    config.color = options.color || 'blue';
    config.icon = options.icon || null;
    config.data = options.data || null;
    
    // Abrir el diálogo
    isOpen.value = true;
    
    // Crear y devolver una promesa
    return new Promise<ConfirmationResult>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  /**
   * Confirma el diálogo
   */
  const handleConfirm = async (): Promise<void> => {
    if (!resolvePromise) return;
    
    try {
      isLoading.value = true;
      resolvePromise({ confirmed: true, data: config.data });
    } finally {
      isLoading.value = false;
      isOpen.value = false;
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  /**
   * Cancela el diálogo
   */
  const handleCancel = (): void => {
    if (!resolvePromise) return;
    
    resolvePromise({ confirmed: false, data: config.data });
    isOpen.value = false;
    resolvePromise = null;
    rejectPromise = null;
  };

  /**
   * Cierra el diálogo (equivalente a cancelar)
   */
  const close = (): void => {
    handleCancel();
  };

  /**
   * Crea un diálogo de confirmación de eliminación
   * @param options - Opciones del diálogo
   * @returns Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirmDelete = (options: ConfirmationOptions = {}): Promise<ConfirmationResult> => {
    return confirm({
      title: options.title || 'Eliminar',
      message: options.message || '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
      confirmText: options.confirmText || 'Eliminar',
      cancelText: options.cancelText || 'Cancelar',
      color: 'red',
      icon: 'trash',
      data: options.data || null
    });
  };

  /**
   * Crea un diálogo de confirmación de guardado
   * @param options - Opciones del diálogo
   * @returns Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirmSave = (options: ConfirmationOptions = {}): Promise<ConfirmationResult> => {
    return confirm({
      title: options.title || 'Guardar cambios',
      message: options.message || '¿Estás seguro de que deseas guardar los cambios?',
      confirmText: options.confirmText || 'Guardar',
      cancelText: options.cancelText || 'Cancelar',
      color: 'green',
      icon: 'save',
      data: options.data || null
    });
  };

  return {
    // Estado
    isOpen,
    isLoading,
    config,
    
    // Métodos
    confirm,
    confirmDelete,
    confirmSave,
    handleConfirm,
    handleCancel,
    close
  };
}
