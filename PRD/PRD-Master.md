# PRD - Vaxav

## Product Requirements Document - Master Index

**Versión:** 1.5
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

---

## Tabla de Contenidos

1. [Visión del Producto](#1-visión-del-producto)
2. [Game Design & Mecánicas](./PRD-GameDesign.md)
3. [Universo & Mundo](./PRD-Universe.md)
4. [Naves & Combate](./PRD-ShipsAndCombat.md)
5. [Economía](./PRD-Economy.md)
6. [Sistema Social](./PRD-SocialSystem.md)
7. [Interfaz & UX](./PRD-Interface.md)
8. [Arquitectura Técnica](./PRD-TechnicalArchitecture.md)
9. [Seguridad & Calidad](./PRD-SecurityAndQuality.md)
10. [Roadmap & Futuro](./PRD-FutureConsiderations.md)
11. [Changelog](./PRD-Changelog.md)

---

## Cómo Usar Esta Documentación

Este PRD está organizado en **documentos especializados** para facilitar la navegación y el mantenimiento. Cada archivo cubre un área específica del juego:

- **Game Design:** Mecánicas fundamentales, sistema de ticks configurable, habilidades con inyección
- **Universo:** Facciones NPC, navegación espacial, estaciones con módulos upgradables
- **Naves & Combate:** 5 clases de naves, módulos, doctrina de combate, clonación
- **Economía:** Recursos, cadena de producción, mercado, misiones, corporaciones
- **Sistema Social:** Atributos del piloto (Energía, Nutrición, Moral, Estrés), relaciones, reputación
- **Interfaz:** 10 menús principales + 7 adicionales, tema visual "Void Command", UX completa
- **Arquitectura Técnica:** Stack (Laravel + PostgreSQL), base de datos (27+ tablas), testing
- **Seguridad & Calidad:** Seguridad, anti-cheating, métricas, analytics
- **Roadmap:** Plan de desarrollo en 6 fases, futuras consideraciones (i18n, mobile, APIs)
- **Changelog:** Historial de versiones del documento (v1.0 a v1.5)

---

## 1. Visión del Producto

### 1.1 Descripción General

Vaxav es un **juego web masivo asíncrono** de ciencia ficción tipo sandbox, fuertemente inspirado en títulos como Popmundo, OGame, Travian y EVE Online. Los jugadores asumen el rol de pilotos espaciales en un universo abierto donde pueden combatir, recolectar recursos, comerciar, fabricar y formar alianzas en una economía completamente dirigida por jugadores.

**IMPORTANTE:** Aunque el juego es **basado en texto e información** (no en gráficos 3D ni animaciones), cuenta con una **interfaz gráfica moderna, hermosa y profesional** diseñada específicamente para este tipo de juegos. La GUI está optimizada para mostrar texto, estadísticas y menús de forma elegante, con una identidad visual única inspirada en la estética sci-fi, completamente responsive para desktop y móvil.

### 1.2 Objetivos del Producto

- Crear un universo sandbox persistente y escalable
- Implementar una economía 100% dirigida por jugadores
- Ofrecer gameplay profundo basado en habilidades y progresión
- Proporcionar experiencia asíncrona accesible en sesiones cortas
- Facilitar interacción social a través de corporaciones y facciones
- Mantener arquitectura escalable y extensible

### 1.3 Público Objetivo

- Jugadores de juegos de navegador clásicos
- Fanáticos de EVE Online buscando experiencia más accesible
- Jugadores que disfrutan economías complejas
- Personas con tiempo limitado que prefieren juegos asíncronos
- Entusiastas de la ciencia ficción y estrategia

---

## 2. Game Design & Mecánicas

Vaxav es un juego basado en un **sistema de ticks configurable** que permite gameplay asíncrono. El tick por defecto es de 10 minutos, pero el administrador puede ajustarlo desde el panel de administración. Los jugadores progresan mediante un árbol de habilidades con sistema de inyección, donde cada habilidad debe ser adquirida (mediante inyectores comprados en laboratorios o mercado) antes de ser entrenada.

**Aspectos clave:**
- Sistema de ticks configurable almacenado en base de datos (tabla `game_config`)
- Habilidades con 5 niveles, multiplicadores (x1 a x5), y dependencias
- Sistema de inyección de habilidades: No Descubierta → Descubierta → Inyectada (Nivel 0-5)
- 4 carreras iniciales: Minero, Contrabandista, Cazador de Recompensas, Transportista
- Acciones instantáneas (navegación, mercado) vs acciones de tick (minería, combate, fabricación)
- Cálculo de ticks basado en habilidades, bonos de nave y módulos

**Mecánicas fundamentales:**
- Creación de cuenta y piloto con nombre aleatorio generado
- Selección de carrera que define nave inicial, habilidades y créditos
- Sistema de acciones con porcentaje de éxito basado en skills

[**→ Ver documentación completa: PRD-GameDesign.md**](./PRD-GameDesign.md)

---

## 3. Universo & Mundo

El juego toma lugar en el **sistema solar Vaxav**, controlado por 4 facciones NPC principales (Confederación Vaxav, Liga Libre, Sindicato Técnico, Flota Nómada). Los jugadores pueden explorar sistemas procedurales adicionales al desbloquear Stargates mediante progreso colectivo del servidor.

**Aspectos clave:**
- **4 facciones NPC principales** con ideologías distintas y relaciones dinámicas (-100 a +100)
- Sistema Vaxav predefinido: 1 estrella, 8 planetas, múltiples lunas, 15+ estaciones iniciales
- Progreso de sistema que desbloquea contenido (Stargates en 1K, 5K, 10K, 25K, 50K, 100K puntos)
- Generación procedural de sistemas con seeds reproducibles
- **Estaciones espaciales** orbitando lunas con 8 tipos de módulos upgradables (nivel 1-5):
  - Puente de Mando (obligatorio), Hangar, Laboratorio, Habitáculos
  - Mercado, Astillero, Sala de Ingeniería, Bodegas
- Cada módulo tiene funcionalidades que se expanden por nivel
- Propiedad de estaciones: NPC o corporaciones de jugadores
- Sistema de exploración con anomalías espaciales y escaneo

**Jerarquía de ubicaciones:**
```
Sistema Solar → Estrella/Planetas → Lunas → Estaciones → Módulos
```

[**→ Ver documentación completa: PRD-Universe.md**](./PRD-Universe.md)

---

## 4. Naves & Combate

Sistema de naves dividido en **5 clases principales** (Fragatas, Cruceros, Acorazados, Cargueros, Capitales), cada una con requisitos de habilidades específicos. Las naves pueden equipar módulos ofensivos, defensivos y de utilidad en slots limitados.

**Aspectos clave:**
- **5 clases de naves** con características distintas (velocidad, armadura, escudos, slots)
- Sistema de módulos (Armas de Energía/Proyectiles, Misiles, Escudos, Blindaje, Utilidad)
- Combate por ticks automático con doctrina de combate (Agresivo, Defensivo, Evasivo)
- Sistema de daño con 3 tipos: Cinético, Térmico, Electromagnético
- Mecánica de muerte y clonación (respawn en estación con clon actualizado)
- Estados de nave: Atracado, En Espacio, En Combate, En Viaje, Destruido
- Recompensas de combate: botín (wreck), experiencia y posible bounty
- Cooldown de actualización de clon: 144 ticks (~24h con tick de 10 min)

**Sistema de fitting:**
- Slots de armas (High Slots)
- Slots de defensa (Mid/Low Slots)
- Rigs y modificadores
- Límite de CPU y Reactor de Energía

[**→ Ver documentación completa: PRD-ShipsAndCombat.md**](./PRD-ShipsAndCombat.md)

---

## 5. Economía

Economía **100% dirigida por jugadores** con cadena de producción completa desde minería hasta fabricación de naves y módulos. El mercado funciona con órdenes de compra/venta estilo EVE Online.

**Aspectos clave:**
- **Moneda única:** Créditos (no comprable con dinero real en MVP)
- **Recursos:**
  - Minerales en crudo (8 tipos): Ferrita, Magnetita, Tritanio, Pirita, Isógeno, Nocxio, Morfita, Megalita
  - Minerales refinados procesados en refinerías
  - Componentes fabricados (circuitos, condensadores, motores, etc.)
- **Cadena de producción:** Minar → Refinar → Fabricar componentes → Fabricar productos finales
- **Mercado de habilidades:** Inyectores vendidos en laboratorios NPC o mercado jugador
- **Sistema de misiones:** 4 tipos (Minería, Transporte, Combate, Investigación) con agentes NPC
- **Corporaciones de jugadores:** Sistema de roles, impuestos, hangares compartidos
- **Alianzas:** Agrupaciones de corporaciones con diplomacia y guerra

**Mercado:**
- Órdenes de compra/venta con duración limitada
- Mercado regional conectando múltiples estaciones
- Comisiones y tarifas de transacción
- Historial de precios y gráficos

[**→ Ver documentación completa: PRD-Economy.md**](./PRD-Economy.md)

---

## 6. Sistema Social

Sistema completo de **atributos del piloto** y **relaciones sociales** que afectan directamente el gameplay. Inspirado en mecánicas de Popmundo.

**Aspectos clave:**
- **4 atributos del piloto (0-100):**
  - **Energía:** Sistema anti-grinding, degrada con acciones, se recupera descansando
  - **Nutrición:** Degradación cada 6 ticks, se recupera comiendo (items consumibles)
  - **Moral:** Afecta exp ganada (+20% a -20%), influenciada por relaciones y eventos
  - **Estrés Espacial:** Mayor en espacio/combate, menor en estaciones, afecta performance
- **Sistema de relaciones sociales (0-100):**
  - 6 niveles: Desconocido (0-19) → Conocido → Amigo → Buen Amigo → Amigo Cercano → Mejor Amigo (100)
  - Bonificadores por nivel: eficiencia grupal, descuentos, boost moral, acceso a activos
- **Reputación personal (3 tipos):**
  - Honorabilidad: Afecta seguros y préstamos
  - Fiabilidad en Combate: Afecta invitaciones a flotas
  - Reputación Comercial: Afecta comisiones de mercado
- **Actividades recreativas:** Descansar, dormir (36 ticks), socializar, entretenimiento, ejercicio, meditación
- **Mecánica anti-grinding:** Si energía llega a 0 = piloto inconsciente + cooldown 6 ticks

**Efectos en gameplay:**
Todos los atributos se aplican como multiplicadores en cálculos de acciones, recompensas y eficiencia.

[**→ Ver documentación completa: PRD-SocialSystem.md**](./PRD-SocialSystem.md)

---

## 7. Interfaz & UX

Interfaz gráfica **moderna y profesional** con tema visual "Void Command" inspirado en estética sci-fi. Completamente responsive para desktop y móvil.

**Aspectos clave:**
- **10 menús principales:**
  1. Licencia de Piloto (ID card)
  2. Registro del Capitán (historial completo)
  3. Habilidades (árbol de skills)
  4. Nave (fitting, carga, stats)
  5. Activos (vista global de items)
  6. Mercado (órdenes, gráficos)
  7. Billetera (finanzas, estadísticas)
  8. Corporación (gestión)
  9. Mapa (navegación visual)
  10. Mensajería (emails entre jugadores)

- **7 menús adicionales:**
  - Contratos, Industria, Flotas, Notificaciones, Configuración, Amigos/Contactos, Rankings/Leaderboards

- **Panel de Administración:**
  - Configuración del sistema de ticks en tiempo real
  - Ajustes de parámetros sociales y cooldowns
  - Métricas del servidor

- **Tema visual "Void Command":**
  - Paleta oscura con acentos neón (cyan, púrpura, naranja)
  - Tipografía: Orbitron (headers), Inter (body)
  - Progress bars animadas, tooltips elegantes, modals con overlays
  - Efectos visuales con Particles.js
  - Gráficos con Chart.js/ApexCharts

- **Tecnologías UI:**
  - Tailwind CSS para estilos
  - Alpine.js para interactividad
  - Componentes Blade de Laravel
  - Headless UI para componentes complejos
  - Heroicons para iconografía

[**→ Ver documentación completa: PRD-Interface.md**](./PRD-Interface.md)

---

## 8. Arquitectura Técnica

Stack completo basado en **Laravel (PHP)** con PostgreSQL, optimizado para juegos web masivos con sistema de ticks.

**Aspectos clave:**
- **Backend:**
  - PHP 8.2+
  - Laravel 10+ (framework principal)
  - Laravel Scheduler para procesamiento de ticks
  - Queue system (Redis) para tareas asíncronas

- **Frontend:**
  - Blade templates
  - Tailwind CSS 3+
  - Alpine.js 3+
  - Livewire (opcional para componentes reactivos)

- **Base de Datos:**
  - PostgreSQL 15+ (JSONB para metadata flexible)
  - Redis para cache y sesiones
  - **27+ tablas** documentadas con esquemas SQL completos:
    - Configuración: game_config
    - Jugadores: users, pilots, pilot_skills, pilot_relationships
    - Universo: solar_systems, planets, moons, stations, station_modules
    - Naves: ship_templates, ships, ship_modules
    - Economía: items, inventories, market_orders, market_transactions
    - Misiones: agents, missions, mission_objectives
    - Social: social_activities, pilot_attributes_log

- **Containerización:**
  - Docker con docker-compose
  - Servicios: app, postgresql, redis, nginx

- **Testing:**
  - PHPUnit para unit tests
  - Laravel Dusk para browser tests
  - Feature tests para APIs

- **Extensibilidad:**
  - Sistema de carreras extensible vía seeder
  - Módulos de estación como sistema modular
  - Generación procedural con seeds reproducibles

[**→ Ver documentación completa: PRD-TechnicalArchitecture.md**](./PRD-TechnicalArchitecture.md)

---

## 9. Seguridad & Calidad

Medidas de seguridad y calidad para proteger el juego contra cheating, exploits y garantizar rendimiento.

**Aspectos clave:**
- **Seguridad:**
  - Autenticación con Laravel Sanctum
  - Autorización granular con Gates y Policies
  - Validación server-side de todas las acciones
  - Rate limiting en todas las rutas
  - Prevención de SQL injection, XSS, CSRF
  - Anti-cheating: validación de tiempos de ticks, detección de bots

- **Métricas y Analytics:**
  - Métricas de jugador: retención, engagement, sesiones
  - Métricas de economía: inflación, velocidad de dinero, balance recursos
  - Métricas de sistema: rendimiento ticks, uptime, errores

- **Documentación:**
  - Técnica: API documentation, diagramas ER, guías de deployment
  - Jugador: Wiki del juego, tutoriales, guía de mecánicas

- **Calidad:**
  - Testing automatizado (unit, feature, browser)
  - Code review obligatorio
  - CI/CD pipeline
  - Monitoring con logs estructurados

[**→ Ver documentación completa: PRD-SecurityAndQuality.md**](./PRD-SecurityAndQuality.md)

---

## 10. Roadmap & Futuro

Plan de desarrollo en **6 fases** con features priorizadas y futuras consideraciones.

**Roadmap de Desarrollo:**
- **Fase 1: Fundamentos (MVP)**
  - Sistema de ticks, autenticación, creación de piloto
  - Sistema Vaxav inicial, estaciones básicas
  - Navegación, naves básicas, inventario

- **Fase 2: Economía y Fabricación**
  - Minería, refinamiento, fabricación
  - Mercado jugador, misiones NPC
  - Sistema de habilidades completo

- **Fase 3: Combate**
  - Sistema de combate PvE/PvP
  - Doctrina, fitting, clonación
  - Bounties y seguridad

- **Fase 4: Social**
  - Corporaciones, alianzas
  - Sistema social completo
  - Diplomacia y guerra

- **Fase 5: Expansión**
  - Generación procedural de sistemas
  - Stargates, nuevas facciones
  - Contenido endgame

- **Fase 6: Endgame**
  - Conquista territorial
  - Eventos globales
  - Economía avanzada

**Futuras Consideraciones:**
- Internacionalización (i18n) multi-idioma
- Mobile responsiveness optimizada
- APIs públicas para desarrolladores
- Eventos en vivo y temporadas
- Posible monetización ética (cosmetics, premium features)

[**→ Ver documentación completa: PRD-FutureConsiderations.md**](./PRD-FutureConsiderations.md)

---

## 11. Changelog

Historial completo de versiones del documento PRD desde v1.0 hasta v1.5, documentando todos los cambios, adiciones y mejoras realizadas.

**Versiones destacadas:**
- **v1.5:** Sistema de ticks configurable, tabla game_config, panel de administración
- **v1.4:** Aclaración de interfaz gráfica moderna, tema visual "Void Command"
- **v1.3:** Sistema social completo (atributos, relaciones, reputación)
- **v1.2:** Sistema de menús y navegación (17 menús documentados)
- **v1.1:** Sistema de inyección de habilidades, mercado de habilidades
- **v1.0:** Documento inicial

[**→ Ver changelog completo: PRD-Changelog.md**](./PRD-Changelog.md)

---

## Estructura de Archivos del PRD

```
PRD/
├── PRD-Master.md (este archivo)
├── PRD-GameDesign.md
├── PRD-Universe.md
├── PRD-ShipsAndCombat.md
├── PRD-Economy.md
├── PRD-SocialSystem.md
├── PRD-Interface.md
├── PRD-TechnicalArchitecture.md
├── PRD-SecurityAndQuality.md
├── PRD-FutureConsiderations.md
└── PRD-Changelog.md
```

**Total:** 11 archivos especializados, ~4,400+ líneas de documentación completa.

---

## Navegación Rápida

- [→ Comenzar por Game Design](./PRD-GameDesign.md)
- [→ Ver Arquitectura Técnica](./PRD-TechnicalArchitecture.md)
- [→ Consultar Changelog](./PRD-Changelog.md)
