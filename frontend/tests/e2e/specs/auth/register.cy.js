// Test para el flujo de registro

describe('Registro', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');

    // Limpiar el estado de autenticación antes de cada test
    cy.clearAuth();

    // Visitar la página de registro
    cy.visit('/register');
  });

  it('debería mostrar el formulario de registro correctamente', () => {
    // Verificar que el título del formulario sea correcto
    cy.contains('h2', 'Crear Cuenta').should('be.visible');

    // Verificar que los campos del formulario estén presentes
    cy.get('input#name').should('be.visible');
    cy.get('input#email').should('be.visible');
    cy.get('input#email_confirmation').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('input#password_confirmation').should('be.visible');

    // Verificar que el botón de submit esté presente
    cy.get('button[type="submit"]').contains('Registrarse').should('be.visible');

    // Verificar que el enlace de login esté presente
    cy.contains('a', 'Inicia Sesión').should('be.visible');
  });

  it('debería mostrar errores de validación cuando los campos están vacíos', () => {
    // Enviar el formulario sin completar los campos
    cy.get('button[type="submit"]').click();

    // Verificar que se muestren mensajes de error para los campos requeridos
    // Nota: La implementación exacta depende de cómo se manejan los errores en tu aplicación
    cy.get('input#name').should('have.attr', 'required');
    cy.get('input#email').should('have.attr', 'required');
    cy.get('input#email_confirmation').should('have.attr', 'required');
    cy.get('input#password').should('have.attr', 'required');
    cy.get('input#password_confirmation').should('have.attr', 'required');
  });

  it('debería completar el formulario de registro correctamente', function () {
    // Completar el formulario con datos válidos
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

  it('debería validar que los emails coincidan', function () {
    // Completar el formulario con emails que no coinciden
    cy.get('input#name').type(this.users.existingUser.name);
    cy.get('input#email').type(this.users.existingUser.email);
    cy.get('input#email_confirmation').type('otro_email@example.com');
    cy.get('input#password').type(this.users.existingUser.password);
    cy.get('input#password_confirmation').type(this.users.existingUser.password);

    // Enviar el formulario
    cy.get('button[type="submit"]').click();

    // Verificar que seguimos en la página de registro
    cy.get('input#name').should('exist');

    // Verificar que los campos de email siguen teniendo los valores ingresados
    cy.get('input#email').should('have.value', this.users.existingUser.email);
    cy.get('input#email_confirmation').should('have.value', 'otro_email@example.com');
  });

  it('debería navegar a la página de login al hacer clic en el enlace', () => {
    // Hacer clic en el enlace de login
    cy.contains('a', 'Inicia Sesión').click();

    // Verificar que se redirija a la página de login
    cy.url().should('include', '/login');
  });
});
