import { reactive, ref, computed } from 'vue';

/**
 * Composable para gestionar formularios y validaciones
 *
 * @param {Object} options - Opciones de configuración
 * @param {Object} [options.initialValues={}] - Valores iniciales del formulario
 * @param {Object} [options.validationRules={}] - Reglas de validación
 * @param {Function} [options.onSubmit=null] - Función a ejecutar al enviar el formulario
 * @param {Function} [options.onError=null] - Función a ejecutar cuando hay errores de validación
 * @returns {Object} Estado y métodos para gestionar formularios
 */
export function useForm(options = {}) {
  const {
    initialValues = {},
    validationRules = {},
    onSubmit = null,
    onError = null
  } = options;

  // Estado del formulario
  const values = reactive({ ...initialValues });
  const errors = reactive({});
  const touched = reactive({});
  const submitting = ref(false);
  const submitted = ref(false);

  /**
   * Valida un campo específico
   * @param {string} field - Nombre del campo a validar
   * @returns {string|null} Mensaje de error o null si es válido
   */
  const validateField = (field) => {
    if (!validationRules[field]) return null;

    const rules = validationRules[field];
    const value = values[field];

    // Recorrer todas las reglas de validación para este campo
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) {
        return error;
      }
    }

    return null;
  };

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} true si todos los campos son válidos, false en caso contrario
   */
  const validateForm = () => {
    let isValid = true;

    // Limpiar errores anteriores
    Object.keys(errors).forEach(key => {
      errors[key] = null;
    });

    // Validar cada campo
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    return isValid;
  };

  /**
   * Maneja el cambio de valor de un campo
   * @param {string} field - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const handleChange = (field, value) => {
    values[field] = value;

    // Si el campo ha sido tocado, validarlo
    if (touched[field]) {
      errors[field] = validateField(field);
    }
  };

  /**
   * Maneja cuando un campo pierde el foco
   * @param {string} field - Nombre del campo
   */
  const handleBlur = (field) => {
    touched[field] = true;
    errors[field] = validateField(field);
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento de envío
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    submitted.value = true;

    // Marcar todos los campos como tocados
    Object.keys(validationRules).forEach(field => {
      touched[field] = true;
    });

    // Validar el formulario
    const isValid = validateForm();

    if (!isValid) {
      if (onError) {
        onError(errors);
      }
      return;
    }

    submitting.value = true;

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } finally {
      submitting.value = false;
    }
  };

  /**
   * Restablece el formulario a sus valores iniciales
   */
  const resetForm = () => {
    // Restablecer valores
    Object.keys(values).forEach(key => {
      values[key] = initialValues[key] !== undefined ? initialValues[key] : '';
    });

    // Limpiar errores y estado de tocado
    Object.keys(errors).forEach(key => {
      errors[key] = undefined;
      touched[key] = false;
    });

    submitted.value = false;
  };

  /**
   * Establece los valores del formulario
   * @param {Object} newValues - Nuevos valores
   */
  const setValues = (newValues) => {
    Object.keys(newValues).forEach(key => {
      values[key] = newValues[key];
    });
  };

  /**
   * Establece los errores del formulario (útil para errores de API)
   * @param {Object} apiErrors - Errores de la API
   */
  const setErrors = (apiErrors) => {
    Object.keys(apiErrors).forEach(key => {
      errors[key] = apiErrors[key];
    });
  };

  /**
   * Indica si el formulario es válido
   */
  const isValid = computed(() => {
    return Object.keys(errors).every(key => !errors[key]);
  });

  /**
   * Indica si el formulario ha sido modificado
   */
  const isDirty = computed(() => {
    return Object.keys(initialValues).some(key => initialValues[key] !== values[key]);
  });

  return {
    // Estado
    values,
    errors,
    touched,
    submitting,
    submitted,
    isValid,
    isDirty,

    // Métodos
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    resetForm,
    setValues,
    setErrors
  };
}
