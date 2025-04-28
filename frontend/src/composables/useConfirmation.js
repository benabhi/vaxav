import { ref, reactive } from 'vue';

/**
 * Composable para gestionar diálogos de confirmación
 * 
 * @returns {Object} Estado y métodos para gestionar diálogos de confirmación
 */
export function useConfirmation() {
  // Estado del diálogo
  const isOpen = ref(false);
  const isLoading = ref(false);
  const config = reactive({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    color: 'blue',
    icon: null,
    data: null
  });
  
  // Promesa actual
  let resolvePromise = null;
  let rejectPromise = null;

  /**
   * Abre un diálogo de confirmación
   * @param {Object} options - Opciones del diálogo
   * @param {string} [options.title='Confirmar'] - Título del diálogo
   * @param {string} [options.message='¿Estás seguro?'] - Mensaje del diálogo
   * @param {string} [options.confirmText='Confirmar'] - Texto del botón de confirmación
   * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelación
   * @param {string} [options.color='blue'] - Color del diálogo (blue, red, green, yellow)
   * @param {string} [options.icon=null] - Icono a mostrar
   * @param {any} [options.data=null] - Datos adicionales para pasar al resolver la promesa
   * @returns {Promise<boolean>} Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirm = (options = {}) => {
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
    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  /**
   * Confirma el diálogo
   */
  const handleConfirm = async () => {
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
  const handleCancel = () => {
    if (!resolvePromise) return;
    
    resolvePromise({ confirmed: false, data: config.data });
    isOpen.value = false;
    resolvePromise = null;
    rejectPromise = null;
  };

  /**
   * Cierra el diálogo (equivalente a cancelar)
   */
  const close = () => {
    handleCancel();
  };

  /**
   * Crea un diálogo de confirmación de eliminación
   * @param {Object} options - Opciones del diálogo
   * @param {string} [options.title='Eliminar'] - Título del diálogo
   * @param {string} [options.message='¿Estás seguro de que deseas eliminar este elemento?'] - Mensaje del diálogo
   * @param {string} [options.confirmText='Eliminar'] - Texto del botón de confirmación
   * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelación
   * @param {any} [options.data=null] - Datos adicionales para pasar al resolver la promesa
   * @returns {Promise<boolean>} Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirmDelete = (options = {}) => {
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
   * @param {Object} options - Opciones del diálogo
   * @param {string} [options.title='Guardar cambios'] - Título del diálogo
   * @param {string} [options.message='¿Estás seguro de que deseas guardar los cambios?'] - Mensaje del diálogo
   * @param {string} [options.confirmText='Guardar'] - Texto del botón de confirmación
   * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelación
   * @param {any} [options.data=null] - Datos adicionales para pasar al resolver la promesa
   * @returns {Promise<boolean>} Promesa que se resuelve con true si se confirma, false si se cancela
   */
  const confirmSave = (options = {}) => {
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
