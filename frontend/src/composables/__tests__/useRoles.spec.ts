import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoles } from '@/composables/useRoles';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

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

describe('useRoles', () => {
  let notificationStore;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Configurar mock del store de notificaciones
    notificationStore = {
      success: vi.fn(),
      error: vi.fn(),
      adminSuccess: vi.fn(),
      adminError: vi.fn()
    };
    useNotificationStore.mockReturnValue(notificationStore);
    
    // Mock API responses
    api.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Admin', slug: 'admin' },
          { id: 2, name: 'User', slug: 'user' }
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2
        }
      }
    });
  });
  
  it('should fetch roles', async () => {
    // Arrange
    const { roles, loading, pagination, fetchRoles } = useRoles();
    
    // Act
    await fetchRoles();
    
    // Assert
    expect(api.get).toHaveBeenCalledWith('/admin/roles', expect.any(Object));
    expect(roles.value).toHaveLength(2);
    expect(roles.value[0].name).toBe('Admin');
    expect(loading.value).toBe(false);
    expect(pagination.currentPage).toBe(1);
    expect(pagination.totalPages).toBe(1);
    expect(pagination.perPage).toBe(10);
  });
  
  it('should create a role', async () => {
    // Arrange
    const { createRole } = useRoles();
    const roleData = { name: 'Editor', slug: 'editor', permissions: [1, 2] };
    
    api.post.mockResolvedValue({
      data: { id: 3, name: 'Editor', slug: 'editor', permissions: [1, 2] }
    });
    
    // Act
    const result = await createRole(roleData);
    
    // Assert
    expect(api.post).toHaveBeenCalledWith('/admin/roles', roleData);
    expect(result).toEqual({ id: 3, name: 'Editor', slug: 'editor', permissions: [1, 2] });
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
  });
  
  it('should handle error when creating a role', async () => {
    // Arrange
    const { createRole } = useRoles();
    const roleData = { name: 'Editor', slug: 'editor', permissions: [1, 2] };
    
    api.post.mockRejectedValue(new Error('Failed to create role'));
    
    // Act
    const result = await createRole(roleData);
    
    // Assert
    expect(api.post).toHaveBeenCalledWith('/admin/roles', roleData);
    expect(result).toBeNull();
    expect(notificationStore.adminError).toHaveBeenCalled();
  });
  
  it('should update a role', async () => {
    // Arrange
    const { updateRole } = useRoles();
    const roleData = { name: 'Updated Admin', slug: 'admin', permissions: [1, 2, 3] };
    
    api.put.mockResolvedValue({
      data: { id: 1, name: 'Updated Admin', slug: 'admin', permissions: [1, 2, 3] }
    });
    
    // Act
    const result = await updateRole(1, roleData);
    
    // Assert
    expect(api.put).toHaveBeenCalledWith('/admin/roles/1', roleData);
    expect(result).toEqual({ id: 1, name: 'Updated Admin', slug: 'admin', permissions: [1, 2, 3] });
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
  });
  
  it('should handle error when updating a role', async () => {
    // Arrange
    const { updateRole } = useRoles();
    const roleData = { name: 'Updated Admin', slug: 'admin', permissions: [1, 2, 3] };
    
    api.put.mockRejectedValue(new Error('Failed to update role'));
    
    // Act
    const result = await updateRole(1, roleData);
    
    // Assert
    expect(api.put).toHaveBeenCalledWith('/admin/roles/1', roleData);
    expect(result).toBeNull();
    expect(notificationStore.adminError).toHaveBeenCalled();
  });
  
  it('should delete a role', async () => {
    // Arrange
    const { deleteRole } = useRoles();
    
    api.delete.mockResolvedValue({
      data: { success: true }
    });
    
    // Act
    const result = await deleteRole(1);
    
    // Assert
    expect(api.delete).toHaveBeenCalledWith('/admin/roles/1');
    expect(result).toBe(true);
    expect(notificationStore.adminSuccess).toHaveBeenCalled();
  });
  
  it('should handle error when deleting a role', async () => {
    // Arrange
    const { deleteRole } = useRoles();
    
    api.delete.mockRejectedValue(new Error('Failed to delete role'));
    
    // Act
    const result = await deleteRole(1);
    
    // Assert
    expect(api.delete).toHaveBeenCalledWith('/admin/roles/1');
    expect(result).toBe(false);
    expect(notificationStore.adminError).toHaveBeenCalled();
  });
  
  it('should change page', async () => {
    // Arrange
    const { changePage, pagination, fetchRoles } = useRoles();
    
    // Mock fetchRoles to avoid actual API call
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        data: [
          { id: 3, name: 'Editor', slug: 'editor' },
          { id: 4, name: 'Moderator', slug: 'moderator' }
        ],
        meta: {
          current_page: 2,
          last_page: 2,
          per_page: 10,
          total: 4
        }
      }
    });
    
    // Act
    await changePage(2);
    
    // Assert
    expect(pagination.currentPage).toBe(2);
    expect(api.get).toHaveBeenCalledWith('/admin/roles', expect.objectContaining({
      params: expect.objectContaining({ page: 2 })
    }));
  });
  
  it('should change per page', async () => {
    // Arrange
    const { changePerPage, pagination, fetchRoles } = useRoles();
    
    // Act
    await changePerPage(20);
    
    // Assert
    expect(pagination.perPage).toBe(20);
    expect(api.get).toHaveBeenCalledWith('/admin/roles', expect.objectContaining({
      params: expect.objectContaining({ per_page: 20 })
    }));
  });
  
  it('should update filters', async () => {
    // Arrange
    const { updateFilters, filters, fetchRoles } = useRoles();
    
    // Act
    await updateFilters({ search: 'admin' });
    
    // Assert
    expect(filters.search).toBe('admin');
    expect(api.get).toHaveBeenCalledWith('/admin/roles', expect.objectContaining({
      params: expect.objectContaining({ search: 'admin' })
    }));
  });
  
  it('should update sort', async () => {
    // Arrange
    const { updateSort, filters, fetchRoles } = useRoles();
    
    // Act
    await updateSort({ key: 'name', order: 'desc' });
    
    // Assert
    expect(filters.sort_field).toBe('name');
    expect(filters.sort_direction).toBe('desc');
    expect(api.get).toHaveBeenCalledWith('/admin/roles', expect.objectContaining({
      params: expect.objectContaining({ 
        sort_field: 'name',
        sort_direction: 'desc'
      })
    }));
  });
});
