# Changelog del Documento

**Parte del:** PRD - Vaxav
**Versión:** 1.5
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

[Volver al PRD Master](./PRD-Master.md)

---

## Historial de Versiones

### v1.5 - 2025-11-28

**SISTEMA DE TICKS BASADO EN TIEMPO CONFIGURABLE:**

**Sección 2.1 completamente reescrita:**
- Duración del tick configurable (por defecto: 10 minutos)
- Configuración almacenada en base de datos (tabla `game_config`)
- Laravel Scheduler ejecuta comando `game:process-tick` según configuración
- Todos los sistemas del juego ahora funcionan en base a ticks
- Ejemplos de tiempos calculados con tick de 10 minutos
- Nota sobre ajuste automático si cambia duración del tick

**Sistema Social rediseñado con ticks en lugar de horas:**
- **Energía:** Recuperación pasiva cada 2 ticks, dormir 48 ticks, cooldown inconsciente 6 ticks
- **Nutrición:** Degradación cada 6 ticks, buff de comida 12 ticks
- **Moral:** Cambios cada 144 ticks (equivalente a 1 día), socializar cooldown 144 ticks
- **Estrés:** Cambios cada 6 ticks en espacio/estación
- **Relaciones:** Aumento cada 6 ticks al pasar tiempo juntos
- **Actividades recreativas:** Dormir 36 ticks, gimnasio cooldown 6 ticks, meditación 72 ticks

**Cooldowns del juego convertidos a ticks:**
- Actualización de clon: 144 ticks (~24h)
- Declaración de guerra: 144 ticks (~24h)
- Duración mínima guerra: 1008 ticks (~7 días)

**NUEVA TABLA: game_config (Sección 16.1)**
- Almacena configuraciones globales del juego
- Campos: config_key, config_value, value_type, description, category
- 10 configuraciones iniciales pre-cargadas
- Helper PHP `gameConfig()` con cache para rendimiento
- Soporte para tipos: integer, float, string, boolean, json
- Índices para búsquedas optimizadas

**NUEVO MENÚ: Panel de Administración (Sección 14.3.8)**
- Ruta: `/admin` (solo administradores)

**Configuración del Sistema de Ticks:**
- Cambiar duración del tick en tiempo real
- Ver estado del sistema y último tick ejecutado
- Ejecutar tick manualmente para testing
- Advertencias sobre impacto de cambios

**Configuración Social:**
- Ajustar recuperación energía offline
- Configurar degradación de nutrición
- Modificar frecuencia de cambios de estrés
- Definir equivalencias de tiempo (ticks por día)

**Configuración de Cooldowns:**
- Cooldown inconsciente, clon, guerra, etc.

**Características:**
- Cambios aplicados inmediatamente con cache invalidation
- Historial de cambios con timestamp
- Validaciones de valores
- Cálculos automáticos de equivalencias
- Botón restaurar defaults

**BENEFICIOS DEL SISTEMA:**
- Balanceo del juego ajustable sin tocar código
- Testing más flexible (cambiar tick duration para pruebas rápidas)
- Adaptación a diferentes estilos de juego (casual vs hardcore)
- Escalabilidad para eventos especiales (ticks más rápidos temporalmente)
- Transparencia total de configuración para administradores

---

### v1.4 - 2025-11-27

**ACLARACIÓN CRÍTICA: Interfaz Gráfica Moderna**
- Agregada aclaración en Sección 1.1: Vaxav es un juego web con GUI moderna, NO un juego ASCII
- **Sección 14:** Nota importante sobre mockups - todos los diagramas ASCII son ilustrativos
- **Sección 15 completamente reescrita:**
  - Visión completa de la interfaz gráfica moderna
  - Principios de diseño visual detallados
  - Paleta de colores sci-fi (tonos oscuros + acentos neón)
  - Tema visual "Void Command" - estética de comando espacial
  - Referentes: EVE Online, Popmundo, OGame, interfaces sci-fi modernas
  - Especificaciones técnicas: Tailwind CSS, Alpine.js, componentes Blade

**Nuevas herramientas UI recomendadas:**
- Chart.js/ApexCharts para gráficos
- Headless UI para componentes
- Particles.js para efectos visuales
- Heroicons para iconografía

**Características de la GUI:**
- Completamente responsive (desktop/tablet/móvil)
- Animaciones suaves y transiciones
- Progress bars visuales y animadas
- Sistema de notificaciones con badges
- Tooltips elegantes
- Modals con overlays
- El juego es **rico en información pero visualmente organizado**
- Los mockups ASCII son **wireframes funcionales** para el equipo de diseño

---

### v1.3 - 2025-11-27

**Nueva sección completa: Sistema Social y Estado del Piloto (Sección 13):**

**4 Atributos del piloto:**
1. Energía (0-100) - Sistema anti-grinding, fatiga, mecánica de descanso
2. Nutrición (0-100) - Sistema de alimentación con items consumibles
3. Moral (0-100) - Estado anímico que afecta experiencia ganada
4. Estrés Espacial (0-100) - Presión psicológica, mayor en combate/espacio

**Sistema de Relaciones Sociales:**
- 6 niveles de amistad (Desconocido → Mejor amigo)
- Bonificadores por nivel: eficiencia, descuentos, moral
- Mecánicas inspiradas en Popmundo
- Acciones sociales: pasar tiempo juntos, ayudarse, eventos especiales
- Formas de aumentar/disminuir relación

**Sistema de Reputación Personal:**
- Honorabilidad (afecta seguros y préstamos)
- Fiabilidad en Combate (afecta invitaciones a flotas)
- Reputación Comercial (afecta comisiones de mercado)

**Actividades Recreativas:**
- Descansar, dormir, socializar, entretenimiento
- Ejercicio físico, meditación
- Sistema de cooldowns y costos

**Efectos en gameplay:**
- Todos los atributos afectan cálculos de acciones
- Ejemplo completo de cálculo con modificadores
- Panel de estado siempre visible
- Vista detallada `/pilot/status`

**Mecánica anti-grinding:**
- Si energía llega a 0 = inconsciente + cooldown 1h
- Requiere gestión activa de recursos del piloto
- Fomenta sesiones de juego balanceadas

**Base de Datos actualizada:**
- Tabla `pilots` con campos: energy, nutrition, morale, stress, last_ate_at, last_rested_at
- Tabla `pilots` con reputación: honorability, combat_reliability, trade_reputation
- Nueva tabla `pilot_relationships` para relaciones sociales
- Nueva tabla `social_activities` para log de interacciones
- Nueva tabla `pilot_attributes_log` para historial de cambios
- Items tipo 'food' con metadata para buffs y restauración

**Componente social:**
- Sistema completo de amistades con beneficios progresivos
- Economía de relaciones (comercio entre amigos con descuentos)
- Sistema de moral impactado por amistades y corporación

---

### v1.2 - 2025-11-27

**Nueva sección completa: Sistema de Menús y Navegación (Sección 14):**

**10 Menús principales detallados:**
1. Licencia de Piloto - ID card con información del piloto
2. Registro del Capitán - Historial completo (combate, viajes, misiones, logros, línea de tiempo)
3. Habilidades - Gestión completa de skills
4. Nave - Vista general, fitting, carga/inventario
5. Activos - Vista global de items dispersos por el universo
6. Mercado - Sistema de trading completo con gráficos
7. Billetera - Gestión financiera y estadísticas
8. Corporación - Panel de gestión corporativa
9. Mapa - Navegación visual textual del universo
10. Mensajería - Sistema de emails entre jugadores

**7 Menús adicionales:**
- Contratos (transporte, fabricación, courier)
- Industria (producción centralizada)
- Flotas (cooperativo PvE/PvP)
- Notificaciones (centro de alertas)
- Configuración (preferencias del juego)
- Amigos y Contactos
- Rankings/Leaderboards

**Menús contextuales** según ubicación del jugador
- Mockups textuales completos para cada menú
- Sistema de navegación coherente y profesional

---

### v1.1 - 2025-11-27

**Sistema de Inyección de Habilidades expandido:**
- Habilidades no disponibles desde el inicio, deben ser inyectadas
- Sistema de estados: No Descubierta → Descubierta → Inyectada (Nivel 0-5)
- Inyectores como items comercializables
- Catálogos de laboratorio especializados por tipo de estación

**Mercado de Habilidades:**
- Sistema de órdenes estilo EVE Online (buy/sell orders)
- Mercado regional conectando múltiples estaciones
- Interfaz de búsqueda integrada desde árbol de habilidades
- Economía de arbitraje de inyectores

**Laboratorios especializados:**
- 5 tipos: Minero, Militar, Comercial, Investigación, Exploración
- Cada laboratorio con catálogo limitado según especialización
- Descuentos progresivos por nivel de laboratorio (hasta 20%)
- Sistema de descubrimiento de habilidades

**Base de Datos actualizada:**
- Tabla `pilot_skills` con campos `is_injected` y `injected_at`
- Nueva tabla `pilot_discovered_skills`
- Nueva tabla `laboratory_catalogs`
- Nueva tabla `laboratory_specializations`
- Nueva tabla `market_orders` para sistema de trading
- Nueva tabla `market_transactions` para historial
- Items con metadata JSONB para inyectores y aceleradores

**URLs adicionales:**
- `/pilot/skills/tree`, `/pilot/skills/discovered`, `/pilot/skills/injected`
- `/station/{id}/laboratory/*` rutas completas
- `/market/browse/injectors/*` sección dedicada

---

### v1.0 - 2025-11-27

- Documento inicial
- Definición de todas las mecánicas core
- Estructura de base de datos preliminar
- Stack tecnológico definido
- Roadmap de desarrollo

---

## Notas Finales

Este PRD es un **documento vivo** que evolucionará con el desarrollo del proyecto. Se espera que se agreguen, modifiquen y refinen secciones a medida que se implementen features y se reciba feedback de testing.

**Próximos Pasos:**
1. Configurar entorno Docker
2. Inicializar proyecto Laravel
3. Configurar base de datos PostgreSQL
4. Implementar modelos base
5. Comenzar con Fase 1 (MVP)

---

## Navegación

- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-FutureConsiderations.md](./PRD-FutureConsiderations.md)
