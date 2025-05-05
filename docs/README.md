# Documentación de Vaxav

Bienvenido a la documentación oficial de Vaxav, un MMO espacial en navegador web. Esta documentación está organizada en secciones para facilitar la navegación y comprensión del proyecto.

## Estructura de la Documentación

La documentación está organizada en las siguientes secciones principales:

### 1. Guías de Inicio
Documentación para comenzar a trabajar con el proyecto:
- [Instalación](./installation.md) - Instrucciones detalladas de instalación
- [Puesta en Marcha](./getting-started.md) - Cómo ejecutar el proyecto localmente
- [Uso de PM2](./pm2-usage.md) - Gestión de servicios con PM2

### 2. Arquitectura
Documentación sobre la estructura y diseño técnico:
- [Estructura del Proyecto](./architecture/project-structure.md) - Organización de directorios y archivos
- [Backend (Laravel)](./architecture/backend.md) - Arquitectura del backend
- [Frontend (Vue.js)](./architecture/frontend.md) - Arquitectura del frontend
- [Base de Datos](./architecture/database.md) - Esquema y relaciones

### 3. Características del Juego
Documentación sobre las características implementadas:
- [Sistema de Habilidades](./features/skills-system.md) - Implementación del sistema de habilidades
- [Sistema de Pilotos](./features/pilots.md) - Creación y gestión de pilotos

### 4. Mecánicas de Juego
Documentación sobre las mecánicas y reglas del juego:
- [Visión General](./game/README.md) - Conceptos fundamentales del juego
- [Flujo de Navegación](./game/navigation-flow.md) - Secuencia de navegación y restricciones

### 5. Componentes UI
Documentación sobre los componentes de interfaz de usuario:
- [Visión General](./components/README.md) - Sistema de componentes
- [Componentes UI](./components/ui/README.md) - Componentes básicos de UI
- [Componentes de Layout](./components/layout/layout.md) - Componentes de estructura

### 6. API y Autenticación
Documentación sobre la API y el sistema de autenticación:
- [Autenticación](./auth/README.md) - Sistema de autenticación
- [Validaciones de Registro](./auth/registration-validation.md) - Validaciones del formulario de registro
- [Verificación de Email](./auth/email-verification.md) - Sistema de verificación de email
- [Recuperación de Contraseña](./auth/password-reset.md) - Sistema de recuperación de contraseña
- [Roles y Permisos](./auth/roles-permissions.md) - Sistema de autorización
- [Endpoints de API](./api/README.md) - Documentación de la API REST

### 7. Testing
Documentación sobre pruebas y calidad:
- [Estrategia de Testing](./testing/README.md) - Enfoque general de testing
- [Tests de Backend](./testing/backend-testing.md) - Testing en Laravel
- [Tests de Frontend](./testing/frontend-testing.md) - Testing en Vue.js
- [Vitest](./testing/testing-vitest.md) - Uso de Vitest para tests de frontend

### 8. Guías y Solución de Problemas
Documentación adicional para desarrolladores:
- [Separación de Responsabilidades](./guides/separation-of-concerns.md) - Principios de diseño
- [Uso de Composables](./guides/using-composables.md) - Patrones con composables de Vue
- [Problemas Comunes](./troubleshooting/common-issues.md) - Soluciones a problemas frecuentes

## Estado Actual del Proyecto

El proyecto Vaxav actualmente incluye las siguientes características implementadas:

- ✅ Sistema de autenticación y autorización completo
- ✅ Verificación de email con enlace y código
- ✅ Sistema de roles y permisos
- ✅ Creación y gestión de pilotos
- ✅ Sistema de habilidades con prerrequisitos y niveles
- ✅ Interfaz de usuario con componentes reutilizables
- ✅ Pruebas automatizadas para backend y frontend

Características en desarrollo:
- 🔄 Sistema de naves y combate
- 🔄 Universo navegable con sistemas solares
- 🔄 Mercado y economía
- 🔄 Corporaciones de jugadores

## Convenciones de Documentación

Para mantener la documentación consistente, seguimos estas convenciones:

1. **Estructura de Archivos**:
   - Cada sección principal tiene su propia carpeta
   - Cada característica importante tiene su propio archivo
   - Los nombres de archivos usan kebab-case (ej. `project-structure.md`)

2. **Formato de Documentos**:
   - Todos los documentos usan Markdown
   - Cada documento comienza con un título principal (# Título)
   - Las secciones usan encabezados de segundo nivel (## Sección)
   - Las subsecciones usan encabezados de tercer nivel (### Subsección)
   - El código se formatea en bloques de código con el lenguaje especificado

3. **Enlaces**:
   - Los enlaces internos usan rutas relativas (ej. `./features/skills.md`)
   - Los enlaces externos incluyen el protocolo (ej. `https://example.com`)

## Contribuir a la Documentación

Si deseas contribuir a esta documentación:

1. Sigue las convenciones de documentación descritas anteriormente
2. Asegúrate de que la documentación refleje el estado actual del código
3. Incluye ejemplos prácticos cuando sea posible
4. Actualiza el índice principal cuando agregues nuevos documentos
5. Verifica que todos los enlaces funcionen correctamente
