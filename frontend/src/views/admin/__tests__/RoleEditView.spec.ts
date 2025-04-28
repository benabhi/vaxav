import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useForm } from '@/composables/useForm';
import RoleEditView from '@/views/admin/RoleEditView.vue';

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
      path: '/admin/roles',
      name: 'roles',
      component: { template: '<div>Roles</div>' }
    },
    {
      path: '/admin/roles/:id/edit',
      name: 'roles.edit',
      component: RoleEditView
    }
  ]
});

describe('RoleEditView', () => {
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
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
        permissions: [1, 2]
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

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/admin/roles/1') {
        return Promise.resolve({
          data: {
            id: 1,
            name: 'Test Role',
            slug: 'test-role',
            description: 'Test role description',
            permissions: [
              { id: 1, name: 'View Users', slug: 'view-users' },
              { id: 2, name: 'Create Users', slug: 'create-users' }
            ]
          }
        });
      } else if (url === '/admin/permissions') {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, name: 'View Users', slug: 'view-users' },
              { id: 2, name: 'Create Users', slug: 'create-users' },
              { id: 3, name: 'Edit Users', slug: 'edit-users' },
              { id: 4, name: 'Delete Users', slug: 'delete-users' }
            ]
          }
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Set route params
    router.push('/admin/roles/1/edit');

    // Mount the component
    wrapper = mount(RoleEditView, {
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
    expect(wrapper.find('h2').text()).toBe('Editar Rol');
  });

  it('should fetch role data on mount', async () => {
    // Check if API was called with correct ID
    expect(api.get).toHaveBeenCalledWith('/admin/roles/1');

    // Wait for promises to resolve
    await flushPromises();

    // Check if setValues was called with correct data
    expect(useForm().setValues).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      permissions: [1, 2]
    }));
  });

  it('should fetch permissions on mount', async () => {
    // Check if API was called
    expect(api.get).toHaveBeenCalledWith('/admin/permissions');

    // Wait for promises to resolve
    await flushPromises();

    // Check if permissions are available
    expect(wrapper.vm.availablePermissions).toHaveLength(4);
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

  it('should update role when form is submitted', async () => {
    // Mock API response for role update
    api.put.mockResolvedValue({
      data: {
        id: 1,
        name: 'Updated Role',
        slug: 'test-role',
        description: 'Updated description',
        permissions: [
          { id: 1, name: 'View Users', slug: 'view-users' },
          { id: 2, name: 'Create Users', slug: 'create-users' }
        ]
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
      name: 'Updated Role',
      slug: 'test-role',
      description: 'Updated description',
      permissions: [1, 2]
    });

    // Check if API was called with correct data
    expect(api.put).toHaveBeenCalledWith('/admin/roles/1', expect.objectContaining({
      name: 'Updated Role',
      slug: 'test-role',
      description: 'Updated description',
      permissions: [1, 2]
    }));

    // Check if success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();

    // Check if router was redirected to roles list
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/admin/roles');
  });

  it('should handle API errors', async () => {
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

    // Manually call the onSubmit function
    const onSubmit = useForm.mock.calls[0][0].onSubmit;
    try {
      await onSubmit({
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
        permissions: [1, 2]
      });
    } catch (error) {
      // Error is expected
    }

    // Check if API was called
    expect(api.put).toHaveBeenCalled();

    // Check if setErrors was called with the correct error
    expect(useForm().setErrors).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'El slug ya está en uso.'
    }));
  });

  it('should go back to roles list when cancel button is clicked', async () => {
    // Find the cancel button
    const buttons = wrapper.findAll('button');
    const cancelButton = buttons[buttons.length - 1]; // Usually the last button

    // Click the cancel button
    await cancelButton.trigger('click');

    // Check if router was redirected to roles list
    expect(router.currentRoute.value.path).toBe('/admin/roles');
  });

  it('should disable slug field for system roles', async () => {
    // Set a system role
    useForm().values.slug = 'admin';

    // Wait for the component to update
    await wrapper.vm.$nextTick();

    // Check if isSystemRole is true
    expect(wrapper.vm.isSystemRole).toBe(true);

    // Find the slug input
    const slugInput = wrapper.findComponent({ ref: 'slug' });

    // Check if it's disabled
    expect(slugInput.attributes('disabled')).toBeDefined();
  });
});
