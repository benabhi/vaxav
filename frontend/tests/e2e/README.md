# Tests End-to-End (E2E) con Cypress

Este directorio contiene los tests end-to-end (E2E) para la aplicación frontend utilizando Cypress.

## Estructura de directorios

```
tests/e2e/
├── fixtures/       # Datos de prueba
├── specs/          # Tests E2E
│   ├── auth/       # Tests de autenticación
│   │   ├── login.cy.js
│   │   └── register.cy.js
│   └── ...
├── support/        # Comandos personalizados y configuración
│   ├── commands.js
│   └── e2e.js
└── README.md       # Esta documentación
```

## Ejecutar los tests

Para ejecutar los tests E2E, puedes usar los siguientes comandos:

```bash
# Abrir Cypress en modo interactivo
npm run test:e2e

# Ejecutar los tests en modo headless (sin interfaz gráfica)
npm run test:e2e:headless
```

## Comandos personalizados

Se han definido los siguientes comandos personalizados para facilitar los tests:

- `cy.login(email, password)`: Inicia sesión con las credenciales proporcionadas
- `cy.clearAuth()`: Limpia el estado de autenticación (localStorage, cookies, etc.)

## Convenciones

- Los archivos de test deben tener la extensión `.cy.js` o `.cy.ts`
- Los tests deben organizarse en subdirectorios según la funcionalidad que prueban
- Cada test debe ser independiente y no depender del estado de otros tests

## Buenas prácticas

1. **Independencia**: Cada test debe ser independiente y no depender del estado de otros tests.
2. **Limpieza**: Usar `beforeEach` para limpiar el estado antes de cada test.
3. **Selectores**: Usar selectores que sean resistentes a cambios en el diseño (data-testid, id, etc.).
4. **Interceptación**: Usar `cy.intercept()` para simular respuestas del servidor.
5. **Verificación**: Verificar siempre el resultado esperado de cada acción.
6. **Comandos personalizados**: Crear comandos personalizados para acciones comunes.

## Recursos

- [Documentación oficial de Cypress](https://docs.cypress.io/)
- [Buenas prácticas de Cypress](https://docs.cypress.io/guides/references/best-practices)
- [API de Cypress](https://docs.cypress.io/api/table-of-contents)
