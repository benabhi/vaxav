import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions } from '@/composables/usePermissions';

// Import first, then mock
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

describe('usePermissions', () => {
  let permissions;
  let notificationStore;

  beforeEach(() => {
    // Resetear mocks
    vi.clearAllMocks();

    // Configurar mock del store de notificaciones
    notificationStore = {
      success: vi.fn(),
      error: vi.fn(),
      adminSuccess: vi.fn(),
      adminError: vi.fn()
    };
    useNotificationStore.mockReturnValue(notificationStore);

    // Inicializar el composable
    permissions = usePermissions();
  });

  describe('fetchPermissions', () => {
    it('should fetch permissions successfully', async () => {
      // Configurar mock de la API
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'Create Users', slug: 'create-users' },
            { id: 2, name: 'Edit Users', slug: 'edit-users' }
          ],
          total: 2,
          current_page: 1,
          last_page: 1
        }
      };

      api.get.mockResolvedValue(mockResponse);

      // Llamar al método
      await permissions.fetchPermissions();

      // Verificar que la API fue llamada correctamente
      expect(api.get).toHaveBeenCalledWith('/admin/permissions', {
        params: {
          search: '',
          sort_field: 'name',
          sort_direction: 'asc',
          page: 1,
          per_page: 10
        }
      });

      // Verificar que los datos se actualizaron correctamente
      expect(permissions.permissions.value).toEqual(mockResponse.data.data);
      expect(permissions.pagination.totalPages).toBe(1);
      expect(permissions.pagination.currentPage).toBe(1);
      expect(permissions.loading.value).toBe(false);
    });

    it('should handle API error', async () => {
      // Configurar mock de la API para simular un error
      api.get.mockRejectedValue(new Error('API Error'));

      // Llamar al método
      await permissions.fetchPermissions();

      // Verificar que los datos se actualizaron correctamente en caso de error
      expect(permissions.permissions.value).toEqual([]);
      expect(permissions.pagination.totalPages).toBe(1);
      expect(permissions.loading.value).toBe(false);
    });
  });

  describe('createPermission', () => {
    it('should create permission successfully', async () => {
      // Configurar mock de la API
      const mockResponse = {
        data: { id: 1, name: 'Create Users', slug: 'create-users' }
      };

      api.post.mockResolvedValue(mockResponse);

      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // Datos del permiso a crear
      const permissionData = {
        name: 'Create Users',
        slug: 'create-users'
      };

      // Llamar al método
      const result = await permissions.createPermission(permissionData);

      // Verificar que la API fue llamada correctamente
      expect(api.post).toHaveBeenCalledWith('/admin/permissions', permissionData);

      // Verificar que se mostró una notificación de éxito
      expect(notificationStore.adminSuccess).toHaveBeenCalled();

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();

      // Verificar que se devolvió el resultado correcto
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when creating permission', async () => {
      // Configurar mock de la API para simular un error
      api.post.mockRejectedValue(new Error('API Error'));

      // Datos del permiso a crear
      const permissionData = {
        name: 'Create Users',
        slug: 'create-users'
      };

      // Llamar al método
      const result = await permissions.createPermission(permissionData);

      // Verificar que se mostró una notificación de error
      expect(notificationStore.adminError).toHaveBeenCalled();

      // Verificar que se devolvió null en caso de error
      expect(result).toBeNull();
    });
  });

  describe('updatePermission', () => {
    it('should update permission successfully', async () => {
      // Configurar mock de la API
      const mockResponse = {
        data: { id: 1, name: 'Create Users Updated', slug: 'create-users' }
      };

      api.put.mockResolvedValue(mockResponse);

      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // ID y datos del permiso a actualizar
      const permissionId = 1;
      const permissionData = {
        name: 'Create Users Updated',
        slug: 'create-users'
      };

      // Llamar al método
      const result = await permissions.updatePermission(permissionId, permissionData);

      // Verificar que la API fue llamada correctamente
      expect(api.put).toHaveBeenCalledWith(`/admin/permissions/${permissionId}`, permissionData);

      // Verificar que se mostró una notificación de éxito
      expect(notificationStore.adminSuccess).toHaveBeenCalled();

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();

      // Verificar que se devolvió el resultado correcto
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when updating permission', async () => {
      // Configurar mock de la API para simular un error
      api.put.mockRejectedValue(new Error('API Error'));

      // ID y datos del permiso a actualizar
      const permissionId = 1;
      const permissionData = {
        name: 'Create Users Updated',
        slug: 'create-users'
      };

      // Llamar al método
      const result = await permissions.updatePermission(permissionId, permissionData);

      // Verificar que se mostró una notificación de error
      expect(notificationStore.adminError).toHaveBeenCalled();

      // Verificar que se devolvió null en caso de error
      expect(result).toBeNull();
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      // Configurar mock de la API
      api.delete.mockResolvedValue({});

      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // ID del permiso a eliminar
      const permissionId = 1;

      // Llamar al método
      const result = await permissions.deletePermission(permissionId);

      // Verificar que la API fue llamada correctamente
      expect(api.delete).toHaveBeenCalledWith(`/admin/permissions/${permissionId}`);

      // Verificar que se mostró una notificación de éxito
      expect(notificationStore.adminSuccess).toHaveBeenCalled();

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();

      // Verificar que se devolvió true en caso de éxito
      expect(result).toBe(true);
    });

    it('should handle API error when deleting permission', async () => {
      // Configurar mock de la API para simular un error
      api.delete.mockRejectedValue(new Error('API Error'));

      // ID del permiso a eliminar
      const permissionId = 1;

      // Llamar al método
      const result = await permissions.deletePermission(permissionId);

      // Verificar que se mostró una notificación de error
      expect(notificationStore.adminError).toHaveBeenCalled();

      // Verificar que se devolvió false en caso de error
      expect(result).toBe(false);
    });

    it('should handle 403 error when deleting permission', async () => {
      // Configurar mock de la API para simular un error 403
      const error = new Error('Forbidden');
      error.response = { status: 403 };
      api.delete.mockRejectedValue(error);

      // ID del permiso a eliminar
      const permissionId = 1;

      // Llamar al método
      const result = await permissions.deletePermission(permissionId);

      // Verificar que se mostró una notificación de error específica
      expect(notificationStore.adminError).toHaveBeenCalledWith(
        expect.stringContaining('No tienes permiso')
      );

      // Verificar que se devolvió false en caso de error
      expect(result).toBe(false);
    });
  });

  describe('pagination and filtering', () => {
    it('should change page and fetch permissions', async () => {
      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // Llamar al método
      permissions.changePage(2);

      // Verificar que se actualizó la página actual
      expect(permissions.pagination.currentPage).toBe(2);

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();
    });

    it('should change per page and fetch permissions', async () => {
      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // Llamar al método
      permissions.changePerPage(20);

      // Verificar que se actualizó el número de elementos por página
      expect(permissions.pagination.perPage).toBe(20);

      // Verificar que se reinició la página actual
      expect(permissions.pagination.currentPage).toBe(1);

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();
    });

    it('should update filters and fetch permissions', async () => {
      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // Nuevos filtros
      const newFilters = {
        search: 'create',
        sort_field: 'slug',
        sort_direction: 'desc'
      };

      // Llamar al método
      permissions.updateFilters(newFilters);

      // Verificar que se actualizaron los filtros
      expect(permissions.filters.search).toBe('create');
      expect(permissions.filters.sort_field).toBe('slug');
      expect(permissions.filters.sort_direction).toBe('desc');

      // Verificar que se reinició la página actual
      expect(permissions.pagination.currentPage).toBe(1);

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();
    });

    it('should update sort and fetch permissions', async () => {
      // Mock de fetchPermissions para evitar llamadas reales
      permissions.fetchPermissions = vi.fn();

      // Datos de ordenación
      const sortData = {
        key: 'slug',
        order: 'desc'
      };

      // Llamar al método
      permissions.updateSort(sortData);

      // Verificar que se actualizaron los filtros de ordenación
      expect(permissions.filters.sort_field).toBe('slug');
      expect(permissions.filters.sort_direction).toBe('desc');

      // Verificar que se actualizó la lista de permisos
      expect(permissions.fetchPermissions).toHaveBeenCalled();
    });
  });

  describe('getAllPermissions', () => {
    it('should fetch all permissions without pagination', async () => {
      // Configurar mock de la API
      const mockResponse = {
        data: [
          { id: 1, name: 'Create Users', slug: 'create-users' },
          { id: 2, name: 'Edit Users', slug: 'edit-users' }
        ]
      };

      api.get.mockResolvedValue(mockResponse);

      // Llamar al método
      const result = await permissions.getAllPermissions();

      // Verificar que la API fue llamada correctamente
      expect(api.get).toHaveBeenCalledWith('/admin/permissions');

      // Verificar que se devolvió el resultado correcto
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when fetching all permissions', async () => {
      // Configurar mock de la API para simular un error
      api.get.mockRejectedValue(new Error('API Error'));

      // Llamar al método
      const result = await permissions.getAllPermissions();

      // Verificar que se devolvió un array vacío en caso de error
      expect(result).toEqual([]);
    });
  });
});
