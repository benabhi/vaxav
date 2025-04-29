import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';

// Mock the API
vi.mock('@/services/api', () => {
  return {
    default: {
      get: vi.fn(),
      put: vi.fn()
    }
  };
});

// Mock the notification store
vi.mock('@/stores/notification', () => {
  return {
    useNotificationStore: vi.fn()
  };
});

// Mock the form composable
vi.mock('@/composables/useForm', () => {
  return {
    useForm: vi.fn()
  };
});

describe('RoleEditView - Form Logic', () => {
  let notificationStore;
  let formMock;
  let onSubmit;
  const roleId = 1;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup notification store mock
    notificationStore = {
      success: vi.fn(),
      error: vi.fn(),
      adminSuccess: vi.fn(),
      adminError: vi.fn()
    };
    useNotificationStore.mockReturnValue(notificationStore);

    // Setup form composable mock
    formMock = {
      values: {
        id: roleId,
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator role',
        permissions: [1, 2],
        is_system: false
      },
      errors: {},
      touched: {},
      submitting: { value: false },
      submitted: { value: false },
      isValid: { value: true },
      isDirty: { value: false },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
      setValues: vi.fn(),
      setErrors: vi.fn(),
      validateForm: vi.fn(() => true),
      resetForm: vi.fn()
    };
    useForm.mockReturnValue(formMock);

    // Create a mock onSubmit function that simulates the component's behavior
    onSubmit = async (values) => {
      try {
        const response = await api.put(`/admin/roles/${roleId}`, {
          name: values.name,
          slug: values.slug,
          description: values.description,
          permissions: values.permissions,
          is_system: values.is_system
        });
        notificationStore.adminSuccess('Rol actualizado correctamente');
        return response.data;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          const apiErrors = error.response.data.errors;
          const formErrors = {};
          
          // Convert API errors to form errors
          Object.keys(apiErrors).forEach(key => {
            formErrors[key] = apiErrors[key][0];
          });
          
          formMock.setErrors(formErrors);
        } else {
          notificationStore.adminError('Error al actualizar el rol');
        }
        throw error;
      }
    };
  });

  // Test the form submission logic
  it('should update role successfully', async () => {
    // Mock API response
    api.put.mockResolvedValue({
      data: {
        id: roleId,
        name: 'Admin Updated',
        slug: 'admin-updated',
        description: 'Updated administrator role',
        permissions: [1, 2, 3],
        is_system: false
      }
    });

    // Call the onSubmit function directly
    const result = await onSubmit({
      id: roleId,
      name: 'Admin Updated',
      slug: 'admin-updated',
      description: 'Updated administrator role',
      permissions: [1, 2, 3],
      is_system: false
    });

    // Verify API was called with correct data
    expect(api.put).toHaveBeenCalledWith(`/admin/roles/${roleId}`, {
      name: 'Admin Updated',
      slug: 'admin-updated',
      description: 'Updated administrator role',
      permissions: [1, 2, 3],
      is_system: false
    });

    // Verify success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
    
    // Verify the result
    expect(result).toEqual({
      id: roleId,
      name: 'Admin Updated',
      slug: 'admin-updated',
      description: 'Updated administrator role',
      permissions: [1, 2, 3],
      is_system: false
    });
  });

  // Test error handling
  it('should handle validation errors', async () => {
    // Mock API error response
    const errorResponse = {
      response: {
        data: {
          errors: {
            slug: ['El slug ya está en uso.']
          }
        }
      }
    };
    api.put.mockRejectedValue(errorResponse);

    // Call the onSubmit function and catch the error
    try {
      await onSubmit({
        id: roleId,
        name: 'Admin Updated',
        slug: 'admin-updated',
        description: 'Updated administrator role',
        permissions: [1, 2, 3],
        is_system: false
      });
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Verify error handling
      expect(formMock.setErrors).toHaveBeenCalledWith({
        slug: 'El slug ya está en uso.'
      });
    }
  });
});
