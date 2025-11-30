# Universo, Navegación y Estaciones

**Parte del:** PRD - Vaxav
**Versión:** 2.0
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

## Changelog

### Versión 2.0 (2025-11-28) - MAJOR UPDATE: Refactorización de Recursos y Mapas
**BREAKING CHANGES:**
- ✨ Recursos planetarios ahora son EXCLUSIVOS (no comparten con asteroides)
- ✨ Eliminados cinturones de hielo y nebulosas de gas (gases SOLO de planetas)
- ✨ Nuevas mecánicas de extracción planetaria pasiva con instalaciones

**Agregado:**
- ✅ Mapa completo de recursos del Sistema Vaxav (5.2.1)
- ✅ Distribución de recursos en 8 planetas con categorización A/B
- ✅ 5 cinturones de asteroides con recursos metálicos únicos
- ✅ Sistema de extracción atmosférica con Extractores Orbitales
- ✅ Sistema de extracción biológica con Drones de Bioprospección
- ✅ Mecánica de Perforación Geológica para recursos subsuperficiales
- ✅ Recursos ausentes en Vaxav (10 recursos críticos para forzar comercio)
- ✅ Implicaciones económicas detalladas (autosuficiencia limitada, especialización)
- ✅ Actualización de 7 tipos de planetas con recursos de Categoría B

**Modificado:**
- 🔄 Sección 5.2.1: Mapa de Sistema Vaxav completamente rediseñado
- 🔄 Sección 5.5: Tipos de planetas ahora muestran solo recursos planetarios (Categoría B)
- 🔄 Sección 6.2.3: Laboratorio enfocado en investigación (sin teletransporte)
- 🔄 Planetas Rocosos/Volcánicos: Solo gases atmosféricos, sin metales
- 🔄 Planetas Jovianos: Gases T1-T3 con extracción atmosférica pasiva
- 🔄 Planetas Oceánicos/Vitales: Orgánicos T1-T4 con drones de bioprospección

**Removido:**
- ❌ Sección 6.2.9: Nodo de Teletransporte (usuario prefiere sistema de EVE sin teletransporte fácil)
- ❌ Referencias a extracción de metales desde planetas (metales SOLO de asteroides)

### Versión 1.5 (2025-11-28) - Expansión de Sistemas Estelares

[Volver al PRD Master](./PRD-Master.md)

---

## 4. Sistema de Facciones

### 4.1 Facciones NPC Principales (4)

**1. Confederación Vaxav**
- **Ideología:** Orden, comercio regulado, expansión controlada
- **Especialidad:** Industria y comercio
- **Relaciones iniciales:**
  - Liga Libre: -20 (Hostil)
  - Sindicato Técnico: +30 (Neutral amistoso)
  - Flota Nómada: 0 (Neutral)
- **Estaciones iniciales:** 8
- **Corporaciones:** 12
- **Bonos de facción:** +10% eficiencia de fabricación

**2. Liga Libre**
- **Ideología:** Libertad individual, libre mercado, capitalismo extremo
- **Especialidad:** Comercio y piratería
- **Relaciones iniciales:**
  - Confederación Vaxav: -20 (Hostil)
  - Sindicato Técnico: +10 (Neutral amistoso)
  - Flota Nómada: +20 (Amistoso)
- **Estaciones iniciales:** 6
- **Corporaciones:** 10
- **Bonos de facción:** +10% beneficios de comercio

**3. Sindicato Técnico**
- **Ideología:** Progreso tecnológico, meritocracia, investigación
- **Especialidad:** Investigación y naves avanzadas
- **Relaciones iniciales:**
  - Confederación Vaxav: +30 (Neutral amistoso)
  - Liga Libre: +10 (Neutral amistoso)
  - Flota Nómada: -10 (Neutral hostil)
- **Estaciones iniciales:** 5
- **Corporaciones:** 8
- **Bonos de facción:** +15% velocidad de investigación

**4. Flota Nómada**
- **Ideología:** Exploración, supervivencia, independencia
- **Especialidad:** Exploración y combate
- **Relaciones iniciales:**
  - Confederación Vaxav: 0 (Neutral)
  - Liga Libre: +20 (Amistoso)
  - Sindicato Técnico: -10 (Neutral hostil)
- **Estaciones iniciales:** 4
- **Corporaciones:** 6
- **Bonos de facción:** +10% velocidad de viaje

### 4.2 Facciones NPC Secundarias

- **Piratas del Cinturón:** Hostiles a todos, controlan zonas peligrosas
- **Mercaderes Independientes:** Neutrales, proveen comercio
- **Culto de la Singularidad:** Misteriosos, tecnología alienígena
- **Salvadores del Vacío:** Rescate y recuperación

### 4.3 Facciones de Jugadores

- Las corporaciones de jugadores pueden formar facciones
- Requiere mínimo 5 corporaciones
- Pueden declarar guerra a otras facciones
- Controlan territorio y estaciones
- Sistema de diplomacia entre facciones

### 4.4 Sistema de Relación

**Escala de Relación:** -100 a +100

- **100 a -60:** Guerra (KOS - Kill on Sight)
- **59 a -20:** Hostil
- **19 a +19:** Neutral
- **+20 a +49:** Amistoso
- **+50 a +79:** Aliado
- **+80 a +100:** Leal

**Formas de Ganar/Perder Relación:**
- Completar misiones: +5 a +50
- Matar NPCs hostiles: +2 a +10
- Matar NPCs amistosos: -20 a -50
- Comerciar: +1 por cada 100,000 créditos
- Donar recursos: Variable

---

## 5. Sistema de Navegación y Ubicación

### 5.1 Jerarquía de Ubicaciones

```
Sistema Solar
├── Estrella
├── Planetas
│   ├── Lunas
│   │   └── Estaciones Espaciales
│   │       └── Módulos
├── Campos de Asteroides
├── Anomalías Espaciales
└── Stargates
```

### 5.2 Sistemas Solares

**Sistema Inicial: Vaxav**
- Sistema fijo, no procedural
- 1 Estrella (Vaxav)
- 8 Planetas predefinidos
- Múltiples lunas
- 15+ estaciones iniciales
- Campos de asteroides
- 0-4 Stargates (desbloqueables)

**Nomenclatura:**

```
Sistema: Vaxav
Estrella: Vaxav
Planeta: Vaxav I, Vaxav II, ..., Vaxav VIII
Luna: Vaxav I - Luna 1, Vaxav I - Luna 2
Estación: Vaxav I - Luna 1 - [Nombre Estación]
Ejemplo: Vaxav I - Luna 1 - Puerto Estelar Génesis
```

#### 5.2.1 Mapa de Recursos del Sistema Vaxav (Primera Versión)

El Sistema Vaxav es el sistema inicial del juego, diseñado específicamente para ser **rico en metales y pobre en gases/orgánicos**. Esto fuerza el comercio temprano entre jugadores y hace que ciertos recursos sean muy valiosos.

**Filosofía de Diseño:**
- **Abundantes:** Recursos metálicos T1-T2 (Ferrita, Cobre, Titanita, Magnetita)
- **Escasos:** Recursos gaseosos T2+ (Deuterio, Plasma, Xenón)
- **Muy Escasos:** Recursos orgánicos T2+ (Proteínas, Algas, Nanobots)
- **Inexistentes:** 9 recursos críticos solo disponibles mediante comercio o exploración fuera del sistema

**Tabla de Distribución de Recursos PLANETARIOS (CATEGORÍA B):**

Los planetas solo proveen **recursos planetarios únicos** (gases atmosféricos y orgánicos) mediante extracción pasiva con instalaciones.

| Planeta | Tipo | IIC | Recursos Planetarios Disponibles (Tier) | Abundancia | Lunas | Estaciones NPC |
|---------|------|-----|----------------------------------------|------------|-------|----------------|
| **Vaxav I** | Rocoso Árido | IIC 1 | Ninguno (sin atmósfera, sin vida) | N/A | 2 | 3 |
| **Vaxav II** | Volcánico | IIC 1 | Plasma Atmosférico (T3, trazas en erupciones) | Muy Baja | 3 | 2 |
| **Vaxav III** | Rocoso | IIC 2 | Ninguno (atmósfera tenue, no viable) | N/A | 4 | 2 |
| **Vaxav IV** | Joviano | IIC 2 | Hidrógeno Molecular (T1), Helio-3 (T1), Nitrógeno Comprimido (T2) | Media | 6 | 1 |
| **Vaxav V** | Helado | IIC 2 | Agua Planetaria (T1), Hidrógeno Molecular (T1, trazas), Deuterio Atmosférico (T2, trazas) | Media | 2 | 1 |
| **Vaxav VI** | Oceánico | IIC 3 | Biomasa Cruda (T1), Agua Planetaria (T1), Proteínas Nativas (T2), Algas Fotosintéticas (T2) | Alta | 1 | 0 |
| **Vaxav VII** | Rocoso Denso | IIC 3 | Ninguno (cuerpo rocoso sin atmósfera) | N/A | 3 | 0 |
| **Vaxav VIII** | Fragmentado | IIC 4 | Ninguno (fragmentos rocosos sin atmósfera) | N/A | 0 | 0 |

**Cinturones de Asteroides del Sistema Vaxav - CATEGORÍA A (5 totales):**

Los asteroides solo proveen **recursos metálicos únicos** mediante minería activa con láseres de nave.

| Cinturón | Ubicación (UA) | IIC | Recursos Metálicos Disponibles | Regeneración | Asteroides |
|----------|---------------|-----|-------------------------------|--------------|------------|
| **Cinturón Principal Alfa** | Entre Vaxav II y III | IIC 1 | Ferrita (70%), Cobre Estelar (25%), Titanita (5%) | 48 ticks | 200 |
| **Cinturón Principal Beta** | Entre Vaxav III y IV | IIC 2 | Titanita (50%), Magnetita Pura (30%), Ferrita (20%) | 48 ticks | 150 |
| **Cinturón Exterior** | Entre Vaxav V y VI | IIC 2 | Titanita (45%), Magnetita Pura (40%), Cristales de Zafiro (15%) | 48 ticks | 120 |
| **Cinturón Disperso** | Entre Vaxav VI y VII | IIC 3 | Duralinio Espacial (60%), Cristales de Zafiro (30%), Adamantita (10%) | 48 ticks | 80 |
| **Anillo de Escombros** | Alrededor de Vaxav VIII | IIC 4 | Adamantita (50%), Neutronium (30%), Duralinio Espacial (20%) | 72 ticks | 40 |

**Cinturones de Hielo del Sistema Vaxav - CATEGORÍA B (2 totales):**

Los cinturones de hielo proveen **recursos volátiles congelados** mediante minería activa con naves especializadas.

| Cinturón de Hielo | Ubicación | IIC | Recursos Volátiles Disponibles | Regeneración | Bloques |
|-------------------|-----------|-----|-------------------------------|--------------|---------|
| **Anillo de Hielo Vaxav V** | Órbita de Vaxav V (Helado) | IIC 2 | Agua Planetaria Congelada (50%), Hidrógeno Molecular Congelado (30%), Deuterio Atmosférico Congelado (15%), Nitrógeno Comprimido Congelado (5%) | 72 ticks | 80 |
| **Campo de Hielo Exterior** | Más allá de Vaxav VII | IIC 3 | Deuterio Atmosférico Congelado (40%), Nitrógeno Comprimido Congelado (30%), Plasma Atmosférico Congelado (20%), Xenón Estratosférico Congelado (10%) | 96 ticks | 50 |

**Nebulosas de Gas del Sistema Vaxav - CATEGORÍA B (1 total):**

Las nebulosas proveen **gases en estado libre** mediante recolección con naves especializadas.

| Nebulosa | Ubicación | IIC | Recursos Gaseosos Disponibles | Regeneración | Tamaño |
|----------|-----------|-----|------------------------------|--------------|--------|
| **Nebulosa de Nitrógeno "Velo Azul"** | Entre Vaxav IV y V | IIC 2 | Nitrógeno Comprimido (60%), Deuterio Atmosférico (30%), Hidrógeno Molecular (10%) | 96 ticks | Mediana (40 km³) |

**NOTA IMPORTANTE sobre Fuentes de Recursos:**
- **Categoría A (Metales):** SOLO de asteroides (minería activa con láseres)
- **Categoría B (Gases/Orgánicos):** De múltiples fuentes:
  - Atmósferas planetarias (Extractores Orbitales - pasivo)
  - Cinturones de hielo (Minería criogénica - activo)
  - Nebulosas (Recolección de gas - activo)
  - Superficie planetaria (Drones de Bioprospección - pasivo)

**Recursos CRUDOS AUSENTES en Sistema Vaxav (requieren comercio o exploración externa):**

Estos 10 recursos CRUDOS NO existen en el Sistema Vaxav inicial, forzando el comercio:

**Gases Atmosféricos Ausentes (Categoría B):**
1. **Plasma Atmosférico (T3, crudo)** - Solo trazas en Vaxav II (erupciones volcánicas), crítico para reactores T3
2. **Xenón Estratosférico (T3, crudo)** - Inexistente, crítico para motores avanzados
3. **Partículas de Antimateria (T4, crudas)** - Inexistente, crítico para capitales
4. **Trazas de Materia Oscura (T4, crudas)** - Inexistente, crítico para T4

**Recursos Orgánicos Ausentes (Categoría B):**
5. **Algas Fotosintéticas (T2, crudas)** - Disponible solo en Vaxav VI (abundancia Alta)
6. **Colonias de Nanobots Simbióticos (T3, crudas)** - Inexistente
7. **Cristales Bioconductores (T3, crudos)** - Inexistente
8. **Esporas Xenorregenerativas (T4, crudas)** - Inexistente
9. **Secuencias de ADN Xenomorfo (T4, crudas)** - Inexistente

**Metales Raros Limitados (Categoría A):**
10. **Neutronium (T4, crudo)** - Solo en Anillo de Escombros de Vaxav VIII (30%), extremadamente peligroso (IIC 4)

**Implicaciones Económicas:**

1. **Autosuficiencia Limitada:**
   - **Categoría A (Metales):** Vaxav es RICO en metales T1-T3, casi autosuficiente para estructuras
   - **Categoría B (Gases):** Solo T1-T2 disponibles (Hidrógeno, Helio, Nitrógeno, Deuterio), T3-T4 requieren importación
   - **Categoría B (Orgánicos):** Solo T1-T2 disponibles (Biomasa, Agua, Proteínas, Algas), T3-T4 inexistentes
   - **Fabricación:** Naves/módulos T1-T2 viables localmente, T3+ requieren importar componentes orgánicos/gasesosos avanzados

2. **Especialización del Sistema Vaxav:**
   - **Exportaciones:** Metales refinados (Ferrita, Titanita, Magnetita, Duralinio) a sistemas pobres en metales
   - **Importaciones Críticas:** Plasma Atmosférico, Xenón Estratosférico, Nanobots Simbióticos, Cristales Bioconductores
   - **Ventaja Competitiva:** Fabricación de cascos/armaduras T1-T3 (abundancia de metales)
   - **Desventaja:** Dependencia total de otros sistemas para electrónica/energética T3+

3. **Rutas Comerciales Tempranas:**
   - Jugadores con acceso a sistemas ricos en gases/orgánicos T3+ pueden dominar el mercado de Vaxav
   - Vaxav se convierte en hub de fabricación de estructuras metálicas y naves T1-T2
   - Los orgánicos T3-T4 se convierten en commodities de lujo (inexistentes localmente)

4. **Progresión del Sistema:**
   - Al desbloquear Stargates (ver sección 5.3), los jugadores acceden a sistemas con recursos faltantes
   - El primer Stargate (1,000 puntos progreso) da acceso a sistema con Plasma/Xenón
   - Recursos T4 (Antimateria, Materia Oscura, Esporas Xenorregenerativas, ADN Xenomorfo) solo en sistemas IIC 4-5

5. **Importancia de Instalaciones Planetarias:**
   - Jugadores que instalen Extractores Atmosféricos en Vaxav IV (Joviano) y V (Helado) controlan suministro local de gases T1-T2
   - Extractores en Vaxav VI (Oceánico) controlan orgánicos T1-T2 (único planeta con vida)
   - Fragatas Mercante Rápido críticas para transportar grandes volúmenes de gases/orgánicos (baja densidad)

**Estaciones NPC Iniciales (Total: 9)**

| Estación | Planeta-Luna | IIC | Facción | Tipo | Servicios |
|----------|--------------|-----|---------|------|-----------|
| **Puerto Estelar Génesis** | Vaxav I - Luna 1 | 1 | Confederación Vaxav | Hub Central | Todos (Hangar 5, Mercado 4, Astillero 3, Laboratorio 4) |
| **Estación Minera Titán** | Vaxav II - Luna 2 | 1 | Confederación Vaxav | Minera | Hangar 3, Mercado 2, Sala Ingeniería 4 |
| **Puesto Comercial Libre** | Vaxav I - Luna 2 | 1 | Liga Libre | Comercio | Hangar 2, Mercado 5, Bodegas 4 |
| **Outpost Industrial Delta** | Vaxav II - Luna 1 | 1 | Sindicato Técnico | Industrial | Hangar 2, Sala Ingeniería 5, Astillero 2 |
| **Base Comercial Neptuno** | Vaxav III - Luna 3 | 2 | Liga Libre | Comercio | Mercado 3, Bodegas 3, Habitáculos 2 |
| **Refinería Orbital Helios** | Vaxav II - Luna 3 | 1 | Confederación Vaxav | Refinería | Sala Ingeniería 4, Bodegas 4 |
| **Plataforma de Gas Vaxav IV-A** | Vaxav IV - Luna 4 | 2 | Flota Nómada | Recolección | Hangar 1, Bodegas 3, Mercado 1 |
| **Colonia Acuática Poseidón** | Vaxav VI - Luna 1 | 3 | Sindicato Técnico | Bio-investigación | Laboratorio 3, Sala Ingeniería 2, Habitáculos 3 |
| **Estación Frontera VII** | Vaxav VII - Luna 2 | 3 | Flota Nómada | Frontera | Hangar 2, Mercado 1, Habitáculos 1 |

**Nota:** Las estaciones de jugadores pueden anclar en cualquier luna del sistema (total: 21 lunas disponibles).

### 5.3 Progreso de Sistema

Barra de progreso que desbloquea contenido nuevo.

**Fuentes de Progreso:**
- Fabricación de objetos: +1 por item
- Completar misiones: +10 a +100
- Comercio: +1 por cada 500,000 créditos
- Combates: +5 a +50
- Exploración: +20 por descubrimiento
- Construcción de estaciones: +500

**Umbrales de Desbloqueo:**
- **1,000 puntos:** Primer Stargate
- **5,000 puntos:** Nuevas corporaciones NPC
- **10,000 puntos:** Segunda facción NPC secundaria
- **25,000 puntos:** Segundo Stargate
- **50,000 puntos:** Tercer Stargate
- **100,000 puntos:** Cuarto Stargate

### 5.4 Generación Procedural de Sistemas

Los sistemas nuevos se generan al cruzar Stargates.

**Parámetros de Generación:**
- Número de planetas: 3-12
- Tipo de estrella: Enana Roja, Amarilla, Gigante
- Recursos predominantes
- Dificultad de NPCs
- Número de lunas por planeta
- Estaciones NPC iniciales: 1-5

**Librería de Generación:**
- Sistema modular y extensible
- Seeds guardados en DB para reproducibilidad
- Validación de recursos equilibrados
- Nombres generados proceduralmente

### 5.5 Tipos de Planetas

Los planetas del universo VAXAV tienen 7 tipos distintos, cada uno con recursos específicos.

#### 5.5.1 Planeta Rocoso

**Características:**
- **Superficie:** Rocas áridas, cráteres, valles secos
- **Atmósfera:** Ninguna o muy tenue
- **Gravedad:** Media (0.8-1.2G)
- **Temperatura:** Extrema (según distancia estrella)

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Ninguno (sin atmósfera viable)
- **Orgánicos:** Ninguno (sin vida, árido)
- **Agua Planetaria:** Escasa, solo si hay hielo en polos (requiere Drones de Bioprospección)

**NOTA:** Los planetas rocosos NO proveen metales. Los metales se extraen de **asteroides** (Categoría A).

**Método Extracción:**
- Drones de Bioprospección en superficie para hielo/agua (si existe)
- Skill requerida: Bioprospección Nivel 1

**Ejemplo:** Planetas similares a Mercurio, Marte, Luna

#### 5.5.2 Planeta Volcánico

**Características:**
- **Superficie:** Lagos de lava, montañas volcánicas, cenizas
- **Atmósfera:** Tóxica (SO₂, CO₂, nubes de azufre)
- **Gravedad:** Media-Alta (1.0-1.5G)
- **Temperatura:** Muy alta

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Plasma Atmosférico (T3, trazas en tormentas volcánicas), CO₂, SO₂
- **Orgánicos:** Ninguno (demasiado caliente para vida)

**NOTA:** Los planetas volcánicos NO proveen metales. Los metales se extraen de **asteroides** (Categoría A).

**Método Extracción:**
- Extractores Atmosféricos orbitales resistentes al calor para gases
- Skill requerida: Extracción Atmosférica Nivel 2+

**Ejemplo:** Io (luna de Júpiter), Venus

#### 5.5.3 Planeta Joviano (Gigante Gaseoso)

**Características:**
- **Superficie:** No tiene, atmósfera gaseosa profunda
- **Atmósfera:** Hidrógeno, Helio, trazas metano/amoníaco
- **Gravedad:** Muy alta (2.0-3.0G en capas altas)
- **Temperatura:** Fría en capas altas, muy caliente en profundidad

**Recursos Planetarios (CATEGORÍA B):**
- **Gases Primarios:** Hidrógeno Molecular (T1, abundante), Helio-3 (T1, abundante)
- **Gases Secundarios:** Deuterio Atmosférico (T2, común), Nitrógeno Comprimido (T2, poco común)
- **Gases Raros:** Plasma Atmosférico (T3, en tormentas eléctricas), Xenón Estratosférico (T3, capas profundas)
- **Orgánicos:** Ninguno

**Método Extracción:**
- Extractores Atmosféricos orbitales con sondas de profundidad
- Skill requerida: Extracción Atmosférica Nivel 1-3 (según profundidad)

**Ejemplo:** Júpiter, Saturno, Urano

#### 5.5.4 Planeta Helado

**Características:**
- **Superficie:** Hielo, nieve, océanos congelados subsuperficiales
- **Atmósfera:** Tenue (nitrógeno, metano) o inexistente
- **Gravedad:** Baja-Media (0.3-0.9G)
- **Temperatura:** Muy baja (-150°C a -220°C)

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Hidrógeno Molecular (T1, trazas en atmósfera), Nitrógeno Comprimido (T2, abundante en atmósfera), Deuterio Atmosférico (T2, poco común)
- **Orgánicos Primarios:** Agua Planetaria (T1, abundante en hielo superficial)
- **Orgánicos Secundarios:** Biomasa Cruda (T1, raro en océanos subsuperficiales), Proteínas Nativas (T2, muy raro si hay vida microbiana)

**Método Extracción:**
- **Gases:** Extractores Atmosféricos orbitales (atmósfera tenue)
- **Orgánicos:** Drones de Bioprospección con perforación criogénica (superficie/subsuelo)
- Skills requeridas: Extracción Atmosférica Nivel 1+, Bioprospección Nivel 1+, Perforación Geológica Nivel 1+

**Ejemplo:** Europa, Encélado, Plutón

#### 5.5.5 Planeta Oceánico

**Características:**
- **Superficie:** 90-100% océano líquido, islas pequeñas
- **Atmósfera:** Respirable o casi respirable (O₂, N₂)
- **Gravedad:** Media (0.9-1.1G)
- **Temperatura:** Templada (+5°C a +40°C)

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Nitrógeno Comprimido (T2, atmósfera), Hidrógeno Molecular (T1, trazas)
- **Orgánicos Primarios:** Agua Planetaria (T1, abundante en océanos), Biomasa Cruda (T1, abundante - plancton/algas), Algas Fotosintéticas (T2, abundante)
- **Orgánicos Secundarios:** Proteínas Nativas (T2, abundante - vida marina), Colonias de Nanobots Simbióticos (T3, poco común en ruinas sumergidas), Cristales Bioconductores (T3, raro en formaciones coralinas bioluminiscentes)

**Método Extracción:**
- **Gases:** Extractores Atmosféricos orbitales
- **Orgánicos:** Drones de Bioprospección submarina + cultivo de algas
- Skills requeridas: Extracción Atmosférica Nivel 1+, Bioprospección Nivel 1-3

**Ejemplo:** Planetas hipotéticos tipo "mundo océano" (GJ 1214 b si fuera habitable)

#### 5.5.6 Planeta Vital (Terrestre)

**Características:**
- **Superficie:** Continentes, océanos, ecosistemas diversos
- **Atmósfera:** Respirable (N₂, O₂)
- **Gravedad:** Media (0.8-1.2G)
- **Temperatura:** Templada (-10°C a +35°C)

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Nitrógeno Comprimido (T2, abundante en atmósfera), Hidrógeno Molecular (T1, trazas)
- **Orgánicos T1-T2:** Biomasa Cruda (T1, abundante), Agua Planetaria (T1, abundante), Proteínas Nativas (T2, abundante), Algas Fotosintéticas (T2, abundante)
- **Orgánicos T3:** Colonias de Nanobots Simbióticos (T3, poco común en ruinas de civilizaciones), Cristales Bioconductores (T3, poco común en bosques cristalinos)
- **Orgánicos T4:** Esporas Xenorregenerativas (T4, raro en hongos especiales), Secuencias de ADN Xenomorfo (T4, muy raro - restos de vida inteligente extinta)

**NOTA:** Este es el ÚNICO tipo de planeta donde aparecen recursos orgánicos T4 naturalmente.

**Método Extracción:**
- **Gases:** Extractores Atmosféricos orbitales
- **Orgánicos:** Drones de Bioprospección superficial, agricultura espacial, excavaciones arqueológicas
- Skills requeridas: Extracción Atmosférica Nivel 1+, Bioprospección Nivel 1-4, Perforación Geológica Nivel 2+

**Ejemplo:** Tierra, planetas tipo "segunda Tierra" (exoplanetas en zona habitable)

#### 5.5.7 Planeta Fragmentado (Restos Planetarios)

**Características:**
- **Superficie:** Fragmentos planetarios, núcleo expuesto
- **Atmósfera:** Inexistente (destruida)
- **Gravedad:** Baja (0.1-0.5G)
- **Temperatura:** Extrema

**Recursos Planetarios (CATEGORÍA B):**
- **Gases:** Partículas de Antimateria (T4, raro en remanentes del evento destructivo), Trazas de Materia Oscura (T4, muy raro - origen del cataclismo)
- **Orgánicos:** Ninguno (toda vida destruida)

**NOTA IMPORTANTE:** Aunque es técnicamente un "planeta", sus fragmentos se comportan como **asteroides** para minería de metales. Los fragmentos contienen metales del núcleo expuesto (Adamantita, Neutronium, Duralinio) y se minan con Categoría A.

**Método Extracción:**
- **Gases exóticos:** Extractores Atmosféricos especializados (capturan partículas residuales del evento)
- **Metales (fragmentos):** Minería estándar de asteroides (Categoría A)
- Skills requeridas: Extracción Atmosférica Nivel 4+ (gases T4), Minería Nivel 3+ (fragmentos metálicos)

**Ejemplo:** Cinturón de asteroides (hipótesis de Faetón), planetas destruidos por supernovas cercanas

**Distribución de Planetas en Sistemas:**
- Cada sistema tiene 3-12 planetas
- Distribución típica: 30% Rocosos, 20% Jovianos, 15% Helados, 15% Volcánicos, 10% Oceánicos, 8% Vitales, 2% Fragmentados
- Los planetas Vitales y Fragmentados son los más raros

### 5.6 Sistema de Seguridad IIC (Índice de Influencia Corporativa)

Cada sistema solar tiene un **Índice de Influencia Corporativa (IIC)** que representa el nivel de control territorial y presencia militar de las facciones NPC. Este sistema reemplaza el modelo decimal 0.0-1.0 con 5 categorías narrativas que determinan la presencia de policía, reglas de combate y recursos disponibles.

#### 5.6.1 Categorías IIC

**IIC 1: Núcleo Corporativo**
- **Descripción:** Corazón de las facciones principales, sistemas capitales y centros económicos
- **Control:** 100% facción propietaria, múltiples flotas patrullando
- **Policía NPC:** "Albatross" - Respuesta instantánea (1 tick)
- **Combate PvP:** Prohibido (atacar resulta en KOS instantáneo + intervención Albatross)
- **Consecuencias:** -100 standing con facción, pérdida de nave garantizada
- **Recursos:** Tier 1 únicamente (Ferrita, Cobre Estelar, Hidrógeno, Biomasa básica)
- **Características:**
  - 5-8 estaciones NPC por sistema
  - Mercados más activos y seguros
  - Zona de aprendizaje para nuevos pilotos
  - Stargates siempre funcionales
  - Infraestructura completa (reparación, fabricación, investigación)

**IIC 2: Territorio Estable**
- **Descripción:** Sistemas colonizados con presencia militar activa pero menor densidad
- **Control:** 70-90% facción propietaria, patrullas regulares
- **Policía NPC:** "Albatross" - Respuesta rápida (3-5 ticks)
- **Combate PvP:** Permitido con penalizaciones severas
  - Atacar: -50 standing con facción
  - Matar: -80 standing + marca criminal temporal (12 horas)
  - Albatross responde y destruye al atacante si continúa en zona
- **Recursos:** Tier 1-2 (Titanita, Magnetita, Deuterio, Proteínas)
- **Características:**
  - 2-4 estaciones NPC por sistema
  - Cinturones de asteroides básicos
  - Algunos cinturones de hielo
  - Infraestructura moderada
  - Comercio activo pero con algo de competencia

**IIC 3: Frontera Disputada**
- **Descripción:** Sistemas fronterizos donde múltiples facciones compiten por control
- **Control:** 40-60% facción dominante, presencia de múltiples facciones
- **Policía NPC:** "Albatross" - Respuesta lenta (10-15 ticks) solo en estaciones
- **Combate PvP:** Permitido con penalizaciones leves
  - Atacar: -10 standing con facción dominante
  - Matar: -20 standing
  - Albatross NO interviene en espacio abierto, solo defiende estaciones NPC
- **Recursos:** Tier 1-3 (Duralinio, Cristales de Zafiro, Plasma, Xenón, Nanobots)
- **Características:**
  - 1-2 estaciones NPC, posibles estaciones de jugadores
  - Cinturones de asteroides ricos
  - Cinturones de hielo con recursos raros
  - Nebulosas de gas (Tier 2-3)
  - Mayor riesgo, mayores recompensas
  - Zona de conflicto entre facciones

**IIC 4: Tierra de Nadie**
- **Descripción:** Sistemas sin control corporativo claro, dominados por piratas y jugadores
- **Control:** <30% control NPC, principalmente piratas y corporaciones de jugadores
- **Policía NPC:** Inexistente (solo piratas hostiles)
- **Combate PvP:** Sin restricciones ni penalizaciones de standing
- **Recursos:** Tier 2-4 (Adamantita, Neutronium, Antimateria, recursos exóticos)
- **Características:**
  - 0-1 estaciones NPC (generalmente piratas)
  - Estaciones de jugadores frecuentes
  - Cinturones de asteroides exóticos
  - Cinturones de hielo con recursos Tier 3-4
  - Nebulosas de gas Tier 3-4
  - Sitios de exploración frecuentes (T3-T4)
  - Mercados Negros flotantes aparecen aquí
  - Control territorial por corporaciones de jugadores

**IIC 5: Espacio Profundo**
- **Descripción:** Sistemas inexplorados o completamente abandonados, sin presencia civilizada
- **Control:** 0% control, naturaleza salvaje del espacio
- **Policía NPC:** Inexistente (posibles NPCs hostiles exóticos)
- **Combate PvP:** Sin restricciones, ley del más fuerte
- **Recursos:** Tier 3-4 exclusivamente (Adamantita, Neutronium, Antimateria, Materia Oscura, Genoma Alienígena)
- **Características:**
  - 0 estaciones NPC
  - Solo estaciones de jugadores (si se construyen)
  - Recursos más raros y valiosos del juego
  - Planetas Fragmentados y Vitales más frecuentes
  - Sitios de exploración legendarios (T4)
  - Agujeros de gusano más comunes
  - Fenómenos espaciales únicos (pulsares, agujeros negros)
  - Posible aparición de NPCs alienígenas desconocidos
  - Máximo riesgo, máxima recompensa

#### 5.6.2 Fuerza Policial "Albatross"

**Descripción:**
- Fuerza de seguridad NPC multifacción
- Opera en sistemas IIC 1, 2 y 3
- Naves: Fragatas (IIC 3), Cruceros (IIC 2), Acorazados (IIC 1)

**Mecánica de Respuesta:**
1. **Detección:** Al iniciarse combate no consentido
2. **Alerta:** Mensaje de advertencia al agresor (5 segundos para detenerse)
3. **Intervención:** Albatross warp in y ataca al criminal
4. **Duración:** Hasta destruir al criminal o que escape del sistema

**Poder Relativo:**
- IIC 1: Albatross destruye fragata T1 en 2-3 ticks
- IIC 2: Albatross destruye fragata T1 en 5-7 ticks
- IIC 3: Albatross destruye fragata T1 en 10-12 ticks

**Evasión:**
- El agresor puede escapar saltando a otro sistema antes de ser destruido
- Marca criminal persiste entre sesiones
- Entrar a estación en sistema IIC alto con marca criminal = Albatross ataca al desatracar

#### 5.6.3 Protocolo de Inspección de Carga Albatross

**Descripción:**
La fuerza Albatross realiza inspecciones aleatorias de carga en busca de ítems ilegales. Los pilotos pueden usar módulos de contrabando para evadir detección.

**Ubicaciones de Inspección:**
- **Al atracar en estaciones NPC** en sistemas IIC 1-2: Inspección automática obligatoria
- **Checkpoints espaciales** en sistemas IIC 2-3: Patrullas Albatross interceptan naves aleatoriamente (15% chance al viajar)
- **Stargates** en IIC 1-2: 25% chance de inspección al cruzar

**Chance Base de Detección:**
- **IIC 1 (Núcleo Corporativo):** 70% chance base de detectar contrabando
- **IIC 2 (Territorio Estable):** 50% chance base
- **IIC 3 (Frontera Disputada):** 25% chance base
- **IIC 4-5:** No hay inspecciones

**Fórmula de Detección Final:**

```
chance_final = max(0%, chance_base_IIC + modificadores)

Modificadores:
- Compartimento Blindado T1: -15%
- Compartimento Blindado T2: -35%
- Compartimento Blindado T3: -60%
- Bloqueador de Escaneo T1 activo: -20%
- Bloqueador de Escaneo T2 activo: -45%
- Bloqueador de Escaneo T3 activo: -70%
- Revestimiento Anti-Detección: -25%
- Transponder Falso activo: +15% (sospechoso)
- Nave con modificaciones ilegales: +30% (escáneres detectan anomalías)
```

**Ejemplo:**
- Nave en IIC 1 (70% base) con Compartimento Blindado T3 (-60%) + Bloqueador T2 activo (-45%) + Revestimiento (-25%) = 70 - 60 - 45 - 25 = **-60% → 0% chance de detección**

**Consecuencias de Detección:**

**Contrabando Menor** (drogas, transponders falsos, chips robados):
- Confiscación de ítems ilegales
- Multa: 50,000₡ - 200,000₡
- -25 standing con facción del sistema
- Marca de "Contrabandista" temporal (24 horas, futuras inspecciones +15% detección)

**Contrabando Mayor** (armas prohibidas, esclavos, genoma alienígena):
- Confiscación total del cargo
- Multa: 500,000₡ - 2,000,000₡
- -80 standing con todas las facciones lawful
- Marca de "Criminal" permanente hasta pagar multa
- Albatross ataca si vuelves a entrar en IIC 1-2 con marca activa

**Modificaciones Ilegales de Nave:**
- Destrucción inmediata de la nave por Albatross
- -100 standing con todas las facciones lawful
- Pod del piloto se teletransporta a estación más cercana
- Multa de 1,000,000₡ para limpiar récord

**Evasión:**
- Jugador puede huir antes de que termine la inspección (10 ticks de escaneo)
- Huir = flagged como criminal, Albatross persigue
- Si escapas del sistema, se emite "Orden de Búsqueda" (bounty de 500K₡ para otros jugadores)

### 5.7 Cinturones de Asteroides

Los cinturones de asteroides existen en todos los sistemas y contienen recursos metálicos.

**Características:**
- **Ubicación:** Orbitan la estrella, entre planetas
- **Cantidad por sistema:** 1-5 cinturones
- **Asteroides por cinturón:** 50-200 (regeneran cada 48 horas)
- **Tipos de asteroides:** Según nivel de seguridad del sistema

**Distribución de Recursos por IIC:**
- **IIC 1:** Solo Ferrita, Cobre Estelar, Silicatos (Tier 1)
- **IIC 2:** Tier 1-2 (Titanita, Magnetita Pura)
- **IIC 3:** Tier 1-3 (Duralinio Espacial, Cristales de Zafiro)
- **IIC 4-5:** Tier 1-4 (Adamantita, Neutronium)

**Mecánica de Minería:**
1. Viajar al cinturón (acción de ticks)
2. Seleccionar asteroide
3. Iniciar minería (consume ticks según skill y equipo)
4. Recursos van al cargo de la nave
5. Asteroide se agota tras X extracciones

**Regeneración:**
- Los asteroides agotados desaparecen
- Cada 48 horas (288 ticks), nuevos asteroides aparecen
- La composición es aleatoria dentro del tier del sistema

### 5.8 Cinturones de Hielo

Los cinturones de hielo son zonas especiales con recursos volátiles congelados.

**Características:**
- **Ubicación:** Zonas exteriores del sistema, más allá de los planetas
- **Cantidad por sistema:** 0-2 cinturones (solo en sistemas con planetas Helados o Jovianos)
- **Bloques de hielo:** 20-100 por cinturón
- **Regeneración:** 72 horas (432 ticks)

**Tipos de Hielo:**
- **Hielo de Agua** (Tier 1): Agua, Hidrógeno básico
- **Hielo de Deuterio** (Tier 2): Deuterio, Nitrógeno
- **Hielo de Plasma** (Tier 3): Plasma congelado, Xenón
- **Hielo Exótico** (Tier 4): Antimateria, Materia Oscura (solo IIC 4-5)

**Distribución por IIC:**
- **IIC 1:** No existen cinturones de hielo
- **IIC 2:** Hielo Tier 1-2
- **IIC 3:** Hielo Tier 2-3
- **IIC 4-5:** Hielo Tier 3-4

**Mecánica de Extracción:**
1. Requiere módulo "Extractor Criogénico" en la nave
2. Requiere skill "Extracción Criogénica" (nivel según tier)
3. Proceso similar a minería pero con ticks diferentes
4. Los bloques de hielo son más grandes (más recursos por bloque)

**Riesgo vs Recompensa:**
- Los cinturones de hielo en sec baja son objetivos de piratería
- Mayor riesgo = mejores recursos (Antimateria vale 100x más que Agua)

### 5.9 Nebulosas de Gas

Las nebulosas son nubes de gas cósmico donde se recolectan recursos gaseosos.

**Características:**
- **Ubicación:** Zonas aleatorias del sistema, pueden moverse lentamente
- **Cantidad por sistema:** 0-3 nebulosas
- **Tamaño:** Variable (pequeña 10km³, grande 100km³)
- **Visibilidad:** Reducida dentro de la nebulosa (-30% alcance sensores)
- **Regeneración:** 96 horas (576 ticks)

**Tipos de Nebulosas:**
- **Nebulosa de Hidrógeno** (Tier 1): Hidrógeno, Helio
- **Nebulosa de Nitrógeno** (Tier 2): Nitrógeno, Deuterio
- **Nebulosa de Plasma** (Tier 3): Plasma, Xenón
- **Nebulosa Oscura** (Tier 4): Antimateria, Materia Oscura

**Distribución por IIC:**
- **IIC 1:** No existen nebulosas
- **IIC 2:** Nebulosas Tier 1-2 (raras)
- **IIC 3:** Nebulosas Tier 2-3
- **IIC 4-5:** Nebulosas Tier 3-4

**Mecánica de Recolección:**
1. Requiere módulo "Recolector de Gas" en la nave
2. Requiere skill "Recolección de Gas" (nivel según tier)
3. La nave debe permanecer estacionaria durante la recolección
4. Rendimiento: X unidades de gas por tick (según skill y módulo)

**Peligros:**
- **Tormentas de Plasma:** Eventos aleatorios que dañan naves (cada 50 ticks, 10% probabilidad)
- **Visibilidad reducida:** Dificulta detectar enemigos
- **Piratas:** Las nebulosas son zonas de emboscada perfectas

**Ventaja Táctica:**
- Las naves con alto Sigilo pueden ocultarse en nebulosas
- Los piratas usan nebulosas para tender trampas

---

## 6. Estaciones Espaciales

### 6.1 Características Generales

- **Ubicación:** Siempre orbitan lunas
- **Propiedad:** NPC o Corporaciones de jugadores
- **Acceso:** Público, Corporación, Alianza, Privado
- **Capacidad:** Limitada por nivel de hangar

**Atributos de Estación:**

```json
{  "nombre": "Puerto Estelar Génesis",  "descripcion": "La primera y más grande estación del sistema Vaxav...",  "corporacion_id": 1,  "faccion_id": 1,  "sistema_id": 1,  "planeta_id": 1,  "luna_id": 1,  "nivel_acceso": "publico",  "estado": "operacional",  "hangar_capacidad_actual": 45,  "hangar_capacidad_maxima": 100,  "modulos": [],  "tamaño": "grande",  "cpu_total": 2500,  "re_total": 1800}
```

### 6.1.1 Tamaños de Bases Estelares

Las bases estelares de jugadores vienen en 3 tamaños predefinidos con diferentes capacidades y requisitos de transporte.

**Base Pequeña:**
- **CPU Total:** 800 Teraflops (TF)
- **Reactor de Energía Total:** 500 Megawatts (MW)
- **Volumen:** 50,000 m³
- **Transporte:** Requiere Carguero T1 (capacidad 60,000+ m³)
- **Costo Base:** 15,000,000₡
- **Anclaje:** Solo en lunas
- **Módulo Integrado:** Puente de Mando Nivel 1 (incluido, no consume CPU/RE)
- **Uso Típico:** Puesto minero, estación personal, base de exploración

**Base Mediana:**
- **CPU Total:** 1,500 Teraflops (TF)
- **Reactor de Energía Total:** 1,000 Megawatts (MW)
- **Volumen:** 150,000 m³
- **Transporte:** Requiere Carguero T2 o Freighter T1 (capacidad 200,000+ m³)
- **Costo Base:** 45,000,000₡
- **Anclaje:** Solo en lunas
- **Módulo Integrado:** Puente de Mando Nivel 1 (incluido, no consume CPU/RE)
- **Uso Típico:** Base corporativa, centro de fabricación, hub comercial

**Base Grande:**
- **CPU Total:** 2,500 Teraflops (TF)
- **Reactor de Energía Total:** 1,800 Megawatts (MW)
- **Volumen:** 350,000 m³
- **Transporte:** Requiere Freighter T2 o Capital (capacidad 400,000+ m³)
- **Costo Base:** 120,000,000₡
- **Anclaje:** Solo en lunas
- **Módulo Integrado:** Puente de Mando Nivel 1 (incluido, no consume CPU/RE)
- **Uso Típico:** Fortaleza territorial, centro de investigación avanzado, capital corporativo

**Mecánica de Consumo de Energía:**
- Cada módulo de estación consume CPU y RE según su nivel
- El Puente de Mando integrado NO consume recursos (ya incluido en la base)
- Si instalas más módulos de los que permite el CPU/RE, la estación entra en estado "Sobrecarga"
- Sobrecarga: -50% eficiencia en todos los módulos hasta resolver
- Solución a sobrecarga: Desactivar módulos o mejorar Puente de Mando para aumentar capacidad

**Bonificación del Puente de Mando:**
- Cada nivel del Puente de Mando otorga +5% CPU y +5% RE total de la base
- Ejemplo: Base Mediana (1500 TF, 1000 MW) con Puente Nivel 5 = 1500×1.25 = 1,875 TF, 1000×1.25 = 1,250 MW

### 6.2 Módulos de Estación

**Estructura de Módulo:**
- **Nivel:** 1-5
- **Estado:** Construcción, Operacional, Dañado, Deshabilitado
- **Energía requerida:** Sí/No
- **Costo de construcción:** Recursos + Créditos
- **Tiempo de construcción:** Ticks

### 6.2.1 Puente de Mando

**Obligatorio** - Módulo inicial de toda estación.

**Nivel 1:**
- Gestión básica de la estación
- Ver información de módulos
- Asignar permisos básicos

**Nivel 2:**
- Gestión de roles
- Ver tráfico de naves
- Logs de actividad

**Nivel 3:**
- Establecer impuestos de atracaje
- Gestión de defensa (torretas)
- Contratos de estación

**Nivel 4:**
- Sistema de alertas automático
- Gestión avanzada de energía
- Bloqueo de pilotos

**Nivel 5:**
- Transferencia de propiedad
- Sistema de seguridad IA
- Clonación de configuración a otras estaciones

### 6.2.2 Hangar

Almacenamiento y mantenimiento de naves.

**Nivel 1:**
- Capacidad: 20 naves
- Acciones: Atracar, Despegar, Ver nave

**Nivel 2:**
- Capacidad: 50 naves
- Acciones: +Reparación básica (casco)
- Costo reparación: -10%

**Nivel 3:**
- Capacidad: 100 naves
- Acciones: +Reparación completa (escudos, armadura)
- Reconfiguración de módulos

**Nivel 4:**
- Capacidad: 200 naves
- Acciones: +Reparación automática
- Mantenimiento preventivo

**Nivel 5:**
- Capacidad: 500 naves
- Acciones: +Mejoras de nave
- Velocidad de reparación +50%

### 6.2.3 Laboratorio

Centro de investigación, inyección de habilidades y clonación.

**Funcionalidades Principales:**
- **Catálogo de Inyectores:** Cada laboratorio tiene un inventario limitado de inyectores según su especialización
- **Inyección de Habilidades:** Proceso instantáneo que desbloquea una habilidad en nivel 0
- **Gestión de Clones:** Creación de clones múltiples, salto entre clones, respawn al morir
- **Implantes:** Instalación y extracción de implantes cibernéticos (máximo 5 activos)
- **Investigación:** Mejora de Blueprints (niveles superiores)

**Nivel 1:**
- **Catálogo:** 5-8 inyectores básicos (x1, x2)
- Ejemplo estación minera: Minería, Refinamiento, Prospección, Pilotaje Fragatas
- Ejemplo estación militar: Armas Proyectiles, Armas Energía, Blindaje, Pilotaje Fragatas
- **Precio inyectores:** 100% del costo base
- **Clones:** Puede crear 1 clon activo (respawn al morir)
- **Descubrimiento:** Visitar el laboratorio descubre todas las habilidades de su catálogo

**Nivel 2:**
- **Catálogo:** 10-15 inyectores (x1, x2, x3)
- **Precio inyectores:** 95% del costo base
- **Clones:** Puede crear hasta 3 clones activos
- **Salto de Clones:** Permite saltar entre clones (cooldown 144 ticks / 24 horas)
- Ver árbol completo de habilidades con progreso
- Aceleradores de entrenamiento disponibles (+exp a skills)

**Nivel 3:**
- **Catálogo:** 15-25 inyectores (x1, x2, x3, x4)
- **Precio inyectores:** 90% del costo base
- **Clones:** Puede crear hasta 5 clones activos
- Descifrado de Núcleos de Datos (12 ticks) para desbloquear recetas aleatorias
- Atributos de la habilidad visible (bonificadores exactos)

**Nivel 4:**
- **Catálogo:** 25-40 inyectores (x1, x2, x3, x4, x5)
- **Precio inyectores:** 85% del costo base
- **Clones:** Puede crear hasta 10 clones activos
- Análisis de Prototipos Experimentales (24 ticks) para desbloquear recetas T3 únicas
- Extracción de experiencia (+10% exp en todas las acciones mientras atracado)
- "Skill Planner" - Herramienta que muestra camino óptimo para alcanzar habilidad objetivo

**Nivel 5:**
- **Catálogo:** 40+ inyectores (todas las categorías, incluyendo raras)
- **Precio inyectores:** 80% del costo base
- **Clones:** Clones ilimitados
- **Salto de Clones:** Cooldown reducido a 72 ticks (12 horas)
- Investigación avanzada de Esquemas Xenotecnología (48 ticks) para recetas exóticas
- Transferencia de skills limitada (redistribuir exp entre skills similares, con pérdida)
- "Neural Backup" - Backup automático de skills cada 144 ticks (24 horas)

**Sistema de Clones Estilo EVE:**
- Los clones se crean en cualquier Laboratorio Nivel 1+ (costo 50,000₡ + 12 ticks)
- Puedes "saltar" de un clon a otro usando la acción "Clone Jump" en el Laboratorio
- Al saltar, tu consciencia se transfiere al clon destino instantáneamente
- El clon anterior queda en su estación CON todos sus implantes equipados
- Los implantes NO se transfieren al saltar - cada clon mantiene sus propios implantes
- **Cooldown:** 144 ticks (24 horas) entre saltos de clones, reducido a 72 ticks (12 horas) con Laboratorio Nivel 5
- **Skill requerida:** "Gestión de Clones Avanzada" - cada nivel aumenta +2 clones máximos
- **Al morir:** Respawneas instantáneamente en el clon activo más reciente, pierdes el clon destruido y sus implantes (a menos que tengas seguro)
- **Estrategia:** Jugadores pueden tener clones especializados (ej: clon minero con implantes de minería, clon PvP con implantes de combate)

**Especialización de Laboratorios por Tipo de Estación:**

**Estaciones Mineras/Industriales:**
- Inyectores: Minería, Refinamiento, Prospección, Geología, Ingeniería, Producción en Masa

**Estaciones Militares:**
- Inyectores: Armas (todas), Blindaje, Escudos, Tácticas, Sistemas de Defensa, Liderazgo

**Estaciones de Comercio:**
- Inyectores: Comercio, Negociación, Contabilidad, Pilotaje Cargueros, Logística

**Estaciones de Investigación (Sindicato Técnico):**
- Inyectores: Investigación, Ciencias, Ingeniería Avanzada, Cibernética, Astrofísica

**Estaciones de Exploración:**
- Inyectores: Navegación, Escaneo, Análisis Espacial, Cartografía, Supervivencia

**Importante:**
- No todos los inyectores están disponibles en todas las estaciones
- Los jugadores deben explorar y encontrar laboratorios especializados
- Los inyectores también se pueden comprar/vender en el **Mercado** entre jugadores (ver [PRD-Economy.md](./PRD-Economy.md))
- Algunos inyectores muy raros solo se obtienen como recompensa de misiones especiales

#### 6.2.3.1 Sistema de Implantes

Los implantes son mejoras cibernéticas permanentes que otorgan bonificaciones pasivas al piloto.

**Reglas Generales:**
- **Máximo 5 implantes activos simultáneamente**
- Instalación: Requiere Laboratorio Nivel 2+ (costo 10,000₡ + 6 ticks de proceso)
- Extracción: Requiere Laboratorio Nivel 1+ (costo 5,000₡ + 3 ticks, implante se destruye)
- Intercambio: Puedes extraer un implante para instalar otro (no acumulan más allá de 5)
- Los implantes permanecen con el clon cuando saltas a otro clon
- Los implantes se destruyen si el clon muere (a menos que tenga seguro de implantes)

**Categorías de Implantes (5 tipos):**

**1. Implantes de Atributos (Básicos)**
- **Procesador Neural Alfa:** +5% velocidad de entrenamiento de skills
  - Precio: 150,000₡
- **Procesador Neural Beta:** +10% velocidad de entrenamiento de skills
  - Precio: 500,000₡
- **Procesador Neural Omega:** +15% velocidad de entrenamiento de skills
  - Precio: 2,000,000₡

**2. Implantes de Combate**
- **Optimizador de Puntería T1:** +3% tracking de armas
  - Precio: 300,000₡
- **Optimizador de Puntería T2:** +5% tracking de armas
  - Precio: 800,000₡
- **Reflejos de Combate:** -5% tiempo de activación de módulos
  - Precio: 600,000₡
- **Sistemas de Targeting Avanzado:** +1 target máximo
  - Precio: 1,200,000₡

**3. Implantes de Ingeniería/Fitting**
- **Amplificador de RE:** +3% Reactor de Energía total de la nave
  - Precio: 400,000₡
- **Overclock CPU:** +5% CPU total de la nave
  - Precio: 400,000₡
- **Regulador de Capacitor:** +8% capacitor total de la nave
  - Precio: 500,000₡

**4. Implantes de Navegación**
- **Propulsión Mejorada:** +5% velocidad de viaje de la nave
  - Precio: 350,000₡
- **Estabilizador de Warp:** -10% tiempo de warp
  - Precio: 700,000₡

**5. Implantes de Industria/Exploración**
- **Eficiencia Minera:** +8% rendimiento de minería
  - Precio: 450,000₡
- **Scanner Mejorado:** +10% precisión de escaneos planetarios
  - Precio: 600,000₡
- **Negociador Experto:** -3% impuestos de mercado
  - Precio: 800,000₡

**Obtención de Implantes:**
- Compra en Mercados (precio variable según oferta/demanda)
- Fabricación (requiere Nanobots + Cristales Vivos + Chips de Diseño)
- Loot de NPCs raros en sitios de exploración T3-T4
- Recompensa de misiones de alto nivel

**Seguro de Implantes (Opcional):**
- Costo: 20% del valor total de los implantes equipados
- Duración: 30 días
- Beneficio: Si mueres, los implantes NO se destruyen (se conservan)
- Renovable automáticamente si tienes fondos

**Estrategia:**
- Jugadores deben elegir 3 implantes que complementen su estilo de juego
- Ejemplo piloto minero: Procesador Neural Beta + Eficiencia Minera + Scanner Mejorado
- Ejemplo piloto PvP: Reflejos de Combate + Optimizador Puntería T2 + Regulador de Capacitor

### 6.2.4 Habitáculos

Área de descanso y recuperación.

**Nivel 1:**
- 10 habitaciones
- Regeneración básica de "fatiga"
- Acceso a chat global

**Nivel 2:**
- 25 habitaciones
- Regeneración +25% más rápida
- Bonos temporales de descanso

**Nivel 3:**
- 50 habitaciones
- Regeneración +50% más rápida
- Sala de reuniones corporativa

**Nivel 4:**
- 100 habitaciones
- Bonos permanentes leves
- Sala de entrenamiento (+5% exp)

**Nivel 5:**
- 250 habitaciones
- Bonos permanentes moderados
- Centro social (mini-juegos, eventos)

### 6.2.5 Mercado

Compra y venta de bienes.

**Nivel 1:**
- 5 puestos de vendedor
- Órdenes de compra/venta básicas
- Comisión: 5%

**Nivel 2:**
- 15 puestos
- Órdenes avanzadas (límite de precio)
- Comisión: 4%
- Historial de precios

**Nivel 3:**
- 50 puestos
- Contratos de transporte
- Comisión: 3%
- Subastas

**Nivel 4:**
- 150 puestos
- Contratos de fabricación
- Comisión: 2%
- Sistema de intermediarios

**Nivel 5:**
- 500 puestos
- Mercado regional (conecta varias estaciones)
- Comisión: 1%
- Análisis de mercado IA

### 6.2.6 Astillero

Construcción de naves.

**Nivel 1:**
- Construcción de fragatas
- 1 bahía de construcción
- Velocidad base

**Nivel 2:**
- +Construcción de cruceros
- 2 bahías
- Velocidad +15%

**Nivel 3:**
- +Construcción de cargueros
- 3 bahías
- Velocidad +30%
- Descuento materiales 5%

**Nivel 4:**
- +Construcción de acorazados
- 5 bahías
- Velocidad +50%
- Descuento materiales 10%

**Nivel 5:**
- +Construcción de capitales
- 10 bahías
- Velocidad +75%
- Descuento materiales 20%
- Construcción simultánea

### 6.2.7 Sala de Ingeniería

Fabricación de módulos, items y componentes.

**Nivel 1:**
- Fabricación de módulos T1 (Tech 1)
- 2 líneas de producción
- Velocidad base

**Nivel 2:**
- +Módulos T2
- 5 líneas
- Velocidad +20%
- Reciclaje de items

**Nivel 3:**
- +Municiones y cargas
- 10 líneas
- Velocidad +40%
- Producción en masa

**Nivel 4:**
- +Módulos T3
- 20 líneas
- Velocidad +60%
- Reverse engineering

**Nivel 5:**
- +Módulos de estación
- 50 líneas
- Velocidad +100%
- Innovación (crear BPC mejorados)

### 6.2.8 Bodegas

Almacenamiento de recursos e items.

**Nivel 1:**
- Capacidad: 100,000 m³
- Acceso básico

**Nivel 2:**
- Capacidad: 500,000 m³
- Divisiones de almacén

**Nivel 3:**
- Capacidad: 2,000,000 m³
- Almacén corporativo
- Sistema de logs

**Nivel 4:**
- Capacidad: 10,000,000 m³
- Almacén de alianza
- Gestión automática

**Nivel 5:**
- Capacidad: 50,000,000 m³
- Refrigeración (items perecederos)
- Compresión de recursos

---

## 14. Sistema de Exploración

### 14.1 Escaneo de Naves

Desde cualquier ubicación espacial (no estación), los pilotos pueden escanear para detectar otras naves.

**Mecánica:**
- Depende de habilidad "Rastreo" del escaneador vs "Sigilo" del objetivo
- **Fórmula de detección:**

```
probabilidad_detectar = 50% + (nivel_rastreo × 10%) - (nivel_sigilo_objetivo × 8%)
```

- Si se detecta: Muestra nombre piloto, clase de nave, distancia aproximada
- Si NO se detecta: La nave permanece oculta
- **Cooldown:** 1 tick entre escaneos
- **Costo:** No consume recursos, pero la nave debe estar estacionaria

**Contramedidas:**
- Naves con módulos de "Camuflaje" aumentan Sigilo temporalmente
- Estar dentro de nebulosas otorga +20% Sigilo
- Moverse reduce Sigilo en -15%

### 14.2 Escaneo Planetario

Los pilotos pueden escanear planetas para descubrir recursos y generar "Datos de Exploración" vendibles.

**Requisitos:**
- Módulo: "Scanner Planetario" equipado en la nave
- Skill: "Escaneo Planetario" (nivel determina calidad del escaneo)
- Ubicación: Misma ubicación espacial que el planeta

**Proceso:**
1. El piloto selecciona un planeta sin escanear (o parcialmente escaneado)
2. Inicia el escaneo (consume 3-10 ticks según nivel skill y módulo)
3. Al completar, se genera un **Nivel de Exploración** (1-100)
4. Se crea un item "Datos de Exploración - [Nombre Planeta]" en el inventario

**Nivel de Exploración:**
- Determinado por: Skill + Módulo + Tipo de Planeta + Azar
- **Fórmula:**

```
nivel_exploracion = min(100,
  (skill_escaneo × 15) +
  (calidad_modulo × 10) +
  random(1, 20) -
  (dificultad_planeta × 5)
)
```

- **Dificultad por tipo de planeta:**
  - Rocoso, Joviano: 1
  - Volcánico, Helado: 2
  - Oceánico, Vital: 3
  - Fragmentado: 4

**Información Revelada por Nivel:**
- **Nivel 1-20:** Tipo de planeta, recursos Tier 1 presentes
- **Nivel 21-40:** + Recursos Tier 2, abundancia aproximada
- **Nivel 41-60:** + Recursos Tier 3, ubicaciones óptimas de extracción
- **Nivel 61-80:** + Recursos Tier 4, presencia de anomalías
- **Nivel 81-100:** + Datos completos, coordenadas exactas, posibles sitios arqueológicos

**Registro de Primer Descubridor:**
- Si el planeta NUNCA fue escaneado antes, el piloto queda registrado como "Primer Descubridor"
- El nombre del piloto aparece en la información pública del planeta
- Bonificación: +100 puntos de progreso del sistema
- El "Primer Descubridor" recibe un pequeño royalty (1%) sobre las ventas de Datos de Exploración de ese planeta

**Venta de Datos:**
- Los "Datos de Exploración" son items vendibles en el Mercado
- Precio sugerido: 5,000₡ - 500,000₡ según nivel de exploración y recursos presentes
- Los NPCs pueden comprarlos automáticamente
- Otros jugadores pueden comprarlos para establecer extractores sin escanear ellos mismos

### 14.3 Escaneo de Recursos en Asteroides

En cinturones de asteroides, cinturones de hielo y nebulosas.

**Mecánica:**
- Habilidad: "Prospección" (para asteroides y hielo) o "Recolección de Gas" (para nebulosas)
- Permite ver la composición exacta de un asteroide/hielo/nube antes de extraer
- **Sin prospección:** Solo se ven tipos generales ("Asteroide Metálico")
- **Con prospección:** Se ven minerales específicos y cantidad estimada

**Ejemplo:**
- Sin Prospección: "Asteroide Metálico - Desconocido"
- Prospección Nivel 1: "Asteroide Metálico - Ferrita (abundante)"
- Prospección Nivel 3: "Asteroide Metálico - Ferrita 250u, Titanita 50u, Duralinio 5u"
- Prospección Nivel 5: "Asteroide Metálico - Ferrita 247u (±10), Titanita 52u (±5), Duralinio 6u (±1)"

### 14.4 Sitios de Exploración Temporales

Sitios especiales que aparecen aleatoriamente en sistemas y desaparecen tras cierto tiempo o después de ser completados.

#### 14.4.1 Tipos de Sitios Temporales

**1. Sitios de Combate (Combat Sites)**
- **Descripción:** Naves NPC hostiles (piratas, drones rebeldes)
- **Tiers:** T1 (fácil) a T4 (muy difícil)
- **Recompensas:** Loot de naves destruidas, créditos, módulos raros
- **Duración:** 24-48 horas desde aparición
- **Detección:** Skill "Exploración" + Scanner de Combate

**2. Campos de Asteroides Ricos (Rich Ore Sites)**
- **Descripción:** Asteroides con recursos Tier 3-4
- **Recompensas:** Duralinio Espacial, Adamantita, Neutronium
- **Duración:** 12-24 horas (o hasta agotar asteroides)
- **Detección:** Skill "Prospección" (nivel 3+)

**3. Sitios Ancestrales (Ancestral Sites)**
- **Descripción:** Categoría unificada que reemplaza Relic y Data Sites. Cada instancia es uno de 4 tipos aleatorios de sitios de civilizaciones antiguas con mecánicas únicas
- **Subtipo desconocido:** Al detectar el sitio, aparece como "??? Sitio Ancestral [Tier X]" - el tipo exacto se revela al llegar
- **Tipos posibles:**
  1. **Complejo Precursor Abandonado** (30% probabilidad)
     - Estructuras militares/industriales/tecnológicas de civilización precursora
     - Mecánica: Explorar salas (3-7 salas conectadas), resolver puzzles ambientales
     - Recompensas: Fragmentos de Diseño (combinar para Chip de Diseño), Artefactos Precursores
     - Duración: 48-96 ticks (8-16 horas)
     - Requiere: Arqueología Espacial Nivel 2+

  2. **Derelicto Generacional** (25% probabilidad)
     - Naves coloniales gigantes abandonadas hace siglos
     - Mecánica: Hackear terminales (Puente, Motores, Bodegas, Criocámaras), evitar peligros
     - Recompensas: Núcleos de Datos (vendibles o descifrables en Laboratorio)
     - Duración: 36-72 ticks (6-12 horas)
     - Requiere: Hackeo Nivel 2+

  3. **Laboratorio de Investigación Perdido** (25% probabilidad)
     - Estaciones experimentales con IA corrupta
     - Mecánica: Negociar con IA (diplomacia/engaño/hackeo/ciencias), resolver minijuegos científicos
     - Recompensas: Prototipos Experimentales T3 (blueprints únicos), Documentos de Investigación
     - Duración: 48-120 ticks (8-20 horas)
     - Requiere: Ciencias Nivel 2+ (mejor opción) o Hackeo Nivel 5+

  4. **Campo de Escombros Alienígena** (20% probabilidad)
     - Tecnología de origen no-humano, diseño completamente ajeno
     - Mecánica: Recolectar Fragmentos Xeno, analizar con probabilidad creciente según cantidad
     - Recompensas: Esquemas Xenotecnología (blueprints exóticos), Fragmentos Xeno (vendibles), Materiales exóticos
     - Duración: 24-48 ticks (4-8 horas)
     - Requiere: Análisis Xenotecnológico Nivel 1+

- **Detección:** Skill "Exploración" (nivel 2+)
- **Tiers:** T1-T4 según seguridad del sistema
- **Sistema de fragmentos/núcleos:** Diferentes formas de obtener blueprints:
  - Chips de Diseño: Desbloquean blueprint inmediato
  - Núcleos de Datos: Vendibles o descifrables (12 ticks) para blueprint aleatorio
  - Prototipos Experimentales: Blueprints T3 únicos con stats ligeramente variables
  - Esquemas Xenotecnología: Blueprints exóticos con estética alienígena

**5. Nubes de Gas Exóticas (Gas Sites)**
- **Descripción:** Nebulosas temporales con gases Tier 3-4
- **Recompensas:** Plasma, Xenón, Antimateria, Materia Oscura
- **Duración:** 6-12 horas
- **Peligro:** Pueden contener NPCs o explotar al recolectar (daño AOE)
- **Detección:** Skill "Recolección de Gas" (nivel 3+)

**6. Agujeros de Gusano (Wormholes)**
- **Descripción:** Conexiones temporales a otros sistemas (incluso no descubiertos)
- **Mecánica:** Al atravesar, te lleva a un sistema aleatorio (puede ser IIC 4-5)
- **Duración:** 1-6 horas, masa de naves limitada antes de colapsar
- **Peligro:** Puedes quedar atrapado lejos de casa
- **Detección:** Skill "Exploración" (nivel 4+)

**7. Mercados Negros Flotantes (Black Markets)**
- **Descripción:** Estaciones piratas temporales que aparecen solo en sistemas de baja seguridad
- **Ubicación:** Solo sistemas IIC 4-5
- **Duración:** 72-144 ticks (12-24 horas)
- **Detección:** Skill "Exploración" (nivel 3+) o información de NPCs piratas
- **Acceso:** Requiere standing neutral/positivo (+5) con facción "Piratas del Cinturón" O pagar entrada de 50,000₡

**Servicios ofrecidos:**

1. **Mercado Negro de Items**
   - **Módulos Overclocked:** +50% stats pero -50% durabilidad
   - **Munición Prohibida:** Daño AOE (daña aliados también)
   - **Drogas Sintéticas:** Buffs potentes (+25% todas las skills, 12 ticks) con debuffs posteriores (-15% skills, 24 ticks, -30 moral)
   - **Chips de Diseño Robados:** Blueprints obtenidos ilegalmente (más baratos, traceables)
   - **Transponder Falso:** Cambia identidad por 48 ticks
   - **Precios:** 1.5-3x más caros que mercado normal

2. **Contratos Ilegales**
   - Misiones que reducen standing con facciones lawful:
     - Sabotaje de estaciones (150,000₡, -25 standing Confederación)
     - Asesinato de pilotos específicos (250,000₡)
     - Contrabando de materiales prohibidos (80,000₡)
   - Paga: 2-5x más que misiones normales
   - Consecuencia: Standing negativo permanente con facciones lawful

3. **Modificaciones Ilegales de Naves**
   - **Quitar Transponder:** Stealth permanente, nave ilegal (200,000₡, NO reversible)
   - **Amplificador RE/CPU Ilegal:** +25% RE/CPU, Albatross ataca en IIC 1-2 (350,000₡, reversible 100,000₡)
   - **Reactor Black Hole:** Capacitor infinito, 5% chance explosión/tick en combate (1,000,000₡, reversible 250,000₡)
   - **Sistema Puntería Ilegal:** +40% tracking, +25% optimal range, nave ilegal (450,000₡, NO reversible)
   - Consecuencia: Naves flagged como ilegales, Albatross las ataca en sistemas de alta seguridad

4. **Información del Mercado**
   - Rumores de sitios de exploración (coordenadas de sitios ancestrales no descubiertos)
   - Intel de jugadores (ubicación de pilotos específicos, rutas comerciales)
   - Mapas de sistemas no descubiertos

**Riesgos:**
- **PvP Permitido Dentro:** Otros jugadores pueden atacarte mientras estás en el mercado negro sin consecuencias
- **Raids de Albatross:** 5% chance por hora de que Albatross raidee el mercado (todos los presentes flagged + combate forzado)
- **Items Trackeados:** Algunos items ilegales pueden ser "rastreados" por NPCs lawful (confiscación si detectado en IIC 1-2)
- **Standing Negativo:** Comerciar aquí reduce standing con facciones lawful (-1 por transacción)

**Economía:**
- Precios inflados (1.5-3x mercado normal)
- Standing con "Piratas del Cinturón" otorga descuentos (5-25% según standing)
- Los items ilegales NO pueden venderse en mercados normales (solo P2P o en otros mercados negros)

#### 14.4.2 Aparición de Sitios Temporales

**Frecuencia General:**
- Sistemas IIC 1: 0-1 sitio cada 72 horas (solo T1, NO Sitios Ancestrales ni Mercados Negros)
- Sistemas IIC 2: 1-3 sitios cada 48 horas (T1-T2, incluye Sitios Ancestrales T1-T2)
- Sistemas IIC 3: 2-5 sitios cada 24 horas (T1-T3, incluye Sitios Ancestrales T2-T3)
- Sistemas IIC 4-5: 3-10 sitios cada 12 horas (T1-T4, incluye Sitios Ancestrales T3-T4 + Mercados Negros)

**Frecuencia Específica - Sitios Ancestrales:**
- IIC 1: 0 sitios (NO spawneran)
- IIC 2: 1 sitio cada 96 horas (T1-T2)
- IIC 3: 2-3 sitios cada 48 horas (T1-T3)
- IIC 4-5: 3-6 sitios cada 24 horas (T2-T4)

**Distribución Aleatoria de Tipos (Sitios Ancestrales):**
- 30% Complejo Precursor
- 25% Derelicto Generacional
- 25% Laboratorio de Investigación
- 20% Campo de Escombros Alienígena

**Frecuencia Específica - Mercados Negros Flotantes:**
- Solo aparecen en sistemas IIC 4-5
- Frecuencia: 1 mercado cada 72-144 horas en el sistema
- Duración: 72-144 ticks (12-24 horas)
- Máximo: 1 mercado negro activo por sistema simultáneamente

**Mecánica de Detección:**
1. El piloto usa "Escaneo de Anomalías" (acción de 1 tick)
2. Roll de probabilidad basado en skill "Exploración"
3. Si tiene éxito, aparece un sitio en su scanner con coordenadas
4. El sitio permanece visible solo para él (o puede compartir coordenadas)
5. El sitio desaparece tras completarlo o transcurrir su duración

**Compartir Coordenadas:**
- Los pilotos pueden guardar las coordenadas como "Bookmark"
- Pueden compartir bookmarks con corpmates o venderlos
- Los bookmarks expiran cuando el sitio desaparece

#### 14.4.3 Sistema de Recompensas

**Fórmula General:**

```
valor_recompensa = tier_sitio × dificultad × (1 + nivel_exploración × 0.05) × random(0.8, 1.2)
```

**Ejemplos:**
- Sitio Combate T1: 50,000₡ + loot
- Sitio Combate T4: 5,000,000₡ + blueprints T3
- Sitio Arqueológico T3: Artefacto único + 200,000 exp + posible inyector raro
- Agujero de Gusano a sistema virgen: Registro como "Primer Descubridor" del sistema completo

### 14.5 Escaneo de Anomalías Espaciales

Ubicaciones especiales permanentes o semi-permanentes.

**Tipos:**
- **Wreck Antiguo:** Restos de nave destruida hace tiempo, puede contener tecnología perdida
- **Estructura Abandonada:** Estación dañada o base militar olvidada
- **Fenómeno Espacial:** Pulsar, agujero negro lejano, estrella de neutrones (peligrosos pero con recursos únicos)

**Detección:**
- Habilidad: "Análisis Espacial" o "Exploración"
- Son más raros que sitios temporales pero permanecen indefinidamente
- Una vez descubiertos, quedan marcados en el mapa

---

## 15. Sistema de Desarrollo de Sistemas Solares

### 15.1 Concepto: Sistemas Vírgenes vs Sistemas Colonizados

Los sistemas empiezan **vírgenes** (sin estaciones NPC) y avanzan con la actividad de los jugadores.

**Mecánica:**
- Los jugadores exploran, extraen recursos y construyen estaciones
- Cuando el sistema alcanza ciertos umbrales de **Índice de Desarrollo (ID)**, las facciones NPC establecen estaciones oficiales
- Esto crea una ventana temporal donde los jugadores tienen monopolio de recursos antes de que aparezca competencia NPC

### 15.2 Índice de Desarrollo (ID) del Sistema

Cada sistema solar tiene un valor de **Desarrollo** que aumenta con la actividad de los jugadores.

**Estructura SQL:**

```sql
-- Tabla de desarrollo de sistemas
CREATE TABLE system_development (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    system_id BIGINT UNSIGNED NOT NULL,
    development_index INT UNSIGNED DEFAULT 0, -- 0 a 10,000 puntos
    total_player_stations INT UNSIGNED DEFAULT 0,
    total_resources_extracted BIGINT UNSIGNED DEFAULT 0,
    total_trade_volume BIGINT UNSIGNED DEFAULT 0,
    total_combat_events INT UNSIGNED DEFAULT 0,
    unique_pilots_visited INT UNSIGNED DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    UNIQUE KEY unique_system (system_id)
);

-- Tabla de hitos de desarrollo alcanzados
CREATE TABLE system_development_milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    system_id BIGINT UNSIGNED NOT NULL,
    milestone_type ENUM('npc_station_tier1', 'npc_station_tier2', 'npc_station_tier3', 'faction_presence', 'police_patrol', 'trade_hub') NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    development_index_at_achievement INT UNSIGNED NOT NULL,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    INDEX idx_system_milestone (system_id, milestone_type)
);

-- Tabla de estaciones NPC dinámicas
CREATE TABLE dynamic_npc_stations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    system_id BIGINT UNSIGNED NOT NULL,
    faction_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    station_type ENUM('mining_outpost', 'trade_hub', 'military_base', 'research_facility') NOT NULL,
    tier INT UNSIGNED DEFAULT 1,
    spawned_at_development_index INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE
);
```

### 15.3 Cómo se Gana Desarrollo

**Tabla de Puntos por Actividad:**

| Actividad | Puntos de Desarrollo | Notas |
|-----------|---------------------|-------|
| Ciclo de minería completado | +5 | Por cada 60 ticks de minería |
| Extracción planetaria | +3 | Por cada recolección de extractor |
| Combate NPC destruido | +8 | Por nave NPC destruida |
| Combate PvP | +15 | Por nave jugador destruida |
| Misión completada | +10 | Varía según nivel de misión |
| Comercio (por 10,000₡) | +2 | Incentiva comercio |
| Construcción de estación jugador | +500 | Gran impacto |
| Primer descubrimiento de sitio temporal | +50 | Exploración recompensada |
| Visita de nuevo piloto | +3 | Primera vez en el sistema |

**Implementación:**

```php
// Evento: Jugador completa ciclo de minería
SystemDevelopment::incrementDevelopment($systemId, [
    'activity' => 'mining',
    'points' => 5,
    'resources_extracted' => 5000 // m³
]);

// Evento: Jugador construye estación espacial
SystemDevelopment::incrementDevelopment($systemId, [
    'activity' => 'station_built',
    'points' => 500,
    'player_stations' => 1
]);
```

### 15.4 Umbrales de Desarrollo y Aparición de Estaciones NPC

**Sistema Virgen: ID 0-1,000**
- Sin estaciones NPC
- Sin patrullas policiales
- Recursos sin explotar
- **Ventana de oportunidad** para jugadores early adopters

**Umbral 1 - Puesto Fronterizo: ID 1,000-3,000**
- **Hito:** Primera estación NPC aparece
- **Tipo:** Puesto Minero o Comercial Tier 1
- **Facción:** La dominante en sistemas vecinos
- **Servicios:** Hangar Nivel 1, Mercado Nivel 1
- **Impacto:** Los jugadores ahora compiten con NPCs por recursos

**Umbral 2 - Asentamiento Establecido: ID 3,000-6,000**
- **Hito:** Segunda estación NPC + Patrullas ocasionales
- **Tipo:** Estación Industrial Tier 2
- **Servicios:** Hangar Nivel 2, Mercado Nivel 2, Sala de Ingeniería Nivel 1
- **Patrullas:** Flota Albatross aparece cada 100 ticks (solo en IIC 1-2)
- **Impacto:** Sistema más seguro, infraestructura mejorada

**Umbral 3 - Hub Regional: ID 6,000-10,000**
- **Hito:** Tercera estación NPC (Tier 3) + Múltiples corporaciones NPC
- **Tipo:** Hub Comercial o Base Militar
- **Servicios:** Todos los módulos disponibles (Astillero, Laboratorio, Mercado Nivel 3-4)
- **Corporaciones NPC:** 2-3 corporaciones establecen presencia
- **Tiendas de Lealtad:** Desbloqueadas en las estaciones NPC
- **Patrullas:** Constantes (cada 20 ticks en IIC 1-2)
- **Impacto:** Sistema completamente desarrollado

**Umbral 4 - Núcleo Consolidado: ID 10,000+**
- **Hito:** Sistema se convierte en IIC 1 (si era IIC 2+)
- **Cambios:** Seguridad máxima, PvP restringido, precios estabilizados
- **Estaciones NPC:** 4-5 estaciones con todos los servicios
- **Impacto:** Sistema maduro, ideal para nuevos jugadores

### 15.5 Mecánica de Aparición de Estaciones NPC

```php
// Sistema de eventos ejecutado por Laravel Scheduler (cada tick)
// app/Console/Commands/ProcessSystemDevelopment.php

public function handle()
{
    $systems = System::with('development')->get();

    foreach ($systems as $system) {
        $dev = $system->development;

        // Verificar umbral 1 (1,000 puntos)
        if ($dev->development_index >= 1000 && $dev->development_index < 3000) {
            if (!$system->hasAchievedMilestone('npc_station_tier1')) {
                $this->spawnNPCStation($system, 'tier1');
                $this->notifyPlayers($system, 'Nueva estación NPC en ' . $system->name);
            }
        }

        // Verificar umbral 2 (3,000 puntos)
        if ($dev->development_index >= 3000 && $dev->development_index < 6000) {
            if (!$system->hasAchievedMilestone('npc_station_tier2')) {
                $this->spawnNPCStation($system, 'tier2');
                $this->spawnPolicePatrols($system);
            }
        }

        // Verificar umbral 3 (6,000 puntos)
        if ($dev->development_index >= 6000) {
            if (!$system->hasAchievedMilestone('npc_station_tier3')) {
                $this->spawnNPCStation($system, 'tier3');
                $this->establishCorporations($system);
            }
        }
    }
}
```

### 15.6 Ventajas y Desventajas

**Ventajas para Jugadores Early Adopters:**
- ✅ **Monopolio temporal de recursos** (sin competencia NPC)
- ✅ **Control de mercado** (pueden establecer precios iniciales)
- ✅ **Construcción de estaciones sin competencia** (terreno barato)
- ✅ **Descubrimiento de sitios temporales raros** antes que otros

**Desventajas de Sistemas Vírgenes:**
- ❌ Sin estaciones NPC = sin servicios (deben construir propios)
- ❌ Sin patrullas = más peligroso (PvP sin restricciones)
- ❌ Lejos de hubs comerciales = transporte costoso
- ❌ Sin tiendas de lealtad NPC = menos acceso a items únicos

**Ventajas de Sistemas Desarrollados:**
- ✅ Infraestructura completa (servicios NPC disponibles)
- ✅ Patrullas de seguridad (menos PvP no deseado en IIC 1-2)
- ✅ Tiendas de lealtad (acceso a items exclusivos)
- ✅ Corporaciones NPC (misiones disponibles)

**Desventajas de Sistemas Desarrollados:**
- ❌ Alta competencia por recursos (NPCs + jugadores)
- ❌ Precios estabilizados (menos oportunidad de arbitraje)
- ❌ Sitios temporales ya descubiertos
- ❌ Terreno más caro para estaciones de jugadores

### 15.7 Interfaz de Desarrollo del Sistema

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 📊 DESARROLLO DEL SISTEMA: Frontera-7                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║ ÍNDICE DE DESARROLLO: 4,250 / 10,000 (42%)                          ║
║                                                                       ║
║ [████████░░░░░░░░░░░░░░░░░░░░] 4,250 pts                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║ HITOS ALCANZADOS:                                                     ║
║ ✅ Puesto Fronterizo (1,000 pts) - Día 82                           ║
║ ✅ Asentamiento Establecido (3,000 pts) - Día 145                   ║
║ 🔒 Hub Regional (6,000 pts) - Faltan 1,750 pts (~45 días)           ║
║ 🔒 Núcleo Consolidado (10,000 pts) - Faltan 5,750 pts (~150 días)   ║
╠═══════════════════════════════════════════════════════════════════════╣
║ CONTRIBUCIONES POR ACTIVIDAD (últimos 30 días):                     ║
║ • Minería: 18,450 pts (62%)                                          ║
║ • Extracción Planetaria: 4,280 pts (15%)                             ║
║ • Combate: 3,120 pts (11%)                                           ║
║ • Comercio: 2,150 pts (7%)                                           ║
║ • Exploración: 1,500 pts (5%)                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║ PRÓXIMAS RECOMPENSAS (Hub Regional - 6,000 pts):                    ║
║ • 1x Estación NPC Tier 3 con Astillero y Laboratorio                ║
║ • 2-3 Corporaciones NPC establecen presencia                         ║
║ • Tiendas de Lealtad desbloqueadas                                   ║
║ • Sistema IIC puede mejorar a 3 (si era 4)                           ║
║ • Misiones NPC de nivel 3-4 disponibles                              ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Navegación

- [← Anterior: PRD-GameDesign.md](./PRD-GameDesign.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-ShipsAndCombat.md](./PRD-ShipsAndCombat.md)
