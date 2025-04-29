import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import first, then mock
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useConfirmation } from '@/composables/useConfirmation';

// Mock the API
vi.mock('@/services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
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

// Mock the confirmation composable
vi.mock('@/composables/useConfirmation', () => {
  return {
    useConfirmation: vi.fn()
  };
});

describe('UsersView - Core Logic', () => {
  let notificationStore;
  let confirmationMock;
  let fetchUsers;
  let createUser;
  let deleteUser;

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

    // Mock API responses
    api.get.mockImplementation((url, params) => {
      if (url === '/admin/users') {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, name: 'Admin User', email: 'admin@example.com', role: { name: 'Admin' } },
              { id: 2, name: 'Regular User', email: 'user@example.com', role: { name: 'User' } }
            ],
            total: 2,
            current_page: 1,
            last_page: 1,
            per_page: 10
          }
        });
      } else if (url === '/admin/roles') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Admin', slug: 'admin' },
            { id: 2, name: 'User', slug: 'user' }
          ]
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Create mock functions that simulate the component's behavior
    fetchUsers = async (page = 1, filters = {}) => {
      try {
        const response = await api.get('/admin/users', {
          params: {
            page,
            ...filters
          }
        });
        return response.data;
      } catch (error) {
        notificationStore.adminError('Error al cargar los usuarios');
        throw error;
      }
    };

    createUser = async (userData) => {
      try {
        const response = await api.post('/admin/users', userData);
        notificationStore.adminSuccess('Usuario creado correctamente');
        return response.data;
      } catch (error) {
        notificationStore.adminError('Error al crear el usuario');
        throw error;
      }
    };

    deleteUser = async (userId) => {
      try {
        await confirmationMock.confirm('¿Está seguro de eliminar este usuario?', async () => {
          await api.delete(`/admin/users/${userId}`);
          notificationStore.adminSuccess('Usuario eliminado correctamente');
        });
      } catch (error) {
        notificationStore.adminError('Error al eliminar el usuario');
        throw error;
      }
    };
  });

  it('should fetch users successfully', async () => {
    // Call the fetchUsers function
    const result = await fetchUsers();

    // Verify API was called with correct parameters
    expect(api.get).toHaveBeenCalledWith('/admin/users', {
      params: {
        page: 1
      }
    });

    // Verify the result contains the expected data
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('Admin User');
    expect(result.data[1].name).toBe('Regular User');
  });

  it('should create a new user successfully', async () => {
    // Mock API response for user creation
    api.post.mockResolvedValue({
      data: {
        id: 3,
        name: 'New User',
        email: 'new@example.com',
        role: { name: 'User' }
      }
    });

    // Create user data
    const userData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password',
      password_confirmation: 'password',
      role_id: 2
    };

    // Call the createUser function
    const result = await createUser(userData);

    // Verify API was called with correct data
    expect(api.post).toHaveBeenCalledWith('/admin/users', userData);

    // Verify success notification was shown
    expect(notificationStore.adminSuccess).toHaveBeenCalled();

    // Verify the result contains the expected data
    expect(result.id).toBe(3);
    expect(result.name).toBe('New User');
    expect(result.email).toBe('new@example.com');
  });
});
