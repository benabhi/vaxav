import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

describe('UserEditView', () => {
  let wrapper;
  let notificationStore;

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
    const formMock = {
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

    // Mount the component
    wrapper = mount(UserEditView, {
      global: {
        plugins: [router],
        stubs: {
          AdminLayout: true,
          BaseBreadcrumb: true,
          BaseInput: true,
          BaseCheckbox: true,
          BaseButton: true
        }
      }
    });
  });

  it('should render the form', () => {
    // Check if the form is rendered
    expect(wrapper.find('form').exists()).toBe(true);

    // Check if the title is correct
    expect(wrapper.find('h2').text()).toBe('Editar Usuario');
  });

  it('should fetch user data on mount', async () => {
    // Check if API was called with correct ID
    expect(api.get).toHaveBeenCalledWith('/admin/users/1');

    // Wait for promises to resolve
    await flushPromises();

    // Check if setValues was called with correct data
    expect(useForm().setValues).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test User',
      email: 'test@example.com',
      roles: [4]
    }));
  });

  it('should have validation rules', () => {
    // Check if the form has validation rules
    expect(useForm).toHaveBeenCalledWith(expect.objectContaining({
      validationRules: expect.any(Object)
    }));
  });

  it('should have a submit handler', () => {
    // Check if the form has a submit handler
    expect(useForm).toHaveBeenCalledWith(expect.objectContaining({
      onSubmit: expect.any(Function)
    }));
  });

  it('should update user when form is submitted', async () => {
    // Mock API response for user update
    api.put.mockResolvedValue({
      data: {
        id: 1,
        name: 'Updated User',
        email: 'test@example.com',
        roles: [{ id: 4, name: 'Usuario', slug: 'user' }]
      }
    });

    // Get the form
    const form = wrapper.find('form');

    // Submit the form
    await form.trigger('submit');

    // Check if handleSubmit was called
    expect(useForm().handleSubmit).toHaveBeenCalled();

    // Manually call the onSubmit function
    const onSubmit = useForm.mock.calls[0][0].onSubmit;
    await onSubmit({
      name: 'Updated User',
      email: 'test@example.com',
      password: '',
      password_confirmation: '',
      roles: [4]
    });

    // Check if API was called with correct data
    expect(api.put).toHaveBeenCalledWith('/admin/users/1', expect.objectContaining({
      name: 'Updated User',
      email: 'test@example.com',
      roles: [4]
    }));

    // Check if success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();

    // Check if router was redirected to users list
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/admin/users');
  });

  it('should handle API errors', async () => {
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

    // Manually call the onSubmit function
    const onSubmit = useForm.mock.calls[0][0].onSubmit;
    try {
      await onSubmit({
        name: 'Test User',
        email: 'test@example.com',
        password: '',
        password_confirmation: '',
        roles: [4]
      });
    } catch (error) {
      // Error is expected
    }

    // Check if API was called
    expect(api.put).toHaveBeenCalled();

    // Check if setErrors was called with the correct error
    expect(useForm().setErrors).toHaveBeenCalledWith(expect.objectContaining({
      email: 'El correo electrónico ya está en uso.'
    }));
  });

  it('should go back to users list when cancel button is clicked', async () => {
    // Find the cancel button
    const buttons = wrapper.findAll('button');
    const cancelButton = buttons[buttons.length - 1]; // Usually the last button

    // Click the cancel button
    await cancelButton.trigger('click');

    // Check if router was redirected to users list
    expect(router.currentRoute.value.path).toBe('/admin/users');
  });
});
