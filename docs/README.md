# Documentación de Vaxav

Bienvenido a la documentación de Vaxav, un MMO espacial en navegador web. Esta documentación está organizada en secciones para facilitar la navegación.

## Índice

### Guías de Inicio

- [Instalación](./installation.md) - Cómo instalar y configurar el proyecto
- [Puesta en Marcha](./getting-started.md) - Cómo ejecutar el proyecto
- [Uso de PM2](./pm2-usage.md) - Guía detallada sobre el uso de PM2

### Arquitectura

- [Estructura del Proyecto](./architecture/project-structure.md) - Organización general del proyecto
- [Backend (Laravel API)](./architecture/backend.md) - Detalles sobre el backend
- [Frontend (Vue.js)](./architecture/frontend.md) - Detalles sobre el frontend
- [Base de Datos](./architecture/database.md) - Esquema y relaciones de la base de datos

### Mecánicas de Juego

- [Visión General](./game/README.md) - Visión general de las mecánicas de juego
- [Sistema de Pilotos](./game/pilots.md) - Creación y gestión de pilotos
- [Flujo de Navegación](./game/navigation-flow.md) - Secuencia de navegación y restricciones de acceso

### Diseño y Estilo

- [Guía de Estilo](./design/style-guide.md) - Guía completa de estilo para mantener la coherencia visual
- [Diseño y Estilo](./design/README.md) - Visión general del diseño de Vaxav
- [Sistema de Componentes](./components/README.md) - Documentación del sistema de componentes

### API y Autenticación

- [Autenticación y Autorización](./auth/README.md) - Sistema completo de autenticación y autorización
  - [Roles y Permisos](./auth/roles-permissions.md) - Sistema de roles y permisos
  - [Implementación Frontend](./auth/frontend-implementation.md) - Autenticación en el frontend
  - [Implementación Backend](./auth/backend-implementation.md) - Autenticación en el backend
  - [Mejoras Realizadas](./auth/improvements.md) - Mejoras en el sistema de autenticación
- [Pilotos](./api/pilots.md) - Endpoints relacionados con pilotos
- [Universo](./api/universe.md) - Endpoints relacionados con el universo
- [Naves](./api/ships.md) - Endpoints relacionados con naves
- [Mercado](./api/market.md) - Endpoints relacionados con el mercado

### Testing

- [Estrategia de Testing](./testing/testing-strategy.md) - Visión general de la estrategia de testing
- [Testing Frontend](./testing/frontend-testing.md) - Guía para escribir y ejecutar tests en el frontend
- [Testing Backend](./testing/backend-testing.md) - Guía para escribir y ejecutar tests en el backend

### Guías de Desarrollo

- [Contribución](./development/contributing.md) - Cómo contribuir al proyecto
- [Estándares de Código](./development/code-standards.md) - Estándares y convenciones de código

### Solución de Problemas

- [Problemas Comunes](./troubleshooting/common-issues.md) - Soluciones a problemas frecuentes
- [Logs y Depuración](./troubleshooting/logging-debugging.md) - Cómo usar logs para depurar

### Despliegue

- [Entorno de Producción](./deployment/production.md) - Configuración para producción
- [CI/CD](./deployment/ci-cd.md) - Integración y despliegue continuos

## Contribuir a la Documentación

Si deseas contribuir a esta documentación, por favor sigue estas pautas:

1. Usa Markdown para formatear los documentos
2. Mantén un estilo consistente
3. Incluye ejemplos prácticos cuando sea posible
4. Actualiza el índice cuando agregues nuevos documentos
