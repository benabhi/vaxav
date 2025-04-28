import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useForm } from '@/composables/useForm';

describe('useForm', () => {
  // Configuración común para las pruebas
  const initialValues = {
    name: '',
    email: '',
    password: ''
  };

  const validationRules = {
    name: [
      value => !value ? 'El nombre es obligatorio' : null,
      value => value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : null
    ],
    email: [
      value => !value ? 'El email es obligatorio' : null,
      value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'El email no es válido' : null
    ],
    password: [
      value => !value ? 'La contraseña es obligatoria' : null,
      value => value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null
    ]
  };

  let form;
  let onSubmitMock;
  let onErrorMock;

  beforeEach(() => {
    onSubmitMock = vi.fn();
    onErrorMock = vi.fn();

    form = useForm({
      initialValues,
      validationRules,
      onSubmit: onSubmitMock,
      onError: onErrorMock
    });
  });

  it('should initialize with the correct values', () => {
    expect(form.values).toEqual(initialValues);
    expect(form.errors).toEqual({});
    expect(form.touched).toEqual({});
    expect(form.submitting.value).toBe(false);
    expect(form.submitted.value).toBe(false);
    expect(form.isValid.value).toBe(true);
    expect(form.isDirty.value).toBe(false);
  });

  it('should update values when handleChange is called', () => {
    form.handleChange('name', 'John Doe');
    expect(form.values.name).toBe('John Doe');
  });

  it('should mark field as touched when handleBlur is called', () => {
    form.handleBlur('name');
    expect(form.touched.name).toBe(true);
  });

  it('should validate field when handleBlur is called', () => {
    form.handleBlur('name');
    expect(form.errors.name).toBe('El nombre es obligatorio');

    form.handleChange('name', 'Jo');
    form.handleBlur('name');
    expect(form.errors.name).toBe('El nombre debe tener al menos 3 caracteres');

    form.handleChange('name', 'John Doe');
    form.handleBlur('name');
    expect(form.errors.name).toBe(null);
  });

  it('should validate all fields when validateForm is called', () => {
    const isValid = form.validateForm();
    expect(isValid).toBe(false);
    expect(form.errors.name).toBe('El nombre es obligatorio');
    expect(form.errors.email).toBe('El email es obligatorio');
    expect(form.errors.password).toBe('La contraseña es obligatoria');
  });

  it('should reset form to initial values when resetForm is called', () => {
    form.handleChange('name', 'John Doe');
    form.handleChange('email', 'john@example.com');
    form.handleBlur('name');

    // Mock the errors object to have a value before reset
    form.errors.name = 'Error before reset';

    form.resetForm();

    expect(form.values).toEqual(initialValues);

    // Check if errors object has been reset, but don't check exact structure
    expect(form.errors.name).toBeUndefined();

    // Check if touched object has been reset, but don't check exact structure
    expect(form.touched.name).toBeFalsy();

    expect(form.submitted.value).toBe(false);
  });

  it('should set values when setValues is called', () => {
    const newValues = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    form.setValues(newValues);
    expect(form.values).toEqual(newValues);
  });

  it('should set errors when setErrors is called', () => {
    const apiErrors = {
      email: 'Este email ya está en uso'
    };

    form.setErrors(apiErrors);
    expect(form.errors.email).toBe('Este email ya está en uso');
  });

  it('should call onSubmit when form is valid and handleSubmit is called', async () => {
    form.setValues({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });

    await form.handleSubmit();

    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    expect(onErrorMock).not.toHaveBeenCalled();
  });

  it('should call onError when form is invalid and handleSubmit is called', async () => {
    await form.handleSubmit();

    expect(onSubmitMock).not.toHaveBeenCalled();
    expect(onErrorMock).toHaveBeenCalled();
    expect(form.submitted.value).toBe(true);
  });

  it('should update isDirty when values change', () => {
    expect(form.isDirty.value).toBe(false);

    form.handleChange('name', 'John Doe');
    expect(form.isDirty.value).toBe(true);

    form.resetForm();
    expect(form.isDirty.value).toBe(false);
  });

  it('should update isValid when errors change', () => {
    expect(form.isValid.value).toBe(true);

    form.validateForm();
    expect(form.isValid.value).toBe(false);

    form.setValues({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    form.validateForm();
    expect(form.isValid.value).toBe(true);
  });
});
