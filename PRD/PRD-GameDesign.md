# Game Design & Mecánicas Core

**Parte del:** PRD - Vaxav
**Versión:** 2.0
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

## Changelog

### Versión 2.0 (2025-11-28) - Sistema Completo de Skills de Crafting
**Agregado:**
- ✅ Skill: Extracción Atmosférica (x3) - Reemplaza Recolección de Gas, enfoque en instalaciones planetarias
- ✅ Skill: Perforación Geológica (x3) - Extracción profunda en planetas (océanos subsuperficiales, manto, núcleo)
- ✅ Skill: Construcción de Componentes (x4) - Fabricación de componentes intermedios T1-T4
- ✅ Skill: Construcción de Naves (x5) - Fabricación de naves y módulos T1-T4
- ✅ Skill: Producción en Masa (x3) - Fabricación en lotes con bonos de eficiencia
- ✅ Skill: Refinamiento Avanzado (x3) - Mejora eficiencia de refinamiento de recursos
- ✅ Skill: Gestión de Clones Avanzada (x3) - Manejo de múltiples clones con cooldowns reducidos
- ✅ Progresión completa de niveles 1-5 para todas las skills nuevas
- ✅ Dependencias y multiplicadores de experiencia definidos

**Modificado:**
- 🔄 Extracción Atmosférica: Nueva mecánica pasiva con instalaciones (antes era Recolección de Gas activa)
- 🔄 Bioprospección: Actualizada descripción para reflejar extracción planetaria con drones
- 🔄 Skills de extracción ahora diferenciadas por Categoría A (Minería) y Categoría B (Atmosférica/Bio)

**Removido:**
- ❌ Extracción Criogénica (reemplazada por Extracción Atmosférica + Perforación Geológica)
- ❌ Recolección de Gas (reemplazada por Extracción Atmosférica)

### Versión 1.5 (2025-11-28) - Skills Sociales y de Negocios

[Volver al PRD Master](./PRD-Master.md)

---

## 2. Mecánicas Core del Juego

### 2.1 Sistema de Ticks/Pulsos

El juego opera en ciclos de tiempo llamados "ticks" o "pulsos" ejecutados por el servidor mediante Laravel Scheduler.

**Duración del Tick:**
- **Valor por defecto:** 10 minutos
- **Configurable:** El administrador puede cambiar la duración del tick desde el panel de administración
- **Almacenado en:** Base de datos (tabla `game_config`)
- **Ejecutado por:** `php artisan game:process-tick` cada X minutos según configuración

**Características:**
- Las acciones se programan y ejecutan en ticks específicos
- Acciones instantáneas: navegación entre módulos de estación, compras simples
- Acciones de tick: minería, combate, fabricación, viajes espaciales
- El tiempo de tick depende de habilidades, equipo y bonificaciones
- Los jugadores pueden ver contadores de ticks en curso
- **Todos los sistemas del juego funcionan en base a ticks** (atributos sociales, cooldowns, regeneración, etc.)

**Cálculo de Ticks para Acciones:**

```
ticks_requeridos = base_ticks / (skill_multiplier × ship_bonus × module_bonus)
```

**Ejemplos de tiempos con tick de 10 minutos:**
- Minar asteroide básico: 6 ticks = 60 minutos
- Viajar 3 saltos: 3 ticks = 30 minutos
- Fabricar componente T1: 12 ticks = 2 horas
- Construir módulo estación nivel 2: 144 ticks = 24 horas
- Combate promedio: 5-8 ticks = 50-80 minutos

**Nota:** Si el administrador cambia la duración del tick (por ejemplo a 5 o 15 minutos), todos los tiempos se ajustan proporcionalmente de forma automática.

### 2.2 Sistema de Habilidades (Skills)

**Estructura de Habilidades:**
- Cada habilidad tiene 5 niveles máximo
- Multiplicadores: x1, x2, x3, x4, x5
- Habilidades más poderosas tienen multiplicadores más altos
- Las habilidades pueden tener dependencias (árbol de habilidades)

**Progresión de Experiencia:**

```
exp_requerida_nivel = base_exp × multiplicador_habilidad × nivel
```

**Ejemplos de Habilidades:**
- **Minería** (x2): Extracción de recursos de asteroides
  - Nivel 1: Minería básica
  - Nivel 5: Minería avanzada, acceso a minerales raros

- **Pilotaje de Fragatas** (x1): Permite usar naves clase Fragata
  - Dependencia: Ninguna
- **Pilotaje de Cruceros** (x3): Permite usar naves clase Crucero
  - Dependencia: Pilotaje de Fragatas Nivel 3
- **Armas de Energía** (x2): Uso de armas láser y plasma
- **Blindaje** (x2): Mejora armadura de la nave
- **Escudos** (x3): Mejora capacidad de escudos
- **Ingeniería** (x4): Fabricación de componentes
- **Comercio** (x2): Mejores precios en mercados
- **Negociación** (x3): Reducción de tarifas y mejores contratos
- **Liderazgo** (x5): Bonos a corporación
- **Investigación** (x4): Blueprints mejorados

**Skills de Extracción Especializada:**

- **Extracción Atmosférica** (x3): Permite instalar y operar Extractores Atmosféricos en planetas para gases
  - Nivel 1: Acceso a gases T1 (Hidrógeno Molecular, Helio-3), +10% eficiencia de extracción, instalación en planetas Jovianos/Helados
  - Nivel 2: Acceso a gases T2 (Deuterio Atmosférico, Nitrógeno Comprimido), +20% eficiencia, reduce tiempo setup 15%
  - Nivel 3: Acceso a gases T3 (Plasma Atmosférico, Xenón Estratosférico), +30% eficiencia, reduce tiempo setup 30%
  - Nivel 4: Acceso a gases T4 (Partículas de Antimateria), +40% eficiencia, aumenta capacidad extractores 25%
  - Nivel 5: Acceso a gases T4 exóticos (Trazas de Materia Oscura), +50% eficiencia, aumenta capacidad extractores 50%, reduce mantenimiento 30%
  - Dependencia: Ninguna
  - Cómo se entrena: Instalar extractores atmosféricos, recolectar gases de planetas

- **Perforación Geológica** (x3): Permite perforación profunda en planetas para agua/recursos subsuperficiales
  - Nivel 1: Perforación básica en planetas Helados (hielo superficial), +10% eficiencia
  - Nivel 2: Perforación mejorada, acceso a océanos subsuperficiales, +20% eficiencia
  - Nivel 3: Perforación avanzada, acceso a depósitos profundos (500m-2km), +30% eficiencia, reduce tiempo setup 20%
  - Nivel 4: Perforación experta, acceso a recursos del manto (2km-10km), +40% eficiencia, reduce tiempo setup 40%
  - Nivel 5: Perforación extrema, acceso a núcleo planetario (10km+), +50% eficiencia, desbloquea recursos raros geológicos
  - Dependencia: Bioprospección Nivel 2
  - Cómo se entrena: Realizar perforaciones en planetas Helados/Oceánicos, extraer agua planetaria

- **Extracción Criogénica** (x3): Permite extraer recursos volátiles congelados de cinturones de hielo
  - Nivel 1: Acceso a hielo básico (Agua, Hidrógeno congelados), +10% eficiencia
  - Nivel 2: +20% eficiencia, reduce ticks de extracción 10%
  - Nivel 3: Acceso a hielo raro (Deuterio, Nitrógeno congelados), +30% eficiencia
  - Nivel 4: +40% eficiencia, reduce ticks de extracción 20%
  - Nivel 5: +50% eficiencia, acceso a hielo exótico (Plasma, Xenón congelados)
  - Dependencia: Minería Nivel 2
  - Cómo se entrena: Extraer recursos de cinturones de hielo con naves criogénicas

- **Recolección de Gas** (x3): Permite recolectar gases en estado libre de nebulosas
  - Nivel 1: Acceso a gases básicos (Hidrógeno, Nitrógeno), +10% eficiencia
  - Nivel 2: +20% eficiencia, reduce ticks de recolección 10%
  - Nivel 3: Acceso a gases raros (Deuterio, Plasma), +30% eficiencia
  - Nivel 4: +40% eficiencia, reduce ticks de recolección 20%
  - Nivel 5: +50% eficiencia, acceso a gases exóticos (Xenón, trazas de Antimateria)
  - Dependencia: Ninguna
  - Cómo se entrena: Recolectar gases en nebulosas con naves recolectoras

**Skills de Exploración:**

- **Escaneo Planetario** (x2): Permite escanear planetas para descubrir recursos
  - Nivel 1: Escaneo básico, nivel exploración 1-20
  - Nivel 2: Escaneo mejorado, nivel exploración 21-40
  - Nivel 3: Escaneo avanzado, nivel exploración 41-60
  - Nivel 4: Escaneo experto, nivel exploración 61-80
  - Nivel 5: Escaneo maestro, nivel exploración 81-100, detecta anomalías
  - Dependencia: Ninguna
  - Cómo se entrena: Escanear planetas

- **Exploración** (x3): Mejora descubrimiento de sitios temporales y anomalías
  - Nivel 1: +10% probabilidad descubrir sitios, acceso a sitios T1
  - Nivel 2: +20% probabilidad, acceso a sitios T2
  - Nivel 3: +30% probabilidad, acceso a sitios T3, reduce ticks de exploración 15%
  - Nivel 4: +40% probabilidad, reduce ticks de exploración 30%
  - Nivel 5: +50% probabilidad, desbloquea sitios legendarios
  - Dependencia: Ninguna
  - Cómo se entrena: Explorar sistemas, descubrir sitios temporales

- **Arqueología Espacial** (x4): Permite excavar sitios arqueológicos y descifrar artefactos
  - Nivel 1: Acceso a sitios arqueológicos T1, +10% éxito excavación
  - Nivel 2: Acceso a sitios T2, +20% éxito excavación
  - Nivel 3: Acceso a sitios T3, +30% éxito excavación, reduce ticks 15%
  - Nivel 4: +40% éxito excavación, reduce ticks 30%, desbloquea descifrado avanzado
  - Nivel 5: +50% éxito excavación, acceso a artefactos legendarios
  - Dependencia: Exploración Nivel 2
  - Cómo se entrena: Excavar sitios arqueológicos, descifrar artefactos

- **Bioprospección** (x2): Permite extraer recursos orgánicos de planetas
  - Nivel 1: Acceso a extracción orgánica básica (Biomasa, Agua)
  - Nivel 2: +15% eficiencia, acceso a Proteínas y Algas
  - Nivel 3: +30% eficiencia, acceso a Nanobots
  - Nivel 4: +45% eficiencia, acceso a Cristales Vivos
  - Nivel 5: +60% eficiencia, acceso a Esporas y Genoma Alienígena
  - Dependencia: Ninguna
  - Cómo se entrena: Extraer recursos orgánicos de planetas Vitales y Oceánicos

- **Hackeo** (x3): Permite acceder a terminales y sistemas cerrados en Derelictos y Laboratorios
  - Nivel 1: Hackeo básico de terminales, acceso a Derelictos T1
  - Nivel 2: Hackeo mejorado, reduce ticks de hackeo 15%, acceso a terminales de seguridad media
  - Nivel 3: Hackeo avanzado, acceso a Derelictos T2-T3, reduce ticks 30%
  - Nivel 4: Bypass de seguridad, puede desactivar drones guardianes, +20% chance éxito hackeo
  - Nivel 5: Maestro hacker, puede hackear IA corrupta de Laboratorios, bypass instantáneo de seguridad
  - Dependencia: Exploración Nivel 2
  - Cómo se entrena: Hackear terminales en Derelictos Generacionales, completar misiones de infiltración

- **Ciencias** (x4): Conocimiento científico para experimentos complejos en Laboratorios
  - Nivel 1: Ciencias básicas, puede leer documentos científicos, +5% éxito en experimentos
  - Nivel 2: Acceso a experimentos básicos en Laboratorios Perdidos T1, +15% éxito
  - Nivel 3: Experimentos avanzados, +25% éxito en minijuegos científicos, +15% margen de error
  - Nivel 4: Puede crear Prototipos T3, acceso a Laboratorios T3, +35% éxito en experimentos
  - Nivel 5: Científico experto, puede modificar prototipos experimentales, +50% éxito, desbloquea experimentos legendarios
  - Dependencia: Investigación Nivel 2
  - Cómo se entrena: Completar experimentos en Laboratorios Perdidos, investigar en estaciones

- **Análisis Xenotecnológico** (x3): Estudio de tecnología alienígena en Campos de Escombros
  - Nivel 1: Identifica fragmentos Xeno básicos, +10% probabilidad descifrar esquemas
  - Nivel 2: Análisis mejorado, +25% probabilidad descifrar, reduce ticks análisis 20%
  - Nivel 3: Análisis avanzado, +50% probabilidad descifrar, reduce ticks análisis 40%
  - Nivel 4: Puede combinar fragmentos para crear esquemas híbridos, +65% probabilidad
  - Nivel 5: Maestro xenotecnólogo, puede reverse engineer tecnología alien completa, +80% probabilidad
  - Dependencia: Arqueología Espacial Nivel 3
  - Cómo se entrena: Analizar fragmentos Xeno, completar Campos de Escombros Alienígenas

**Skills de Fabricación y Producción:**

- **Construcción de Componentes** (x4): Permite fabricar componentes intermedios en Sala de Ingeniería
  - Nivel 1: Fabricación de componentes T1 (Circuitos Básicos, Placas T1, Celdas T1), +5% eficiencia
  - Nivel 2: Fabricación de componentes T2 (Microconductores, Placas T2, Celdas T2), +10% eficiencia, reduce tiempo 10%
  - Nivel 3: Fabricación de componentes T3 (Procesadores T3, Placas T3, Reactores T2), +15% eficiencia, reduce tiempo 20%
  - Nivel 4: Fabricación de componentes T4 (Núcleos de IA, Aleaciones Neutrónicas), +20% eficiencia, reduce tiempo 30%
  - Nivel 5: Fabricación de componentes exóticos (Matrices Neuronales, Materia Exótica Sólida), +25% eficiencia, reduce tiempo 40%, reduce fallo crítico 50%
  - Dependencia: Ingeniería Nivel 1
  - Cómo se entrena: Fabricar componentes intermedios en estaciones con Sala de Ingeniería

- **Construcción de Naves** (x5): Permite fabricar naves y módulos avanzados en Consola de Construcción
  - Nivel 1: Fabricación de módulos T1 y fragatas T1, +5% eficiencia materiales
  - Nivel 2: Fabricación de módulos T2 y fragatas T2, +10% eficiencia materiales, reduce tiempo 10%
  - Nivel 3: Fabricación de cruceros T1-T2 y módulos T3, +15% eficiencia materiales, reduce tiempo 20%
  - Nivel 4: Fabricación de cruceros T3 y acorazados T1-T2, +20% eficiencia materiales, reduce tiempo 30%
  - Nivel 5: Fabricación de capitales y naves T4, +25% eficiencia materiales, reduce tiempo 40%, chance de calidad superior (stats +5%)
  - Dependencia: Construcción de Componentes Nivel 2
  - Cómo se entrena: Fabricar naves y módulos en Consola de Construcción

- **Producción en Masa** (x3): Permite fabricar múltiples items simultáneamente con bonos de eficiencia
  - Nivel 1: Fabricación en lotes de hasta 5 items, +3% eficiencia en lotes
  - Nivel 2: Fabricación en lotes de hasta 10 items, +6% eficiencia en lotes, reduce tiempo total 10%
  - Nivel 3: Fabricación en lotes de hasta 25 items, +10% eficiencia en lotes, reduce tiempo total 20%
  - Nivel 4: Fabricación en lotes de hasta 50 items, +15% eficiencia en lotes, reduce tiempo total 30%
  - Nivel 5: Fabricación en lotes de hasta 100 items, +20% eficiencia en lotes, reduce tiempo total 40%, auto-reabastecer materiales
  - Dependencia: Construcción de Componentes Nivel 3
  - Cómo se entrena: Fabricar items en lotes grandes

- **Refinamiento Avanzado** (x3): Mejora eficiencia de refinamiento de recursos crudos a procesados
  - Nivel 1: +5% eficiencia refinamiento (se suma al ratio base 0.75), reduce tiempo 5%
  - Nivel 2: +10% eficiencia refinamiento, reduce tiempo 10%
  - Nivel 3: +15% eficiencia refinamiento, reduce tiempo 15%, acceso a procesos avanzados
  - Nivel 4: +20% eficiencia refinamiento, reduce tiempo 20%, chance de output extra (+5%)
  - Nivel 5: +25% eficiencia refinamiento, reduce tiempo 25%, chance de output extra (+10%), sin desperdicio
  - Dependencia: Ninguna
  - Cómo se entrena: Refinar recursos crudos en Sala de Ingeniería

- **Gestión de Clones Avanzada** (x3): Permite gestionar múltiples clones con implantes
  - Nivel 1: Máximo 3 clones activos, cooldown clone jump 144 ticks (24h)
  - Nivel 2: Máximo 5 clones activos, cooldown clone jump 120 ticks (20h)
  - Nivel 3: Máximo 7 clones activos, cooldown clone jump 96 ticks (16h)
  - Nivel 4: Máximo 9 clones activos, cooldown clone jump 72 ticks (12h)
  - Nivel 5: Máximo 11 clones activos, cooldown clone jump 48 ticks (8h), puede clonar remotamente (sin visitar Laboratorio)
  - Dependencia: Ninguna
  - Cómo se entrena: Crear clones, realizar clone jumps, instalar implantes

**Skills de Combate Avanzado:**

- **Sigilo** (x3): Reduce la firma de la nave, dificulta detección por enemigos
  - Nivel 1: -10% firma de nave, +5% probabilidad evadir escaneos
  - Nivel 2: -20% firma, +10% evadir escaneos
  - Nivel 3: -30% firma, +15% evadir escaneos, reduce tiempo aparición en radar 20%
  - Nivel 4: -40% firma, +20% evadir escaneos, reduce tiempo aparición en radar 40%
  - Nivel 5: -50% firma, +25% evadir escaneos, desbloquea módulos de camuflaje avanzado
  - Dependencia: Ninguna
  - Cómo se entrena: Usar módulos de sigilo, evadir detección enemiga

**Skills de Negocios de Jugadores:**

- **Gestión Comercial** (x4): Permite operar comercios de jugadores en estaciones
  - Nivel 1: Permite alquilar espacio comercial, abrir Tienda o Gimnasio
  - Nivel 2: Reduce costos operativos 10%, aumenta capacidad clientes 20%
  - Nivel 3: Desbloquea Taberna y Restaurante, reduce costos operativos 20%
  - Nivel 4: Aumenta capacidad clientes 40%, reduce costos operativos 30%
  - Nivel 5: Desbloquea Taller de Reparación, reduce costos operativos 50%, bonos VIP
  - Dependencia: Comercio Nivel 2
  - Cómo se entrena: Operar comercios, atender clientes, gestionar inventario

- **Cocina** (x3): Permite preparar comidas de calidad en restaurantes
  - Nivel 1: Recetas básicas, +5% satisfacción clientes
  - Nivel 2: Recetas mejoradas, +15% satisfacción, +10% precio cobrable
  - Nivel 3: Recetas avanzadas, +25% satisfacción, +20% precio cobrable
  - Nivel 4: Recetas expertas, +35% satisfacción, buffs de comida duran 20% más
  - Nivel 5: Recetas maestras, +50% satisfacción, desbloquea comidas exóticas con buffs únicos
  - Dependencia: Ninguna
  - Cómo se entrena: Preparar comidas en restaurantes, servir clientes

- **Reparación de Naves** (x3): Permite reparar naves de otros jugadores en talleres
  - Nivel 1: Reparaciones básicas T1, +10% velocidad reparación
  - Nivel 2: Reparaciones T1-T2, +20% velocidad reparación
  - Nivel 3: Reparaciones T1-T3, +30% velocidad reparación, reduce coste materiales 15%
  - Nivel 4: +40% velocidad reparación, reduce coste materiales 30%
  - Nivel 5: +50% velocidad reparación, puede reparar módulos dañados sin reemplazar
  - Dependencia: Ingeniería Nivel 2
  - Cómo se entrena: Reparar naves de clientes en taller

**Skills Sociales:**

- **Sociabilidad** (x2): Aumenta límite de interacciones sociales diarias
  - Nivel 0: 3 interacciones/día (base sin skill inyectada)
  - Nivel 1: 5 interacciones/día
  - Nivel 2: 7 interacciones/día
  - Nivel 3: 10 interacciones/día
  - Nivel 4: 13 interacciones/día
  - Nivel 5: 15 interacciones/día
  - Cómo se entrena: Realizar interacciones sociales exitosas

- **Carisma** (x3): Aumenta ganancia de relación por interacción
  - Nivel 1: +10% ganancia de relación
  - Nivel 2: +20% ganancia de relación
  - Nivel 3: +30% ganancia de relación
  - Nivel 4: +40% ganancia de relación
  - Nivel 5: +50% ganancia de relación
  - Cómo se entrena: Realizar interacciones sociales exitosas

- **Seducción** (x4): Mejora interacciones románticas y desbloquea acciones especiales
  - Nivel 1: Desbloquea acción "Coquetear", +5% éxito romance
  - Nivel 2: +15% éxito romance, desbloquea "Seducir"
  - Nivel 3: +25% éxito romance, desbloquea "Declararse"
  - Nivel 4: +35% éxito romance, reduce cooldown interacciones románticas 20%
  - Nivel 5: +50% éxito romance, desbloquea "Proponer Matrimonio/Unión"
  - Cómo se entrena: Realizar interacciones románticas exitosas

- **Diplomacia** (x5): Mejora relaciones con corporaciones, facciones y gestión de conflictos
  - Nivel 1: +5% ganancia standing facciones, -5% pérdida relación por conflictos
  - Nivel 2: +10% ganancia standing, desbloquea "Mediar Conflicto" entre pilotos
  - Nivel 3: +15% ganancia standing, reduce penalización relación por traiciones 25%
  - Nivel 4: +20% ganancia standing, desbloquea "Negociar Tregua" entre corporaciones
  - Nivel 5: +25% ganancia standing, desbloquea "Formar Alianza" (diplomacia nivel 5 requerido)
  - Cómo se entrena: Realizar acciones diplomáticas, gestionar corporación, mediar conflictos

**Ganancia de Experiencia:**
- Al completar acciones exitosamente
- Habilidad principal: 100% experiencia
- Habilidades secundarias: 30-50% experiencia
- Misiones otorgan experiencia fija
- Combate otorga experiencia según dificultad

**Sistema de Inyección de Habilidades:**

Los pilotos NO comienzan con todas las habilidades disponibles. Deben adquirirlas e inyectarlas primero.

**Estado de Habilidades:**
- **No Descubierta:** El piloto no la ha visto aún
- **Descubierta (No Inyectada):** Visible en el árbol de habilidades pero no entrenada. Se puede ver en la interfaz con estado "No Inyectada"
- **Inyectada Nivel 0:** La habilidad está en el cerebro del piloto pero sin entrenar
- **Inyectada Nivel 1-5:** Habilidad entrenada activamente

**Adquisición de Inyectores:**
- Los **Inyectores de Habilidad** son items que se compran con Créditos
- Cada inyector corresponde a una habilidad específica (ej: "Inyector de Minería")
- Solo pueden inyectarse en **Laboratorios** de estaciones
- Cada laboratorio tiene un **catálogo limitado** de inyectores disponibles
- Ejemplo: Un laboratorio en una estación minera tendrá inyectores de Minería, Refinamiento, Prospección
- Un laboratorio militar tendrá inyectores de Armas, Blindaje, Tácticas
- Los jugadores deben **viajar entre estaciones** para encontrar inyectores específicos
- Los inyectores también se pueden encontrar en el **Mercado** (vendidos por otros jugadores o NPCs)

**Proceso de Inyección:**
1. Comprar el inyector (de laboratorio o mercado)
2. Ir a un Laboratorio de cualquier estación
3. Inyectar la habilidad (instantáneo, consume el inyector)
4. La habilidad queda en nivel 0, lista para entrenar

**Entrenamiento de Niveles (1-5):**
- Una vez inyectada, se puede entrenar hasta nivel 5
- Cada nivel requiere **experiencia** ganada al usar la habilidad
- Alternativamente, se pueden comprar **"Aceleradores de Entrenamiento"** (items que otorgan exp directa)
- Requisitos de nivel:
  - Para entrenar nivel 1: Tener la habilidad inyectada (nivel 0)
  - Para nivel 2-5: Tener el nivel anterior completado + habilidades dependientes

**Costo de Inyectores:**
Basado en el multiplicador de la habilidad:

```
costo_inyector = base_cost × multiplicador_habilidad
```

Ejemplos:
- Inyector de Pilotaje de Fragatas (x1): 10,000 Créditos
- Inyector de Minería (x2): 20,000 Créditos
- Inyector de Escudos (x3): 30,000 Créditos
- Inyector de Ingeniería (x4): 40,000 Créditos
- Inyector de Liderazgo (x5): 50,000 Créditos

**Interfaz de Habilidades:**
Los jugadores pueden ver en su "Árbol de Habilidades":
- ✓ Habilidades inyectadas y su nivel actual
- 🔒 Habilidades descubiertas pero no inyectadas (con opción de buscar en mercado)
- ❓ Habilidades no descubiertas (se revelan al explorar estaciones o cumplir requisitos)

**Descubrimiento de Habilidades:**
- Al visitar un Laboratorio por primera vez, se "descubren" las habilidades de su catálogo
- Al leer descripciones de naves/módulos, se descubren sus requisitos
- Al hablar con agentes NPC o completar misiones especiales

### 2.3 Sistema de Acciones

**Tipos de Acciones:**

**Acciones Instantáneas:**
- Moverse entre módulos de estación
- Ver información de objetos
- Acceder a mercados
- Gestión de inventario
- Comunicación con otros jugadores

**Acciones de Tick:**
- Minería
- Combate
- Fabricación
- Refinamiento
- Viajes espaciales
- Reparaciones

**Características:**
- Todas las acciones están determinadas por la ubicación del piloto
- Requieren habilidades específicas
- Tienen porcentaje de éxito basado en skills
- Pueden tener acciones secundarias simultáneas
- Se pueden cancelar (perdiendo progreso)

**Cálculo de Éxito:**

```
chance_exito = base_chance × (1 + skill_level × 0.15) × ship_bonus × module_bonus
```

---

## 3. Creación de Cuenta y Piloto

### 3.1 Registro de Cuenta

**Campos Requeridos:**
- Nombre de usuario (único)
- Email (único, verificado)
- Contraseña (mínimo 8 caracteres, hash seguro)

**Restricciones:**
- Un piloto por cuenta
- La cuenta es permanente
- No se pueden eliminar cuentas con actividad reciente

### 3.2 Creación de Piloto

**Paso 1: Generación de Nombre**
- El sistema genera nombre y apellido aleatorios
- No puede ser elegido por el jugador
- Combinación de nombres de base de datos predefinida
- Formato: "[Nombre] [Apellido]"
- La fecha de creación es el "cumpleaños" del piloto

**Paso 2: Selección de Carrera Inicial**
Sistema extensible que define el punto de partida del jugador.

**Carreras Disponibles (Inicial):**

1. **Minero**
   - Habilidades iniciales:
     - Minería: Nivel 2
     - Pilotaje de Fragatas: Nivel 1
     - Refinamiento: Nivel 1
   - Nave inicial: Fragata Minera "Excavador MK-I"
   - Módulos iniciales:
     - 1x Láser de Minería Básico
     - 1x Expansor de Carga
   - Créditos iniciales: 50,000

2. **Contrabandista**
   - Habilidades iniciales:
     - Pilotaje de Fragatas: Nivel 2
     - Evasión: Nivel 2
     - Comercio: Nivel 1
   - Nave inicial: Fragata Rápida "Sombra"
   - Módulos iniciales:
     - 1x Propulsor Mejorado
     - 1x Camuflaje Básico
   - Créditos iniciales: 75,000

3. **Cazador de Recompensas**
   - Habilidades iniciales:
     - Pilotaje de Fragatas: Nivel 2
     - Armas de Proyectiles: Nivel 2
     - Rastreo: Nivel 1
   - Nave inicial: Fragata de Combate "Depredador"
   - Módulos iniciales:
     - 2x Cañón Automático Ligero
     - 1x Scanner de Combate
   - Créditos iniciales: 40,000

4. **Transportista**
   - Habilidades iniciales:
     - Pilotaje de Cargueros: Nivel 2
     - Navegación: Nivel 2
     - Comercio: Nivel 1
   - Nave inicial: Carguero Ligero "Mercante"
   - Módulos iniciales:
     - 2x Expansor de Carga
     - 1x Escudo Básico
   - Créditos iniciales: 60,000

**Paso 2.5: Definición de Personalidad**

El piloto tiene 4 atributos de personalidad que afectan interacciones sociales y eventos del juego.

**Atributos de Personalidad (cada uno: 1-10):**

1. **Carisma/Sociabilidad (1-10)**
   - Afecta: Éxito de interacciones sociales, velocidad de ganancia de relación
   - Alto (8-10): +15% ganancia de relación, +10% éxito en interacciones
   - Medio (4-7): Sin modificadores
   - Bajo (1-3): -10% ganancia de relación, +5% costos de interacciones pagas

2. **Temperamento (1-10)**
   - Afecta: Reacción a eventos (pérdidas, victorias), ganancia/pérdida de moral y estrés
   - Alto (Flemático 8-10): -20% ganancia de moral, -30% pérdida de moral, -15% acumulación estrés
   - Medio (Equilibrado 4-7): Sin modificadores
   - Bajo (Colérico 1-3): +20% ganancia de moral, +30% pérdida de moral, +15% acumulación estrés

3. **Ambición/Codicia (1-10)**
   - Afecta: Comercio, economía vs relaciones sociales
   - Alto (8-10): +5% ganancias comercio, -10% ganancia de relación (percibido como codicioso)
   - Medio (4-7): Sin modificadores
   - Bajo (1-3): -5% ganancias comercio, +10% ganancia de relación (percibido como generoso)

4. **Valentía/Cautela (1-10)**
   - Afecta: Combate, exploración, estrés espacial
   - Alto (Valiente 8-10): +5% daño combate, +20% estrés en combate (más temerario)
   - Medio (Calculado 4-7): Sin modificadores
   - Bajo (Cauteloso 1-3): -5% daño combate, -20% estrés en combate (más prudente)

**Sistema de Asignación:**
- El jugador tiene **20 puntos totales** para distribuir entre los 4 atributos
- Mínimo 1 por atributo, máximo 10
- Sistema de sliders en la UI de creación
- Ejemplos de distribuciones:
  - Carismático: Carisma 10, Temperamento 5, Ambición 2, Valentía 3 = 20
  - Mercader Ambicioso: Carisma 3, Temperamento 7, Ambición 8, Valentía 2 = 20
  - Guerrero Temerario: Carisma 2, Temperamento 4, Ambición 2, Valentía 12 (ERROR: máx 10)

**Balance Anti-Minmaxing:**
- Los modificadores son sutiles (±5% a ±20% máximo)
- No hay combinación "óptima" universal
- Cada estilo de juego (social, comercial, combate) se beneficia de diferentes distribuciones
- Los atributos son **permanentes** (no se pueden cambiar después de creación)

**Paso 3: Selección de Facción de Origen**
Define relaciones iniciales y ubicación de inicio.

> Para más información sobre facciones, ver [PRD-Universe.md - Sistema de Facciones](./PRD-Universe.md#4-sistema-de-facciones)

---

## 25. Glosario

**BPO:** Blueprint Original - Plano de fabricación con usos infinitos
**BPC:** Blueprint Copy - Copia de plano con usos limitados
**DPS:** Damage Per Second - Daño por segundo
**KOS:** Kill On Sight - Matar a la vista
**NPC:** Non-Player Character - Personaje no jugador
**Tick:** Ciclo de tiempo del servidor donde se procesan acciones
**Wreck:** Restos de nave destruida
**m³:** Metro cúbico - Unidad de volumen en el juego
**T1/T2/T3:** Tech Level 1/2/3 - Nivel tecnológico de un item

---

## Navegación

- [← Anterior: PRD-Master.md](./PRD-Master.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-Universe.md](./PRD-Universe.md)
