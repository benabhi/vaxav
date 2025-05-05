/**
 * @file Composable para gestionar formularios y validaciones
 * @description Proporciona estado y métodos para manejar formularios con validación
 * @module composables/useForm
 */

import { reactive, ref, computed } from 'vue';

// Interfaces
export interface FormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (errors: Record<keyof T, string | null>) => void;
}

export type ValidationRule<T> = (value: any, values: T) => string | null;

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

/**
 * Composable para gestionar formularios y validaciones
 *
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar formularios
 */
export function useForm<T extends Record<string, any>>(options: FormOptions<T>) {
  const {
    initialValues,
    validationRules = {} as ValidationRules<T>,
    onSubmit = null,
    onError = null
  } = options;

  // Estado del formulario
  const values = reactive({ ...initialValues }) as T;
  const errors = reactive({} as Record<keyof T, string | null>);
  const touched = reactive({} as Record<keyof T, boolean>);
  const submitting = ref(false);
  const submitted = ref(false);

  /**
   * Valida un campo específico
   * @param field - Nombre del campo a validar
   * @returns Mensaje de error o null si es válido
   */
  const validateField = (field: keyof T): string | null => {
    if (!validationRules[field]) return null;

    const rules = validationRules[field] as ValidationRule<T>[];
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
   * @returns true si todos los campos son válidos, false en caso contrario
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Limpiar errores anteriores
    Object.keys(errors).forEach(key => {
      (errors as any)[key] = null;
    });

    // Validar cada campo
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T);
      if (error) {
        (errors as any)[field] = error;
        isValid = false;
      }
    });

    return isValid;
  };

  /**
   * Maneja el cambio de valor de un campo
   * @param field - Nombre del campo
   * @param value - Nuevo valor
   */
  const handleChange = (field: keyof T, value: any): void => {
    (values as any)[field] = value;

    // Si el campo ha sido tocado, validarlo
    if ((touched as any)[field]) {
      (errors as any)[field] = validateField(field);
    }
  };

  /**
   * Maneja cuando un campo pierde el foco
   * @param field - Nombre del campo
   */
  const handleBlur = (field: keyof T): void => {
    (touched as any)[field] = true;
    (errors as any)[field] = validateField(field);
  };

  /**
   * Maneja el envío del formulario
   * @param e - Evento de envío
   */
  const handleSubmit = async (e?: Event): Promise<void> => {
    if (e) e.preventDefault();

    submitted.value = true;

    // Marcar todos los campos como tocados
    Object.keys(validationRules).forEach(field => {
      (touched as any)[field] = true;
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
  const resetForm = (): void => {
    // Restablecer valores
    Object.keys(values).forEach(key => {
      (values as any)[key] = initialValues[key] !== undefined ? initialValues[key] : '';
    });

    // Limpiar errores y estado de tocado
    Object.keys(errors).forEach(key => {
      (errors as any)[key] = undefined;
      (touched as any)[key] = false;
    });

    submitted.value = false;
  };

  /**
   * Establece los valores del formulario
   * @param newValues - Nuevos valores
   */
  const setValues = (newValues: Partial<T>): void => {
    Object.keys(newValues).forEach(key => {
      (values as any)[key] = (newValues as any)[key];
    });
  };

  /**
   * Establece los errores del formulario (útil para errores de API)
   * @param apiErrors - Errores de la API
   */
  const setErrors = (apiErrors: Record<string, string>): void => {
    Object.keys(apiErrors).forEach(key => {
      (errors as any)[key] = apiErrors[key];
    });
  };

  /**
   * Indica si el formulario es válido
   */
  const isValid = computed((): boolean => {
    return Object.keys(errors).every(key => !(errors as any)[key]);
  });

  /**
   * Indica si el formulario ha sido modificado
   */
  const isDirty = computed((): boolean => {
    return Object.keys(initialValues).some(key => initialValues[key] !== (values as any)[key]);
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
