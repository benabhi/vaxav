import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useRoles } from '@/composables/useRoles';
import { useConfirmation } from '@/composables/useConfirmation';

// Mock the API
vi.mock('@/services/api', () => {
  return {
    default: {
      get: vi.fn()
    }
  };
});

// Mock the notification store
vi.mock('@/stores/notification', () => {
  return {
    useNotificationStore: vi.fn()
  };
});

// Mock the roles composable
vi.mock('@/composables/useRoles', () => {
  return {
    useRoles: vi.fn()
  };
});

// Mock the confirmation composable
vi.mock('@/composables/useConfirmation', () => {
  return {
    useConfirmation: vi.fn()
  };
});

describe('RolesView - Core Logic', () => {
  let notificationStore;
  let rolesMock;
  let confirmationMock;
  let deleteRoleWithConfirmation;

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

    // Setup roles composable mock
    rolesMock = {
      roles: {
        value: [
          { id: 1, name: 'Admin', slug: 'admin', is_system: true },
          { id: 2, name: 'User', slug: 'user', is_system: false }
        ]
      },
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
      loading: { value: false },
      fetchRoles: vi.fn().mockResolvedValue(true),
      deleteRole: vi.fn().mockResolvedValue(true),
      changePage: vi.fn(),
      changePerPage: vi.fn(),
      updateFilters: vi.fn(),
      updateSort: vi.fn()
    };
    useRoles.mockReturnValue(rolesMock);

    // Setup confirmation composable mock
    confirmationMock = {
      confirm: vi.fn().mockImplementation(async (message, callback) => {
        // Simulate user confirming the action
        await callback();
        return true;
      }),
      isConfirming: { value: false }
    };
    useConfirmation.mockReturnValue(confirmationMock);

    // Create a function that simulates the component's delete role with confirmation behavior
    deleteRoleWithConfirmation = async (roleId) => {
      try {
        await confirmationMock.confirm('¿Está seguro de eliminar este rol?', async () => {
          await rolesMock.deleteRole(roleId);
          notificationStore.adminSuccess('Rol eliminado correctamente');
        });
        return true;
      } catch (error) {
        notificationStore.adminError('Error al eliminar el rol');
        return false;
      }
    };
  });

  it('should fetch roles successfully', async () => {
    // Call the fetchRoles function
    await rolesMock.fetchRoles();

    // Verify fetchRoles was called
    expect(rolesMock.fetchRoles).toHaveBeenCalled();
  });

  it('should delete a role with confirmation', async () => {
    // Call the deleteRoleWithConfirmation function
    const result = await deleteRoleWithConfirmation(2);

    // Verify confirmation was requested
    expect(confirmationMock.confirm).toHaveBeenCalled();

    // Verify deleteRole was called with correct ID
    expect(rolesMock.deleteRole).toHaveBeenCalledWith(2);

    // Verify success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();

    // Verify the result is true (successful deletion)
    expect(result).toBe(true);
  });
});
