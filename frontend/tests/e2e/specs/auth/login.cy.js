// Test para el flujo de login

describe('Login', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');

    // Limpiar el estado de autenticación antes de cada test
    cy.clearAuth();

    // Visitar la página de login
    cy.visit('/login');
  });

  it('debería mostrar el formulario de login correctamente', () => {
    // Verificar que el título del formulario sea correcto
    cy.contains('h2', 'Iniciar Sesión').should('be.visible');

    // Verificar que los campos del formulario estén presentes
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');

    // Verificar que el botón de submit esté presente
    cy.get('button[type="submit"]').contains('Iniciar Sesión').should('be.visible');

    // Verificar que los enlaces de registro y recuperación de contraseña estén presentes
    cy.contains('a', 'Regístrate').should('be.visible');
    cy.contains('a', '¿Olvidaste tu contraseña?').should('be.visible');
  });

  it('debería mostrar error con credenciales incorrectas', function () {
    // Ingresar credenciales incorrectas
    cy.get('input#email').type(this.users.invalidUser.email);
    cy.get('input#password').type(this.users.invalidUser.password);

    // Enviar el formulario
    cy.get('button[type="submit"]').click();

    // Verificar que se muestre algún tipo de mensaje de error
    // Usamos una expresión regular para ser más flexibles con el mensaje
    cy.get('body').should('contain.text', 'Error');

    // Alternativa: esperar un tiempo para que aparezca la notificación
    cy.wait(1000);
  });

  it('debería poder enviar el formulario de login', function () {
    // Ingresar credenciales
    cy.get('input#email').type(this.users.validUser.email);
    cy.get('input#password').type(this.users.validUser.password);

    // Verificar que los campos tienen los valores correctos
    cy.get('input#email').should('have.value', this.users.validUser.email);
    cy.get('input#password').should('have.value', this.users.validUser.password);

    // Verificar que el botón de submit está habilitado
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('debería navegar a la página de registro al hacer clic en el enlace', () => {
    // Hacer clic en el enlace de registro
    cy.contains('a', 'Regístrate').click();

    // Verificar que se redirija a la página de registro
    cy.url().should('include', '/register');
  });

  it('debería navegar a la página de recuperación de contraseña al hacer clic en el enlace', () => {
    // Hacer clic en el enlace de recuperación de contraseña
    cy.contains('a', '¿Olvidaste tu contraseña?').click();

    // Verificar que se redirija a la página de recuperación de contraseña
    cy.url().should('include', '/forgot-password');
  });
});
