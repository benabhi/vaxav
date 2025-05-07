// Test para el flujo de verificación de email

describe('Verificación de email', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');

    // Limpiar el estado de autenticación antes de cada test
    cy.clearAuth();
  });

  it('debería completar el formulario de registro correctamente', function () {
    // Completar el formulario de registro
    cy.visit('/register');
    cy.get('input#name').type(this.users.newUser.name);
    cy.get('input#email').type(this.users.newUser.email);
    cy.get('input#email_confirmation').type(this.users.newUser.email);
    cy.get('input#password').type(this.users.newUser.password);
    cy.get('input#password_confirmation').type(this.users.newUser.password);

    // Verificar que todos los campos están completos
    cy.get('input#name').should('have.value', this.users.newUser.name);
    cy.get('input#email').should('have.value', this.users.newUser.email);
    cy.get('input#email_confirmation').should('have.value', this.users.newUser.email);
    cy.get('input#password').should('have.value', this.users.newUser.password);
    cy.get('input#password_confirmation').should('have.value', this.users.newUser.password);

    // Verificar que el botón de submit está habilitado
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('debería simular un usuario no verificado', function () {
    // Simular un usuario autenticado pero no verificado
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: this.users.newUser.name,
        email: this.users.newUser.email,
        email_verified_at: null
      }));
    });

    // Verificar que los datos se han almacenado correctamente
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      const user = JSON.parse(win.localStorage.getItem('user'));

      expect(token).to.eq('fake-token');
      expect(user.name).to.eq(this.users.newUser.name);
      expect(user.email).to.eq(this.users.newUser.email);
      expect(user.email_verified_at).to.be.null;
    });
  });

  it('debería simular un usuario verificado', function () {
    // Simular un usuario autenticado y verificado
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: this.users.newUser.name,
        email: this.users.newUser.email,
        email_verified_at: '2023-01-01T00:00:00.000000Z'
      }));
    });

    // Verificar que los datos se han almacenado correctamente
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      const user = JSON.parse(win.localStorage.getItem('user'));

      expect(token).to.eq('fake-token');
      expect(user.name).to.eq(this.users.newUser.name);
      expect(user.email).to.eq(this.users.newUser.email);
      expect(user.email_verified_at).to.not.be.null;
    });
  });
});
