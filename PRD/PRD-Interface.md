# Interfaz de Usuario y Navegación

**Parte del:** PRD - Vaxav
**Versión:** 2.1
**Fecha:** 2025-11-29
**Estado:** Documento Vivo - En Desarrollo

## Changelog

### Versión 2.1 (2025-11-29) - Filosofía AFK-Friendly Integrada
**Agregado:**
- ✅ Sección 14: Filosofía de Diseño AFK-Friendly como principio fundamental
  - Documentación clara del patrón: Iniciar → Esperar AFK → Ver Resumen
  - Ejemplos de todas las acciones (minería, combate, exploración, misiones, viajes)
  - Implicaciones para GUI: botones claros, progreso visible, logs detallados
  - Eliminación de mecánicas de "acercamiento" activo
- ✅ Sección 14.2.11: Nota AFK-friendly en exploración
  - Clarificación que puzzles mostrados son narrativos
  - Implementación real: exploración automática pasiva
- ✅ Sección 15.2: Filosofía AFK-Friendly como prioridad máxima en principios de diseño
  - Acciones claras de inicio/fin
  - Estado visible en HUD
  - Resúmenes detallados post-acción
  - No penalización por ausencia
- ✅ Actualización de botón [Minar] → [Iniciar Minería] con nota explicativa

### Versión 2.0 (2025-11-28) - Interfaz de Crafting Completa
**Agregado:**
- ✅ Sección 15.6: Interfaz de Consola de Construcción completa
  - Layout principal con búsqueda y filtrado
  - Vista de detalles con renderizado 3D (opcional)
  - Receta de fabricación interactiva con materiales requeridos vs disponibles
  - Cola de fabricación con progreso animado
  - Árbol de dependencias expandible
- ✅ Sección 15.7: Sistema de Información de Ítems (Tooltips)
  - Formato de tooltip para naves (stats completos, skills, recetas)
  - Formato de tooltip para módulos (stats de combate, recetas)
  - Formato de tooltip para componentes (receta, usado en X items)
  - Formato de tooltip para recursos (categoría A/B, fuente, extracción)
  - Árbol de dependencias interactivo con visualización gráfica
  - Navegación integrada (Ir a Mercado, Ver Árbol, etc.)
  - Comparación de precios NPC vs mercado
  - Exportar lista de compras con materiales crudos

**Características del Sistema:**
- ✅ Tooltips contextuales que aparecen en hover
- ✅ Indicadores visuales de disponibilidad (✓/✗)
- ✅ Links clickeables en listas de materiales
- ✅ Cálculo recursivo de materiales en árbol de dependencias
- ✅ Botón "Obtener Materiales Faltantes" → filtro en mercado
- ✅ Filtros avanzados (tier, categoría, tengo materiales, puedo fabricar)

### Versión 1.5 (2025-11-28) - Interfaz Social y Comercios

[Volver al PRD Master](./PRD-Master.md)

---

## 14. Sistema de Menús y Navegación

**FILOSOFÍA DE DISEÑO: AFK-FRIENDLY**

**VAXAV es un juego ASÍNCRONO diseñado para jugadores que no pueden estar pegados a la pantalla.**

**Principio fundamental:**
> El jugador INICIA una acción → DEJA el juego AFK → REGRESA para ver el RESUMEN detallado de resultados

**Esto significa que TODAS las acciones en el juego siguen este patrón:**

1. **Minería**: Click "Iniciar Minería" → Esperar 60 ticks → Ver resumen con recursos extraídos, encuentros, eventos
2. **Combate**: Click "Atacar NPC" → Combate se resuelve automáticamente → Ver resumen detallado (módulos usados, daño, botín)
3. **Exploración**: Click "Explorar Derelicto" → Exploración automática → Ver resumen de hackeos, loot, peligros
4. **Misiones**: Click "Aceptar Misión" → Misión se ejecuta automáticamente → Ver resumen de eventos
5. **Viajes**: Click "Viajar a Sistema X" → Viaje automático en N ticks → Llegar y ver eventos del viaje

**Implicaciones para la GUI:**

- ✅ **SÍ**: Botones claros "Iniciar [Acción]", progreso visible, resúmenes detallados
- ✅ **SÍ**: Indicadores de "tu nave está minando..." con barra de progreso
- ✅ **SÍ**: Logs detallados de lo que sucedió mientras estabas AFK
- ❌ **NO**: Mecánicas de "acercamiento" activo o animado
- ❌ **NO**: Acciones que requieran atención constante
- ❌ **NO**: Gameplay que penalice estar ausente

**El HUD muestra claramente el estado actual**: "⚙️ Minando... 5/10" para que el jugador sepa que su personaje está haciendo algo productivo mientras está ausente.

---

**NOTA TÉCNICA:**
Todos los mockups mostrados en esta sección están en formato ASCII/texto **únicamente con fines ilustrativos** para comunicar la estructura de información, jerarquía de datos y funcionalidades de cada menú.

**La interfaz real será una GUI web moderna** con:
- Diseño visual profesional y atractivo
- Componentes interactivos (dropdowns, modals, tooltips)
- Animaciones y transiciones suaves
- Gráficos visuales (charts, progress bars, iconos)
- Responsive design para todos los dispositivos
- Paleta de colores sci-fi (ver Sección 15)
- **Énfasis en claridad de estado y progreso AFK-friendly**

Los mockups sirven como wireframes funcionales que el equipo de diseño UI/UX utilizará para crear la interfaz visual real.

---

### 14.1 HUD Persistente (Barra Superior Compacta)

**Ruta:** Componente global `<x-persistent-hud />` visible en TODAS las páginas

Barra fija en la parte superior mostrando información crítica del piloto sin necesidad de navegar entre menús. Siempre visible, actualizada en tiempo real.

**Mockup Visual:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📍 Vaxav III - Órbita  🛡️ Seg: 0.8  ⏱️ Tick: 3:42  ⚙️ Minando... 5/10  │
│ ❤️ 1500/2000 HP  ⚡ 450/500 Cap  💰 125,450₡  🔔 [3]        [John Doe ▼] │
└──────────────────────────────────────────────────────────────────────────┘
```

**Elementos del HUD (de izquierda a derecha):**

**1. 📍 Ubicación Actual**
- Formato: "Sistema - Ubicación Específica"
- Ejemplos:
  - "Vaxav I - Hangar"
  - "Nova-VII - Belt Asteroide 3"
  - "Desconocido - Agujero Gusano"
- Click: Abre mapa del sistema
- Tooltip: Coordenadas exactas

**2. 🛡️ Seguridad del Sistema** (Color-coded)
- Verde (1.0): "Seg: 1.0"
- Amarillo (0.5-0.9): "Seg: 0.7"
- Naranja (0.1-0.4): "Seg: 0.3"
- Rojo (0.0): "Seg: 0.0"
- Tooltip: "Advertencia de Albatross: Respuesta inmediata en sistemas de alta seguridad"

**3. ⏱️ Countdown Próximo Tick**
- Formato: "Tick: MM:SS"
- Color dinámico:
  - Verde: > 2 minutos
  - Amarillo: 1-2 minutos
  - Rojo: < 1 minuto
- Tooltip: "Próximo tick del servidor en X minutos Y segundos"

**4. ⚙️ Acción en Curso**
- Si idle: "✓ Idle" (verde)
- Si en acción: "⚙️ [Acción]... X/Y" con barra de progreso
- Ejemplos:
  - "⛏️ Minando... 5/10"
  - "🚀 Viajando... 2/5"
  - "⚔️ En Combate (Tick 3)"
  - "🔬 Escaneando... 7/12"
  - "🔧 Hackeando Terminal... 4/8"
- Click: Abre detalles de la acción (permite cancelar)
- Color: Azul (acción normal), Rojo (combate), Verde (completado)

**5. ❤️ HP Total Nave**
- Formato: "❤️ current/max HP"
- Color dinámico:
  - Verde: > 70%
  - Amarillo: 40-70%
  - Rojo: < 40%
- Tooltip: Desglose detallado
  - "Escudos: 450/500 (90%)"
  - "Armadura: 800/800 (100%)"
  - "Estructura: 250/250 (100%)"

**6. ⚡ Capacitor Nave**
- Formato: "⚡ current/max Cap"
- Solo visible si la nave tiene módulos activos
- Color dinámico:
  - Verde: > 50%
  - Amarillo: 25-50%
  - Rojo: < 25%
- Tooltip: "Capacitor agotándose en X ticks al ritmo actual"

**7. 💰 Créditos Actuales**
- Formato: "💰 X₡" (con separador de miles)
- Ejemplos: "125,450₡", "1,234,567₡"
- Click: Abre billetera
- Tooltip: Cambio en últimas 24h: "+15,000₡ (+13%)"

**8. 🔔 Notificaciones**
- Badge numérico: "🔔 [3]" si hay notificaciones pendientes
- Desaparece cuando no hay notificaciones
- Click: Abre panel flotante de notificaciones
- Tipos:
  - Mensajes de otros pilotos
  - Alertas de combate ("¡Estás bajo ataque!")
  - Operaciones completadas
  - Eventos de sistema
- Color rojo si hay notificaciones urgentes

**9. [Nombre Piloto ▼]**
- Dropdown menu con:
  - Ver Licencia
  - Habilidades
  - Configuración
  - Cerrar Sesión
- Muestra avatar del piloto (si existe)

**Implementación Técnica:**

**Blade Component:**
```php
// resources/views/components/persistent-hud.blade.php
<x-persistent-hud
    :pilot="$pilot"
    :current-location="$location"
    :tick-remaining="$tick_seconds"
    :current-action="$action"
/>
```

**Alpine.js Reactivity:**
```javascript
// Actualización cada 10 segundos
Alpine.data('persistentHud', () => ({
    tickRemaining: 180,
    init() {
        setInterval(() => {
            this.tickRemaining--;
            if (this.tickRemaining <= 0) {
                this.fetchUpdatedState(); // Poll servidor
                this.tickRemaining = 600; // Reset a 10 min
            }
        }, 1000);
    }
}));
```

**CSS:**
```css
.persistent-hud {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(0, 10, 20, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}
```

**Responsive (Mobile):**
En móvil, la barra se colapsa a:
```
┌──────────────────────────────────────────┐
│ 📍 Vaxav III  🛡️ 0.8  ⏱️ 3:42  [≡ Más] │
└──────────────────────────────────────────┘
```
- Click en "[≡ Más]" expande todos los elementos

---

### 14.2 Menú Principal

Barra de navegación global debajo del HUD con acceso a todos los menús principales.

**Estructura del Menú:**

```
┌────────────────────────────────────────────────────────────────────────┐
│ VAXAV    [Licencia] [Registro] [Habilidades] [Nave] [Activos]        │
│          [Mercado] [Billetera] [Corporación] [Mapa] [Mensajería]      │
│          [Exploración]                                                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 14.2 Menús Principales

### 14.2.1 Licencia de Piloto

**Ruta:** `/pilot/license`

Información básica del personaje estilo "ID Card" o licencia oficial.

**Contenido:**

```
╔═══════════════════════════════════════════════════════════╗
║              LICENCIA DE PILOTO INTERESTELAR             ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  NOMBRE:           John Doe                               ║
║  ID PILOTO:        #00012847                              ║
║  FECHA NACIMIENTO: 15 de Marzo, 2125                      ║
║  EDAD:             28 años                                ║
║                                                           ║
║  CORPORACIÓN:      Mineros del Vacío S.A.                ║
║  FACCIÓN:          Confederación Vaxav                   ║
║  RANGO:            Piloto Experimentado                   ║
║                                                           ║
║  ESTACIÓN BASE:    Vaxav I - Luna 1 - Puerto Génesis     ║
║  UBICACIÓN ACTUAL: Vaxav III - Órbita                    ║
║  NAVE ACTIVA:      Excavador MK-I "La Fortuna"           ║
║                                                           ║
║  ESTADO:           ⚫ En Línea                            ║
║  DESDE:            2025-11-27                             ║
║                                                           ║
║  REPUTACIÓN:                                              ║
║    Confederación Vaxav:  ████████░░  +45                 ║
║    Liga Libre:           ███░░░░░░░  -15                 ║
║    Sindicato Técnico:    ██████░░░░  +20                 ║
║    Flota Nómada:         █████░░░░░  0                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

[Ver Perfil Completo] [Editar Bio] [Historial de Kills]
```

**Información Incluida:**
- Nombre y ID único del piloto
- Fecha de nacimiento (fecha creación de personaje)
- Corporación y facción actual
- Rango basado en experiencia/logros
- Estación base (última estación donde se atracó)
- Ubicación actual
- Nave activa
- Estado (online/offline)
- Barras de reputación con todas las facciones principales
- Estadísticas básicas (kills, muertes, misiones completadas)

### 14.2.2 Registro del Capitán

**Ruta:** `/pilot/registry`

Historial completo de actividades y logros del piloto.

**Secciones:**

**1. Historial de Combate:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE COMBATE                                            │
├──────────────┬──────────────────────────┬───────────┬───────────┤
│ Fecha        │ Víctima/Atacante         │ Resultado │ Valor     │
├──────────────┼──────────────────────────┼───────────┼───────────┤
│ 2025-11-25   │ Pirata "Scar" (NPC)      │ Victoria  │ 5,000 ₡   │
│ 2025-11-23   │ Jane Smith               │ Derrota   │ -25,000 ₡ │
│ 2025-11-20   │ Bandido del Vacío (NPC)  │ Victoria  │ 2,500 ₡   │
└──────────────┴──────────────────────────┴───────────┴───────────┘
Victorias: 45 | Derrotas: 12 | Ratio: 3.75
```

**2. Historial de Viajes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ÚLTIMOS VIAJES                                                  │
├──────────────┬──────────────────────────┬──────────────────────┤
│ Fecha        │ Origen → Destino         │ Duración             │
├──────────────┼──────────────────────────┼──────────────────────┤
│ 2025-11-27   │ Vaxav I → Vaxav III      │ 45 ticks (22 min)    │
│ 2025-11-26   │ Vaxav III → Vaxav I      │ 45 ticks (22 min)    │
└──────────────┴──────────────────────────┴──────────────────────┘
Saltos totales: 1,247 | Distancia total: 2,847,392 AU
```

**3. Historial de Misiones:**

```
┌─────────────────────────────────────────────────────────────────┐
│ MISIONES RECIENTES                                              │
├──────────────┬─────────────────┬────────┬─────────┬────────────┤
│ Fecha        │ Misión          │ Tipo   │ Estado  │ Recompensa │
├──────────────┼─────────────────┼────────┼─────────┼────────────┤
│ 2025-11-26   │ Minar Tritanio  │ Minería│ ✓       │ 15,000 ₡   │
│ 2025-11-24   │ Escoltar Convoy │ Combate│ ✓       │ 35,000 ₡   │
│ 2025-11-22   │ Recuperar Datos │ Explor.│ ✗ Falló │ 0 ₡        │
└──────────────┴─────────────────┴────────┴─────────┴────────────┘
Completadas: 87 | Fallidas: 5 | Ratio éxito: 94.6%
```

**4. Logros y Hitos:**

```
╔═══════════════════════════════════════════════════════════╗
║ LOGROS DESBLOQUEADOS                              23/150  ║
╠═══════════════════════════════════════════════════════════╣
║ ⭐ Primer Salto                    Desbloqueado 2025-11-01║
║ ⭐ Minero Novato (1K minerales)    Desbloqueado 2025-11-05║
║ ⭐ Millonario (1M créditos)        Desbloqueado 2025-11-15║
║ ⭐ Asesino Despiadado (10 kills)   Desbloqueado 2025-11-20║
║ 🔒 Magnate (100M créditos)         Bloqueado              ║
║ 🔒 Explorador (Visitar 10 sistemas) Bloqueado            ║
╚═══════════════════════════════════════════════════════════╝
```

**Indicador de Notificaciones en GUI:**

El Registro del Capitán es el **sistema central de notificaciones** del juego. En la barra de navegación principal, junto a "Registro" debe aparecer:

```
[Registro del Capitán (🔔 12)]  ← Badge con número de notificaciones sin leer
```

- Número en badge rojo indica eventos nuevos sin leer
- Al hacer hover: tooltip "12 eventos nuevos desde tu última visita"
- Al entrar al Registro, los eventos se marcan como "leídos"
- Badge desaparece cuando no hay eventos nuevos

**Vista Unificada "Todos los Eventos":**

```
╔═══════════════════════════════════════════════════════════════════╗
║ REGISTRO DEL CAPITÁN - TODOS LOS EVENTOS          [🔔 Sin leer: 5]║
╠═══════════════════════════════════════════════════════════════════╣
║ Filtros: [Todos] [Combate] [Viajes] [Misiones] [Logros]         ║
║          [Economía] [Social] [Habilidades] [Corporación] [Sistema]║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ 🆕 2025-11-27 14:32  💬 SOCIAL      Charlar con Jane Smith       ║
║                      Relación +3 (ahora: 79/100 - Amigo Cercano) ║
║                                                                   ║
║ 🆕 2025-11-27 14:15  💰 ECONOMÍA    Venta de Tritanio            ║
║                      +15,000₡ (Balance: 250,450₡)                ║
║                                                                   ║
║ 🆕 2025-11-27 13:45  ⚔️ COMBATE     Victoria contra Pirata (NPC) ║
║                      Botín: 5,000₡ | Exp: +250                   ║
║                                                                   ║
║ 🆕 2025-11-27 12:20  📈 HABILIDAD   Nivel subió: Carisma IV      ║
║                      Nuevo límite interacciones: 11/día          ║
║                                                                   ║
║ 🆕 2025-11-27 10:05  ⚠️ SISTEMA     Moral baja detectada         ║
║                      Moral: 35/100 - Considera descansar         ║
║                                                                   ║
║    2025-11-26 18:30  🚀 VIAJE       Vaxav I → Vaxav III          ║
║                      Completado en 45 ticks                      ║
║                                                                   ║
║    2025-11-26 15:15  💼 MISIÓN      "Minar Tritanio" completada  ║
║                      Recompensa: 15,000₡ | Exp: +180             ║
║                                                                   ║
║    2025-11-26 12:00  👥 CORPORACIÓN Nuevo miembro: Sarah Lee     ║
║                      Bienvenida a Mineros del Vacío!             ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║ Mostrando 8 de 2,847 eventos | [Página 1 de 356]                ║
║ [Anterior] [1] [2] [3] ... [356] [Siguiente]                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Categorías de eventos adicionales:**

**5. Historial de Economía:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE ECONOMÍA                                           │
├──────────────┬──────────────────────────┬───────────┬───────────┤
│ Fecha        │ Evento                   │ Item/NPC  │ Cambio    │
├──────────────┼──────────────────────────┼───────────┼───────────┤
│ 2025-11-27   │ 💰 Venta en mercado      │ Tritanio  │ +15,000₡  │
│ 2025-11-27   │ 💸 Compra de módulo      │ Láser MK2 │ -25,000₡  │
│ 2025-11-26   │ 🎁 Regalo recibido       │ Jane Smith│ +5,000₡   │
│ 2025-11-26   │ 💼 Contrato completado   │ Agente Han│ +35,000₡  │
│ 2025-11-25   │ ⚠️ Orden expirada        │ Magnetita │ 0₡        │
│ 2025-11-24   │ 💵 Préstamo recibido     │ Marcus    │ +50,000₡  │
│ 2025-11-23   │ 📉 Pérdida en mercado    │ Isógeno   │ -8,000₡   │
└──────────────┴──────────────────────────┴───────────┴───────────┘
Balance neto (7 días): +62,000₡ | Transacciones: 47
```

**6. Historial Social:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL SOCIAL                                                │
├──────────────┬──────────────────────────┬───────────┬───────────┤
│ Fecha        │ Evento                   │ Piloto    │ Cambio    │
├──────────────┼──────────────────────────┼───────────┼───────────┤
│ 2025-11-27   │ 💬 Charlar               │ Jane Smith│ +3 rel    │
│ 2025-11-27   │ 🍺 Invitar Bebidas       │ Marcus    │ +12 rel   │
│ 2025-11-26   │ 💕 Coquetear (éxito)     │ Jane Smith│ +10 rel   │
│ 2025-11-26   │ 📈 Nivel de amistad      │ Marcus    │ → Amigo   │
│ 2025-11-25   │ 💔 Ruptura automática    │ Sarah Lee │ -50 moral │
│ 2025-11-24   │ 🎁 Recibiste regalo      │ Bob       │ +8 rel    │
│ 2025-11-23   │ ⚠️ Fallo crítico social  │ Tom       │ -5 rel    │
│ 2025-11-22   │ 💍 Propuesta aceptada    │ Jane Smith│ → Unidos  │
└──────────────┴──────────────────────────┴───────────┴───────────┘
Total interacciones: 247 | Éxito: 89% | Relaciones activas: 8
```

**7. Historial de Habilidades:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE HABILIDADES                                        │
├──────────────┬──────────────────────────┬───────────────────────┤
│ Fecha        │ Evento                   │ Habilidad             │
├──────────────┼──────────────────────────┼───────────────────────┤
│ 2025-11-27   │ 📈 Nivel subió           │ Carisma III → IV      │
│ 2025-11-26   │ 💉 Habilidad inyectada   │ Seducción (Nivel 0)   │
│ 2025-11-25   │ 🔍 Habilidad descubierta │ Diplomacia            │
│ 2025-11-24   │ 📈 Nivel subió           │ Minería IV → V        │
│ 2025-11-22   │ 💉 Habilidad inyectada   │ Pilotaje Cruceros     │
└──────────────┴──────────────────────────┴───────────────────────┘
Habilidades inyectadas: 12 | Nivel promedio: 3.2
```

**8. Historial de Corporación:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE CORPORACIÓN                                        │
├──────────────┬──────────────────────────┬───────────────────────┤
│ Fecha        │ Evento                   │ Detalles              │
├──────────────┼──────────────────────────┼───────────────────────┤
│ 2025-11-27   │ 👥 Nuevo miembro         │ Sarah Lee se unió     │
│ 2025-11-26   │ 💼 Impuestos pagados     │ 5,000₡ a corp         │
│ 2025-11-25   │ 🏆 Promoción             │ Rango: Capitán        │
│ 2025-11-23   │ 📦 Depósito en hangar    │ 500 Tritanio          │
│ 2025-11-20   │ 🎯 Misión corp asignada  │ "Defender Estación"   │
│ 2025-11-15   │ 🏢 Unión a corporación   │ Mineros del Vacío     │
└──────────────┴──────────────────────────┴───────────────────────┘
Contribución total: 125,000₡ | Misiones corp: 15
```

**9. Historial de Sistema:**

```
┌─────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE SISTEMA                                            │
├──────────────┬──────────────────────────┬───────────────────────┤
│ Fecha        │ Evento                   │ Detalles              │
├──────────────┼──────────────────────────┼───────────────────────┤
│ 2025-11-27   │ ⚡ Energía en 0          │ Inconsciente 6 ticks  │
│ 2025-11-26   │ ⚠️ Moral baja            │ Moral: 25/100         │
│ 2025-11-25   │ 🍖 Hambriento            │ Nutrición: 15/100     │
│ 2025-11-24   │ 💭 Estrés alto           │ Estrés: 85/100        │
│ 2025-11-23   │ 🔧 Nave reparada         │ Excavador MK-I        │
│ 2025-11-22   │ 🛡️ Clon actualizado      │ Estación Vaxav Prime  │
└──────────────┴──────────────────────────┴───────────────────────┘
Advertencias activas: 2 | Última actualización clon: hace 5 días
```

**10. Línea de Tiempo (Actualizada con eventos sociales):**

```
═══════════════════════════ LÍNEA DE VIDA ═══════════════════════════
│
├─ 2025-11-01  🎂 Nacimiento en Puerto Estelar Génesis
├─ 2025-11-01  🎓 Carrera iniciada: Minero
├─ 2025-11-02  ⚔️  Primera muerte
├─ 2025-11-05  🏭 Primera fabricación exitosa
├─ 2025-11-08  👋 Primera amistad formada (Marcus Steel)
├─ 2025-11-10  🏢 Unión a corporación "Mineros del Vacío"
├─ 2025-11-12  💕 Primera relación romántica (Sarah Lee)
├─ 2025-11-15  💰 Alcanzado 1M créditos
├─ 2025-11-18  💔 Ruptura con Sarah Lee
├─ 2025-11-20  🚀 Primera nave Crucero adquirida
├─ 2025-11-22  💍 Unidos con Jane Smith
├─ 2025-11-25  🌟 Primera amistad nivel "Mejor Amigo" (Marcus)
└─ 2025-11-27  📍 Ubicación actual
```

**Eventos sociales registrados en línea de tiempo:**
- 👋 Primera amistad (relación >25)
- 💕 Primera relación romántica
- 💔 Rupturas importantes
- 💍 Uniones/Matrimonios
- 🌟 Hitos de amistad (Mejor Amigo)
- 🎊 Eventos especiales (ej: sobrevivir combate con amigo)

### 14.2.3 Habilidades

**Ruta:** `/pilot/skills`

Sistema completo de gestión de habilidades (ver [PRD-GameDesign.md](./PRD-GameDesign.md) para detalles completos).

**Vistas:**
- **Árbol de Habilidades:** Vista jerárquica con dependencias
- **Habilidades Inyectadas:** Solo las que el piloto posee
- **Habilidades Descubiertas:** No inyectadas pero visibles
- **Buscar en Mercado:** Integración directa con mercado

### 14.2.4 Nave

**Ruta:** `/ship/current` o `/ship/{ship_id}`

Menú dedicado a la nave activa con submenús.

**Submenús:**

**1. Vista General:**

```
╔═══════════════════════════════════════════════════════════╗
║  EXCAVADOR MK-I "La Fortuna"                              ║
║  Fragata Minera                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ⚡ ESTADO DE SISTEMAS                                    ║
║    Escudos:     ████████░░  450/500  (90%)               ║
║    Armadura:    ██████████  800/800  (100%)              ║
║    Estructura:  ██████████  600/600  (100%)              ║
║    Energía:     ███████░░░  700/1000 (70%)               ║
║                                                           ║
║  📦 CARGA                                                 ║
║    Usado:       3,250/5,000 m³  (65%)                    ║
║                                                           ║
║  ⚙️  MÓDULOS ACTIVOS                                      ║
║    ● Láser de Minería Básico     [ACTIVO]                ║
║    ● Expansor de Carga I         [PASIVO]                ║
║    ○ Escudo Básico              [OFFLINE]                ║
║                                                           ║
║  📍 UBICACIÓN                                             ║
║    Vaxav III - Campo de Asteroides Alpha                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

[Gestionar Módulos] [Ver Carga] [Reparar] [Cambiar Nave]
```

**2. Fitting (Módulos):**

```
┌───────────────────────────────────────────────────────────┐
│ CONFIGURACIÓN DE MÓDULOS                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ SISTEMAS OFENSIVOS (1/1 usado)                           │
│  [█] Slot 1: Láser de Minería Básico                     │
│                                                           │
│ SISTEMAS DEFENSIVOS (1/2 usado)                          │
│  [█] Slot 1: Escudo Básico                               │
│  [ ] Slot 2: Vacío                                       │
│                                                           │
│ SISTEMAS DE UTILIDAD (1/3 usado)                         │
│  [█] Slot 1: Expansor de Carga I                         │
│  [ ] Slot 2: Vacío                                       │
│  [ ] Slot 3: Vacío                                       │
│                                                           │
└───────────────────────────────────────────────────────────┘

[Equipar Módulo] [Desequipar] [Guardar Fitting] [Cargar Fitting]
```

**3. Carga/Inventario:**

```
┌───────────────────────────────────────────────────────────┐
│ BODEGA DE CARGA - 3,250/5,000 m³                         │
├─────────────────────┬──────────┬───────────┬─────────────┤
│ Item                │ Cantidad │ Volumen   │ Total m³    │
├─────────────────────┼──────────┼───────────┼─────────────┤
│ Tritanio Crudo      │ 1,500    │ 1 m³      │ 1,500 m³    │
│ Pirita Cruda        │ 800      │ 1.5 m³    │ 1,200 m³    │
│ Munición Estándar   │ 500      │ 0.1 m³    │ 50 m³       │
│ Escudo Mejorado I   │ 1        │ 500 m³    │ 500 m³      │
└─────────────────────┴──────────┴───────────┴─────────────┘

[Transferir a Estación] [Desechar] [Ver Todo]
```

### 14.2.5 Activos

**Ruta:** `/pilot/assets`

Vista global de todos los items, naves y recursos del piloto dispersos por el universo.

```
╔═══════════════════════════════════════════════════════════╗
║ ACTIVOS TOTALES                         Valor: 2.5M ₡     ║
╠═══════════════════════════════════════════════════════════╣

📍 VAXAV I - LUNA 1 - PUERTO ESTELAR GÉNESIS
├─ 🚀 Naves (2)
│  ├─ Excavador MK-I "La Fortuna"        [EN USO]
│  └─ Fragata de Combate "Venganza"      250,000 ₡
├─ 📦 Items en Hangar (45 items)         125,000 ₡
│  ├─ Tritanio Puro (5,000 unidades)
│  ├─ Láser de Minería Avanzado (x2)
│  └─ ... [Ver más]
└─ 📦 Items en Bodega Estación (120)     450,000 ₡

📍 VAXAV III - LUNA 2 - ESTACIÓN MARTE
├─ 🚀 Naves (1)
│  └─ Carguero Ligero "Mercante"         300,000 ₡
└─ 📦 Items en Hangar (12 items)          75,000 ₡

📍 EN ÓRDENES DE MERCADO
├─ 💹 Órdenes de Venta (5)
│  ├─ Inyector de Minería x3            @ 20,000 ₡
│  ├─ Pirita Refinada x5000             @ 15,000 ₡
│  └─ ... [Ver más]
└─ Valor total bloqueado:                 250,000 ₡

═══════════════════════════════════════════════════════════
RESUMEN:
  Naves:              3           (800,000 ₡)
  Items:              177         (1,200,000 ₡)
  En mercado:         5 órdenes   (250,000 ₡)
  Créditos líquidos:  ──          (250,000 ₡)
  ─────────────────────────────────────────────
  TOTAL:                          2,500,000 ₡
```

**Filtros disponibles:**
- Por ubicación
- Por tipo (naves, módulos, minerales, etc.)
- Por valor
- Items en venta vs. almacenados

**Acciones:**
- Ver detalle de item/nave
- Contratar transporte de items
- Vender rápido
- Empaquetar todo en estación

### 14.2.6 Mercado

**Ruta:** `/market`

Sistema completo de comercio (ver [PRD-Economy.md](./PRD-Economy.md) para mecánicas completas).

**Secciones:**

**1. Explorar Mercado:**

```
┌───────────────────────────────────────────────────────────┐
│ MERCADO - Puerto Estelar Génesis                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ [🔍 Buscar...]                    [Filtros ▼] [Vista: 📋]│
│                                                           │
│ Categorías:                                               │
│   ⛏️  Minerales y Recursos                                │
│   🔧 Módulos de Nave                                      │
│   🚀 Naves                                                │
│   💉 Inyectores de Habilidad                              │
│   📘 Blueprints                                           │
│   🔋 Municiones y Cargas                                  │
│   📦 Otros                                                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**2. Vista de Item:**

```
╔═══════════════════════════════════════════════════════════╗
║ TRITANIO REFINADO                                         ║
╠═══════════════════════════════════════════════════════════╣
║ Mineral refinado básico usado en construcción de naves   ║
║ y módulos. El material más común en el universo.         ║
║                                                           ║
║ Volumen: 1 m³ | Precio Base: 100 ₡                       ║
╚═══════════════════════════════════════════════════════════╝

ÓRDENES DE VENTA (Comprar)
┌──────────┬──────────┬───────────────────────────┬──────────┐
│ Precio   │ Cantidad │ Ubicación                 │ Rango    │
├──────────┼──────────┼───────────────────────────┼──────────┤
│ 95 ₡     │ 50,000   │ Puerto Estelar Génesis    │ Estación │
│ 98 ₡     │ 120,000  │ Puerto Estelar Génesis    │ Estación │
│ 102 ₡    │ 80,000   │ Estación Marte            │ 5 saltos │
└──────────┴──────────┴───────────────────────────┴──────────┘

ÓRDENES DE COMPRA (Vender)
┌──────────┬──────────┬───────────────────────────┬──────────┐
│ Precio   │ Cantidad │ Ubicación                 │ Rango    │
├──────────┼──────────┼───────────────────────────┼──────────┤
│ 92 ₡     │ 30,000   │ Puerto Estelar Génesis    │ Estación │
│ 90 ₡     │ 75,000   │ Puerto Estelar Génesis    │ Regional │
│ 88 ₡     │ 100,000  │ Cualquiera                │ Regional │
└──────────┴──────────┴───────────────────────────┴──────────┘

[📈 Ver Gráfico] [Comprar Ahora] [Vender Ahora] [Crear Orden]
```

**3. Historial de Precios:**

```
HISTORIAL - TRITANIO REFINADO (Últimos 30 días)

Precio ₡
  110│                                    ╱╲
     │                                  ╱    ╲
  100│                        ╱╲      ╱      ╲
     │              ╱╲      ╱    ╲  ╱          ╲
   90│    ╱╲      ╱  ╲    ╱      ╲╱            ╲╱╲
     │  ╱    ╲  ╱      ╲╱
   80│╱        ╲╱
     └────────────────────────────────────────────────> Días
      30      25      20      15      10       5       0

Promedio 30d: 95 ₡
Máximo:      112 ₡  (hace 18 días)
Mínimo:       82 ₡  (hace 28 días)
Volumen 24h:  2.5M unidades
```

**4. Mis Órdenes:**

```
┌───────────────────────────────────────────────────────────┐
│ MIS ÓRDENES ACTIVAS                                  (8)  │
├──────┬─────────────┬────────┬──────────┬─────────┬────────┤
│ Tipo │ Item        │ Precio │ Cantidad │ Restante│ Expira │
├──────┼─────────────┼────────┼──────────┼─────────┼────────┤
│ SELL │ Tritanio    │ 98 ₡   │ 10,000   │ 7,500   │ 15d    │
│ BUY  │ Iny. Minería│ 18K ₡  │ 1        │ 1       │ 22d    │
│ SELL │ Pirita      │ 150 ₡  │ 5,000    │ 5,000   │ 8d     │
└──────┴─────────────┴────────┴──────────┴─────────┴────────┘

[Cancelar Orden] [Modificar] [Ver Historial]
```

### 14.2.7 Billetera

**Ruta:** `/wallet`

Gestión financiera completa del piloto.

```
╔═══════════════════════════════════════════════════════════╗
║ BILLETERA                                                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  💰 BALANCE PERSONAL                                      ║
║     Créditos:  250,450 ₡                                  ║
║                                                           ║
║  🏢 BALANCE CORPORATIVO (Mineros del Vacío S.A.)         ║
║     Créditos:  1,250,000 ₡                                ║
║     Tu acceso: Solo lectura                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

TRANSACCIONES RECIENTES
┌──────────────┬──────────────────────┬───────────┬──────────┐
│ Fecha        │ Descripción          │ Monto     │ Balance  │
├──────────────┼──────────────────────┼───────────┼──────────┤
│ 2025-11-27   │ Venta: Tritanio x500 │ +47,500 ₡ │ 250,450₡ │
│ 2025-11-27   │ Compra: Iny. Escudos │ -30,000 ₡ │ 202,950₡ │
│ 2025-11-26   │ Misión completada    │ +15,000 ₡ │ 232,950₡ │
│ 2025-11-26   │ Reparación de nave   │ -5,250 ₡  │ 217,950₡ │
│ 2025-11-25   │ Impuesto corporativo │ -2,500 ₡  │ 223,200₡ │
└──────────────┴──────────────────────┴───────────┴──────────┘

[Ver Histórico Completo] [Transferir] [Estadísticas]

ESTADÍSTICAS DEL MES
  Ingresos totales:     +450,000 ₡
  Gastos totales:       -285,000 ₡
  Balance neto:         +165,000 ₡

  Fuente principal:     Comercio (45%)
  Gasto principal:      Mejoras de nave (32%)
```

**Filtros:**
- Por tipo (compras, ventas, misiones, etc.)
- Por rango de fechas
- Por monto mínimo/máximo

### 14.2.8 Corporación

**Ruta:** `/corporation/{corp_id}`

Panel de gestión de corporación (ver [PRD-GameDesign.md](./PRD-GameDesign.md) para mecánicas completas).

**Vista para Miembros:**

```
╔═══════════════════════════════════════════════════════════╗
║ MINEROS DEL VACÍO S.A.                                    ║
║ Facción: Confederación Vaxav                              ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  CEO: Marcus Steel                                        ║
║  Miembros: 45                                             ║
║  Fundada: 2025-10-15                                      ║
║  Cuartel General: Puerto Estelar Génesis                  ║
║                                                           ║
║  Impuesto: 5%                                             ║
║  Balance: 1,250,000 ₡                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

MIEMBROS ONLINE (12/45)
┌────────────────────┬──────────────┬─────────────────────┐
│ Piloto             │ Rango        │ Ubicación           │
├────────────────────┼──────────────┼─────────────────────┤
│ ⚫ Marcus Steel    │ CEO          │ Vaxav I             │
│ ⚫ John Doe        │ Minero       │ Vaxav III           │
│ ⚫ Jane Smith      │ Director     │ Vaxav II            │
│ ⚫ Bob Johnson     │ Minero       │ Vaxav I             │
└────────────────────┴──────────────┴─────────────────────┘

[Chat Corporativo] [Solicitar Fondos] [Ver Hangares] [Diplomacia]
```

**Vista para CEO/Directores:**
- Gestión de miembros
- Configuración de impuestos
- Roles y permisos
- Declaraciones de guerra
- Gestión de estaciones corporativas
- Finanzas detalladas

### 14.2.9 Mapa

**Ruta:** `/map`

Representación textual del universo (ver [PRD-Universe.md](./PRD-Universe.md) para detalles del sistema).

**Vista de Sistema Solar:**

```
════════════════════ SISTEMA VAXAV ════════════════════

                         ☀️ VAXAV (Estrella)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
        🌑 I              🌍 II              🔴 III
      (2 lunas)         (1 luna)          (3 lunas)
          │                   │                   │
    ┌─────┴─────┐            │            ┌──────┼──────┐
    │           │            │            │      │      │
  Luna 1     Luna 2       Luna 1       Luna 1  Luna 2  Luna 3
   [3]        [1]          [2]          [2]    [1]     [0]

[Número] = Estaciones en la luna

📍 TU UBICACIÓN: Vaxav III - Órbita

════════════════════════════════════════════════════════

🚪 STARGATES DISPONIBLES (1/4 desbloqueados)
  → Stargate Alpha (destino: Sistema Kepler-442)

⚠️ Progreso de Sistema: ████████░░ 12,450/25,000
   Próximo desbloqueo: Stargate Beta (12,550 puntos más)

[Ver Planetas] [Ver Estaciones] [Saltar a Sistema] [Anomalías]
```

**Vista de Planeta:**

```
🌍 VAXAV II
Tipo: Planeta Rocoso
Gravedad: 1.2 G
Atmósfera: Tóxica

LUNA 1
├─ 📡 Estación "Observatorio Kepler"      [NPC - Sindicato Técnico]
└─ 📡 Estación "Puesto Científico 7"      [NPC - Sindicato Técnico]

RECURSOS CONOCIDOS:
  ⛏️  Isógeno (abundante)
  ⛏️  Megacita (raro)

ANOMALÍAS CERCANAS:
  ❓ Señal desconocida (escaneo requerido)

[Viajar] [Escanear] [Ver Estaciones]
```

**Vista Galáctica:**

```
═══════════════ GALAXIA CONOCIDA ═══════════════

    [Vaxav] ═══════════> [Kepler-442]
       │
       ╚═══════════> [???] (Stargate Beta - Bloqueado)

Sistemas explorados: 2/∞
Distancia total mapeada: 42 años luz

[Expandir Sistema] [Ver Rutas] [Stargates]
```

### 14.2.10 Mensajería

**Ruta:** `/messages`

Sistema de mensajes tipo email entre jugadores.

```
╔═══════════════════════════════════════════════════════════╗
║ MENSAJES                                     Nuevos: 3    ║
╠═══════════════════════════════════════════════════════════╣

[Nuevo Mensaje] [Actualizar]

BANDEJA DE ENTRADA
┌────────────────────────────────────────────────────────┐
│ ● Marcus Steel          [Corp] Reunión mañana          │
│   Hace 2 horas                                         │
│                                                        │
│ ● Jane Smith            RE: Venta de Tritanio          │
│   Hace 5 horas                                         │
│                                                        │
│ ● Sistema Vaxav         [Auto] Misión disponible       │
│   Hace 1 día                                           │
│                                                        │
│   Bob Johnson           Propuesta de comercio          │
│   Hace 2 días                                          │
│                                                        │
│   Agente NPC            Misión completada              │
│   Hace 3 días                                          │
└────────────────────────────────────────────────────────┘

[Enviados] [Archivados] [Papelera]
```

**Vista de Mensaje:**

```
╔═══════════════════════════════════════════════════════════╗
║ De: Marcus Steel (CEO - Mineros del Vacío S.A.)          ║
║ Para: Todos los miembros                                  ║
║ Asunto: [Corp] Reunión mañana                             ║
║ Fecha: 2025-11-27 14:30                                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║ Equipo,                                                   ║
║                                                           ║
║ Mañana a las 20:00 hora del servidor tendremos una       ║
║ reunión corporativa para discutir la expansión al        ║
║ sistema Kepler-442. Todos están invitados.               ║
║                                                           ║
║ La reunión será en el chat corporativo.                  ║
║                                                           ║
║ Saludos,                                                  ║
║ Marcus                                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

[Responder] [Responder a Todos] [Archivar] [Eliminar]
```

**Tipos de mensajes:**
- Mensajes de jugadores
- Notificaciones del sistema
- Alertas de corporación
- Confirmaciones de transacciones
- Notificaciones de combate
- Alertas de mercado (opcional)

### 14.2.11 Exploración

**Ruta:** `/exploration`

**NOTA AFK-FRIENDLY:** Aunque los mockups muestran puzzles interactivos para comunicar la narrativa, en la implementación real el jugador simplemente hace click en "Explorar Sitio" y la exploración se ejecuta AUTOMÁTICAMENTE durante múltiples ticks. Al finalizar, se muestra un resumen detallado de lo que sucedió (puzzles resueltos, peligros encontrados, loot obtenido). Los puzzles se resuelven usando las habilidades del piloto (Arqueología, Hackeo, etc.) de forma pasiva.

Sistema de exploración con Sitios Ancestrales y Mercados Negros Flotantes.

**Vista Principal de Exploración:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ EXPLORACIÓN - SISTEMA VAXAV                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ SCANNER DE ANOMALÍAS: [███████░░░] 70% | 7/10 ticks restantes        ║
║                                                                       ║
║ [Escanear Sistema] [Ver Histórico] [Filtrar por Tipo]                ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ SITIOS ACTIVOS EN SISTEMA (5)                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🔮 ??? SITIO ANCESTRAL [Tier 2]                                      ║
║    • Ubicación: Vaxav III - Órbita Alta                              ║
║    • Tipo: Desconocido (visita para descubrir)                       ║
║    • Duración restante: 48 ticks (~8 horas)                          ║
║    • Seguridad requerida: 0.1 - 1.0                                  ║
║    [Warpar al Sitio] [Guardar Coordenadas]                           ║
║                                                                       ║
║ ──────────────────────────────────────────────────────────────────────║
║                                                                       ║
║ 🔮 ??? SITIO ANCESTRAL [Tier 3]                                      ║
║    • Ubicación: Vaxav II - Belt de Asteroides                        ║
║    • Tipo: Desconocido (visita para descubrir)                       ║
║    • Duración restante: 96 ticks (~16 horas)                         ║
║    • Seguridad requerida: 0.0 - 0.4                                  ║
║    [Warpar al Sitio] [Guardar Coordenadas]                           ║
║                                                                       ║
║ ──────────────────────────────────────────────────────────────────────║
║                                                                       ║
║ 💀 MERCADO NEGRO FLOTANTE                                            ║
║    • Ubicación: Coordenadas Ocultas (IIC 4)                          ║
║    • Duración restante: 72 ticks (~12 horas)                         ║
║    • ⚠️ ADVERTENCIA: Zona PvP activa                                 ║
║    • Requiere: Standing +5 con Piratas del Cinturón O 50,000₡        ║
║    [Warpar al Sitio] [Comprar Información]                           ║
║                                                                       ║
║ ──────────────────────────────────────────────────────────────────────║
║                                                                       ║
║ ⚔️ SITIO DE COMBATE [Tier 1]                                         ║
║    • Ubicación: Vaxav I - Luna 2                                     ║
║    • NPCs: Piratas del Cinturón (3-5)                                ║
║    • Duración restante: 36 ticks (~6 horas)                          ║
║    [Warpar al Sitio]                                                 ║
║                                                                       ║
║ ──────────────────────────────────────────────────────────────────────║
║                                                                       ║
║ ⛽ NEBULOSA DE GAS TEMPORAL                                           ║
║    • Ubicación: Vaxav III - Órbita Baja                              ║
║    • Recursos: Plasma Ionizado, Xenón Enriquecido                    ║
║    • Duración restante: 48 ticks (~8 horas)                          ║
║    [Warpar al Sitio]                                                 ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Escanear Nuevamente] [Compartir con Corp] [Vender Coordenadas]
```

**Información mostrada:**
- 🔮 = Sitio Ancestral (tipo desconocido hasta visitar)
- 💀 = Mercado Negro
- ⚔️ = Sitio de Combate
- ⛽ = Nebulosa de Gas
- 💎 = Belt Rico
- 🕳️ = Agujero de Gusano

#### 14.2.11.1 Vista de Sitio Ancestral - Tipo 1: Complejo Precursor

**Ruta:** `/exploration/ancestral-site/{id}`

Al llegar al sitio, el tipo se revela:

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 🏛️ COMPLEJO PRECURSOR ABANDONADO [Tier 2]                            ║
║ "Bastión de los Antiguos"                                             ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Has descubierto un complejo militar de la civilización precursora.   ║
║ Sus sistemas aún funcionan, pero requieren resolver antiguos puzzles ║
║ para acceder a las cámaras internas.                                 ║
║                                                                       ║
║ PROGRESO: Sala 2 de 5 completada                                     ║
║ [████░░░░░░] 40%                                                     ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ SALAS DISPONIBLES:                                                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ ✓ SALA 1: Atrio de Entrada                        [COMPLETADA]       ║
║    Recompensa: 1x Fragmento de Diseño Militar                        ║
║                                                                       ║
║ ✓ SALA 2: Terminal de Control                     [COMPLETADA]       ║
║    Recompensa: 1x Fragmento de Diseño Militar, 5x Artefacto          ║
║                                                                       ║
║ 🔓 SALA 3: Cámara de Energía                       [DISPONIBLE]      ║
║    Puzzle: Redirigir flujo de energía a 3 nodos                      ║
║    Peligro: Torretas desactivadas (pueden reactivarse)               ║
║    Requiere: Arqueología Espacial Nivel 2+                           ║
║    Duración estimada: 12-24 ticks                                    ║
║    [ENTRAR A SALA]                                                   ║
║                                                                       ║
║ 🔒 SALA 4: Laboratorio de Armamento                [BLOQUEADA]       ║
║    Desbloqueo: Completar Sala 3                                      ║
║                                                                       ║
║ 🔒 SALA 5: Cámara del Núcleo                       [BLOQUEADA]       ║
║    Desbloqueo: Completar Salas 3 y 4                                 ║
║    Recompensa Final: 1x Chip de Diseño [Militar T2]                 ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ FRAGMENTOS RECOLECTADOS: 2/5                                         ║
║                                                                       ║
║ Al completar el complejo completo, podrás combinar los fragmentos    ║
║ en un Chip de Diseño que desbloquea un blueprint aleatorio Militar.  ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Entrar Sala 3] [Salir del Complejo] [Ver Inventario] [Abandonar Sitio]
```

#### 14.2.11.2 Vista Dentro de Sala (Puzzle)

```
╔═══════════════════════════════════════════════════════════════════════╗
║ SALA 3: CÁMARA DE ENERGÍA                                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Una sala circular con 3 terminales y conductos de energía en las     ║
║ paredes. Los glifos antiguos indican que debes redirigir el flujo.   ║
║                                                                       ║
║ OBJETIVO: Activar los 3 nodos en el orden correcto                   ║
║                                                                       ║
║      [Terminal A]          [Terminal B]          [Terminal C]        ║
║         ⚪ OFF                 ⚪ OFF                 ⚪ OFF            ║
║                                                                       ║
║ Pista (Glifos): "El fuego precede al agua, el agua a la tierra"      ║
║                                                                       ║
║ ⚠️ Advertencia: Activar en orden incorrecto puede reactivar torretas ║
║                                                                       ║
║ Intentos restantes: 2/3                                              ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Activar Terminal A] [Activar Terminal B] [Activar Terminal C]
[Analizar Glifos (req. Arqueología 3+)] [Salir de Sala]
```

**Mecánica del Puzzle:**
- El jugador debe activar terminales en orden correcto
- Pistas visuales/textuales disponibles
- Skill alta en Arqueología puede dar hints adicionales
- Fallos activan peligros (torretas, radiación)
- Éxito otorga fragmento + posibles bonus

#### 14.2.11.3 Vista de Sitio Ancestral - Tipo 2: Derelicto Generacional

**Ruta:** `/exploration/ancestral-site/{id}`

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 🚢 DERELICTO GENERACIONAL                                            ║
║ "NSS Esperanza Eterna"                                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Nave colonial gigante abandonada hace 300 años. Sus sistemas están   ║
║ sellados y requieren hackeo para acceder a los datos almacenados.    ║
║                                                                       ║
║ PROGRESO: 2/4 secciones hackeadas                                    ║
║ [█████░░░░░] 50%                                                     ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ SECCIONES DISPONIBLES:                                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ ✓ PUENTE DE MANDO                                  [HACKEADO]        ║
║    Recompensa: 1x Núcleo de Datos [Cifrado], Logs de Navegación     ║
║                                                                       ║
║ ✓ SALA DE MOTORES                                  [HACKEADO]        ║
║    Recompensa: 1x Núcleo de Datos [Cifrado], Componentes T2         ║
║                                                                       ║
║ 🔓 BODEGAS DE CARGA                                 [DISPONIBLE]     ║
║    Terminal: Nivel 3 (Difícil)                                       ║
║    Requiere: Hackeo Nivel 3+                                         ║
║    Peligro: Drones de Seguridad (inactivos, 15% chance reactivar)   ║
║    Duración: 18-36 ticks                                             ║
║    [HACKEAR TERMINAL]                                                ║
║                                                                       ║
║ 🔒 CRIOCÁMARAS                                      [BLOQUEADA]      ║
║    Desbloqueo: Hackear Bodegas primero                               ║
║    Recompensa potencial: Núcleos de Datos de alta calidad           ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ NÚCLEOS RECOLECTADOS: 2                                              ║
║                                                                       ║
║ Los Núcleos de Datos pueden:                                         ║
║ • Venderse en mercado (otros pilotos especulan sobre contenido)     ║
║ • Descifrarse en Laboratorio (12 ticks) para obtener blueprint       ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Hackear Bodegas] [Salir del Derelicto] [Ver Núcleos] [Abandonar Sitio]
```

#### 14.2.11.4 Vista de Hackeo de Terminal

```
╔═══════════════════════════════════════════════════════════════════════╗
║ HACKEO: TERMINAL DE BODEGAS                                          ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Conectando a sistema de seguridad...                                 ║
║                                                                       ║
║ NIVEL DE SEGURIDAD: 3 (Difícil)                                      ║
║                                                                       ║
║ PROGRESO DE HACKEO:                                                  ║
║ [████████░░] 80% | 4/8 ticks completados                             ║
║                                                                       ║
║ Tu skill: Hackeo Nivel 4 (+20% velocidad)                            ║
║                                                                       ║
║ ⚠️ ALERTA: Drones de seguridad detectados. 15% chance de activación  ║
║                                                                       ║
║ OPCIONES:                                                            ║
║ • [Continuar Hackeo] - 4 ticks restantes                             ║
║ • [Bypass de Seguridad] - Requiere Hackeo 5, instantáneo             ║
║ • [Abortar] - Salir sin recompensa                                   ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Continuar] [Bypass (No disponible)] [Abortar]
```

#### 14.2.11.5 Vista de Sitio Ancestral - Tipo 3: Laboratorio de Investigación

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 🔬 LABORATORIO DE INVESTIGACIÓN PERDIDO                              ║
║ "Instalación Prometheus-7"                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Estación de investigación experimental controlada por IA corrupta.   ║
║ Debes negociar o convencer a la IA para acceder a los prototipos.    ║
║                                                                       ║
║ ESTADO DE IA: 😐 Neutral (Standing: 0/100)                           ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ DIÁLOGO CON IA "PROMETHEUS"                                          ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🤖 PROMETHEUS:                                                        ║
║ "Intruso detectado. Identificación requerida. Los protocolos de      ║
║  seguridad exigen eliminación de personal no autorizado."            ║
║                                                                       ║
║ TUS OPCIONES:                                                        ║
║                                                                       ║
║ 1. [Diplomacia] "Vengo en paz, solo busco conocimiento"             ║
║    Req: Carisma 3+ | Chance éxito: 60%                               ║
║                                                                       ║
║ 2. [Engaño] "Soy el Dr. Chen, investigador autorizado código 7742"  ║
║    Req: Persuasión 4+ | Chance éxito: 40% (alto riesgo)             ║
║                                                                       ║
║ 3. [Hackeo] Intentar tomar control de la IA                          ║
║    Req: Hackeo 5+ | Si fallas, IA ataca con torretas                ║
║                                                                       ║
║ 4. [Ciencias] "Analicemos juntos estos datos, podemos colaborar"    ║
║    Req: Ciencias 3+ | Chance éxito: 75% (mejor opción)              ║
║                                                                       ║
║ 5. [Combate] Destruir el núcleo de IA                                ║
║    Destruye prototipos pero puedes saquear componentes               ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Selecciona opción] [Escanear Laboratorio] [Salir]
```

#### 14.2.11.6 Vista de Minijuego Científico

Si la IA acepta colaborar:

```
╔═══════════════════════════════════════════════════════════════════════╗
║ EXPERIMENTO: CALIBRACIÓN DE REACTOR                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🤖 PROMETHEUS:                                                        ║
║ "Interesante. Demuestra tu competencia calibrando este reactor."    ║
║                                                                       ║
║ OBJETIVO: Mantener temperatura entre 800-1000°K durante 6 ticks      ║
║                                                                       ║
║ TEMPERATURA ACTUAL: 950°K  ✓ ÓPTIMO                                  ║
║ [████████████████░░] 850°K ─────────── 1000°K                        ║
║                                                                       ║
║ TICK: 3/6 completados                                                ║
║                                                                       ║
║ CONTROLES:                                                           ║
║ [Enfriar (-50°K)] [Calentar (+50°K)] [Mantener]                     ║
║                                                                       ║
║ Bonus por Ciencias Nivel 4: +15% margen de error                     ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

Éxito: Otorga Prototipo Experimental T3
Fallo: IA se molesta, necesitas más intentos o combate
```

#### 14.2.11.7 Vista de Sitio Ancestral - Tipo 4: Campo de Escombros Alienígena

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 👽 CAMPO DE ESCOMBROS ALIENÍGENA                                     ║
║ "Zona Xenotecnológica Delta-9"                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Restos de tecnología de origen no-humano. Fragmentos esparcidos      ║
║ pueden ser escaneados y recolectados para análisis posterior.        ║
║                                                                       ║
║ FRAGMENTOS RECOLECTADOS: 18                                          ║
║ PROBABILIDAD DESCIFRAR: 70% (16-30 fragmentos = 70%)                 ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ OBJETOS DETECTADOS:                                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🔍 Fragmento Xeno #1 - Componente Desconocido                        ║
║    Distancia: 2,500m | Scan: 6 ticks | Recolección: 2 ticks         ║
║    [ESCANEAR] [RECOLECTAR CON TRACTOR BEAM]                          ║
║                                                                       ║
║ 🔍 Fragmento Xeno #2 - Placa con Inscripciones                       ║
║    Distancia: 5,000m | Scan: 6 ticks | Recolección: 2 ticks         ║
║    [ESCANEAR] [RECOLECTAR CON TRACTOR BEAM]                          ║
║                                                                       ║
║ 🔍 Fragmento Xeno #3 - Núcleo de Energía Alien                       ║
║    Distancia: 8,500m | Scan: 12 ticks (raro) | Recolección: 4 ticks ║
║    ⚠️ Radiación alienígena detectada (-5 HP/tick)                    ║
║    [ESCANEAR] [RECOLECTAR CON TRACTOR BEAM]                          ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ ACCIONES DISPONIBLES:                                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ • [ANALIZAR FRAGMENTOS] - 6 ticks, chance 70% de éxito              ║
║   Éxito: Obtienes 1x Esquema Xenotecnología [aleatorio]             ║
║   Fallo: Pierdes 5 fragmentos en el proceso                          ║
║                                                                       ║
║ • [RECOLECTAR MÁS] - Buscar más fragmentos (aumenta probabilidad)   ║
║                                                                       ║
║ • [VENDER FRAGMENTOS] - Los fragmentos son commodities vendibles    ║
║   Precio mercado: ~2,000₡/fragmento                                  ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Analizar Fragmentos] [Continuar Recolectando] [Salir del Sitio]
```

#### 14.2.11.8 Vista de Mercado Negro Flotante

**Ruta:** `/black-market/{id}`

```
╔═══════════════════════════════════════════════════════════════════════╗
║ ⚠️ MERCADO NEGRO FLOTANTE ⚠️                                          ║
║ "Estación Sombra-7"                                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🚨 ADVERTENCIA: ZONA PvP ACTIVA                                      ║
║ Otros pilotos pueden atacarte aquí sin consecuencias de Albatross.  ║
║                                                                       ║
║ Pilotos detectados en área: 3                                        ║
║                                                                       ║
║ Standing con Piratas del Cinturón: +15 (Neutral) ✓ ACCESO PERMITIDO ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ SERVICIOS DISPONIBLES:                                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 1. 🛒 MERCADO NEGRO                                                  ║
║    Items prohibidos y modificaciones ilegales                        ║
║    [VER TIENDA]                                                      ║
║                                                                       ║
║ 2. 📜 CONTRATOS ILEGALES                                             ║
║    Misiones de alto riesgo con grandes recompensas                   ║
║    • Sabotaje de Estación Confederación: 150,000₡ (-25 standing)    ║
║    • Asesinato de "Marcus Steel": 250,000₡                           ║
║    • Contrabando de Drogas Sintéticas: 80,000₡                       ║
║    [VER CONTRATOS]                                                   ║
║                                                                       ║
║ 3. 🔧 MODIFICACIONES ILEGALES DE NAVES                               ║
║    Modificaciones prohibidas por la Confederación                    ║
║    [VER MODIFICACIONES]                                              ║
║                                                                       ║
║ 4. 💬 INFORMACIÓN DEL MERCADO                                        ║
║    Rumores, coordenadas de sitios, intel de jugadores                ║
║    [VER INFORMACIÓN]                                                 ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[Entrar a Mercado] [Salir Inmediatamente] [Escanear Naves Cercanas]
```

**Vista de Tienda del Mercado Negro:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 🛒 MERCADO NEGRO - ITEMS ILEGALES                                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ ⚠️ ADVERTENCIA: Portar estos items en espacio de alta seguridad      ║
║    puede resultar en confiscación y standing negativo.               ║
║                                                                       ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🔴 MÓDULO OVERCLOCKED T2 - LÁSER                    75,000₡          ║
║    Bonus: +50% damage | Debuff: -50% durabilidad                     ║
║    Descripción: Láser modificado ilegalmente. Altísimo daño pero     ║
║    se degrada rápidamente.                                           ║
║    [COMPRAR]                                                         ║
║                                                                       ║
║ 🔴 MUNICIÓN PROHIBIDA - AOE EXPLOSIVA                25,000₡          ║
║    Damage AOE 500m (daña aliados también)                            ║
║    Descripción: Prohibida por tratados galácticos. Explosión masiva.║
║    [COMPRAR]                                                         ║
║                                                                       ║
║ 🔴 DROGA SINTÉTICA: "FOCO EXTREMO"                  15,000₡          ║
║    Buff: +25% todas las skills por 12 ticks                          ║
║    Debuff posterior: -15% skills por 24 ticks, -30 moral             ║
║    Descripción: Estimulante neural ilegal. Efectos potentes.         ║
║    [COMPRAR]                                                         ║
║                                                                       ║
║ 🔴 CHIP DE DISEÑO ROBADO - CRUCERO T2               500,000₡         ║
║    Desbloquea: Blueprint "Crucero de Ataque Mk-II"                   ║
║    Descripción: Robado de Sindicato Técnico. Trazeable.             ║
║    [COMPRAR]                                                         ║
║                                                                       ║
║ 🔴 TRANSPONDER FALSO                                 80,000₡          ║
║    Cambia tu identidad por 48 ticks                                  ║
║    Descripción: Apareces como otro piloto en radares.                ║
║    [COMPRAR]                                                         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

Balance: 125,450₡ | [Volver] [Ver Modificaciones de Naves]
```

**Vista de Modificaciones Ilegales:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 🔧 MODIFICACIONES ILEGALES DE NAVES                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ ⚠️ ADVERTENCIA CRÍTICA:                                              ║
║ Estas modificaciones son PERMANENTES y FLAGGEAN tu nave como ilegal. ║
║ Albatross atacará en sistemas de alta seguridad (IIC 1-2).           ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ 🚫 ELIMINAR TRANSPONDER                             200,000₡         ║
║    Efecto: Tu nave NO aparece en radares (stealth permanente)        ║
║    Consecuencia: Flagged como criminal en IIC 1-2                    ║
║    Reversible: NO                                                    ║
║    [INSTALAR] [MÁS INFO]                                             ║
║                                                                       ║
║ ⚡ AMPLIFICADOR ILEGAL DE RE/CPU                     350,000₡         ║
║    Efecto: +25% Reactor de Energía y CPU total                       ║
║    Consecuencia: Nave ilegal, Albatross ataca en IIC 1-2            ║
║    Reversible: SÍ (costo 100,000₡)                                   ║
║    [INSTALAR] [MÁS INFO]                                             ║
║                                                                       ║
║ 🕳️ REACTOR BLACK HOLE                               1,000,000₡        ║
║    Efecto: Capacitor infinito (nunca se agota)                       ║
║    Consecuencia: 5% chance de explosión cada tick en combate         ║
║    Reversible: SÍ (costo 250,000₡)                                   ║
║    [INSTALAR] [MÁS INFO]                                             ║
║                                                                       ║
║ 🎯 SISTEMA DE PUNTERÍA ILEGAL                       450,000₡         ║
║    Efecto: +40% tracking, +25% optimal range                         ║
║    Consecuencia: Nave ilegal permanentemente                         ║
║    Reversible: NO                                                    ║
║    [INSTALAR] [MÁS INFO]                                             ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

Nave actual: Excavador MK-I "La Fortuna"
[Volver] [Ver Items] [Ver Contratos Ilegales]
```

---

### 14.3 Menús Adicionales y Secundarios

### 14.3.1 Contratos

**Ruta:** `/contracts`

Sistema de contratos entre jugadores (transporte, fabricación, misiones privadas).

```
╔═══════════════════════════════════════════════════════════╗
║ CONTRATOS                                                 ║
╠═══════════════════════════════════════════════════════════╣

CONTRATOS DISPONIBLES (Públicos)
┌──────────────────────────────────────────────────────────┐
│ Tipo: Transporte                                         │
│ De: Marcus Steel → Destino: Estación Marte (5 saltos)   │
│ Carga: 5,000 m³ de Tritanio Refinado                    │
│ Pago: 25,000 ₡ | Colateral: 50,000 ₡                    │
│ Expira en: 3 días                                        │
│ [Aceptar Contrato]                                       │
└──────────────────────────────────────────────────────────┘

MIS CONTRATOS ACTIVOS (2)
┌──────────────────────────────────────────────────────────┐
│ Tipo: Fabricación                                        │
│ Cliente: Jane Smith                                      │
│ Item: 10x Láser de Minería Básico                       │
│ Progreso: 7/10 completado                               │
│ Plazo: 2 días restantes                                 │
└──────────────────────────────────────────────────────────┘

[Crear Contrato] [Mis Contratos] [Historial]
```

**Tipos de Contratos:**
- **Transporte:** Mover items de A a B
- **Fabricación:** Crear items específicos
- **Courier:** Entrega de paquetes (el contenido está sellado)
- **Compra/Venta:** Intercambio de items por precio fijo
- **Préstamo:** Préstamo de créditos con intereses

### 14.3.2 Industria

**Ruta:** `/industry`

Panel centralizado para gestionar todas las actividades de producción.

```
╔═══════════════════════════════════════════════════════════╗
║ INDUSTRIA                                                 ║
╠═══════════════════════════════════════════════════════════╣

TRABAJOS EN CURSO (3)
┌───────────────┬──────────────────┬──────────┬────────────┐
│ Tipo          │ Item             │ Progreso │ Termina en │
├───────────────┼──────────────────┼──────────┼────────────┤
│ Fabricación   │ Escudo Básico x5 │ ███░░░░  │ 45 ticks   │
│ Refinamiento  │ Tritanio Puro    │ ████░░░  │ 12 ticks   │
│ Investigación │ BPO Láser T2     │ ██░░░░░  │ 250 ticks  │
└───────────────┴──────────────────┴──────────┴────────────┘

MIS BLUEPRINTS (25)
  🔷 Fragata Minera MK-I (BPO) - Material Eff: 5%, Time Eff: 0%
  🔶 Láser de Minería Básico (BPC) - 10 runs restantes
  🔶 Escudo Básico (BPC) - 5 runs restantes

[Nueva Producción] [Blueprints] [Investigación] [Instalaciones]
```

### 14.3.3 Flotas

**Ruta:** `/fleets`

Sistema para organizar flotas de jugadores (PvE/PvP cooperativo).

```
╔═══════════════════════════════════════════════════════════╗
║ FLOTAS                                                    ║
╠═══════════════════════════════════════════════════════════╣

INVITACIONES (1)
  ● Marcus Steel te invita a "Operación Minería Vaxav III"
    Miembros: 5/10 | Objetivo: Minería masiva
    [Aceptar] [Rechazar]

MI FLOTA ACTUAL
  Nombre: Operación Minería Vaxav III
  Líder: Marcus Steel ⭐
  Miembros: 6/10

  ┌────────────────┬──────────────────┬────────────┐
  │ Piloto         │ Nave             │ Estado     │
  ├────────────────┼──────────────────┼────────────┤
  │ Marcus Steel ⭐│ Excavador MK-I   │ ⚫ Minando  │
  │ John Doe       │ Excavador MK-I   │ ⚫ Minando  │
  │ Jane Smith     │ Carguero Ligero  │ ⚫ Orbitando│
  │ Bob Johnson    │ Fragata Combate  │ ⚫ Escolta  │
  └────────────────┴──────────────────┴────────────┘

  Recursos totales minados: 15,250 unidades

  [Chat de Flota] [Salir de Flota] [Opciones]

[Crear Flota] [Flotas Públicas]
```

### 14.3.4 Notificaciones

**Ruta:** `/notifications`

Centro de notificaciones del juego.

```
╔═══════════════════════════════════════════════════════════╗
║ NOTIFICACIONES                            No leídas: 5    ║
╠═══════════════════════════════════════════════════════════╣

HOY
● [Mercado] Tu orden de venta de Tritanio se completó
  +47,500 ₡ recibidos                        Hace 15 min

● [Combate] Tu nave fue atacada en Vaxav III
  Resultado: Victoria - Loot disponible     Hace 2 horas

  [Sistema] Misión "Minar Tritanio" expiró
  Sin penalización                           Hace 3 horas

AYER
● [Corporación] Marcus Steel depositó 100K ₡ en el tesoro
                                              Hace 1 día

  [Habilidades] Minería alcanzó nivel 3
  Nuevas capacidades desbloqueadas          Hace 1 día

[Marcar todo como leído] [Configurar Alertas]
```

**Configuración de Notificaciones:**
- Email para eventos importantes
- Notificaciones en juego
- Alertas de mercado (precio objetivo)
- Alertas de combate
- Notificaciones de corporación

### 14.3.5 Configuración

**Ruta:** `/settings`

Panel de configuración del juego.

```
╔═══════════════════════════════════════════════════════════╗
║ CONFIGURACIÓN                                             ║
╠═══════════════════════════════════════════════════════════╣

CUENTA
  Email: johndoe@example.com          [Cambiar]
  Contraseña: ••••••••                [Cambiar]
  Autenticación 2FA: ✗ Deshabilitada  [Habilitar]

INTERFAZ
  Tema: [x] Oscuro  [ ] Claro  [ ] Auto
  Idioma: Español ▼
  Zona horaria: UTC-3 ▼
  Formato de números: 1,234.56 ▼

NOTIFICACIONES
  [x] Alertas de combate
  [x] Alertas de mercado
  [x] Mensajes de corporación
  [ ] Mensajes de jugadores (solo amigos)
  [ ] Email para eventos críticos

PRIVACIDAD
  Perfil visible: [x] Público  [ ] Solo corporación  [ ] Privado
  Ubicación visible: [x] Todos  [ ] Corporación  [ ] Nadie
  Inventario visible: [ ] Todos  [x] Corporación  [ ] Nadie

JUEGO
  Confirmar acciones peligrosas: [x] Activado
  Auto-rechazar duelos PvP: [ ] Activado
  Vista de nave por defecto: General ▼

[Guardar Cambios] [Restaurar Defaults]
```

### 14.3.6 Amigos y Contactos

**Ruta:** `/contacts`

Gestión de amigos, contactos y bloqueos.

```
╔═══════════════════════════════════════════════════════════╗
║ CONTACTOS                                                 ║
╠═══════════════════════════════════════════════════════════╣

AMIGOS ONLINE (8/24)
┌────────────────────┬────────────────────────┬────────────┐
│ Piloto             │ Ubicación              │ Estado     │
├────────────────────┼────────────────────────┼────────────┤
│ ⚫ Marcus Steel    │ Vaxav I                │ Minando    │
│ ⚫ Jane Smith      │ Vaxav III              │ Combate    │
│ ⚫ Bob Johnson     │ Kepler-442             │ Explorando │
└────────────────────┴────────────────────────┴────────────┘

[Agregar Amigo] [Solicitudes Pendientes (2)]

LISTAS
  📋 Amigos (24)
  📋 Corporación (45)
  ⭐ Favoritos (5)
  ⚠️  Vigilar (3)
  🚫 Bloqueados (1)

[Mensaje] [Invitar a Flota] [Ver Licencia]
```

### 14.3.7 Leaderboards / Rankings

**Ruta:** `/rankings`

Clasificaciones y estadísticas del servidor.

```
╔═══════════════════════════════════════════════════════════╗
║ CLASIFICACIONES - SERVIDOR VAXAV                          ║
╠═══════════════════════════════════════════════════════════╣

MÁS RICOS (Por Créditos)
┌─────┬────────────────────┬──────────────┬───────────────┐
│ #   │ Piloto             │ Corporación  │ Fortuna       │
├─────┼────────────────────┼──────────────┼───────────────┤
│ 1   │ 👑 Richard Branson │ Mercaderes   │ 1,250,000,000₡│
│ 2   │ Sarah Connor       │ Liga Libre   │ 845,000,000 ₡ │
│ 3   │ Marcus Steel       │ Min. Vacío   │ 523,000,000 ₡ │
│...  │ ...                │ ...          │ ...           │
│ 847 │ ► John Doe (TÚ)    │ Min. Vacío   │ 250,450 ₡     │
└─────┴────────────────────┴──────────────┴───────────────┘

OTRAS CLASIFICACIONES:
  🏆 PvP Kills
  ⛏️  Recursos Minados
  🏭 Items Fabricados
  🚀 Naves Destruidas
  📊 Volumen de Comercio
  🎯 Misiones Completadas
  🌌 Sistemas Explorados

[Ver Mi Posición] [Filtrar por Corporación]
```

### 14.3.8 Vista de Perfil de Piloto (Interacciones Sociales)

**Ruta:** `/pilot/{pilot_id}/profile`

**Acceso:** Click en nombre de piloto desde lista de contactos, chat, o búsqueda

Vista detallada del perfil de otro piloto con opciones de interacciones sociales directas.

**Layout:**

```
╔═══════════════════════════════════════════════════════════╗
║ PERFIL DE PILOTO                                    [✕]   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  [Avatar/Foto]     MARCUS STEEL                          ║
║                    Minero Veterano • Confederación Vaxav  ║
║                    ⚫ Online (Estación Vaxav Prime)       ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║ RELACIÓN CONTIGO                                          ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ Tipo: Amistad                                         │ ║
║ │ 😐 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ❤️       │ ║
║ │     ████████████████████████████░░░░░░░░░░░░  76/100  │ ║
║ │ Estado: Amigo Cercano 🌟                              │ ║
║ │ Última interacción: Hace 6 horas                      │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ COMPATIBILIDAD                                            ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ Personalidad compatible: 78%                          │ ║
║ │ • Carisma: Alto (buen conversador)                    │ ║
║ │ • Temperamento: Colérico (puede ser volátil)          │ ║
║ │ • Ambición: Alta (similar a ti)                       │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ACCIONES DISPONIBLES                                      ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ Interacciones disponibles hoy: 4/5                    │ ║
║ │                                                       │ ║
║ │ [💬 Charlar]          [🤝 Conocerse Mejor]            │ ║
║ │ -3 energía, +3 rel    -5 energía, +8 rel              │ ║
║ │                                                       │ ║
║ │ [🍺 Invitar Bebidas]  [🎁 Regalar Item]               │ ║
║ │ -3 energía, 500₡      -3 energía, item                │ ║
║ │                                                       │ ║
║ │ [🤫 Compartir Secreto] [💕 Coquetear] 🔒              │ ║
║ │ -5 energía, +15 rel    Requiere relación >50         │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ESTADÍSTICAS                                              ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ • Reputación: Honorable (78/100)                      │ ║
║ │ • Corporación: Vaxav Mining Corp [VMC]                │ ║
║ │ • Rango: Capitán                                      │ ║
║ │ • Skills principales: Minería V, Refinamiento IV      │ ║
║ │ • Combates ganados: 24 | Perdidos: 8                  │ ║
║ │ • Contratos completados: 156                          │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ [Ver Historial] [Enviar Mensaje] [Bloquear]              ║
╚═══════════════════════════════════════════════════════════╝
```

**Elementos Clave de la UI:**

1. **Barra de Relación Visual:**
   - Gradiente de color según fase (gris → azul → verde → dorado → rojo para amistad)
   - Colores diferentes para romance (púrpura → magenta → rosa)
   - Iconos en extremos: 😐 (desconocido) ... ❤️ (mejor amigo) o 💗 (unidos)
   - Valor numérico (76/100)
   - Etiqueta de estado con emoji ("Amigo Cercano 🌟")

2. **Indicador de Compatibilidad:**
   - Porcentaje calculado en tiempo real basado en personalidades
   - Breakdown de personalidad del otro piloto (visible si relación >25)
   - Ayuda al jugador a decidir qué interacciones tienen más probabilidad de éxito
   - Solo muestra rasgos visibles según nivel de relación

3. **Botones de Acción Social:**
   - Muestran costos claramente (-X energía, -X₡, +X rel esperado)
   - Grises/bloqueados si no cumplen requisitos
   - Tooltip explica por qué está bloqueado (ej: "Requiere Seducción Nivel 1")
   - Animación de éxito/fallo al ejecutar interacción
   - Cooldowns visibles ("Disponible en 30 minutos")

4. **Contador de Interacciones:**
   - "4/5 interacciones disponibles hoy"
   - Se actualiza en tiempo real tras cada acción
   - Muestra tiempo para reset si está en 0/5 ("Reset en 8 horas")
   - Indica si skill Sociabilidad puede aumentar límite

5. **Diferenciación por Tipo de Relación:**
   - Si relación es romántica, barra cambia a colores púrpura/magenta/rosa
   - Iconos cambian: 😳 → 💜 → 💕 → 💖 → 💗
   - Acciones románticas reemplazan algunas de amistad
   - Título visible si es "Novios", "Pareja" o "Unidos"
   - Beneficios especiales se muestran en tooltip

6. **Estadísticas Públicas:**
   - Solo muestra información visible según nivel de relación
   - Desconocido (0-10): Info básica (nombre, facción, online status)
   - Conocido (11+): + Corporación, rango
   - Camarada (26+): + Skills principales, estadísticas básicas
   - Amigo (51+): + Historial detallado, ubicación exacta

### 14.3.9 Panel de Administración

**Ruta:** `/admin` (Solo accesible para administradores)

Panel de administración del juego para configurar parámetros globales.

```
╔═══════════════════════════════════════════════════════════╗
║ PANEL DE ADMINISTRACIÓN                                   ║
╠═══════════════════════════════════════════════════════════╣

CONFIGURACIÓN DEL SISTEMA DE TICKS
┌───────────────────────────────────────────────────────────┐
│ Duración del Tick (minutos)                              │
│ ┌──────┐                                                  │
│ │  10  │ minutos  [Actualizar]                           │
│ └──────┘                                                  │
│                                                            │
│ Estado del Sistema: ✓ Activo                             │
│ Último tick ejecutado: Hace 3 minutos                     │
│ Próximo tick en: 7 minutos                               │
│                                                            │
│ ⚠️ ADVERTENCIA: Cambiar la duración del tick afectará    │
│    todos los cálculos del juego. Los jugadores verán     │
│    tiempos actualizados automáticamente.                 │
│                                                            │
│ [Ejecutar Tick Manualmente] [Ver Historial de Ticks]     │
└───────────────────────────────────────────────────────────┘

CONFIGURACIÓN SOCIAL
┌───────────────────────────────────────────────────────────┐
│ Recuperación de energía offline (cada X ticks)           │
│ ┌──────┐ ticks = 1 punto de energía                      │
│ │  2   │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Degradación de nutrición (cada X ticks)                  │
│ ┌──────┐ ticks = -1 nutrición                            │
│ │  6   │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Cambio de estrés (cada X ticks)                          │
│ ┌──────┐ ticks para aplicar cambios de estrés            │
│ │  6   │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Ticks por día (para cálculos de moral/relaciones)        │
│ ┌──────┐ ticks = 1 día de juego                          │
│ │ 144  │                                                  │
│ └──────┘                                                  │
│                                                            │
│ [Guardar Cambios] [Restaurar Defaults]                   │
└───────────────────────────────────────────────────────────┘

COOLDOWNS DEL JUEGO
┌───────────────────────────────────────────────────────────┐
│ Cooldown al quedar inconsciente                          │
│ ┌──────┐ ticks (~1 hora por defecto)                     │
│ │  6   │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Cooldown actualización de clon                           │
│ ┌──────┐ ticks (~24 horas por defecto)                   │
│ │ 144  │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Cooldown declaración de guerra                           │
│ ┌──────┐ ticks (~24 horas por defecto)                   │
│ │ 144  │                                                  │
│ └──────┘                                                  │
│                                                            │
│ Duración mínima de guerra                                │
│ ┌──────┐ ticks (~7 días por defecto)                     │
│ │ 1008 │                                                  │
│ └──────┘                                                  │
│                                                            │
│ [Guardar Cambios] [Restaurar Defaults]                   │
└───────────────────────────────────────────────────────────┘

OTRAS SECCIONES DE ADMINISTRACIÓN:
  👥 Gestión de Usuarios
  🏢 Gestión de Corporaciones
  🌌 Gestión del Universo (Sistemas, Estaciones)
  💰 Economía Global (Precios base, Inflación)
  📊 Estadísticas del Servidor
  📝 Logs de Actividad
  🛠️ Mantenimiento (Backup, Reset de ticks)

[Aplicar Todos los Cambios] [Exportar Configuración]
```

**Características del Panel de Admin:**
- Todas las configuraciones se guardan en la tabla `game_config`
- Los cambios se aplican inmediatamente y se propagan con cache invalidation
- Historial de cambios de configuración con usuario y timestamp
- Validaciones para evitar valores inválidos (ej: tick duration < 1 minuto)
- Botón de "Restaurar Defaults" para valores por defecto del sistema
- Cálculos automáticos de equivalencias en tiempo real (ej: "144 ticks = 24h con tick de 10 min")

### 14.4 Menú Contextual de Ubicación

Dependiendo de dónde está el jugador, se muestran acciones específicas.

**En Estación:**

```
Módulos disponibles:
  [Hangar] [Laboratorio] [Mercado] [Habitáculos]
  [Astillero] [Sala Ingeniería] [Bodegas] [Agentes]

Acciones:
  [Despegar] [Ver Nave] [Reparar] [Recargar]
```

**En Espacio (Órbita):**

```
Ubicación actual: Vaxav III - Órbita (Estación Marte)

Acciones:
  [Atracar en Estación] [Viajar a...] [Escanear]
  [Ver Naves Cercanas] [Activar Módulos]
```

**En Campo de Asteroides:**

```
Ubicación actual: Vaxav III - Campo de Asteroides Alpha

Recursos detectados:
  ⛏️ Tritanio (abundante)
  ⛏️ Pirita (común)

Acciones:
  [Iniciar Minería] [Escanear Asteroides] [Ver Naves] [Viajar]
```

**NOTA AFK:** Al hacer click en [Iniciar Minería], la nave comienza a minar automáticamente durante los ticks configurados (por defecto 60 ticks). El jugador puede dejar el juego AFK y regresar para ver el resumen detallado de recursos extraídos, encuentros con NPCs, y cualquier evento que haya ocurrido durante la minería.

---

## 15. Interfaz de Usuario (GUI)

### 15.1 Visión General de la Interfaz

**ACLARACIÓN IMPORTANTE:**
Vaxav NO es un juego ASCII ni de terminal. Es un **juego web moderno con una interfaz gráfica hermosa y profesional**. Todos los mockups en formato ASCII/texto mostrados en este documento son **puramente ilustrativos** para comunicar la estructura de información y funcionalidades.

**La interfaz real será:**
- 🎨 **Moderna y elegante** con diseño sci-fi/futurista
- 📊 **Rica en información** pero organizada visualmente
- 🖥️ **Completamente responsive** (desktop, tablet, móvil)
- ⚡ **Interactiva y dinámica** con transiciones suaves
- 🎯 **Optimizada para mostrar datos** de forma clara y atractiva
- 🌌 **Identidad visual única** inspirada en EVE Online pero con estilo propio

**Referentes visuales:**
- EVE Online (UI limpia, datos organizados)
- Popmundo (presentación de información textual elegante)
- OGame (diseño espacial, menús claros)
- Interfaces sci-fi modernas (Cyberpunk, Halo, Mass Effect)

### 15.2 Principios de Diseño

### Filosofía AFK-Friendly (PRIORIDAD MÁXIMA):

- **Acciones claras de inicio/fin:** Cada acción tiene un botón "Iniciar [Acción]" que claramente comunica que el proceso es automático
- **Estado visible:** El HUD siempre muestra "⚙️ [Acción]... X/Y" para que el jugador sepa que su personaje está haciendo algo productivo
- **Resúmenes detallados:** Al finalizar cualquier acción, el jugador ve un log completo de lo que sucedió (recursos obtenidos, encuentros, eventos)
- **No penalización por ausencia:** El juego está diseñado para que dejar la sesión abierta AFK sea la forma ESPERADA de jugar
- **Progreso pasivo:** Minería, combate, exploración, misiones - todo se ejecuta automáticamente usando las habilidades y módulos del piloto
- **Claridad en tiempo:** Cada acción muestra "Duración estimada: 60 ticks (~10 horas)" para que el jugador sepa cuándo regresar

### Diseño Visual:

- **Paleta de colores:** Tonos oscuros (negro, gris oscuro, azul oscuro) con acentos brillantes (cyan, naranja, verde neón)
- **Tipografía:** Fuentes modernas y legibles (sans-serif), posiblemente monoespaciadas para números/stats
- **Espaciado:** Generoso uso de whitespace para evitar saturación
- **Íconos:** Sistema de iconografía consistente para acciones, recursos, estados
- **Animaciones:** Sutiles y funcionales (no distractoras)
- **Feedback visual:** Estados de hover, loading, success, error claramente diferenciados

### Organización de Información:

- **Jerarquía visual clara:** Títulos, subtítulos, datos, acciones bien diferenciados
- **Cards/Paneles:** Información agrupada en contenedores visuales
- **Tablas modernas:** Headers sticky, zebra striping, sorting visual
- **Gráficos:** Uso de charts.js o similar para datos complejos (precios de mercado, estadísticas)
- **Progress bars:** Visuales y animadas (energía, nutrición, skills, etc.)
- **Badges/Tags:** Para estados, categorías, niveles

### Navegación:

- **Menú principal:** Sticky header con acceso a todas las secciones
- **Breadcrumbs:** Siempre visibles con navegación rápida
- **Sidebar colapsable:** Para acciones contextuales según ubicación
- **Notificaciones:** Badge counter, toast messages para eventos
- **Quick actions:** Botones flotantes para acciones frecuentes

### Técnico:

- **Server-side rendering:** Laravel Blade para SEO y performance
- **Tailwind CSS:** Framework utility-first para diseño consistente
- **Alpine.js:** JavaScript reactivo mínimo para interactividad
- **Componentes reutilizables:** Sistema de componentes Blade bien estructurado
- **Progressive enhancement:** Funcional sin JS, mejorado con JS
- **Optimización móvil:** Touch-friendly, gestos, menús adaptados

### 15.3 Tema Visual: "Void Command"

**Concepto:**
Interfaz de comando espacial moderna, como si estuvieras en el puente de una nave estelar.

**Elementos visuales:**
- **Fondo:** Gradiente oscuro sutil con efecto de partículas estelares (canvas/CSS)
- **Paneles:** Bordes con glow sutil, fondos semi-transparentes
- **Botones:** Estilo sci-fi con estados hover/active animados
- **Inputs:** Border glow al focus, placeholder text sugerente
- **Modals:** Overlay oscuro, panel central con animación de entrada
- **Stats/Barras:** Gradientes de color según valor (rojo=bajo, verde=alto)

**Ejemplo conceptual de un panel:**

```
┌─────────────────────────────────────────────┐
│ ⚡ ENERGÍA                          85/100  │ ← Header con ícono
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ (+5% eficiencia)      │ ← Barra visual + estado
│                                             │
│ 🍖 NUTRICIÓN                        60/100  │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░ (Normal)               │
│ [!] Comer pronto                            │ ← Alerta visual
└─────────────────────────────────────────────┘
```

*Esto sería renderizado con divs, CSS, gradientes, no con caracteres ASCII.*

### 15.4 Componentes Principales

### 15.4.1 Breadcrumb Dinámico

Siempre visible, muestra ubicación actual.

**Ejemplo:**

```
Vaxav > Vaxav III > Luna 2 > Puerto Estelar Génesis > Hangar
```

### 15.4.2 Panel de Información de Piloto

Header persistente:
- Nombre del piloto
- Créditos actuales
- Estado actual
- Nave actual (si aplica)
- Ubicación actual

### 15.4.3 Vistas de Ubicación

Componente reutilizable según tipo de ubicación.

**Estructura:**
- **Encabezado:** Nombre y descripción
- **Información contextual:** Específico de la ubicación
- **Acciones disponibles:** Botones/links
- **Entidades presentes:** Otras naves, jugadores, etc.

### 15.4.4 Panel de Acciones

Lista clara de acciones disponibles según ubicación.

**Ejemplo en Campo de Asteroides:**
- [ Minar ] - Láser de Minería Básico (15 ticks)
- [ Escanear ] - Buscar nuevos asteroides
- [ Ver Naves ] - Listar otras naves presentes
- [ Viajar ] - Ir a otra ubicación

### 15.4.5 Contador de Ticks

Muestra acciones en progreso.

**Ejemplo:**

```
⏳ Minando Tritanio... [████████░░] 8/10 ticks
   Estimado: 120 segundos restantes
```

### 15.5 Esquema de URLs

URLs RESTful y descriptivas.

**Ejemplos:**

```
/dashboard
/pilot/profile
/pilot/skills
/pilot/skills/tree                    # Árbol completo de habilidades
/pilot/skills/discovered              # Habilidades descubiertas no inyectadas
/pilot/skills/injected                # Habilidades inyectadas

/system/{system_id}
/system/{system_id}/planet/{planet_id}
/system/{system_id}/planet/{planet_id}/moon/{moon_id}

/station/{station_id}
/station/{station_id}/module/{module_type}
/station/{station_id}/hangar
/station/{station_id}/laboratory      # Vista del laboratorio
/station/{station_id}/laboratory/catalog  # Catálogo de inyectores
/station/{station_id}/laboratory/inject   # Inyectar habilidad
/station/{station_id}/market

/ship/{ship_id}
/ship/{ship_id}/modules
/ship/{ship_id}/cargo

/corporation/{corp_id}
/corporation/{corp_id}/members

/market/browse
/market/browse/injectors              # Mercado de inyectores
/market/browse/injectors/{skill_id}   # Órdenes de un inyector específico
/market/orders
/market/orders/my                     # Mis órdenes activas
/market/history

/missions
/missions/{mission_id}

/exploration                            # Vista de exploración
/exploration/sites                      # Sitios temporales detectados
/exploration/bookmarks                  # Bookmarks guardados
/exploration/scan-planet/{planet_id}    # Escanear planeta específico

/fitting                                # Fitting planner
/fitting/planner                        # Planificador interactivo
/fitting/saved                          # Fits guardados
/fitting/saved/{fit_id}                 # Ver/cargar fit guardado

/businesses                             # Vista de comercios de jugadores
/businesses/my                          # Mis comercios
/businesses/browse                      # Explorar comercios en estación
/businesses/{business_id}               # Vista de comercio específico
/businesses/{business_id}/manage        # Panel de gestión (solo dueño)
```

### 15.5.1 New Views - Exploration

#### Planetary Scanner View

**Ruta:** `/exploration/scan-planet/{planet_id}`

```
┌──────────────────────────────────────────────────────────────────┐
│ SCANNER PLANETARIO - Vaxav III                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TIPO: Planeta Rocoso                                            │
│  GRAVEDAD: 0.9G                                                  │
│  ATMÓSFERA: Tenue                                                │
│  TEMPERATURA: Extrema                                            │
│                                                                   │
│  ESTADO EXPLORACIÓN: ████████░░ 0% (No escaneado)                │
│  PRIMER DESCUBRIDOR: [Desconocido]                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ESCANEO REQUERIDO:                                        │   │
│  │                                                           │   │
│  │ • Módulo: Scanner Planetario T1 ✓ Equipado              │   │
│  │ • Skill: Escaneo Planetario Nivel 1 ✓ Tienes nivel 2    │   │
│  │ • Tiempo: 5 ticks (50 minutos)                           │   │
│  │ • Costo Capacitor: 100 GJ por tick                       │   │
│  │                                                           │   │
│  │ NIVEL EXPLORACIÓN ESTIMADO: 25-40 (Medio)               │   │
│  │                                                           │   │
│  │ [INICIAR ESCANEO]                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  RECURSOS DETECTADOS (requiere escaneo completo):               │
│  • Tier 1: ???                                                   │
│  • Tier 2: ???                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### Exploration Sites Map

**Ruta:** `/exploration/sites`

```
┌──────────────────────────────────────────────────────────────────┐
│ SITIOS DE EXPLORACIÓN DETECTADOS                                │
├─────────────┬────────┬──────────┬──────────┬─────────┬──────────┤
│ Nombre      │ Tipo   │ Tier     │ Sistema  │ Expira  │ Acciones │
├─────────────┼────────┼──────────┼──────────┼─────────┼──────────┤
│ Wreck-4729  │ Relic  │ T2 ★★    │ Vaxav    │ 24h     │ [Warp]   │
│ Combat-1822 │ Combat │ T1 ★     │ Vaxav    │ 18h     │ [Warp]   │
│ Gas-Cloud-A │ Gas    │ T3 ★★★   │ Nova-VII │ 6h      │ [Warp]   │
├─────────────┴────────┴──────────┴──────────┴─────────┴──────────┤
│ [Escanear Nuevos Sitios] [Ver Bookmarks]                        │
└──────────────────────────────────────────────────────────────────┘

LEYENDA:
  Combat Sites: Naves NPC hostiles, loot de combate
  Relic Sites: Estructuras antiguas, blueprints raros
  Gas Sites: Nebulosas temporales, gases T3-T4
  Data Sites: Servidores abandonados, datos de exploración
```

### 15.5.2 New Views - Fitting Planner

**Ruta:** `/fitting/planner`

```
┌────────────────────────────────────────────────────────────────────────┐
│ PLANIFICADOR DE EQUIPAMIENTO                                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ NAVE SELECCIONADA: Excavador MK-I (Fragata T1)                       │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ RECURSOS DE FITTING:                                             │ │
│ │                                                                   │ │
│ │ Reactor de Energía:  ████████████░░░░░░░░ 35/50 MW  [70%] ✓ OK  │ │
│ │ CPU:                 ██████████████████░░ 180/200 TF [90%] ✓ OK │ │
│ │ Capacitor:  500 GJ total | Regen: 25 GJ/tick                    │ │
│ │             Tiempo agotamiento: ~20 ticks con todo activo       │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ SLOTS OFENSIVOS (1/1):                                                │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ [1] Cañón Automático Ligero T1                                 │   │
│ │     8 RE | 15 CPU | 20 cap/disparo | 25 DPS                    │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ SLOTS DEFENSIVOS (2/2):                                               │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ [1] Generador de Escudos Pequeño T1                            │   │
│ │     8 RE | 15 CPU | +400 HP escudos                            │   │
│ │ [2] Placa de Armadura Mediana T1                               │   │
│ │     10 RE | 18 CPU | +700 HP armadura                          │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ SLOTS UTILIDAD (2/3):                                                 │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ [1] Láser de Minería Básico T1                                 │   │
│ │     10 RE | 20 CPU | 30 cap/ciclo | -1 tick minería            │   │
│ │ [2] Expansor de Carga I                                        │   │
│ │     3 RE | 10 CPU | +500 m³                                    │   │
│ │ [3] [VACÍO - Arrastrar módulo aquí]                            │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ ESTADÍSTICAS TOTALES:                                            │ │
│ │                                                                   │ │
│ │ • HP Total: 1,700 (400 escudos + 700 armadura + 600 estructura) │ │
│ │ • DPS Total: 25                                                  │ │
│ │ • Carga Total: 5,500 m³ (5,000 base + 500 módulo)               │ │
│ │ • Velocidad: 15 u/tick (base)                                    │ │
│ │                                                                   │ │
│ │ ⚠️ ADVERTENCIAS:                                                 │ │
│ │ • Capacitor se agotará en ~16 ticks si usas todo simultáneo     │ │
│ │ • CPU al 90% - considera Amplificador de CPU                    │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [GUARDAR FIT] [APLICAR A NAVE] [SIMULAR COMBATE] [COMPARTIR]         │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ BIBLIOTECA DE MÓDULOS: [Filtrar por tipo ▼] [Buscar...]        │ │
│ │                                                                   │ │
│ │ ⚔️ ARMAS:                                                         │ │
│ │   • Cañón Automático Ligero T1   8PG 15CPU ✓ Tienes skill      │ │
│ │   • Láser de Pulso T1           10PG 20CPU ✗ Requiere skill 1  │ │
│ │   • Cañón de Riel T2            15PG 25CPU ✗ Requiere skill 3  │ │
│ │                                                                   │ │
│ │ 🛡️ DEFENSIVOS:                                                    │ │
│ │   • Generador Escudos Peq T1     8PG 15CPU ✓                    │ │
│ │   • Generador Escudos Med T1    15PG 25CPU ✓                    │ │
│ │                                                                   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 15.5.3 New Views - Player Businesses

#### Browse Player Businesses

**Ruta:** `/businesses/browse`

```
┌──────────────────────────────────────────────────────────────────────┐
│ COMERCIOS DE JUGADORES - Vaxav I - Luna 1 - Puerto Génesis         │
├──────────────────────────────────────────────────────────────────────┤
│ ZONA COMERCIAL: Nivel 3 (Capacidad: 15 espacios, Ocupados: 8)      │
├─────────────────┬──────────────┬──────────┬────────────┬────────────┤
│ Nombre          │ Tipo         │ Dueño    │ Reputación │ Acciones   │
├─────────────────┼──────────────┼──────────┼────────────┼────────────┤
│ Iron Gym        │ 🏋️ Gimnasio  │ John Doe │ ★★★★☆ 85%  │ [Visitar]  │
│ The Last Bar    │ 🍺 Taberna   │ Jane Fox │ ★★★★★ 95%  │ [Visitar]  │
│ Quick Fix       │ 🔧 Taller    │ Bob Lee  │ ★★★☆☆ 70%  │ [Visitar]  │
│ Star Diner      │ 🍽️ Restaurant│ Ana Cruz │ ★★★★☆ 88%  │ [Visitar]  │
│ Tech Emporium   │ 🏪 Tienda    │ Zara Kim │ ★★★★☆ 82%  │ [Visitar]  │
├─────────────────┴──────────────┴──────────┴────────────┴────────────┤
│ [ALQUILAR ESPACIO] Costo: 5,000₡/tick                               │
└──────────────────────────────────────────────────────────────────────┘
```

#### Player Business Detail View

**Ruta:** `/businesses/{business_id}`

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⭐ IRON GYM - Gimnasio de Élite                                     │
│ Dueño: John Doe | Reputación: ★★★★☆ 85% | 🟢 ABIERTO               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ "El mejor gimnasio de Vaxav. Entrena tu cuerpo, forja tu destino." │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ SERVICIOS DISPONIBLES:                                           ││
│ │                                                                   ││
│ │ • SESIÓN BÁSICA                          500₡                    ││
│ │   Buff: +5% exp física por 12 ticks (2 horas)                   ││
│ │   [COMPRAR]                                                      ││
│ │                                                                   ││
│ │ • SESIÓN PREMIUM                        2,000₡                   ││
│ │   Buff: +10% exp física + combate por 24 ticks (4 horas)        ││
│ │   [COMPRAR]                                                      ││
│ │                                                                   ││
│ │ • ENTRENAMIENTO ÉLITE                   5,000₡                   ││
│ │   Buff: +15% exp todas las skills por 36 ticks (6 horas)        ││
│ │   [COMPRAR]                                                      ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ RESEÑAS RECIENTES:                                                   │
│ ─────────────────────────────────────────────────────────────────   │
│ ★★★★★ "Excelente servicio, volveré" - Ana Cruz (hace 2 horas)      │
│ ★★★★☆ "Buenos buffs pero un poco caro" - Bob Lee (hace 1 día)      │
│ ★★★★★ "El mejor gimnasio del sistema" - Jane Fox (hace 3 días)     │
│                                                                      │
│ [DEJAR RESEÑA] [REPORTAR NEGOCIO]                                   │
└──────────────────────────────────────────────────────────────────────┘
```

#### Business Management Panel (Owner Only)

**Ruta:** `/businesses/{business_id}/manage`

```
┌──────────────────────────────────────────────────────────────────────┐
│ GESTIÓN - IRON GYM                                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ESTADÍSTICAS:                                                        │
│ • Clientes Totales: 247                                              │
│ • Ingresos Totales: 387,500₡                                         │
│ • Reputación: 85% (★★★★☆)                                           │
│ • Alquiler Pendiente: 10,000₡ (2 ticks)                             │
│                                                                      │
│ ESTADO: 🟢 ABIERTO                                                   │
│ [Cerrar Temporalmente] [Cambiar Horario]                            │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ GESTIÓN DE SERVICIOS:                                            ││
│ │                                                                   ││
│ │ • Sesión Básica          500₡  [Editar Precio] [Desactivar]     ││
│ │ • Sesión Premium       2,000₡  [Editar Precio] [Desactivar]     ││
│ │ • Entrenamiento Élite  5,000₡  [Editar Precio] [Desactivar]     ││
│ │                                                                   ││
│ │ [AÑADIR NUEVO SERVICIO]                                           ││
│ └──────────────────────────────────────────────────────────────────┘││
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐││
│ │ ÚLTIMAS TRANSACCIONES:                                           ││
│ │                                                                   ││
│ │ 2025-11-28 14:30 - Ana Cruz compró "Sesión Premium" - 2,000₡    ││
│ │ 2025-11-28 12:15 - Bob Lee compró "Sesión Básica" - 500₡        ││
│ │ 2025-11-28 10:45 - Jane Fox compró "Entrenamiento Élite" - 5K₡  ││
│ └──────────────────────────────────────────────────────────────────┘││
│                                                                      │
│ [VER INFORME COMPLETO] [PAGAR ALQUILER] [CERRAR NEGOCIO]            │
└──────────────────────────────────────────────────────────────────────┘
```

### 15.6 Interfaz de Consola de Construcción (Crafting)

La Consola de Construcción es la interfaz principal para fabricación de naves, módulos y componentes en estaciones con módulo de Consola de Construcción.

**Layout Principal:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ CONSOLA DE CONSTRUCCIÓN - Puerto Estelar Génesis                    │
├──────────────────────────────────────────────────────────────────────┤
│ [Naves] [Módulos] [Componentes] [Recursos] [Cola de Fabricación]    │
├─────────────────────────┬────────────────────────────────────────────┤
│ BLUEPRINTS DISPONIBLES  │ DETALLES: Excavador MK-I (Fragata T1)     │
│ ────────────────────    │                                            │
│ NAVES FRAGATA:          │ ┌────────────────────────────────────────┐ │
│ ✓ Excavador MK-I (T1)   │ │ [RENDERIZADO 3D DE LA NAVE]           │ │
│ ✓ Depredador (T1)       │ │                                        │ │
│ ✓ Explorador Vaxav (T1) │ │                                        │ │
│ ✗ Crucero Vanguardia    │ │                                        │ │
│   (Req: skill Nivel 3)  │ │                                        │ │
│                         │ └────────────────────────────────────────┘ │
│ NAVES CRUCERO:          │                                            │
│ ✗ Crucero Mercante T1   │ ESPECIFICACIONES:                          │
│   (Blueprint bloqueado) │ • Escudos: 500 HP                          │
│   [Desbloquear: 50K₡]   │ • Armadura: 800 HP                         │
│                         │ • Estructura: 600 HP                       │
│ [Buscar...]             │ • Reactor Energía: 50 MW                   │
│                         │ • CPU: 200 GHz                             │
├─────────────────────────┤ • Cargo: 5,000 m³ (+25% minería)          │
│ FILTROS:                │ • Slots: 1 Ofensivo, 2 Defensivo, 3 Util  │
│ □ Solo desbloqueados    │                                            │
│ □ Tengo materiales      │ BONIFICACIONES ESPECIALES:                 │
│ □ Puedo fabricar ahora  │ • +15% velocidad minería                   │
│                         │ • +25% capacidad cargo de minerales        │
│ Tier: [Todos ▾]         │                                            │
│ Categoría: [Todas ▾]    │ ────────────────────────────────────────── │
└─────────────────────────┤ RECETA DE FABRICACIÓN:                     │
                          │                                            │
                          │ Componentes Requeridos:                    │
                          │ ✓ 200 Placas de Blindaje T1    (Tengo 450)│
                          │ ✓ 120 Servomotores T1          (Tengo 300)│
                          │ ✓ 80 Circuitos Básicos         (Tengo 150)│
                          │ ✗ 50 Celdas de Energía T1      (Tengo 20) │
                          │ ✓ 100 Vigas Reforzadas         (Tengo 100)│
                          │                                            │
                          │ Skill Requerida: Construcción Naves Nv1 ✓ │
                          │ Tiempo de Fabricación: 24 ticks (4 horas)  │
                          │ Costo Energía: 500 MW                      │
                          │                                            │
                          │ [Obtener Materiales Faltantes]             │
                          │                                            │
                          │ Cantidad a Fabricar: [1] [5] [10] [Max:3] │
                          │                                            │
                          │ ┌────────────────────────────────────────┐ │
                          │ │  [INICIAR FABRICACIÓN] (24 ticks)      │ │
                          │ └────────────────────────────────────────┘ │
                          │                                            │
                          │ ÁRBOL DE DEPENDENCIAS: [Mostrar ▾]         │
└────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades Clave:**

1. **Sistema de Búsqueda y Filtrado:**
   - Búsqueda por nombre de item
   - Filtro por tier, categoría, disponibilidad
   - Indicadores visuales: ✓ Desbloqueado, ✗ Bloqueado
   - Muestra motivo de bloqueo (skill, blueprint, recursos)

2. **Vista de Detalles del Item:**
   - Renderizado 3D de nave/módulo (opcional)
   - Especificaciones completas con stats
   - Bonificaciones especiales destacadas
   - Comparación con item actualmente equipado (si aplica)

3. **Receta de Fabricación Interactiva:**
   - Lista de materiales con cantidades requeridas vs disponibles
   - Indicadores visuales: ✓ Suficiente, ✗ Insuficiente
   - Botón "Obtener Materiales Faltantes" → abre mercado filtrado
   - Muestra skills requeridas para fabricar
   - Tiempo estimado y costo de energía

4. **Cola de Fabricación:**
   - Permite encolar múltiples fabricaciones
   - Muestra progreso actual con barra animada
   - Estimación de tiempo total
   - Puede pausar/cancelar trabajos

5. **Árbol de Dependencias (Expandible):**
   - Muestra cadena completa: Recursos Crudos → Procesados → Componentes → Producto Final
   - Click en cualquier nodo para ver su receta
   - Navegación rápida entre dependencias

### 15.7 Sistema de Información de Ítems (Tooltips)

Todos los ítems del juego (naves, módulos, componentes, recursos) deben mostrar información detallada al inspeccionar.

**Formato de Tooltip para Naves:**

```
┌────────────────────────────────────────────────────────┐
│ EXCAVADOR MK-I                          [Fragata T1]   │
├────────────────────────────────────────────────────────┤
│ "Fragata especializada en minería con sistemas         │
│  de procesamiento optimizados y cargo expandido."      │
│                                                        │
│ ESPECIFICACIONES:                                      │
│ • Escudos: 500 HP                                      │
│ • Armadura: 800 HP                                     │
│ • Estructura: 600 HP                                   │
│ • Reactor Energía: 50 MW                               │
│ • CPU: 200 GHz                                         │
│ • Cargo: 5,000 m³                                      │
│ • Slots: 1 Ofensivo / 2 Defensivo / 3 Utilidad        │
│                                                        │
│ BONIFICACIONES:                                        │
│ • +15% velocidad de minería                            │
│ • +25% capacidad de cargo de minerales                 │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ SKILLS PARA USAR:                                      │
│ ✓ Pilotaje de Fragatas Nivel 1                        │
│ ✗ Minería Nivel 2 (Tienes: Nivel 1)                   │
│                                                        │
│ SKILLS PARA FABRICAR:                                  │
│ ✓ Construcción de Naves Nivel 1                       │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ RECETA DE FABRICACIÓN:                                 │
│ • 200 Placas de Blindaje T1                            │
│ • 120 Servomotores T1                                  │
│ • 80 Circuitos Básicos                                 │
│ • 50 Celdas de Energía T1                              │
│ • 100 Vigas Reforzadas                                 │
│                                                        │
│ Tiempo: 24 ticks (4 horas)                             │
│ Energía: 500 MW                                        │
│                                                        │
│ BLUEPRINT:                                             │
│ ✓ Desbloqueado (Gratis - Tier 1)                      │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ PRECIO NPC BASE: 150,000₡                              │
│ MERCADO (último precio): 180,000₡ (+20%)               │
│ VOLUMEN: 15,000 m³                                     │
│                                                        │
│ [Ver Árbol de Dependencias] [Ir a Mercado]            │
└────────────────────────────────────────────────────────┘
```

**Formato de Tooltip para Módulos:**

```
┌────────────────────────────────────────────────────────┐
│ CAÑÓN AUTOMÁTICO LIGERO                    [Módulo T1] │
├────────────────────────────────────────────────────────┤
│ "Cañón básico de proyectiles cinéticos para           │
│  combate a corta-media distancia."                     │
│                                                        │
│ STATS:                                                 │
│ • Daño: 120 HP/disparo                                 │
│ • Cadencia: 2.5s                                       │
│ • DPS: 48 HP/s                                         │
│ • Alcance: 15 km                                       │
│ • Tracking: 45°/s                                      │
│ • Consumo Energía: 8 MW                                │
│ • Consumo CPU: 25 GHz                                  │
│ • Munición: Rondas Cinéticas Básicas                   │
│                                                        │
│ SKILLS PARA USAR:                                      │
│ ✓ Armas de Proyectiles Nivel 1                        │
│                                                        │
│ SKILLS PARA FABRICAR:                                  │
│ ✓ Construcción de Naves Nivel 1                       │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ RECETA:                                                │
│ • 15 Placas de Blindaje T1                             │
│ • 10 Servomotores T1                                   │
│ • 8 Circuitos Básicos                                  │
│                                                        │
│ Tiempo: 8 ticks | Energía: 50 MW                       │
│ Blueprint: ✓ Gratis (T1)                               │
│                                                        │
│ PRECIO NPC: 25,000₡                                    │
│ VOLUMEN: 2 m³                                          │
│                                                        │
│ [Ver Árbol de Dependencias]                            │
└────────────────────────────────────────────────────────┘
```

**Formato de Tooltip para Componentes:**

```
┌────────────────────────────────────────────────────────┐
│ CIRCUITOS BÁSICOS                      [Componente T1] │
├────────────────────────────────────────────────────────┤
│ "Circuitos electrónicos fundamentales usados en        │
│  construcción de módulos y naves."                     │
│                                                        │
│ SKILLS PARA FABRICAR:                                  │
│ ✓ Construcción de Componentes Nivel 1                 │
│                                                        │
│ RECETA:                                                │
│ • 20 Cobre Estelar (refinado)                          │
│ • 10 Silicatos Refinados                               │
│                                                        │
│ Tiempo: 2 ticks | Energía: 10 MW                       │
│ Blueprint: ✓ Gratis (T1)                               │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ USADO EN FABRICACIÓN DE:                               │
│ • Cañón Automático Ligero (8 unidades)                 │
│ • Escudo Adaptativo Básico (15 unidades)               │
│ • Excavador MK-I (80 unidades)                         │
│ ... +25 recetas más                                    │
│                                                        │
│ [Ver Todas las Recetas que Usan Este Item]            │
│                                                        │
│ PRECIO NPC: 500₡/u                                     │
│ MERCADO: 450₡/u (-10%)                                 │
│ VOLUMEN: 0.1 m³/u                                      │
└────────────────────────────────────────────────────────┘
```

**Formato de Tooltip para Recursos:**

```
┌────────────────────────────────────────────────────────┐
│ FERRITA REFINADA                       [Recurso T1]    │
├────────────────────────────────────────────────────────┤
│ "Metal refinado obtenido de Ferrita Cruda extraída    │
│  de asteroides. Base para construcciones metálicas."   │
│                                                        │
│ CATEGORÍA: A - Recursos de Asteroides (Metálicos)     │
│                                                        │
│ OBTENCIÓN:                                             │
│ • Refinar Ferrita Cruda en Sala de Ingeniería         │
│ • Ratio refinamiento: 0.75 base                        │
│   (mejora con skill Refinamiento Avanzado)             │
│                                                        │
│ FUENTE DEL RECURSO CRUDO (Ferrita):                    │
│ • Cinturón Principal Alfa (70% abundancia)             │
│ • Cinturón Principal Beta (20% abundancia)             │
│ • Asteroides en IIC 1-2                                │
│                                                        │
│ SKILL PARA EXTRAER: Minería Nivel 1+                   │
│ SKILL PARA REFINAR: Refinamiento Avanzado (opcional)   │
│                                                        │
│ ─────────────────────────────────────────────────────  │
│ USADO EN FABRICACIÓN DE:                               │
│ • Barras de Acero (50 unidades)                        │
│ • Placas de Blindaje T1 (60 unidades)                  │
│ • Vigas Reforzadas (40 unidades)                       │
│ • Servomotores T1 (20 unidades)                        │
│ ... +8 componentes más                                 │
│                                                        │
│ [Ver Árbol de Dependencias] [Ver en Mercado]          │
│                                                        │
│ PRECIO NPC: 12₡/u                                      │
│ MERCADO: 15₡/u (+25%)                                  │
│ VOLUMEN: 1 m³/u                                        │
└────────────────────────────────────────────────────────┘
```

**Árbol de Dependencias Interactivo:**

Al hacer click en "Ver Árbol de Dependencias" en cualquier tooltip, se abre un modal con visualización gráfica:

```
┌─────────────────────────────────────────────────────────────┐
│ ÁRBOL DE DEPENDENCIAS: Excavador MK-I                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Excavador MK-I]                         │
│                           │                                 │
│        ┌──────────────────┼──────────────────┐              │
│        │                  │                  │              │
│   [Placas de        [Servomotores       [Circuitos         │
│   Blindaje T1]         T1]               Básicos]          │
│   (200 unidades)    (120 unidades)     (80 unidades)       │
│        │                  │                  │              │
│    ┌───┴───┐          ┌───┴───┐          ┌───┴───┐         │
│    │       │          │       │          │       │         │
│ [Ferrita  [Titanita  [Ferrita [Cobre   [Cobre  [Silicatos │
│ Refinada] Refinada]  Refinada] Estelar] Estelar] Refinados]│
│  (60u)     (20u)      (20u)    (15u)    (20u)    (10u)     │
│    │         │          │        │        │         │       │
│ [Ferrita  [Titanita  [Ferrita  [Cobre   [Cobre  [Silicatos│
│  Cruda]    Cruda]     Cruda]    Crudo]   Crudo]  Crudos]   │
│  (80u)     (29u)      (27u)     (20u)    (27u)    (13u)    │
│                                                             │
│ TOTALES RECURSIVOS:                                         │
│ • Ferrita Cruda: 134 unidades                               │
│ • Titanita Cruda: 29 unidades                               │
│ • Cobre Crudo: 47 unidades                                  │
│ • Silicatos Crudos: 13 unidades                             │
│ • ... (mostrando solo primeras 4 capas)                     │
│                                                             │
│ Click en cualquier nodo para ver su tooltip                 │
│                                                             │
│ [Exportar Lista de Compras] [Cerrar]                        │
└─────────────────────────────────────────────────────────────┘
```

**Características del Sistema:**

1. **Tooltips Contextuales:**
   - Aparecen al hacer hover sobre cualquier item en inventario, mercado, o consola
   - Información adaptada al contexto (muestra más detalle en consola de fabricación)
   - Indicadores visuales de disponibilidad (✓/✗)

2. **Navegación Integrada:**
   - Botones de acción directa ("Ir a Mercado", "Ver Árbol")
   - Links clickeables en listas de materiales
   - Breadcrumb navigation en árbol de dependencias

3. **Comparación de Precios:**
   - Muestra precio NPC vs precio de mercado de jugadores
   - Indicador de variación porcentual
   - Sugerencia de compra óptima

4. **Exportar Lista de Compras:**
   - Genera lista de materiales crudos necesarios
   - Puede compartirse con otros jugadores
   - Se puede usar como filtro en mercado

### 15.8 Bibliotecas y Herramientas UI Recomendadas

Para implementar la interfaz moderna:

**Gráficos y Visualización:**
- **Chart.js** o **ApexCharts** - Gráficos de precios de mercado, estadísticas
- **ProgressBar.js** - Barras de progreso animadas (energía, skills, etc.)

**Componentes UI:**
- **Headless UI** (by Tailwind) - Componentes accesibles sin estilos
- **Alpine.js Components** - Dropdowns, modals, tabs, tooltips
- **Heroicons** - Sistema de íconos consistente

**Efectos Visuales:**
- **Particles.js** o **tsParticles** - Efecto de estrellas en el fondo
- **GSAP** - Animaciones complejas si son necesarias
- **AOS (Animate On Scroll)** - Animaciones de entrada suaves

**Utilidades:**
- **Moment.js** o **Day.js** - Formateo de fechas/tiempos
- **Numeral.js** - Formateo de números grandes (créditos, cantidades)
- **Tippy.js** - Tooltips elegantes y configurables

---

## Navegación

- [← Anterior: PRD-SocialSystem.md](./PRD-SocialSystem.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-TechnicalArchitecture.md](./PRD-TechnicalArchitecture.md)
