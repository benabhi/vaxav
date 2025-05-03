# Características Implementadas en Vaxav

Esta sección documenta las características principales implementadas en Vaxav, detallando su diseño, implementación y uso.

## Características Disponibles

### Sistema de Autenticación y Autorización

El sistema de autenticación y autorización de Vaxav proporciona:
- Registro de usuarios
- Inicio de sesión con tokens
- Verificación de email
- Recuperación de contraseña
- Roles y permisos

Para más detalles, consulta la [documentación de autenticación](../auth/README.md).

### Sistema de Pilotos

El sistema de pilotos permite a los usuarios crear y gestionar sus personajes en el juego:
- Creación de pilotos con diferentes razas
- Gestión de créditos y ubicación
- Relación con habilidades y naves

Para más detalles, consulta la [documentación del sistema de pilotos](./pilots.md).

### Sistema de Habilidades

El sistema de habilidades proporciona progresión de personajes:
- Habilidades organizadas por categorías
- Sistema de prerrequisitos
- Niveles de habilidad (1-5)
- Activación de habilidades

Para más detalles, consulta la [documentación del sistema de habilidades](./skills-system.md).

## Estado de Implementación

| Característica | Estado | Documentación |
|----------------|--------|---------------|
| Autenticación | ✅ Completo | [Ver documentación](../auth/README.md) |
| Verificación de Email | ✅ Completo | [Ver documentación](../email-verification.md) |
| Roles y Permisos | ✅ Completo | [Ver documentación](../auth/roles-permissions.md) |
| Sistema de Pilotos | ✅ Completo | [Ver documentación](./pilots.md) |
| Sistema de Habilidades | ✅ Completo | [Ver documentación](./skills-system.md) |
| Universo | 🔄 En desarrollo | - |
| Naves | 🔄 En desarrollo | - |
| Mercado | 🔄 En desarrollo | - |
| Corporaciones | 🔄 En desarrollo | - |

## Próximas Características

Las siguientes características están planificadas para futuras actualizaciones:

### Sistema de Universo
- Regiones, constelaciones y sistemas solares
- Navegación entre sistemas
- Diferentes niveles de seguridad

### Sistema de Naves
- Diferentes tipos de naves
- Equipamiento y modificaciones
- Sistema de combate

### Sistema de Mercado
- Compra y venta de recursos
- Órdenes de mercado
- Fluctuaciones de precios

### Sistema de Corporaciones
- Creación y gestión de corporaciones
- Jerarquías y roles
- Control de territorio

## Contribuir a las Características

Si deseas contribuir al desarrollo de nuevas características o mejorar las existentes:

1. Consulta la documentación existente para entender el diseño actual
2. Sigue las convenciones de código y arquitectura establecidas
3. Implementa pruebas para las nuevas funcionalidades
4. Actualiza la documentación para reflejar los cambios
5. Envía un pull request con una descripción detallada de los cambios
