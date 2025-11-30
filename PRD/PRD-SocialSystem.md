# Sistema Social y Estado del Piloto

**Parte del:** PRD - Vaxav
**Versión:** 1.6
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

[Volver al PRD Master](./PRD-Master.md)

---

## 13. Sistema Social y Estado del Piloto

### 13.1 Atributos del Piloto

El piloto tiene atributos que afectan su rendimiento en las acciones y deben ser gestionados activamente.

### 13.1.1 Energía (0-100)

Combina fatiga física y mental del piloto.

**Efectos en el juego:**

```
100-80:  Rendimiento óptimo (+5% a todas las acciones)
79-60:   Rendimiento normal (sin modificadores)
59-40:   Cansancio (-10% eficiencia, -5% exp ganada)
39-20:   Agotamiento (-25% eficiencia, -15% exp ganada)
19-0:    Exhausto (-50% eficiencia, -30% exp ganada, riesgo de errores)
```

**Cómo se consume:**
- Cada acción de tick consume energía (1-5 puntos según intensidad)
- Minería: -2 energía por tick
- Combate: -4 energía por tick
- Pilotaje: -1 energía por tick
- Fabricación: -2 energía por tick
- Navegación simple: -1 energía cada 10 ticks
- **Interacciones sociales:** -3 energía por interacción típica

**Cómo se recupera:**
- **Descansar en Habitáculos:** +20 energía por tick (requiere estar en estación)
- **Dormir (offline 48 ticks / ~8 horas):** Recuperación completa a 100
- **Consumir estimulantes:** +30 energía instantánea (tiene cooldown y efectos secundarios)
- **Pasivo (offline):** +1 energía cada 2 ticks (equivalente a +3 energía/hora con tick de 10 min)

**Mecánica anti-grinding:**
- Si la energía llega a 0, el piloto queda "inconsciente" y no puede realizar ninguna acción hasta recuperar energía
- Puede descansar en la nave pero la recuperación es lenta: +5 energía por tick (menos eficiente que descansar en habitáculos)
- Es necesario ir a una estación o usar otros métodos más efectivos para recuperarse rápidamente
- Penalización temporal: -10% energía máxima por 144 ticks (~24h) (recuperable descansando en habitáculos)

### 13.1.2 Nutrición (0-100)

Representa alimentación e hidratación.

**Efectos en el juego:**

```
100-70:  Bien nutrido (+3% regeneración de energía)
69-40:   Nutrición normal (sin modificadores)
39-20:   Hambriento (-5% energía máxima)
19-0:    Desnutrido (-15% energía máxima, -10% eficiencia)
```

**Cómo se consume:**
- Disminuye 1 punto cada 6 ticks (~1 hora con tick de 10 min)
- Acciones intensas (combate) consumen +1 adicional cada 6 ticks de combate

**Cómo se recupera:**
- **Comer en Habitáculos:** +30 nutrición (consume "Raciones Alimenticias" del inventario)
- **Restaurantes de estación:** +50 nutrición (cuesta créditos, disponible en estaciones grandes)
- **Raciones de emergencia:** +15 nutrición (item consumible, se puede llevar en la nave)

**Items de comida:**
- Raciones Básicas (100₡): +30 nutrición
- Comida de Lujo (500₡): +50 nutrición + buff temporal (+5% exp por 12 ticks / ~2 horas)
- Raciones de Emergencia (50₡): +15 nutrición (stackeable, para viajes largos)

### 13.1.3 Moral (0-100)

Estado anímico y psicológico del piloto.

**Efectos en el juego:**

```
100-80:  Excelente moral (+10% exp ganada, +5% eficiencia social)
79-60:   Moral normal (sin modificadores)
59-40:   Moral baja (-5% exp ganada)
39-20:   Deprimido (-15% exp ganada, -10% relaciones sociales)
19-0:    Desesperado (-25% exp ganada, riesgo de abandonar corporación)
```

**Cómo se consume:**
- Morir en combate: -20 moral
- Perder nave cara: -15 moral
- Perder dinero en mercado: -5 moral
- Estar solo (sin interacciones sociales) por 432+ ticks (~3 días): -2 moral cada 144 ticks (cada día)
- Trabajar demasiado (energía <30 por mucho tiempo): -1 moral cada 6 ticks (~1 hora)
- **Ruptura romántica:** -50 moral (solo al momento de ruptura)
- **Rechazo en interacción social (fallo crítico):** -5 moral
- **Relación importante deteriorándose (>75 y sin interacción 5+ días):** -3 moral por día

**Cómo se recupera:**
- **Interacciones sociales exitosas:**
  - Charlar: +2 moral
  - Conocerse Mejor: +5 moral
  - Invitar Bebidas: +8 moral
  - Compartir Secreto: +10 moral
  - Interacciones románticas: +10 a +20 moral según nivel
- **Tener relaciones activas:**
  - Amigo (51-75): +1 moral cada 144 ticks (~1 día) por amigo (máx 5 amigos)
  - Amigo Cercano (76-90): +2 moral cada 144 ticks por amigo cercano (máx 3)
  - Mejor Amigo (91-100): +3 moral cada 144 ticks por mejor amigo (máx 1)
  - Romance activo (71-85): +5 moral cada 144 ticks
  - Pareja (86-95): +8 moral cada 144 ticks
  - Unidos (96-100): +25 moral permanente (no por tick, es modificador constante)
- **Completar misiones exitosamente:** +3 moral
- **Ganar combates PvP:** +10 moral
- **Ganar dinero en mercado:** +2 moral por transacción exitosa
- **Actividades recreativas en Habitáculos:** +5 moral (1 vez cada 144 ticks / ~1 día)
- **Estar en corporación activa:** +2 moral cada 144 ticks (~1 día) pasivo
- **Cita Romántica (actividad especial):** +15 moral (disponible si romance >70)

### 13.1.4 Estrés Espacial (0-100)

Presión psicológica de estar en el espacio. **Menor es mejor**.

**Efectos en el juego:**

```
0-20:    Tranquilo (sin efectos)
21-40:   Tenso (-3% precisión en combate)
41-60:   Estresado (-7% precisión, -5% eficiencia minería)
61-80:   Muy estresado (-15% precisión, -10% eficiencia, -5% moral cada 144 ticks)
81-100:  Crisis nerviosa (-30% a todo, riesgo de error crítico)
```

**Cómo se acumula:**
- Estar en espacio (no en estación): +1 estrés cada 6 ticks (~1 hora)
- Combate: +5 estrés por combate
- Viajar solo en sistemas peligrosos: +3 estrés cada 6 ticks (~1 hora)
- Estar en nave dañada (<30% estructura): +2 estrés cada 6 ticks (~1 hora)
- Eventos traumáticos (casi morir): +20 estrés

**Cómo se reduce:**
- **Estar atracado en estación:** -5 estrés cada 6 ticks (~1 hora) pasivo
- **Descansar en Habitáculos:** -10 estrés por tick de descanso
- **Terapia psicológica (NPC médico):** -30 estrés (cuesta 5,000₡)
- **Viajar en flota con amigos:** -2 estrés cada 6 ticks (~1 hora) (en lugar de +1 solo)
- **Tiempo offline:** -3 estrés cada 6 ticks (~1 hora) desconectado

### 13.2 Sistema de Relaciones Sociales (Mejorado - Inspirado en Popmundo)

Los pilotos pueden formar relaciones complejas con otros jugadores y NPCs mediante interacciones directas.

#### 13.2.1 Tipos de Relación

**Cada relación tiene:**
- **Tipo:** Amistad o Romance
- **Valor:** 0-100 (nivel de cercanía)
- **Estado:** Icono y etiqueta visual
- **Última Interacción:** Timestamp para calcular deterioro

**Tipos de Relación:**

1. **Amistad (por defecto)**
   - Se forma automáticamente al primera interacción
   - Progresa: Desconocido (0-10) → Conocido (11-25) → Camarada (26-50) → Amigo (51-75) → Amigo Cercano (76-90) → Mejor Amigo (91-100)

2. **Romance**
   - Requiere acción "Coquetear" exitosa (disponible si relación >50)
   - Cambia tipo de amistad → romance
   - Progresa: Atracción (50-60) → Coqueteo (61-70) → Novios (71-85) → Pareja (86-95) → Unión/Matrimonio (96-100)
   - **Solo puede haber 1 relación romántica activa** (nivel >70) a la vez
   - Si intentas iniciar romance con otra persona teniendo pareja: -30 relación con pareja actual, riesgo de "ruptura"

#### 13.2.2 Visualización de Barra de Relación

**Inspirado en Popmundo - Sistema de Fases con Iconos:**

```
┌─────────────────────────────────────────────────────────┐
│ MARCUS STEEL                              ⚫ Online      │
├─────────────────────────────────────────────────────────┤
│ Tipo: Amistad                                           │
│ 😐 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ❤️         │
│     ████████████████████████████░░░░░░░░░░░░  76/100    │
│ Estado: Amigo Cercano                                   │
│ Última interacción: Hace 6 horas                        │
├─────────────────────────────────────────────────────────┤
│ Acciones disponibles: 4/5 interacciones hoy            │
│ [Charlar] [Conocerse Mejor] [Invitar Bebidas]          │
│ [Regalar Item] [Coquetear 🔒]                           │
└─────────────────────────────────────────────────────────┘
```

**Colores de Barra por Fase (Amistad):**
- 0-10: Gris (Desconocido) 😐
- 11-25: Azul claro (Conocido) 👋
- 26-50: Azul (Camarada) 🤝
- 51-75: Verde (Amigo) 😊
- 76-90: Dorado (Amigo Cercano) 🌟
- 91-100: Rojo/Rosa (Mejor Amigo) ❤️

**Colores de Barra por Fase (Romance):**
- 50-60: Púrpura claro (Atracción) 😳
- 61-70: Púrpura (Coqueteo) 💜
- 71-85: Magenta (Novios) 💕
- 86-95: Rosa intenso (Pareja) 💖
- 96-100: Rojo pasión (Unión) 💗

#### 13.2.3 Acciones Sociales Directas

**Al hacer click en perfil de piloto, se abren acciones:**

**Acciones Base (disponibles para todos):**

1. **Charlar**
   - Costo: 1 interacción diaria, -3 energía
   - Efecto base: +3 relación
   - Cooldown: 6 ticks (~1 hora) con la misma persona
   - Exp ganada: +5 Sociabilidad, +3 Carisma

2. **Regalar Item**
   - Costo: 1 interacción, -3 energía, + item del inventario
   - Efecto: +1 relación por cada 1000₡ de valor del item
   - Cooldown: 12 ticks (~2 horas) con la misma persona
   - Exp ganada: +8 Carisma

**Acciones Desbloqueables por Nivel de Relación:**

3. **Conocerse Mejor** (requiere relación >25)
   - Costo: 2 interacciones diarias, -5 energía
   - Efecto base: +8 relación
   - Cooldown: 12 ticks (~2 horas)
   - Exp ganada: +10 Sociabilidad, +8 Carisma

4. **Invitar a Bebidas** (requiere relación >25, estar en misma estación)
   - Costo: 1 interacción, -3 energía, 500₡
   - Efecto base: +12 relación, +5 moral (ambos)
   - Cooldown: 24 ticks (~4 horas)
   - Exp ganada: +12 Carisma

5. **Compartir Secreto** (requiere relación >50)
   - Costo: 2 interacciones, -5 energía
   - Efecto base: +15 relación
   - Riesgo: Si relación <60, puede fallar y -5 relación
   - Cooldown: 72 ticks (~12 horas)
   - Exp ganada: +15 Carisma

**Acciones Románticas (requieren Seducción skill):**

6. **Coquetear** (requiere relación >50, Seducción Nivel 1+)
   - Costo: 1 interacción, -4 energía
   - Efecto: Intento de cambiar tipo amistad → romance
   - Éxito basado en: Carisma propio, Seducción, personalidad objetivo
   - Éxito: Cambia a romance (valor 50), +10 moral propio
   - Fallo: -10 relación, +10 estrés, relación no cambia tipo
   - Cooldown: 144 ticks (~24 horas) si falla
   - Exp ganada: +20 Seducción (éxito), +5 (fallo)

7. **Seducir** (requiere romance activo, Seducción Nivel 2+)
   - Costo: 2 interacciones, -6 energía
   - Efecto base: +10 relación romántica
   - Cooldown: 12 ticks (~2 horas)
   - Exp ganada: +15 Seducción

8. **Declararse** (requiere romance >70, Seducción Nivel 3+)
   - Costo: 3 interacciones, -8 energía
   - Efecto: Propuesta formal de noviazgo
   - Éxito: +20 relación, ambos obtienen título "Novios"
   - Fallo: -15 relación, +20 estrés
   - Cooldown: 288 ticks (~48 horas) si falla
   - Exp ganada: +30 Seducción

9. **Proponer Unión** (requiere romance >90, Seducción Nivel 5)
   - Costo: 5 interacciones, -10 energía, 50,000₡ (anillo/símbolo)
   - Efecto: Propuesta de unión permanente (matrimonio espacial)
   - Éxito: Estado "Unidos", bonos especiales permanentes
   - Fallo: -25 relación, +30 estrés, posible ruptura
   - Cooldown: Solo se puede intentar 1 vez cada 1440 ticks (~10 días)
   - Exp ganada: +50 Seducción

**Acciones Diplomáticas (requieren Diplomacia skill):**

10. **Mediar Conflicto** (requiere Diplomacia Nivel 2+)
    - Costo: 3 interacciones, -8 energía
    - Efecto: Intento de resolver conflicto entre dos pilotos con relación negativa
    - Éxito: +10 relación entre ambos, +5 relación contigo (de ambos)
    - Cooldown: 144 ticks (~24 horas)
    - Exp ganada: +25 Diplomacia

#### 13.2.4 Sistema de Compatibilidad de Personalidades

**Cada interacción tiene probabilidad de éxito/efectividad basada en compatibilidad:**

**Cálculo de Compatibilidad:**

```
compatibilidad_base = 50%

Modificadores por Personalidad:

Carisma:
  - Propio alto (8-10): +15%
  - Propio bajo (1-3): -10%

Temperamento (ambos):
  - Ambos flemáticos (8-10): +10% (se llevan tranquilos)
  - Ambos coléricos (1-3): -15% (chocan)
  - Uno flemático, otro colérico: -5% (diferencia moderada)
  - Ambos equilibrados: +0%

Ambición (diferencia):
  - Diferencia <3: +5% (valores similares)
  - Diferencia 3-6: +0%
  - Diferencia >6: -10% (muy diferentes)

Valentía (depende de acción):
  - Ambos valientes y acción es "Compartir Secreto": +10%
  - Ambos cautelosos: -5% en acciones arriesgadas

Skill del ejecutor:
  - Carisma Nivel 1: +10%
  - Carisma Nivel 2: +20%
  - Carisma Nivel 3: +30%
  - Carisma Nivel 4: +40%
  - Carisma Nivel 5: +50%

  - Seducción (acciones románticas) igual sistema

compatibilidad_final = compatibilidad_base + todos_modificadores
```

**Resultado de Interacción:**

- Si compatibilidad_final ≥ 70%: Éxito total → ganancia base de relación
- Si 40-69%: Éxito parcial → 50% ganancia de relación
- Si 20-39%: Fallo → +0 relación, energía consumida igual
- Si <20%: Fallo crítico → -5 relación, +5 estrés (ambos)

**Ejemplo:**

```
Marcus (Carisma 8, Temperamento 3, Ambición 7, Valentía 9)
intenta "Charlar" con
Jane (Carisma 5, Temperamento 8, Ambición 2, Valentía 4)

Cálculo:
Base: 50%
+ Carisma Marcus alto: +15%
+ Temperamento diferentes (3 vs 8): -5%
+ Ambición diferencia 5: +0%
+ Skill Carisma Marcus Nivel 2: +20%
= 80% compatibilidad

Resultado: Éxito total → Jane gana +3 relación con Marcus
```

#### 13.2.5 Deterioro Pasivo de Relaciones

**Todas las relaciones se deterioran si no se mantienen:**

**Sistema de Deterioro:**

- Cada **72 ticks (~12 horas con tick de 10 min)** se ejecuta proceso de deterioro
- Por cada relación que no ha tenido interacción en últimos 3 días (432 ticks):
  - Relación 0-50: -1 punto cada 3 días
  - Relación 51-75: -1 punto cada 2 días
  - Relación 76-100: -1 punto cada 2 días
  - Relación romántica (novios/pareja): -2 puntos cada 2 días
  - Relación "Unidos": -1 punto cada 5 días (más estable)

**Prevención de Deterioro:**
- Cualquier interacción exitosa resetea el contador de deterioro
- Estar en la misma estación: -50% velocidad deterioro
- Trabajar juntos (minería, combate): resetea contador + bonus relación pasivo
- Estar en la misma corporación: -30% velocidad deterioro

**Notificaciones:**
- Si relación >50 y lleva 5+ días sin interacción: Notificación "Tu amistad con Marcus se está enfriando..."
- Si relación romántica sin interacción 3+ días: Notificación urgente "Tu relación con Jane necesita atención!"

#### 13.2.6 Beneficios por Nivel de Relación

**Actualizados con Romance:**

**AMISTAD:**

```
Desconocido (0-10):
  - Solo pueden ver perfil público

Conocido (11-25):
  - Puede enviar mensajes privados
  - Aparece en lista de contactos

Camarada (26-50):
  - +2% eficiencia cuando trabajan juntos
  - Pueden compartir ubicación en tiempo real
  - Descuento 5% en trades entre ustedes

Amigo (51-75):
  - +5% eficiencia cuando trabajan juntos
  - Pueden compartir hangares corporativos
  - +3 moral cuando están online simultáneamente
  - Descuento 10% en trades
  - Pueden prestarse naves (hasta T1)

Amigo Cercano (76-90):
  - +10% eficiencia trabajando juntos
  - Pueden prestarse naves (hasta T2)
  - Notificación cuando el amigo está en peligro
  - +8 moral cuando están online
  - Descuento 15% en trades
  - Pueden compartir skills temporalmente (1 hora, cooldown 24h)

Mejor Amigo (91-100):
  - +15% eficiencia trabajando juntos
  - Pueden prestarse cualquier nave
  - Respawn prioritario cerca del amigo si muere (opción)
  - +15 moral cuando están online
  - Descuento 20% en trades
  - Compartir skills mejorado (3 horas, cooldown 12h)
  - Acceso total a hangares compartidos
```

**ROMANCE:**

```
Atracción (50-60):
  - Beneficios = Amigo (51-75)
  - +5 moral adicional cuando están juntos

Coqueteo (61-70):
  - Beneficios = Amigo (51-75)
  - +8 moral adicional cuando están juntos
  - Pueden enviarse "Mensajes Románticos" (boost moral +3)

Novios (71-85):
  - +12% eficiencia trabajando juntos
  - +15 moral cuando están juntos online
  - Descuento 20% en trades entre ustedes
  - Pueden compartir hangares totalmente
  - Título visible "Novio/a de [Nombre]"
  - Acceso a "Cita Romántica" (actividad recreativa especial: -10 estrés ambos, +15 moral ambos, cuesta 2000₡)

Pareja (86-95):
  - +15% eficiencia trabajando juntos
  - +20 moral cuando están juntos online
  - Descuento 25% en trades
  - Compartir skills automático (sin cooldown) cuando están en misma ubicación
  - Notificación inmediata si pareja está en peligro (con opción warp to)
  - Pueden tener "Hangar Compartido de Pareja" (inventario común)

Unidos/Casados (96-100):
  - +20% eficiencia trabajando juntos
  - +25 moral permanente (incluso offline)
  - Descuento 30% en trades
  - Compartir skills permanente (siempre activo)
  - Warp to pareja sin restricción (cooldown 1 hora)
  - Hangar compartido permanente
  - Título especial visible "Unidos a [Nombre]" con icono ⚭
  - Beneficios fiscales: -10% impuestos corporativos si ambos en misma corp
  - Si uno muere, el otro recibe notificación inmediata + opción venganza (bounty automático)
  - **Penalización por ruptura:** Si se rompe unión: -50 moral, -30 relación con todos los contactos comunes, +50 estrés (ambos)
```

**Mecánica de Ruptura:**

- Si relación romántica (>70) baja a <50: Ruptura automática
- Opciones post-ruptura:
  - "Intentar Reconciliar" (cuesta 5 interacciones, -15 energía, 50% éxito si Carisma alto)
  - "Aceptar Ruptura" (cambia a amistad normal, valor 25)
  - "Cortar Totalmente" (relación → 0, bloqueado mutuo)

#### 13.2.7 Límites y Cooldowns

**Límites Diarios de Interacciones:**
- Base: 3 interacciones/día (sin Sociabilidad skill)
- Con Sociabilidad: +2 por nivel (hasta 15 con nivel 5)
- Se resetean cada 144 ticks (~24 horas con tick de 10 min)
- Interacciones pasivas (trabajar juntos, estar en misma estación) NO cuentan para límite

**Límites de Relaciones Activas:**
- Amistades: Sin límite total, pero deterioro hace inviable mantener >15-20
- Relaciones románticas activas (>70): Máximo 1 a la vez
- "Unidos": Máximo 1 en toda la vida del piloto (permanente hasta ruptura)

**Costos de Energía:**
- Charlar: -3 energía
- Conocerse Mejor: -5 energía
- Invitar Bebidas: -3 energía
- Compartir Secreto: -5 energía
- Coquetear: -4 energía
- Seducir: -6 energía
- Declararse: -8 energía
- Proponer Unión: -10 energía

Esto hace que socializar activamente sea un trade-off con otras actividades (minería, combate, fabricación).

#### 13.2.8 Sistema de Reputación Personal

Además de relaciones individuales, cada piloto tiene una reputación general.

**Atributos de Reputación:**

1. **Honorabilidad (0-100):**
    - Sube: Cumplir contratos, devolver préstamos, ayudar a otros
    - Baja: Romper contratos, traicionar, robar
    - **Efecto:** Afecta costo de seguros, intereses de préstamos, acceso a misiones
2. **Fiabilidad en Combate (0-100):**
    - Sube: Ganar combates, rescatar aliados, defender estaciones
    - Baja: Huir de combates, abandonar flota
    - **Efecto:** Afecta invitaciones a flotas PvP, acceso a misiones de combate
3. **Reputación Comercial (0-100):**
    - Sube: Completar contratos de transporte, comercio exitoso
    - Baja: Cancelar contratos, fraude
    - **Efecto:** Afecta comisiones de mercado, acceso a contratos premium

### 13.3 Actividades Recreativas

Para recuperar moral, energía y reducir estrés.

**En Habitáculos de estaciones:**

1. **Descansar (pasivo):**
    - +20 energía/tick
    - -10 estrés/tick
    - Gratis
2. **Dormir (programado):**
    - Requiere: Piloto debe estar offline mínimo 36 ticks (~6h con tick de 10 min)
    - Al volver: Energía al 100%, estrés reducido a la mitad
    - +5 moral
3. **Socializar en Sala Común:**
    - Requiere: Estar en la misma estación que otros pilotos
    - +5 moral
    - +2 relación con pilotos presentes
    - Costo: 500₡ (consumiciones)
    - Cooldown: 1 vez cada 144 ticks (~1 día)
4. **Entretenimiento:**
    - Ver holofilms: +3 moral, -5 estrés (500₡)
    - Jugar juegos VR: +5 moral, -3 estrés (1000₡)
    - Leer noticias galácticas: +2 moral, +información del universo (gratis)
5. **Ejercicio físico:**
    - Gimnasio: +5 energía máxima por 144 ticks (~24h) (1000₡)
    - Requiere: 6 ticks (~1 hora) de cooldown
6. **Meditación:**
    - -20 estrés
    - +10 moral
    - Gratis
    - Cooldown: 72 ticks (~12 horas)
7. **Cita Romántica (nueva):**
    - Requiere: Romance activo nivel >70, estar en misma estación
    - -10 estrés (ambos), +15 moral (ambos)
    - Costo: 2000₡
    - Cooldown: 144 ticks (~24 horas)

### 13.4 Visualización en la Interfaz

**Panel de Estado del Piloto (siempre visible):**

```
╔═══════════════════════════════════════════════════════════╗
║ JOHN DOE                                    ₡ 250,450     ║
╠═══════════════════════════════════════════════════════════╣
║ ⚡ Energía:    ████████░░  85/100                         ║
║ 🍖 Nutrición:  ██████░░░░  60/100  [!] Comer pronto      ║
║ 😊 Moral:      ████████░░  82/100                         ║
║ 💭 Estrés:     ██░░░░░░░░  15/100  Tranquilo             ║
╚═══════════════════════════════════════════════════════════╝
```

**Vista Detallada (`/pilot/status`):**

```
╔═══════════════════════════════════════════════════════════╗
║ ESTADO DEL PILOTO                                         ║
╠═══════════════════════════════════════════════════════════╣

ATRIBUTOS FÍSICOS Y MENTALES
┌───────────────────────────────────────────────────────────┐
│ ⚡ ENERGÍA:        85/100  ████████░░                     │
│    Estado: Descansado                                     │
│    Modificador: +5% eficiencia                            │
│    Próxima comida recomendada: En 4 horas                │
│                                                           │
│ 🍖 NUTRICIÓN:      60/100  ██████░░░░                     │
│    Estado: Nutrición normal                               │
│    Última comida: Hace 3 horas                            │
│    [Comer Ahora]                                          │
│                                                           │
│ 😊 MORAL:          82/100  ████████░░                     │
│    Estado: Excelente moral                                │
│    Modificador: +10% exp ganada                           │
│    Factores positivos:                                    │
│      + Corporación activa (+2/día)                        │
│      + 3 amigos online (+3 moral)                         │
│      + Victoria reciente (+10)                            │
│                                                           │
│ 💭 ESTRÉS:         15/100  ██░░░░░░░░                     │
│    Estado: Tranquilo                                      │
│    Tiempo en estación: 2 horas (-10 estrés)              │
│    [Meditar] [Terapia]                                    │
└───────────────────────────────────────────────────────────┘

REPUTACIÓN PERSONAL
┌───────────────────────────────────────────────────────────┐
│ 🏅 Honorabilidad:       ████████░░  78/100  (Honorable)  │
│ ⚔️  Fiabilidad Combate:  ██████░░░░  65/100  (Confiable) │
│ 💼 Reputación Comercial: ███████░░░  72/100  (Buen trader)│
└───────────────────────────────────────────────────────────┘

AMISTADES (Top 5)
┌────────────────────┬──────────────┬────────────┬─────────┐
│ Piloto             │ Relación     │ Estado     │ Acciones│
├────────────────────┼──────────────┼────────────┼─────────┤
│ Marcus Steel       │ ████████░░ 88│ ⚫ Online   │ [Chat]  │
│                    │ Amigo cercano│            │ [Flota] │
│ Jane Smith         │ ███████░░░ 76│ ⚫ Online   │ [Chat]  │
│                    │ Amigo cercano│            │ [Flota] │
│ Bob Johnson        │ █████░░░░░ 52│ ⚪ Offline  │ [Msg]   │
│                    │ Amigo        │            │         │
└────────────────────┴──────────────┴────────────┴─────────┘

ACTIVIDADES DISPONIBLES
  [Descansar] [Comer] [Socializar] [Entretenimiento]
  [Meditación] [Ejercicio] [Ver Amigos]

╚═══════════════════════════════════════════════════════════╝
```

### 13.5 Efectos en Gameplay

**Ejemplo de cálculo de acción con todos los modificadores:**

```
Acción: Minar Tritanio

Base ticks requeridos: 10
Skill bonus (Minería Lvl 3): ×0.85 = 8.5 ticks
Ship bonus (Excavador MK-I): ×0.85 = 7.2 ticks
Module bonus (Láser Avanzado): ×0.90 = 6.5 ticks

Modificadores de estado:
  Energía (85): +5% eficiencia = 6.2 ticks
  Moral (82): +10% exp ganada (no afecta ticks)
  Estrés (15): Sin penalización

Trabajando con amigo cercano:
  Bonus de relación: +10% eficiencia = 5.6 ticks

RESULTADO FINAL: 6 ticks
Energía consumida: 2 × 6 = 12 energía
Exp ganada: 100 base × 1.10 (moral) = 110 exp
```

---

## Navegación

- [← Anterior: PRD-Economy.md](./PRD-Economy.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-FutureConsiderations.md](./PRD-FutureConsiderations.md)
