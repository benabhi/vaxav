import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import api from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    defaults: {
      headers: {
        common: {}
      }
    },
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      // Mock successful login response
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
      const mockResponse = { data: { user: mockUser, token: 'fake-token' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const authStore = useAuthStore()
      const credentials = { email: 'test@example.com', password: 'password' }
      
      // Call login method
      await authStore.login(credentials)

      // Verify API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
      
      // Verify store state was updated correctly
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe('fake-token')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.loading).toBe(false)
    })

    it('should handle login failure', async () => {
      // Mock login failure
      vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'))

      const authStore = useAuthStore()
      const credentials = { email: 'wrong@example.com', password: 'wrong' }
      
      // Set token to null initially
      authStore.$patch({ token: null })
      
      // Call login method and expect it to throw
      await expect(authStore.login(credentials)).rejects.toThrow()
      
      // Verify store state reflects failure
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loading).toBe(false)
    })
  })

  describe('register', () => {
    it('should set user and token on successful registration', async () => {
      // Mock successful registration response
      const mockUser = { id: 1, name: 'New User', email: 'new@example.com' }
      const mockResponse = { data: { user: mockUser, token: 'new-token' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const authStore = useAuthStore()
      const userData = { 
        name: 'New User', 
        email: 'new@example.com', 
        password: 'password',
        password_confirmation: 'password'
      }
      
      // Call register method
      await authStore.register(userData)

      // Verify API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
      
      // Verify store state was updated correctly
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe('new-token')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      // Setup initial authenticated state
      const authStore = useAuthStore()
      authStore.$patch({ 
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        token: 'fake-token'
      })
      
      // Mock successful logout response
      vi.mocked(api.delete).mockResolvedValue({ data: { message: 'Logged out' } })
      
      // Call logout method
      await authStore.logout()

      // Verify API was called
      expect(api.delete).toHaveBeenCalledWith('/auth/logout')
      
      // Verify store state was cleared
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('fetchCurrentUser', () => {
    it('should update user data when fetching current user', async () => {
      // Mock successful user fetch response
      const mockUser = { id: 1, name: 'Current User', email: 'current@example.com' }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const authStore = useAuthStore()
      // Set token but no user to simulate a state where we have a token but need to fetch user data
      authStore.$patch({ token: 'existing-token' })
      
      // Call fetchCurrentUser method
      await authStore.fetchCurrentUser()

      // Verify API was called
      expect(api.get).toHaveBeenCalledWith('/auth/user')
      
      // Verify store state was updated with user data
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
    })
  })
})
