# Testing de Autenticación con Cypress

Este documento proporciona una guía detallada para realizar pruebas end-to-end (E2E) de los flujos de autenticación en VAXAV utilizando Cypress.

## Índice

1. [Introducción](#introducción)
2. [Tests Implementados](#tests-implementados)
3. [Estrategias para Testear Autenticación](#estrategias-para-testear-autenticación)
4. [Testear Verificación de Email](#testear-verificación-de-email)
5. [Ejemplos de Código](#ejemplos-de-código)

## Introducción

Las pruebas de autenticación son críticas para asegurar que los usuarios puedan registrarse, iniciar sesión, verificar su email y gestionar su cuenta correctamente. Cypress nos permite automatizar estos flujos y verificar que funcionan como se espera.

## Tests Implementados

Actualmente, hemos implementado los siguientes tests de autenticación:

### Login

- Verificar que el formulario de login se muestra correctamente
- Verificar que se muestra un error con credenciales incorrectas
- Verificar que se puede enviar el formulario de login con credenciales válidas
- Verificar la navegación a la página de registro
- Verificar la navegación a la página de recuperación de contraseña

### Registro

- Verificar que el formulario de registro se muestra correctamente
- Verificar que se muestran errores de validación cuando los campos están vacíos
- Verificar que se puede completar el formulario de registro correctamente
- Verificar que se valida que los emails coincidan
- Verificar la navegación a la página de login

### Verificación de Email

- Verificar que se puede completar el formulario de registro correctamente
- Simular un usuario no verificado
- Simular un usuario verificado

## Estrategias para Testear Autenticación

### 1. Interceptación de Peticiones API

Para testear flujos de autenticación sin depender del backend, interceptamos las peticiones API:

```javascript
// Interceptar la petición de login
cy.intercept('POST', '**/login', {
  statusCode: 200,
  body: {
    token: 'fake-jwt-token',
    user: {
      id: 1,
      name: 'Usuario de Prueba',
      email: 'usuario@example.com',
      email_verified_at: '2023-01-01T00:00:00.000000Z',
    }
  }
}).as('loginRequest');

// Enviar el formulario
cy.get('button[type="submit"]').click();

// Esperar a que se complete la petición
cy.wait('@loginRequest');
```

### 2. Manipulación del Estado de Autenticación

Para simular diferentes estados de autenticación, manipulamos el localStorage:

```javascript
// Simular un usuario autenticado
cy.window().then((win) => {
  win.localStorage.setItem('auth_token', 'fake-token');
  win.localStorage.setItem('user', JSON.stringify({
    id: 1,
    name: 'Usuario de Prueba',
    email: 'usuario@example.com',
    email_verified_at: '2023-01-01T00:00:00.000000Z',
  }));
});

// Visitar una página protegida
cy.visit('/dashboard');
```

### 3. Comandos Personalizados

Creamos comandos personalizados para acciones comunes:

```javascript
// Comando para iniciar sesión
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para limpiar el estado de autenticación
Cypress.Commands.add('clearAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('user');
  });
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

## Testear Verificación de Email

Testear la verificación de email es un desafío porque involucra varios sistemas. Hemos implementado tres estrategias:

### 1. Interceptar y Simular el Proceso

```javascript
it('debería mostrar la página de verificación de email después del registro', function() {
  // Interceptar la petición de registro
  cy.intercept('POST', '**/register', {
    statusCode: 200,
    body: {
      message: 'Usuario registrado correctamente. Por favor, verifica tu correo electrónico.',
      user: {
        id: 1,
        name: this.users.newUser.name,
        email: this.users.newUser.email,
        email_verified_at: null,
      }
    }
  }).as('registerRequest');
  
  // Completar y enviar el formulario de registro
  cy.visit('/register');
  cy.get('input#name').type(this.users.newUser.name);
  cy.get('input#email').type(this.users.newUser.email);
  cy.get('input#email_confirmation').type(this.users.newUser.email);
  cy.get('input#password').type(this.users.newUser.password);
  cy.get('input#password_confirmation').type(this.users.newUser.password);
  cy.get('button[type="submit"]').click();
  
  // Esperar a que se complete la petición
  cy.wait('@registerRequest');
  
  // Verificar que se redirija a la página de verificación
  cy.url().should('include', '/email/verify');
});
```

### 2. Usar un Servidor de Email de Prueba

Para tests más completos, se puede configurar un servidor de email de prueba como MailHog:

```javascript
it('debería enviar un email de verificación y verificar la cuenta', function() {
  // Registrar un nuevo usuario
  cy.visit('/register');
  cy.get('input#name').type('Test User');
  cy.get('input#email').type('test@example.com');
  cy.get('input#email_confirmation').type('test@example.com');
  cy.get('input#password').type('password123');
  cy.get('input#password_confirmation').type('password123');
  cy.get('button[type="submit"]').click();
  
  // Esperar a que el email sea enviado
  cy.wait(2000);
  
  // Obtener el email de verificación de MailHog
  cy.request('GET', 'http://localhost:8025/api/v2/messages').then((response) => {
    const messages = response.body.items;
    const verificationEmail = messages.find(msg => 
      msg.Content.Headers.To.includes('test@example.com') && 
      msg.Content.Headers.Subject.includes('Verificación')
    );
    
    // Extraer el enlace de verificación
    const emailBody = verificationEmail.Content.Body;
    const verificationLink = emailBody.match(/href="([^"]*verify[^"]*)"/)[1];
    
    // Visitar el enlace de verificación
    cy.visit(verificationLink);
    
    // Verificar que se redirija al dashboard
    cy.url().should('include', '/dashboard');
  });
});
```

### 3. Crear un Endpoint de Prueba en el Backend

Otra estrategia es crear un endpoint especial en el backend solo para pruebas:

```javascript
it('debería verificar el email usando el endpoint de prueba', function() {
  // Registrar un nuevo usuario
  cy.intercept('POST', '**/register').as('registerRequest');
  
  cy.visit('/register');
  cy.get('input#name').type('Test User');
  cy.get('input#email').type('test@example.com');
  cy.get('input#email_confirmation').type('test@example.com');
  cy.get('input#password').type('password123');
  cy.get('input#password_confirmation').type('password123');
  cy.get('button[type="submit"]').click();
  
  // Esperar a que se complete el registro
  cy.wait('@registerRequest').then((interception) => {
    const userId = interception.response.body.user.id;
    
    // Llamar al endpoint de prueba
    cy.request({
      method: 'POST',
      url: `/api/testing/verify-email/${userId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Recargar la página
    cy.reload();
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/dashboard');
  });
});
```

## Ejemplos de Código

### Test de Login

```javascript
// Test para el flujo de login
describe('Login', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');
    
    // Limpiar el estado de autenticación
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

  it('debería mostrar error con credenciales incorrectas', function() {
    // Ingresar credenciales incorrectas
    cy.get('input#email').type(this.users.invalidUser.email);
    cy.get('input#password').type(this.users.invalidUser.password);
    
    // Enviar el formulario
    cy.get('button[type="submit"]').click();
    
    // Verificar que se muestre algún tipo de mensaje de error
    cy.get('body').should('contain.text', 'Error');
    
    // Esperar un tiempo para que aparezca la notificación
    cy.wait(1000);
  });
});
```

### Test de Registro

```javascript
// Test para el flujo de registro
describe('Registro', () => {
  beforeEach(() => {
    // Cargar fixtures
    cy.fixture('users.json').as('users');
    
    // Limpiar el estado de autenticación
    cy.clearAuth();
    
    // Visitar la página de registro
    cy.visit('/register');
  });

  it('debería completar el formulario de registro correctamente', function() {
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
});
```
