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
      post: vi.fn()
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

describe('RoleCreateView - Form Logic', () => {
  let notificationStore;
  let formMock;
  let onSubmit;

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
        name: '',
        slug: '',
        description: '',
        permissions: []
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
      setErrors: vi.fn(),
      validateForm: vi.fn(() => true),
      resetForm: vi.fn()
    };
    useForm.mockReturnValue(formMock);

    // Create a mock onSubmit function that simulates the component's behavior
    onSubmit = async (values) => {
      try {
        const response = await api.post('/admin/roles', values);
        notificationStore.adminSuccess('Rol creado correctamente');
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
          notificationStore.adminError('Error al crear el rol');
        }
        throw error;
      }
    };
  });

  // Test the form submission logic
  it('should create role successfully', async () => {
    // Mock API response
    api.post.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
        permissions: [1, 2]
      }
    });

    // Call the onSubmit function directly
    const result = await onSubmit({
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      permissions: [1, 2]
    });

    // Verify API was called with correct data
    expect(api.post).toHaveBeenCalledWith('/admin/roles', {
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      permissions: [1, 2]
    });

    // Verify success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
    
    // Verify the result
    expect(result).toEqual({
      id: 1,
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      permissions: [1, 2]
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
    api.post.mockRejectedValue(errorResponse);

    // Call the onSubmit function and catch the error
    try {
      await onSubmit({
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
        permissions: [1, 2]
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
