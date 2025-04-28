import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UsersView from '../UsersView.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import api from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock components
vi.mock('@/components/layout/AdminLayout.vue', () => ({
  default: {
    name: 'AdminLayout',
    template: '<div><slot /></div>'
  }
}))

vi.mock('@/components/ui/modals/BaseModal.vue', () => ({
  default: {
    name: 'BaseModal',
    template: '<div v-if="props.show"><slot /></div>',
    props: ['show', 'title', 'color']
  }
}))

vi.mock('@/components/ui/buttons/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button><slot /></button>',
    props: ['variant', 'type', 'loading', 'fullWidth', 'disabled']
  }
}))

describe('UsersView', () => {
  let wrapper
  
  beforeEach(() => {
    // Create a fresh Pinia instance for each test with mocked actions
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })
    
    // Setup mock API responses
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          { 
            id: 1, 
            name: 'Admin User', 
            email: 'admin@example.com', 
            roles: [{ id: 1, name: 'Admin', slug: 'admin' }],
            created_at: '2023-01-01T00:00:00.000Z'
          },
          { 
            id: 2, 
            name: 'Regular User', 
            email: 'user@example.com', 
            roles: [{ id: 2, name: 'User', slug: 'user' }],
            created_at: '2023-01-02T00:00:00.000Z'
          }
        ],
        total: 2
      }
    })
    
    // Mock available roles
    const authStore = useAuthStore(pinia)
    authStore.user = { 
      id: 1, 
      name: 'Admin', 
      email: 'admin@example.com',
      is_superadmin: true
    }
    
    // Mount the component
    wrapper = mount(UsersView, {
      global: {
        plugins: [pinia],
        stubs: {
          AdminLayout: true,
          BaseModal: true,
          BaseButton: true,
          BaseInput: true
        }
      }
    })
  })
  
  it('should fetch and display users on mount', async () => {
    // Wait for the component to finish mounting and API calls to resolve
    await vi.dynamicImportSettled()
    
    // Check if the API was called to fetch users
    expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { search: '', role: '' } })
    
    // Check if users are displayed in the table
    const userRows = wrapper.findAll('tbody tr')
    expect(userRows.length).toBe(2)
    
    // Check if the first user's data is displayed correctly
    const firstUserCells = userRows[0].findAll('td')
    expect(firstUserCells[0].text()).toContain('Admin User')
    expect(firstUserCells[1].text()).toContain('admin@example.com')
  })
  
  it('should open create user modal when clicking "Nuevo Usuario" button', async () => {
    // Find and click the "Nuevo Usuario" button
    const newUserButton = wrapper.find('button:contains("Nuevo Usuario")')
    await newUserButton.trigger('click')
    
    // Check if the modal is displayed with the correct title
    const modal = wrapper.findComponent({ name: 'BaseModal' })
    expect(modal.props('show')).toBe(true)
    expect(modal.props('title')).toBe('Crear Usuario')
  })
  
  it('should create a new user when submitting the form', async () => {
    // Mock successful user creation
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: 3,
        name: 'New User',
        email: 'new@example.com',
        roles: [{ id: 2, name: 'User', slug: 'user' }]
      }
    })
    
    // Open the create user modal
    await wrapper.vm.openCreateUserModal()
    
    // Fill the form
    wrapper.vm.userForm.name = 'New User'
    wrapper.vm.userForm.email = 'new@example.com'
    wrapper.vm.userForm.password = 'password'
    wrapper.vm.userForm.password_confirmation = 'password'
    wrapper.vm.userForm.roles = [2]
    
    // Submit the form
    await wrapper.vm.saveUser()
    
    // Check if the API was called with the correct data
    expect(api.post).toHaveBeenCalledWith('/admin/users', {
      name: 'New User',
      email: 'new@example.com',
      password: 'password',
      password_confirmation: 'password',
      roles: [2]
    })
    
    // Check if the notification was shown
    const notificationStore = useNotificationStore()
    expect(notificationStore.success).toHaveBeenCalled()
    
    // Check if the modal was closed
    expect(wrapper.vm.showUserModal).toBe(false)
    
    // Check if the users list was refreshed
    expect(api.get).toHaveBeenCalledTimes(2)
  })
  
  it('should delete a user when confirming deletion', async () => {
    // Mock successful user deletion
    vi.mocked(api.delete).mockResolvedValue({ data: { message: 'User deleted' } })
    
    // Setup user to delete
    const userToDelete = { 
      id: 2, 
      name: 'User to Delete', 
      email: 'delete@example.com',
      roles: []
    }
    
    // Open the delete confirmation modal
    await wrapper.vm.confirmDeleteUser(userToDelete)
    
    // Check if the delete modal is shown
    expect(wrapper.vm.showDeleteModal).toBe(true)
    expect(wrapper.vm.userToDelete).toEqual(userToDelete)
    
    // Confirm deletion
    await wrapper.vm.deleteUser()
    
    // Check if the API was called with the correct ID
    expect(api.delete).toHaveBeenCalledWith('/admin/users/2')
    
    // Check if the notification was shown
    const notificationStore = useNotificationStore()
    expect(notificationStore.success).toHaveBeenCalled()
    
    // Check if the modal was closed
    expect(wrapper.vm.showDeleteModal).toBe(false)
    
    // Check if the users list was refreshed
    expect(api.get).toHaveBeenCalledTimes(2)
  })
})
