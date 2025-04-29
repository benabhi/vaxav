import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import UserEditView from '@/views/admin/UserEditView.vue';

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

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin/users',
      name: 'users',
      component: { template: '<div>Users</div>' }
    },
    {
      path: '/admin/users/:id/edit',
      name: 'users.edit',
      component: UserEditView
    }
  ]
});

/**
 * Improved UserEditView tests
 * 
 * These tests focus on the business logic rather than DOM interactions.
 * They test:
 * 1. Data fetching
 * 2. Form submission
 * 3. Error handling
 * 4. Navigation
 * 
 * We avoid testing implementation details like DOM structure.
 */
describe('UserEditView', () => {
  let notificationStore;
  let formMock;
  let onSubmitHandler;

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
        name: 'Test User',
        email: 'test@example.com',
        password: '',
        password_confirmation: '',
        roles: [4]
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

    // Mock API response for user fetch
    api.get.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: [{ id: 4, name: 'Usuario', slug: 'user' }]
      }
    });

    // Set route params
    router.push('/admin/users/1/edit');
    
    // Capture the onSubmit handler when useForm is called
    useForm.mockImplementation((options) => {
      onSubmitHandler = options.onSubmit;
      return formMock;
    });
  });

  /**
   * Test: Data fetching
   * 
   * This test verifies that the component fetches user data
   * from the API and sets the form values correctly.
   */
  it('fetches user data and populates the form', async () => {
    // Import the component to trigger onMounted
    const { onMounted } = await import('vue');
    const mountedCallbacks = [];
    
    // Mock onMounted to capture the callback
    vi.spyOn(onMounted, 'default').mockImplementation(fn => {
      mountedCallbacks.push(fn);
    });
    
    // Load the component (this will register the onMounted callback)
    await import('@/views/admin/UserEditView.vue');
    
    // Execute all onMounted callbacks
    for (const callback of mountedCallbacks) {
      await callback();
    }
    
    // Check if API was called with correct ID
    expect(api.get).toHaveBeenCalledWith('/admin/users/1');
    
    // Wait for promises to resolve
    await flushPromises();
    
    // Check if setValues was called with correct data
    expect(formMock.setValues).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: '',
      password_confirmation: '',
      roles: [4]
    });
  });

  /**
   * Test: Form submission
   * 
   * This test verifies that the form submission handler
   * sends the correct data to the API and handles success.
   */
  it('submits form data to update the user', async () => {
    // Mock API response for user update
    api.put.mockResolvedValue({
      data: {
        id: 1,
        name: 'Updated User',
        email: 'test@example.com',
        roles: [{ id: 4, name: 'Usuario', slug: 'user' }]
      }
    });

    // Call the onSubmit handler directly with form values
    await onSubmitHandler({
      name: 'Updated User',
      email: 'test@example.com',
      password: '',
      password_confirmation: '',
      roles: [4]
    });

    // Check if API was called with correct data
    expect(api.put).toHaveBeenCalledWith('/admin/users/1', {
      name: 'Updated User',
      email: 'test@example.com',
      roles: [4]
    });

    // Check if success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();

    // Check if router was redirected to users list
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/admin/users');
  });

  /**
   * Test: Password handling
   * 
   * This test verifies that the password fields are only
   * included in the API request when a new password is provided.
   */
  it('only includes password in API request when provided', async () => {
    // Mock API response for user update
    api.put.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: [{ id: 4, name: 'Usuario', slug: 'user' }]
      }
    });

    // Case 1: Empty password (should be excluded)
    await onSubmitHandler({
      name: 'Test User',
      email: 'test@example.com',
      password: '',
      password_confirmation: '',
      roles: [4]
    });

    // Check that password fields were excluded
    expect(api.put).toHaveBeenCalledWith('/admin/users/1', {
      name: 'Test User',
      email: 'test@example.com',
      roles: [4]
    });

    // Reset mock
    api.put.mockClear();

    // Case 2: New password provided (should be included)
    await onSubmitHandler({
      name: 'Test User',
      email: 'test@example.com',
      password: 'newpassword',
      password_confirmation: 'newpassword',
      roles: [4]
    });

    // Check that password fields were included
    expect(api.put).toHaveBeenCalledWith('/admin/users/1', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'newpassword',
      password_confirmation: 'newpassword',
      roles: [4]
    });
  });

  /**
   * Test: API error handling
   * 
   * This test verifies that API errors are handled correctly
   * and form errors are set appropriately.
   */
  it('handles API errors and sets form errors', async () => {
    // Mock API error response
    const errorResponse = {
      response: {
        data: {
          errors: {
            email: ['El correo electrónico ya está en uso.']
          }
        }
      }
    };
    api.put.mockRejectedValue(errorResponse);

    // Call the onSubmit handler and expect it to throw
    try {
      await onSubmitHandler({
        name: 'Test User',
        email: 'test@example.com',
        password: '',
        password_confirmation: '',
        roles: [4]
      });
      // If we get here, the function didn't throw as expected
      expect(true).toBe(false);
    } catch (error) {
      // Error is expected
    }

    // Check if API was called
    expect(api.put).toHaveBeenCalled();

    // Check if setErrors was called with the correct error
    expect(formMock.setErrors).toHaveBeenCalledWith({
      email: 'El correo electrónico ya está en uso.'
    });
  });

  /**
   * Test: Navigation
   * 
   * This test verifies that the goBack function
   * redirects to the users list.
   */
  it('navigates back to users list', async () => {
    // Import the component to get the goBack function
    const component = await import('@/views/admin/UserEditView.vue');
    
    // Call the goBack function
    component.goBack();
    
    // Check if router was redirected to users list
    expect(router.currentRoute.value.path).toBe('/admin/users');
  });
});
