import { createRouter, createWebHistory } from 'vue-router';
import { flushPromises } from '@vue/test-utils';

/**
 * Crea un router configurado para tests
 * @param {Array} routes - Rutas adicionales para el router
 * @returns {Router} - Router configurado
 */
export function createTestRouter(routes = []) {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: { template: '<div>Home</div>' }
      },
      {
        path: '/admin/roles',
        name: 'roles',
        component: { template: '<div>Roles</div>' }
      },
      {
        path: '/admin/users',
        name: 'users',
        component: { template: '<div>Users</div>' }
      },
      ...routes
    ]
  });
}

/**
 * Espera a que se completen todas las actualizaciones del DOM y promesas
 */
export async function waitForDOM() {
  await flushPromises();
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Configura stubs comunes para los tests
 * @returns {Object} - Objeto con stubs comunes
 */
export function getCommonStubs() {
  return {
    AdminLayout: true,
    BaseBreadcrumb: true,
    BaseInput: true,
    BaseTextarea: true,
    BaseSelect: true,
    BaseCheckbox: true,
    BaseButton: true,
    BaseTable: true,
    BasePagination: true,
    BaseModal: true,
    VxvInput: true,
    VxvTextarea: true,
    VxvSelect: true,
    VxvCheckbox: true,
    VxvButton: true,
    VxvTable: true,
    VxvPagination: true,
    VxvModal: true,
    'font-awesome-icon': true,
    RouterLink: true
  };
}

/**
 * Encuentra un botón por su texto
 * @param {Wrapper} wrapper - Wrapper del componente
 * @param {String} text - Texto del botón
 * @returns {Wrapper|null} - Wrapper del botón o null si no se encuentra
 */
export function findButtonByText(wrapper, text) {
  const buttons = wrapper.findAll('button');
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].text().includes(text)) {
      return buttons[i];
    }
  }
  return null;
}

/**
 * Encuentra un elemento por su atributo data-testid
 * @param {Wrapper} wrapper - Wrapper del componente
 * @param {String} testId - Valor del atributo data-testid
 * @returns {Wrapper|null} - Wrapper del elemento o null si no se encuentra
 */
export function findByTestId(wrapper, testId) {
  return wrapper.find(`[data-testid="${testId}"]`);
}
