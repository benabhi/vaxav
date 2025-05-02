# Mecánicas de Juego

Esta sección documenta las mecánicas de juego principales de Vaxav, incluyendo sistemas, flujos y reglas que definen la experiencia del jugador.

## Índice

- [Sistema de Pilotos](./pilots.md) - Creación y gestión de pilotos
- [Flujo de Navegación](./navigation-flow.md) - Secuencia de navegación y restricciones de acceso
- [Universo](./universe.md) - Estructura del universo y sistemas de navegación
- [Naves](./ships.md) - Tipos de naves y sistemas de combate
- [Economía](./economy.md) - Sistema económico y mercado
- [Corporaciones](./corporations.md) - Organizaciones de jugadores

## Visión General

Vaxav es un MMO espacial en navegador con ambientación sci-fi retro. Los jugadores asumen el rol de pilotos espaciales que exploran un vasto universo, comercian con recursos, participan en batallas y construyen su legado en la galaxia.

El juego se basa en varios sistemas interconectados que proporcionan una experiencia de juego profunda y envolvente:

1. **Pilotos**: Los jugadores crean y desarrollan pilotos con diferentes razas y habilidades.
2. **Exploración**: Los jugadores navegan por un universo compuesto por regiones, constelaciones y sistemas solares.
3. **Comercio**: Un sistema económico dinámico permite a los jugadores comprar, vender y transportar recursos.
4. **Combate**: Batallas espaciales con un sistema de defensa de tres capas (escudos, armadura, estructura).
5. **Progresión**: Los jugadores mejoran sus habilidades, naves y equipamiento a lo largo del tiempo.
6. **Cooperación**: Los jugadores pueden formar corporaciones para trabajar juntos hacia objetivos comunes.

## Principios de Diseño

El diseño de las mecánicas de juego de Vaxav se basa en los siguientes principios:

### 1. Libertad de Elección
Los jugadores tienen libertad para elegir su propio camino en el juego, ya sea como comerciantes, mineros, combatientes o una combinación de roles.

### 2. Riesgo vs. Recompensa
Las actividades más riesgosas (como viajar a sistemas de baja seguridad) ofrecen mayores recompensas potenciales.

### 3. Economía Impulsada por Jugadores
La mayoría de los bienes en el juego son creados y comerciados por jugadores, creando un ecosistema económico dinámico.

### 4. Consecuencias Significativas
Las decisiones de los jugadores tienen consecuencias duraderas, incluyendo la pérdida permanente de naves (permadeath).

### 5. Cooperación y Competencia
El juego fomenta tanto la cooperación entre jugadores (a través de corporaciones) como la competencia (a través de sistemas de combate y mercado).

## Implementación Técnica

Las mecánicas de juego se implementan a través de una combinación de:

- **Backend**: Lógica de juego, persistencia de datos y validación implementados en Laravel.
- **Frontend**: Interfaz de usuario y visualización implementados en Vue.js.
- **API**: Comunicación entre frontend y backend a través de una API RESTful.

Para más detalles sobre la implementación técnica, consulte la documentación de [Arquitectura](../architecture/README.md).

## Futuras Expansiones

Las mecánicas de juego se expandirán en el futuro para incluir:

- Sistema de misiones y contratos
- Fabricación de naves y módulos
- Guerras territoriales entre corporaciones
- Eventos dinámicos en el universo
- Sistema de reputación con facciones NPC
