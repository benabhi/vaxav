# Estructura de URLs en VAXAV

Este documento describe la estructura de URLs utilizada en el proyecto VAXAV, explicando la organización jerárquica y las convenciones de nomenclatura.

## Estructura General

Las URLs en VAXAV siguen una estructura jerárquica que refleja la organización del juego:

```
/{seccion}/{subseccion}
```

Donde:
- `{seccion}` representa una sección principal del juego (piloto, universo, mercado, etc.)
- `{subseccion}` representa una vista específica dentro de esa sección

## Secciones Principales

### Piloto (`/pilot`)

URLs relacionadas con el piloto y sus características:

- `/pilot/overview` - Vista general del piloto
- `/pilot/skills` - Habilidades del piloto
- `/pilot/inventory` - Inventario del piloto
- `/pilot/profile` - Perfil del piloto

### Universo (`/universe`)

URLs relacionadas con la navegación y exploración del universo:

- `/universe/galaxy` - Vista de la galaxia
- `/universe/solar-system` - Vista de sistema solar
- `/universe/planet` - Vista de planeta
- `/universe/station` - Vista de estación

### Mercado (`/market`)

URLs relacionadas con el comercio:

- `/market/browse` - Explorar el mercado
- `/market/orders` - Órdenes del usuario
- `/market/history` - Historial de transacciones

### Naves (`/ships`)

URLs relacionadas con las naves del usuario:

- `/ships/hangar` - Hangar de naves
- `/ships/fitting` - Equipamiento de naves
- `/ships/market` - Mercado de naves

### Administración (`/admin`)

URLs relacionadas con la administración del juego (solo para moderadores y administradores):

- `/admin/users` - Gestión de usuarios
- `/admin/logs` - Registros del sistema
- `/admin/settings` - Configuración del juego

## Convenciones de Nomenclatura

1. **Uso de kebab-case**: Las URLs utilizan kebab-case (palabras en minúsculas separadas por guiones) para mejorar la legibilidad.
   - Ejemplo: `/universe/solar-system` en lugar de `/universe/solarSystem` o `/universe/solar_system`

2. **Plurales para colecciones**: Se utilizan plurales para representar colecciones de elementos.
   - Ejemplo: `/ships/hangar` para una colección de naves

3. **Singulares para elementos específicos**: Se utilizan singulares para representar elementos específicos.
   - Ejemplo: `/universe/planet/123` para un planeta específico

## Navegación y Estado Activo

El sistema de navegación de VAXAV está diseñado para mantener el estado "activo" de manera jerárquica:

1. **Menú principal**: Cuando se navega a cualquier URL dentro de una sección (por ejemplo, `/pilot/skills`), el elemento de menú principal correspondiente (`Piloto`) se mantiene activo.

2. **Submenús**: El elemento de submenú específico también se marca como activo según la URL actual.

## Redirecciones

Para mejorar la experiencia de usuario, se implementan las siguientes redirecciones:

- `/` redirige a `/pilot/overview`
- `/pilot` redirige a `/pilot/overview`
- `/universe` redirige a `/universe/galaxy`
- `/market` redirige a `/market/browse`
- `/ships` redirige a `/ships/hangar`

## Implementación Técnica

La lógica de navegación y estado activo se implementa principalmente en los siguientes componentes:

- `VxvNavLink.vue`: Componente unificado para enlaces de navegación que maneja tanto enlaces principales como subenlaces.
- `App.vue`: Contiene la lógica para determinar la sección actual y el título de la página basado en la URL.

El componente `VxvNavLink` incluye una propiedad `pageNav` que, cuando está activada, aplica un estilo específico para los enlaces de submenú (texto azul sin subrayado cuando está activo). Todos los enlaces activos (tanto principales como secundarios) se muestran con texto azul, sin fondo gris.
