import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useRoles } from '@/composables/useRoles';
import { useAuthStore } from '@/stores/auth';
import RolesView from '@/views/admin/RolesView.vue';

// Mock the API
vi.mock('@/services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  };
});

// Mock the notification store
vi.mock('@/stores/notification', () => {
  return {
    useNotificationStore: vi.fn()
  };
});

// Mock the auth store
vi.mock('@/stores/auth', () => {
  return {
    useAuthStore: vi.fn()
  };
});

// Mock the roles composable
vi.mock('@/composables/useRoles', () => {
  return {
    useRoles: vi.fn()
  };
});

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin/roles',
      name: 'roles',
      component: RolesView
    },
    {
      path: '/admin/roles/create',
      name: 'roles.create',
      component: { template: '<div>Create Role</div>' }
    },
    {
      path: '/admin/roles/:id/edit',
      name: 'roles.edit',
      component: { template: '<div>Edit Role</div>' }
    }
  ]
});

describe('RolesView', () => {
  let wrapper;
  let notificationStore;
  let authStore;
  let rolesMock;

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

    // Setup auth store mock
    authStore = {
      user: {
        is_superadmin: true,
        roles: [{ id: 1, name: 'Super Admin', slug: 'superadmin' }]
      }
    };
    useAuthStore.mockReturnValue(authStore);

    // Setup roles composable mock
    rolesMock = {
      roles: [
        {
          id: 1,
          name: 'Super Admin',
          slug: 'superadmin',
          description: 'Super administrator role',
          permissions: [
            { id: 1, name: 'View Users', slug: 'view-users' },
            { id: 2, name: 'Create Users', slug: 'create-users' }
          ]
        },
        {
          id: 2,
          name: 'Admin',
          slug: 'admin',
          description: 'Administrator role',
          permissions: [
            { id: 1, name: 'View Users', slug: 'view-users' }
          ]
        }
      ],
      loading: false,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        perPage: 10
      },
      filters: {
        search: '',
        sort_field: 'name',
        sort_direction: 'asc'
      },
      fetchRoles: vi.fn(),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      changePage: vi.fn(),
      changePerPage: vi.fn(),
      updateFilters: vi.fn(),
      updateSort: vi.fn()
    };
    useRoles.mockReturnValue(rolesMock);

    // Mount the component
    wrapper = mount(RolesView, {
      global: {
        plugins: [router],
        stubs: {
          AdminCrudView: true,
          BaseModal: true,
          BaseInput: true,
          BaseCheckbox: true,
          BaseButton: true
        }
      }
    });
  });

  it('should fetch roles on mount', () => {
    // Check if fetchRoles was called
    expect(rolesMock.fetchRoles).toHaveBeenCalled();
  });

  it('should navigate to create role page when clicking "Nuevo Rol" button', async () => {
    // Call the goToCreateRole method
    await wrapper.vm.goToCreateRole();

    // Check if router was redirected to create role page
    expect(router.currentRoute.value.path).toBe('/admin/roles/create');
  });

  it('should navigate to edit role page when clicking "Editar" button', async () => {
    // Call the editRole method with a role
    await wrapper.vm.editRole(rolesMock.roles[0]);

    // Check if router was redirected to edit role page
    expect(router.currentRoute.value.path).toBe('/admin/roles/1/edit');
  });

  it('should confirm delete role when clicking "Eliminar" button', async () => {
    // Call the confirmDeleteRole method with a role
    await wrapper.vm.confirmDeleteRole(rolesMock.roles[0]);

    // Check if showDeleteModal is true
    expect(wrapper.vm.showDeleteModal).toBe(true);

    // Check if roleToDelete is set
    expect(wrapper.vm.roleToDelete).toEqual(rolesMock.roles[0]);
  });

  it('should delete role when confirming deletion', async () => {
    // Setup
    wrapper.vm.roleToDelete = rolesMock.roles[0];
    wrapper.vm.showDeleteModal = true;

    // Call the deleteRole method
    await wrapper.vm.deleteRole();

    // Check if deleteRole was called
    expect(rolesMock.deleteRole).toHaveBeenCalledWith(1);

    // Check if showDeleteModal is false
    expect(wrapper.vm.showDeleteModal).toBe(false);

    // Check if roleToDelete is null
    expect(wrapper.vm.roleToDelete).toBeNull();
  });

  it('should cancel delete when clicking "Cancelar" button', async () => {
    // Setup
    wrapper.vm.roleToDelete = rolesMock.roles[0];
    wrapper.vm.showDeleteModal = true;

    // Call the cancelDelete method
    await wrapper.vm.cancelDelete();

    // Check if showDeleteModal is false
    expect(wrapper.vm.showDeleteModal).toBe(false);

    // Check if roleToDelete is null
    expect(wrapper.vm.roleToDelete).toBeNull();
  });

  it('should check if user is superadmin', () => {
    // Check if isSuperAdmin is true
    expect(wrapper.vm.isSuperAdmin).toBe(true);

    // Change user to non-superadmin
    authStore.user = {
      is_superadmin: false,
      roles: [{ id: 2, name: 'Admin', slug: 'admin' }]
    };

    // Check if isSuperAdmin is false
    expect(wrapper.vm.isSuperAdmin).toBe(false);
  });
});
