import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import UserCreateView from '@/views/admin/UserCreateView.vue';

// Mock the API
vi.mock('@/services/api', () => {
  return {
    default: {
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
      path: '/admin/users/create',
      name: 'users.create',
      component: UserCreateView
    }
  ]
});

describe('UserCreateView', () => {
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
        name: '',
        email: '',
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
      setErrors: vi.fn(),
      validateForm: vi.fn(() => true),
      resetForm: vi.fn()
    };
    useForm.mockReturnValue(formMock);

    // Reset router
    router.push('/admin/users/create');

    // Mount the component
    wrapper = mount(UserCreateView, {
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
    expect(wrapper.find('h2').text()).toBe('Crear Nuevo Usuario');
  });

  it('should have the correct initial values', () => {
    // Check if the form has the correct initial values
    expect(useForm).toHaveBeenCalledWith(expect.objectContaining({
      initialValues: expect.objectContaining({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [4]
      })
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

  it('should have a cancel button that redirects to users list', async () => {
    // Find the cancel button
    const buttons = wrapper.findAll('button');
    const cancelButton = buttons[buttons.length - 1]; // Usually the last button

    // Click the cancel button
    await cancelButton.trigger('click');

    // Check if router was redirected to users list
    expect(router.currentRoute.value.path).toBe('/admin/users');
  });
});
