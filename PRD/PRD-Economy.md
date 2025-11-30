# Economía, Misiones y Organizaciones

**Parte del:** PRD - Vaxav
**Versión:** 2.0
**Fecha:** 2025-11-28
**Estado:** Documento Vivo - En Desarrollo

## Changelog

### Versión 2.0 (2025-11-28) - MAJOR UPDATE: Sistema de Crafting Completo
**BREAKING CHANGES:**
- ✨ REFACTORIZACIÓN COMPLETA del sistema de recursos planetarios vs asteroides
- ✨ Separación en Categoría A (Asteroides - Metales) y Categoría B (Planetas - Gases/Orgánicos)
- ✨ Recursos ahora son únicos a su fuente (no overlap entre planetas y asteroides)

**Agregado:**
- ✅ Tabla completa de 24 recursos procesados con recetas de refinamiento (9.2.5.1)
- ✅ 52 componentes intermedios en 6 categorías (9.2.6.1-9.2.6.6)
- ✅ Sistema de extracción planetaria pasiva con instalaciones orbitales/drones
- ✅ Nuevos nombres únicos para todos los recursos de Categoría B
- ✅ Skills específicas por categoría (Minería, Extracción Atmosférica, Bioprospección)
- ✅ Mecánicas diferenciadas: Asteroides (activo, inmediato) vs Planetas (pasivo, AFK-friendly)

**Modificado:**
- 🔄 Sección 9.2.1: Categorías de recursos completamente rediseñada
- 🔄 Sección 9.2.2: Recursos de asteroides (solo metálicos, 8 recursos únicos)
- 🔄 Sección 9.2.3: Recursos planetarios - gases atmosféricos (8 recursos únicos)
- 🔄 Sección 9.2.4: Recursos planetarios - orgánicos (8 recursos únicos)
- 🔄 Notas de recursos procesados: Ahora incluyen categorización y skills específicas

**Removido:**
- ❌ Cinturones de hielo (gases ahora SOLO de planetas)
- ❌ Nebulosas de gas (gases ahora SOLO de planetas)
- ❌ Overlap de recursos entre asteroides y planetas

### Versión 1.5 (2025-11-28) - Sistema de Comercios de Jugadores
- ✅ Agregado sistema completo de comercios de jugadores (Gimnasios, Tabernas, Tiendas, Restaurantes)

[Volver al PRD Master](./PRD-Master.md)

---

## 9. Economía y Recursos

### 9.1 Moneda

**Créditos:** Moneda única del juego.

**Fuentes de Créditos:**
- Vender recursos/items
- Completar misiones
- Recompensas de combate
- Comercio entre jugadores

**Sumideros de Créditos:**
- Comprar items/naves
- Reparaciones
- Tarifas de estación
- Impuestos de mercado
- Construcción

### 9.2 Recursos

VAXAV utiliza un sistema de recursos único organizado en **3 categorías de extracción** con **4 tiers de rareza** cada una.

### 9.2.1 Categorías de Recursos - Sistema Refactorizado

**IMPORTANTE:** Los recursos se dividen en DOS sistemas completamente separados con mecánicas distintas:

**CATEGORÍA A: RECURSOS DE ASTEROIDES (Minería Espacial)**
- **Fuentes EXCLUSIVAS:** Cinturones de asteroides, campos de escombros espaciales
- **Mecánica:** Minería con naves equipadas con láseres mineros (directa, inmediata)
- **Skill:** Minería (x2)
- **Tipos:** 8 recursos metálicos únicos (T1-T4)
- **Uso Principal:** Estructuras metálicas, cascos de naves, blindaje, componentes mecánicos
- **Características:** Alta densidad (1 m³ = muchas unidades), refinamiento simple (1 paso)

**CATEGORÍA B: RECURSOS PLANETARIOS (Extracción Planetaria)**
- **Fuentes EXCLUSIVAS:** Planetas (superficie, atmósfera, océanos, capas geológicas)
- **Mecánica:** Instalaciones planetarias + drones de extracción (requiere setup, pasivo)
- **Skills:** Bioprospección (x2), Extracción Atmosférica (x3), Perforación Geológica (x3)
- **Tipos:** 16 recursos planetarios únicos (gases, orgánicos, especiales)
- **Uso Principal:** Combustibles, energía, tecnología avanzada, componentes electrónicos, biológicos
- **Características:** Baja densidad (grandes volúmenes), procesamiento complejo (múltiples pasos)

**Regla de Oro:** Un recurso NUNCA aparece en asteroides Y planetas. Son ecosistemas separados.

### 9.2.2 Recursos de Asteroides (CATEGORÍA A - Minería Espacial)

**SOLO disponibles en cinturones de asteroides y campos de escombros. NO en planetas.**

**Tier 1 (Comunes):**
- **Ferrita** - Metal estructural básico para cascos T1 y estructuras
- **Cobre Estelar** - Alta conductividad para electrónica y componentes

**Tier 2 (Poco Comunes):**
- **Titanita** - Aleación ligera y resistente para armaduras T2
- **Magnetita Pura** - Genera campos magnéticos para escudos y motores

**Tier 3 (Raros):**
- **Duralinio Espacial** - Super aleación para naves T2-T3 y módulos avanzados
- **Cristales de Zafiro** - Óptica avanzada para armas láser T3 y sensores

**Tier 4 (Muy Raros):**
- **Adamantita** - Material casi indestructible para naves T3 y armaduras exóticas
- **Neutronium** - Materia ultra-densa para reactores capitales y armas devastadoras

**Total: 8 recursos metálicos**

**Fuentes de Extracción EXCLUSIVAS:**
- Cinturones de Asteroides (5 tipos: comunes, ricos, densos, exóticos, escombros)
- Campos de Escombros Espaciales (restos de naves antiguas, estaciones destruidas)
- Anillos planetarios rocosos (solo cinturones orbitales, NO superficie planetaria)

**Mecánica de Extracción:**
1. Nave con Láser de Minería se posiciona en asteroide
2. Activa extracción (consume ticks + capacitor)
3. Recursos van directamente al cargo de la nave
4. Asteroide se agota tras X extracciones
5. Regeneración de asteroides: 48-72 ticks

**Características Únicas:**
- **Compactos:** 1 unidad = 0.2-1 m³ (alta densidad)
- **Refinamiento Simple:** Crudo → Refinado (1 paso, ratio 0.60-0.75)
- **Almacenamiento:** Fácil de transportar en cargueros
- **Volatilidad:** Cero (no se degradan con el tiempo)

### 9.2.3 Recursos Planetarios - Gases Atmosféricos (CATEGORÍA B)

**SOLO disponibles en atmósferas planetarias. NO en asteroides ni nebulosas.**

**Tier 1 (Comunes):**
- **Hidrógeno Molecular** - Gas atmosférico básico, combustible para propulsión simple
- **Helio-3** - Isótopo raro de helio, refrigerante criogénico y combustible fusión

**Tier 2 (Poco Comunes):**
- **Deuterio Atmosférico** - Hidrógeno pesado, combustible para reactores de fusión T2
- **Nitrógeno Comprimido** - Gas inerte para propelentes y sistemas de soporte vital

**Tier 3 (Raros):**
- **Plasma Atmosférico** - Gas ionizado de tormentas eléctricas, energía para armas plasma
- **Xenón Estratosférico** - Gas noble pesado, propulsor de alta eficiencia para motores T3

**Tier 4 (Muy Raros):**
- **Partículas de Antimateria** - Capturadas de cinturones de radiación planetarios
- **Trazas de Materia Oscura** - Detectable solo en planetas con anomalías gravitatorias

**Total: 8 recursos gaseosos**

**Fuentes de Extracción EXCLUSIVAS:**
- Planetas Jovianos (atmósfera profunda): Hidrógeno, Helio, Deuterio, Antimateria
- Planetas Helados (atmósfera tenue): Nitrógeno, Helio, trazas de Xenón
- Planetas con Tormenta Permanente: Plasma Atmosférico
- Planetas Anómalos (IIC 4-5): Materia Oscura

**Mecánica de Extracción Planetaria (NUEVA):**
1. **Setup Inicial:** Instalar Extractor Atmosférico en órbita del planeta (costo 500K₡, 24 ticks setup)
2. **Configuración:** Seleccionar recurso objetivo y profundidad atmosférica
3. **Extracción Pasiva:** El extractor recolecta automáticamente cada tick (sin nave presente)
4. **Recolección:** Nave con cargo debe visitar extractor y recoger recursos acumulados
5. **Capacidad:** Extractor almacena hasta 50,000 m³ antes de llenarse
6. **Mantenimiento:** Requiere reabastecimiento de energía cada 144 ticks (1 Celda de Energía T2)

**Características Únicas:**
- **Baja Densidad:** 1 unidad = 2-4 m³ (gases comprimidos)
- **Procesamiento Complejo:** Crudo → Comprimido → Refinado (2 pasos)
- **Extracción Pasiva:** No requiere piloto activo (AFK-friendly)
- **Riesgo:** Extractores en IIC 3+ pueden ser atacados/robados por otros jugadores

### 9.2.4 Recursos Planetarios - Orgánicos y Biológicos (CATEGORÍA B)

**SOLO disponibles en biosfer as planetarias (superficie, océanos, ecosistemas). NO en asteroides.**

**Tier 1 (Comunes):**
- **Biomasa Cruda** - Materia orgánica de ecosistemas planetarios, base para consumibles
- **Agua Planetaria** - H2O líquida de océanos/ríos, soporte vital y refrigerante

**Tier 2 (Poco Comunes):**
- **Proteínas Nativas** - Cadenas proteicas de flora/fauna planetaria, nutrición avanzada
- **Algas Fotosintéticas** - Organismos unicelulares, baterías biológicas y oxígeno

**Tier 3 (Raros):**
- **Colonias de Nanobots Simbióticos** - Microbios tecnológicos, reparación automática
- **Cristales Bioconductores** - Formaciones minerales vivas, computación orgánica

**Tier 4 (Muy Raros):**
- **Esporas Xenorregenerativas** - Hongos alienígenas con propiedades curativas extremas
- **Secuencias de ADN Xenomorfo** - Genoma de vida inteligente extinta, investigación prohibida

**Total: 8 recursos orgánicos**

**Fuentes de Extracción EXCLUSIVAS:**
- Planetas Vitales (ecosistemas complejos): Todos los tiers
- Planetas Oceánicos (biomas marinos): Agua, Biomasa, Proteínas, Algas, Cristales
- Planetas Fragmentados (vida extremófila): Nanobots, Esporas (muy raro)
- Ruinas Alienígenas: ADN Xenomorfo (requiere Arqueología Espacial 5)

**Mecánica de Extracción Planetaria (NUEVA):**
1. **Setup Inicial:** Desplegar Drones de Bioprospección en superficie (costo 300K₡, 18 ticks setup)
2. **Exploración:** Los drones escanean biomas y establecen zonas de cosecha óptimas
3. **Cosecha Pasiva:** Drones recolectan biomasa/agua automáticamente cada 2 ticks
4. **Recolección:** Nave debe aterrizar/orbitar y cargar recursos de drones
5. **Capacidad:** Cada drone almacena hasta 20,000 m³ antes de llenarse
6. **Degradación:** Recursos orgánicos crudos se degradan 5%/tick si no se procesan (requiere refrigeración)
7. **Mantenimiento:** Drones requieren reparación cada 72 ticks (10K₡ + componentes)

**Características Únicas:**
- **Muy Baja Densidad:** 1 unidad = 3-5 m³ (materia orgánica húmeda)
- **Procesamiento Muy Complejo:** Crudo → Purificado → Sintetizado → Refinado (3 pasos)
- **Degradación:** Se pudren con el tiempo si no se refrigeran
- **Valor Agregado:** Productos finales valen 10x más que el crudo
- **Exclusividad:** Recursos T4 solo en 2-3 planetas del universo conocido

### 9.2.5 Refinamiento y Procesamiento

Los recursos crudos se refinan en estaciones con Sala de Ingeniería (ver [PRD-Universe.md](./PRD-Universe.md#6.2.7-sala-de-ingeniería)).

**Ratio de refinamiento:** Depende de habilidades y nivel de instalación.

**Fórmula:**
```
output_refinado = input_crudo × eficiencia_refinamiento

eficiencia_refinamiento = base_eficiencia × (1 + skill_refinamiento × 0.05) × (1 + station_bonus)

base_eficiencia: 0.75 (75%)
skill_refinamiento: nivel 0-5
station_bonus: 0% a 25% según nivel de Sala de Ingeniería
```

**Ejemplo:**
```
100 unidades de Ferrita Cruda
Skill Refinamiento Nivel 3: +15%
Estación Nivel 2: +10%
→ Eficiencia = 0.75 × 1.15 × 1.10 = 0.94875 (94.8%)
→ 94.8 unidades de Ferrita Refinada
```

#### 9.2.5.1 Tabla Completa de Recursos Procesados

**RECURSOS METÁLICOS PROCESADOS (8 tipos)**

| Recurso Crudo | Recurso Procesado | Tier | Ratio Base | Skill Req. | Tiempo | Precio NPC Base (procesado) | Volumen |
|---------------|-------------------|------|------------|------------|--------|----------------------------|---------|
| Ferrita Cruda | Ferrita Refinada | T1 | 0.75 | Refinamiento Nivel 1 | 1 tick/100u | 12₡/u | 1 m³/u |
| Cobre Crudo | Cobre Estelar | T1 | 0.75 | Refinamiento Nivel 1 | 1 tick/100u | 15₡/u | 0.5 m³/u |
| Silicatos Crudos | Silicatos Refinados | T1 | 0.75 | Refinamiento Nivel 1 | 1 tick/100u | 10₡/u | 0.8 m³/u |
| Titanita Cruda | Titanita Refinada | T2 | 0.70 | Refinamiento Nivel 2 | 2 ticks/100u | 80₡/u | 1.2 m³/u |
| Magnetita Cruda | Magnetita Pura | T2 | 0.70 | Refinamiento Nivel 2 | 2 ticks/100u | 120₡/u | 1 m³/u |
| Duralinio Crudo | Duralinio Espacial | T3 | 0.65 | Refinamiento Nivel 3 | 4 ticks/100u | 350₡/u | 0.6 m³/u |
| Cristales Crudos | Cristales de Zafiro | T3 | 0.65 | Refinamiento Nivel 3 | 4 ticks/100u | 500₡/u | 0.3 m³/u |
| Adamantita Cruda | Adamantita Refinada | T4 | 0.60 | Refinamiento Nivel 4 | 6 ticks/100u | 2,500₡/u | 0.4 m³/u |
| Neutronium Crudo | Neutronium Procesado | T4 | 0.60 | Refinamiento Nivel 5 | 8 ticks/100u | 5,000₡/u | 0.2 m³/u |

**RECURSOS GASEOSOS ATMOSFÉRICOS PROCESADOS - CATEGORÍA B (8 tipos)**

| Recurso Crudo Planetario | Recurso Procesado | Tier | Ratio Base | Skill Req. | Tiempo | Precio NPC Base (procesado) | Volumen |
|--------------------------|-------------------|------|------------|------------|--------|----------------------------|---------|
| Hidrógeno Molecular (crudo) | Hidrógeno Comprimido | T1 | 0.75 | Extracción Atmosférica Nivel 1 | 1 tick/100u | 8₡/u | 2 m³/u |
| Helio-3 (crudo) | Helio-3 Líquido | T1 | 0.75 | Extracción Atmosférica Nivel 1 | 1 tick/100u | 10₡/u | 1.5 m³/u |
| Deuterio Atmosférico (crudo) | Deuterio Refinado | T2 | 0.70 | Extracción Atmosférica Nivel 2 | 2 ticks/100u | 100₡/u | 1 m³/u |
| Nitrógeno Comprimido (crudo) | Nitrógeno Criogénico | T2 | 0.70 | Extracción Atmosférica Nivel 2 | 2 ticks/100u | 85₡/u | 1.2 m³/u |
| Plasma Atmosférico (crudo) | Plasma Ionizado | T3 | 0.65 | Extracción Atmosférica Nivel 3 | 4 ticks/100u | 400₡/u | 0.5 m³/u |
| Xenón Estratosférico (crudo) | Xenón Enriquecido | T3 | 0.65 | Extracción Atmosférica Nivel 3 | 4 ticks/100u | 550₡/u | 0.4 m³/u |
| Partículas de Antimateria (crudas) | Antimateria Estable | T4 | 0.60 | Extracción Atmosférica Nivel 4 | 6 ticks/100u | 3,000₡/u | 0.1 m³/u |
| Trazas de Materia Oscura (crudas) | Materia Oscura Contenida | T4 | 0.60 | Extracción Atmosférica Nivel 5 | 8 ticks/100u | 6,000₡/u | 0.1 m³/u |

**RECURSOS ORGÁNICOS/BIOLÓGICOS PROCESADOS - CATEGORÍA B (8 tipos)**

| Recurso Crudo Planetario | Recurso Procesado | Tier | Ratio Base | Skill Req. | Tiempo | Precio NPC Base (procesado) | Volumen |
|--------------------------|-------------------|------|------------|------------|--------|----------------------------|---------|
| Biomasa Cruda | Biomasa Refinada | T1 | 0.75 | Bioprospección Nivel 1 | 1 tick/100u | 6₡/u | 3 m³/u |
| Agua Planetaria (cruda) | Agua Destilada | T1 | 0.75 | Bioprospección Nivel 1 | 1 tick/100u | 5₡/u | 4 m³/u |
| Proteínas Nativas (crudas) | Proteínas Sintéticas | T2 | 0.70 | Bioprospección Nivel 2 | 2 ticks/100u | 90₡/u | 2 m³/u |
| Algas Fotosintéticas (crudas) | Algas Bioluminiscentes | T2 | 0.70 | Bioprospección Nivel 2 | 2 ticks/100u | 110₡/u | 2.5 m³/u |
| Colonias de Nanobots Simbióticos (crudas) | Nanobots Orgánicos | T3 | 0.65 | Bioprospección Nivel 3 | 4 ticks/100u | 450₡/u | 0.3 m³/u |
| Cristales Bioconductores (crudos) | Cristales Vivos | T3 | 0.65 | Bioprospección Nivel 3 | 4 ticks/100u | 600₡/u | 0.2 m³/u |
| Esporas Xenorregenerativas (crudas) | Esporas Regenerativas | T4 | 0.60 | Bioprospección Nivel 4 | 6 ticks/100u | 3,500₡/u | 0.2 m³/u |
| Secuencias de ADN Xenomorfo (crudas) | Genoma Alienígena | T4 | 0.60 | Bioprospección Nivel 5 | 8 ticks/100u | 7,000₡/u | 0.1 m³/u |

**Notas Importantes:**
- **Categorías Separadas:**
  - **CATEGORÍA A (Asteroides):** 8 recursos metálicos, skill "Minería", refinamiento simple
  - **CATEGORÍA B (Planetas):** 16 recursos (8 gases + 8 orgánicos), skills "Extracción Atmosférica" y "Bioprospección", procesamiento complejo
- **Ratio Base:** Se multiplica por bonificadores de skill y estación (fórmula arriba)
- **Skills Específicas:**
  - **Minería (x2):** Para extracción de asteroides (Categoría A)
  - **Extracción Atmosférica (x3):** Para gases planetarios (Categoría B)
  - **Bioprospección (x2):** Para orgánicos planetarios (Categoría B)
  - Cada nivel otorga +5% eficiencia en refinamiento
- **Bonificador Estación:** Sala de Ingeniería Nivel 1-5 otorga 0-25% eficiencia
- **Tiempo:** Base por 100 unidades, escalable linealmente
- **Precios NPC:** Valor de venta a NPCs, mercado de jugadores puede variar ±300%
- **Receta Desbloqueo:** Todos los refinamientos T1-T2 desbloqueados por defecto, T3-T4 requieren pagar créditos (50K₡-500K₡)

### 9.2.6 Componentes Intermedios

Creados combinando recursos refinados. Necesarios para fabricación avanzada.

**Regla Crítica:** NINGÚN producto final se fabrica directamente con recursos crudos. La cadena es siempre: Crudo → Procesado → Componente → Producto Final.

#### 9.2.6.1 Componentes Electrónicos (10 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Circuitos Básicos | T1 | 20 Cobre Estelar + 10 Silicatos Refinados | 2 ticks | Construcción de Componentes Nivel 1 | 500₡ | 0.1 m³ | Gratis |
| Condensadores | T1 | 15 Cobre Estelar + 5 Magnetita Pura | 2 ticks | Construcción de Componentes Nivel 1 | 650₡ | 0.1 m³ | Gratis |
| Procesadores T1 | T1 | 30 Cobre Estelar + 20 Silicatos Refinados | 3 ticks | Construcción de Componentes Nivel 1 | 800₡ | 0.05 m³ | Gratis |
| Microconductores | T2 | 25 Cobre Estelar + 15 Titanita Refinada | 4 ticks | Construcción de Componentes Nivel 2 | 2,200₡ | 0.08 m³ | 25,000₡ |
| Procesadores T2 | T2 | 40 Cobre Estelar + 10 Cristales de Zafiro | 5 ticks | Construcción de Componentes Nivel 2 | 3,500₡ | 0.05 m³ | 35,000₡ |
| Chips Cuánticos T1 | T2 | 20 Cristales de Zafiro + 30 Cobre Estelar | 6 ticks | Construcción de Componentes Nivel 2 | 4,000₡ | 0.03 m³ | 50,000₡ |
| Procesadores T3 | T3 | 50 Cristales de Zafiro + 20 Duralinio Espacial | 8 ticks | Construcción de Componentes Nivel 3 | 12,000₡ | 0.04 m³ | 100,000₡ |
| Chips Cuánticos T2 | T3 | 30 Cristales Vivos + 25 Cristales de Zafiro | 10 ticks | Construcción de Componentes Nivel 3 | 18,000₡ | 0.02 m³ | 150,000₡ |
| Núcleos de IA | T4 | 40 Cristales Vivos + 30 Chips Cuánticos T2 | 12 ticks | Construcción de Componentes Nivel 4 | 55,000₡ | 0.02 m³ | 300,000₡ |
| Matrices Neuronales | T4 | 50 Genoma Alienígena + 20 Núcleos de IA | 15 ticks | Construcción de Componentes Nivel 5 | 120,000₡ | 0.01 m³ | 500,000₡ |

#### 9.2.6.2 Componentes Estructurales (10 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Barras de Acero | T1 | 50 Ferrita Refinada + 10 Silicatos Refinados | 2 ticks | Construcción de Componentes Nivel 1 | 700₡ | 2 m³ | Gratis |
| Placas de Blindaje T1 | T1 | 60 Ferrita Refinada + 20 Titanita Refinada | 3 ticks | Construcción de Componentes Nivel 1 | 1,200₡ | 1.5 m³ | Gratis |
| Vigas Reforzadas | T1 | 40 Ferrita Refinada + 15 Cobre Estelar | 2 ticks | Construcción de Componentes Nivel 1 | 900₡ | 3 m³ | Gratis |
| Placas de Blindaje T2 | T2 | 50 Titanita Refinada + 30 Duralinio Espacial | 5 ticks | Construcción de Componentes Nivel 2 | 4,500₡ | 1.2 m³ | 30,000₡ |
| Aleaciones Ligeras | T2 | 40 Titanita Refinada + 20 Magnetita Pura | 4 ticks | Construcción de Componentes Nivel 2 | 3,200₡ | 1 m³ | 25,000₡ |
| Armaduras Compuestas | T2 | 35 Duralinio Espacial + 15 Cristales de Zafiro | 6 ticks | Construcción de Componentes Nivel 2 | 5,500₡ | 0.8 m³ | 50,000₡ |
| Placas de Blindaje T3 | T3 | 60 Duralinio Espacial + 40 Adamantita Refinada | 8 ticks | Construcción de Componentes Nivel 3 | 16,000₡ | 1 m³ | 120,000₡ |
| Armaduras Exóticas | T3 | 50 Adamantita Refinada + 20 Neutronium Procesado | 10 ticks | Construcción de Componentes Nivel 3 | 22,000₡ | 0.7 m³ | 150,000₡ |
| Aleaciones Neutrónicas | T4 | 70 Neutronium Procesado + 30 Adamantita Refinada | 12 ticks | Construcción de Componentes Nivel 4 | 60,000₡ | 0.5 m³ | 350,000₡ |
| Materia Exótica Sólida | T4 | 40 Materia Oscura Contenida + 50 Neutronium Procesado | 15 ticks | Construcción de Componentes Nivel 5 | 130,000₡ | 0.3 m³ | 500,000₡ |

#### 9.2.6.3 Componentes Energéticos (10 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Celdas de Energía T1 | T1 | 30 Hidrógeno Comprimido + 15 Helio Líquido | 2 ticks | Construcción de Componentes Nivel 1 | 600₡ | 0.5 m³ | Gratis |
| Superconductores T1 | T1 | 25 Cobre Estelar + 10 Magnetita Pura | 3 ticks | Construcción de Componentes Nivel 1 | 850₡ | 0.2 m³ | Gratis |
| Baterías Iónicas | T1 | 20 Hidrógeno Comprimido + 10 Algas Bioluminiscentes | 2 ticks | Construcción de Componentes Nivel 1 | 750₡ | 0.4 m³ | Gratis |
| Celdas de Energía T2 | T2 | 40 Deuterio Refinado + 20 Magnetita Pura | 4 ticks | Construcción de Componentes Nivel 2 | 3,000₡ | 0.4 m³ | 30,000₡ |
| Reactores de Fusión T1 | T2 | 50 Deuterio Refinado + 30 Superconductores T1 | 6 ticks | Construcción de Componentes Nivel 2 | 5,000₡ | 0.6 m³ | 50,000₡ |
| Superconductores T2 | T2 | 35 Duralinio Espacial + 25 Magnetita Pura | 5 ticks | Construcción de Componentes Nivel 2 | 4,200₡ | 0.15 m³ | 40,000₡ |
| Celdas de Energía T3 | T3 | 60 Plasma Ionizado + 30 Xenón Enriquecido | 8 ticks | Construcción de Componentes Nivel 3 | 14,000₡ | 0.3 m³ | 120,000₡ |
| Reactores de Fusión T2 | T3 | 70 Plasma Ionizado + 40 Superconductores T2 | 10 ticks | Construcción de Componentes Nivel 3 | 20,000₡ | 0.5 m³ | 150,000₡ |
| Núcleos de Antimateria | T4 | 80 Antimateria Estable + 40 Materia Oscura Contenida | 12 ticks | Construcción de Componentes Nivel 4 | 70,000₡ | 0.2 m³ | 400,000₡ |
| Singularidades Contenidas | T4 | 100 Materia Oscura Contenida + 50 Núcleos de Antimateria | 18 ticks | Construcción de Componentes Nivel 5 | 180,000₡ | 0.1 m³ | 500,000₡ |

#### 9.2.6.4 Componentes Mecánicos (8 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Servomotores T1 | T1 | 20 Ferrita Refinada + 15 Cobre Estelar | 2 ticks | Construcción de Componentes Nivel 1 | 700₡ | 0.3 m³ | Gratis |
| Actuadores Hidráulicos | T1 | 30 Ferrita Refinada + 10 Agua Destilada | 2 ticks | Construcción de Componentes Nivel 1 | 650₡ | 0.5 m³ | Gratis |
| Sistemas de Propulsión T1 | T2 | 40 Titanita Refinada + 25 Servomotores T1 | 5 ticks | Construcción de Componentes Nivel 2 | 4,000₡ | 1 m³ | 35,000₡ |
| Servomotores T2 | T2 | 35 Duralinio Espacial + 20 Microconductores | 4 ticks | Construcción de Componentes Nivel 2 | 3,500₡ | 0.2 m³ | 30,000₡ |
| Giroscopios Cuánticos | T2 | 30 Magnetita Pura + 15 Chips Cuánticos T1 | 6 ticks | Construcción de Componentes Nivel 2 | 5,500₡ | 0.15 m³ | 50,000₡ |
| Sistemas de Propulsión T2 | T3 | 60 Duralinio Espacial + 35 Servomotores T2 | 8 ticks | Construcción de Componentes Nivel 3 | 18,000₡ | 0.8 m³ | 120,000₡ |
| Motores de Warp | T3 | 50 Xenón Enriquecido + 30 Giroscopios Cuánticos | 10 ticks | Construcción de Componentes Nivel 3 | 25,000₡ | 0.6 m³ | 150,000₡ |
| Propulsores Exóticos | T4 | 70 Materia Oscura Contenida + 40 Motores de Warp | 15 ticks | Construcción de Componentes Nivel 4 | 90,000₡ | 0.4 m³ | 400,000₡ |

#### 9.2.6.5 Componentes Ópticos (6 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Lentes Básicas | T1 | 25 Silicatos Refinados + 10 Agua Destilada | 2 ticks | Construcción de Componentes Nivel 1 | 500₡ | 0.1 m³ | Gratis |
| Cristales de Enfoque T1 | T2 | 30 Cristales de Zafiro + 15 Lentes Básicas | 4 ticks | Construcción de Componentes Nivel 2 | 3,800₡ | 0.08 m³ | 30,000₡ |
| Sistemas Ópticos T1 | T2 | 35 Cristales de Zafiro + 20 Cobre Estelar | 5 ticks | Construcción de Componentes Nivel 2 | 4,500₡ | 0.12 m³ | 40,000₡ |
| Cristales de Enfoque T2 | T3 | 50 Cristales Vivos + 30 Cristales de Zafiro | 8 ticks | Construcción de Componentes Nivel 3 | 16,000₡ | 0.06 m³ | 120,000₡ |
| Sistemas Ópticos T2 | T3 | 60 Cristales Vivos + 40 Procesadores T3 | 10 ticks | Construcción de Componentes Nivel 3 | 22,000₡ | 0.1 m³ | 150,000₡ |
| Láseres Exóticos | T4 | 80 Genoma Alienígena + 50 Cristales de Enfoque T2 | 14 ticks | Construcción de Componentes Nivel 4 | 95,000₡ | 0.05 m³ | 450,000₡ |

#### 9.2.6.6 Componentes Biológicos (8 tipos)

| Componente | Tier | Materiales Requeridos | Tiempo | Skill Req. | Precio NPC Base | Volumen | Desbloqueo |
|------------|------|-----------------------|--------|------------|-----------------|---------|------------|
| Raciones Básicas | T1 | 30 Biomasa Refinada + 20 Agua Destilada | 1 tick | Construcción de Componentes Nivel 1 | 200₡ | 1 m³ | Gratis |
| Medkits T1 | T1 | 20 Proteínas Sintéticas + 15 Agua Destilada | 2 ticks | Construcción de Componentes Nivel 1 | 600₡ | 0.5 m³ | Gratis |
| Sueros de Buff T1 | T2 | 30 Algas Bioluminiscentes + 25 Proteínas Sintéticas | 3 ticks | Construcción de Componentes Nivel 2 | 2,500₡ | 0.3 m³ | 25,000₡ |
| Medkits T2 | T2 | 35 Nanobots Orgánicos + 20 Proteínas Sintéticas | 4 ticks | Construcción de Componentes Nivel 2 | 4,000₡ | 0.4 m³ | 35,000₡ |
| Cultivos Regenerativos | T3 | 40 Esporas Regenerativas + 30 Nanobots Orgánicos | 6 ticks | Construcción de Componentes Nivel 3 | 14,000₡ | 0.3 m³ | 100,000₡ |
| Sueros de Buff T2 | T3 | 50 Cristales Vivos + 35 Algas Bioluminiscentes | 8 ticks | Construcción de Componentes Nivel 3 | 18,000₡ | 0.25 m³ | 120,000₡ |
| Medkits T3 | T4 | 60 Esporas Regenerativas + 40 Cultivos Regenerativos | 10 ticks | Construcción de Componentes Nivel 4 | 60,000₡ | 0.3 m³ | 300,000₡ |
| Nanomáquinas Alienígenas | T4 | 80 Genoma Alienígena + 50 Nanobots Orgánicos | 15 ticks | Construcción de Componentes Nivel 5 | 140,000₡ | 0.15 m³ | 500,000₡ |

**Total: 52 Componentes Intermedios**

**Notas Importantes:**
- **Skill "Construcción de Componentes":** Skill nueva (ver PRD-GameDesign.md), cada nivel desbloquea tier superior
- **Tiempo de Fabricación:** Por unidad individual, se puede fabricar en lotes con tiempo proporcional
- **Módulo Requerido:** Sala de Ingeniería Nivel 1+ (ver PRD-Universe.md)
- **Desbloqueo de Recetas:** T1 gratis, T2 requiere pago de créditos, T3+ requiere Chips de Diseño o descifrado en Laboratorio
- **Volumen:** Importante para planificación de carga y almacenamiento
- **Precios NPC:** Valor base, mercado de jugadores fluctúa según oferta/demanda

### 9.2.7 Combustibles Procesados

Los combustibles procesados se obtienen de Ice Belts y son esenciales para energizar estaciones espaciales y naves capitales.

**Fuentes:** Ice Belts (Hielo de Agua, Deuterio, Plasma, Exótico)

**Procesamiento:**
```
Hielo Crudo → Refinamiento → Combustible Preparado
```

**Tipos de Combustible:**

**1. Celdas de Hielo (Tier 1)**
- **Input:** 100 Hielo de Agua
- **Output:** 75 Celdas de Hielo
- **Uso:** Energía básica para estaciones pequeñas, naves T1
- **Consumo estación:** 1-6 celdas/tick (según módulos nivel 1-5)
- **Precio:** 500₡/unidad

**2. Bloques de Deuterio (Tier 2)**
- **Input:** 100 Hielo de Deuterio
- **Output:** 80 Bloques de Deuterio
- **Uso:** Energía avanzada para estaciones medianas, naves T2
- **Consumo estación:** 1.5-7.5 bloques/tick (según módulos nivel 1-5)
- **Precio:** 2,000₡/unidad

**3. Núcleos de Plasma (Tier 3)**
- **Input:** 50 Hielo de Plasma
- **Output:** 40 Núcleos de Plasma
- **Uso:** Energía premium para estaciones grandes, naves capitales
- **Consumo estación:** 2.5-9 núcleos/tick (según módulos nivel 1-5)
- **Precio:** 8,000₡/unidad

**4. Reactores de Antimateria (Tier 4)**
- **Input:** 10 Hielo Exótico + 5 Antimateria
- **Output:** 8 Reactores de Antimateria
- **Uso:** Saltos interestelares para naves capitales (sin stargates)
- **Consumo:** 1 reactor por salto (alcance: 3-5 sistemas)
- **Precio:** 50,000₡/unidad

**Mecánica de Consumo en Estaciones:**
- Estaciones sin combustible: Módulos se desactivan progresivamente
- Prioridad de desactivación: Puente Mando (último) > Hangar > Defensa > Otros
- Almacenamiento: Depósito de Combustible (módulo de estación opcional)
- Las bases estelares de jugadores requieren combustible constante para operar

**Mecánica de Consumo en Naves Capitales:**
- Reactores de Antimateria permiten saltos interestelares sin stargates
- Alcance: 3-5 sistemas de distancia
- Cooldown: 30 ticks entre saltos
- Fatiga acumulativa: cada salto aumenta cooldown +10 ticks

### 9.2.8 Datos de Exploración

Nuevo tipo de recurso comercializable obtenido al explorar planetas y sitios desconocidos.

**Tipos:**
- **Datos de Exploración Planetaria:** Información sobre recursos de un planeta
  - Básicos (33% exploración): 1-2 recursos principales
  - Avanzados (66% exploración): Todos los recursos + abundancia
  - Completos (100% exploración): Composición exacta + anomalías

- **Coordenadas de Sitios Temporales:** Ubicación de anomalías espaciales
  - Belt de Asteroides Temporal
  - Nebulosa de Gas Temporal
  - Sitio de Combate
  - Ruina Espacial
  - Agujero de Gusano

**Metadata (JSON):**
```json
{
  "type": "exploration_data",
  "subtype": "planetary_scan",
  "planet_id": 42,
  "planet_name": "Vaxav VII",
  "exploration_level": 66,
  "resources": {
    "ferrita": "abundante",
    "adamantita": "trazas"
  },
  "anomalies": 2,
  "discovered_by": "pilot_name",
  "scan_date": "2025-11-28"
}
```

**Mecánica de Venta:**
- Al vender a NPC o jugador, el vendedor **PIERDE** la información
- El comprador puede instalar los datos en su base de conocimiento (consume el item)
- Precio base NPC: `tier_planeta × 1000₡ × (exploration_level / 33) × rarity_multiplier`
- Jugadores pueden especular revendiendo datos valiosos

**Precios de Referencia:**
- Datos Básicos planeta Rocoso: ~2,000₡
- Datos Avanzados planeta Volcánico: ~8,000₡
- Datos Completos planeta Fragmentado (primer descubridor): ~150,000₡

### 9.2.9 Chips de Diseño (Blueprints)

Los Chips de Diseño son items que desbloquean blueprints en la Consola de Fabricación (reemplazan el sistema tradicional BPO/BPC).

**Características:**
- Item comercializable en mercado
- Uso único (consume el item al desbloquear blueprint)
- Obtenidos como loot de NPCs, recompensas de misiones, o investigación
- Valor según complejidad del blueprint desbloqueado

**Ejemplos:**
- **Chip: Fragata Minera T1** - Desbloquea construcción de "Excavador MK-I"
- **Chip: Láser de Minería T2** - Desbloquea fabricación de láseres avanzados
- **Chip: Escudo Adaptativo T3** - Desbloquea módulo exótico de escudo

**Precio Base:**
- T1: 10,000 - 50,000₡
- T2: 100,000 - 500,000₡
- T3: 1,000,000 - 5,000,000₡

### 9.2.10 Items de Exploración Ancestral

Nuevos items obtenidos en Sitios Ancestrales con mecánicas únicas de blueprint unlock.

**Chip de Diseño (Categorizado):**
- **Descripción:** Item que desbloquea blueprint inmediato al consumir
- **Categorías:** Militar, Industrial, Tecnológico
- **Fuente:** Completar Complejos Precursores (combinar 5 Fragmentos de Diseño)
- **Mecánica:** Uso único, blueprint aleatorio de la categoría
- **Precio Base:**
  - T1: 50,000 - 200,000₡
  - T2: 250,000 - 1,000,000₡
  - T3: 1,500,000 - 5,000,000₡
- **Ejemplos:**
  - "Chip de Diseño [Militar T2]" → Blueprint aleatorio de arma/defensa T2
  - "Chip de Diseño [Industrial T3]" → Blueprint de nave minera/carguero T3

**Núcleo de Datos (Cifrado):**
- **Descripción:** Item vendible que contiene blueprint cifrado (desconocido hasta descifrar)
- **Fuente:** Hackear terminales en Derelictos Generacionales
- **Mecánica:**
  - Puede venderse SIN descifrar (mercado especulativo)
  - Puede descifrarse en Laboratorio de estación (12 ticks) para revelar blueprint aleatorio
  - Tier determina calidad del blueprint (T1-T3)
- **Precio de Mercado Jugadores:** 100,000 - 5,000,000₡ (especulación)
- **Precios NPC (compra):**
  - T1: 75,000₡
  - T2: 400,000₡
  - T3: 2,000,000₡
- **Economía:** Los jugadores pueden especular comprando núcleos sin descifrar y revenderlos

**Prototipo Experimental:**
- **Descripción:** Blueprint T3 único con stats ligeramente variables (RNG de stats)
- **Fuente:** Completar experimentos exitosos en Laboratorios de Investigación Perdidos
- **Mecánica:** Cada prototipo es ligeramente diferente (±5-10% stats aleatorios)
- **Precio Base:** 1,000,000 - 10,000,000₡
- **Ejemplos:**
  - "Prototipo Experimental: Escudo Adaptativo" (Regen +12%, Cap -3%)
  - "Prototipo Experimental: Láser Cuántico" (Damage +8%, Tracking -5%)
- **Rareza:** Muy raros, altamente codiciados por coleccionistas y min-maxers

**Esquema Xenotecnología:**
- **Descripción:** Blueprint de tecnología alienígena con estética y mecánicas únicas
- **Fuente:** Analizar Fragmentos Xeno en Campos de Escombros Alienígenas (probabilidad 70% con 18 fragmentos)
- **Mecánica:** Stats exóticos (beneficios únicos no disponibles en tech humana)
- **Precio Base:** 500,000 - 8,000,000₡
- **Ejemplos:**
  - "Esquema Xeno: Propulsor de Materia Oscura" (Warp speed +40%, energy drain +20%)
  - "Esquema Xeno: Escudo Orgánico" (Regenera 5% HP/tick automáticamente)
- **Apariencia:** Naves/módulos con diseño alienígena visual

**Fragmento Xeno:**
- **Descripción:** Commodity vendible, componente para análisis
- **Fuente:** Recolectar en Campos de Escombros Alienígenas
- **Precio Mercado:** ~2,000₡/unidad
- **Uso:**
  - Vendible como commodity
  - Acumular 16-30+ para aumentar chance de descifrar Esquema Xenotecnología

**Fragmento de Diseño:**
- **Descripción:** Componente para crear Chip de Diseño completo
- **Fuente:** Completar salas individuales en Complejos Precursores
- **Mecánica:** Combinar 5 fragmentos de misma categoría = 1 Chip de Diseño
- **Precio Mercado:** ~10,000 - 100,000₡/fragmento (dependiendo de categoría/tier)
- **No stackeable entre categorías:** Fragmentos Militares ≠ Fragmentos Industriales

**Artefacto Precursor:**
- **Descripción:** Item decorativo coleccionable
- **Fuente:** Loot adicional en Complejos Precursores
- **Precio NPC:** 5,000 - 50,000₡
- **Uso:** Vender a NPCs o coleccionar (logros)

### 9.2.11 Items Ilegales

Items prohibidos solo disponibles en Mercados Negros Flotantes.

**Módulos Overclocked:**
- **Descripción:** Módulos modificados ilegalmente con stats extremos pero durabilidad reducida
- **Stats:** +50% beneficio principal, -50% durabilidad (se rompen más rápido)
- **Precio:** 75,000 - 500,000₡ (1.5-3x precio normal)
- **Consecuencia:** Si Albatross escanea tu nave en IIC 1-2, confiscación (-10 standing)
- **Ejemplos:**
  - "Láser Overclocked T2" (+50% damage, -50% durabilidad)
  - "Escudo Overclocked T3" (+50% HP, -50% durabilidad)

**Munición Prohibida:**
- **Descripción:** Munición AOE que daña objetivos en 500m (incluyendo aliados)
- **Damage:** 2x damage normal, AOE 500m
- **Precio:** 25,000₡ por stack de 1000 unidades
- **Consecuencia:** Uso está prohibido por tratados galácticos, posesión = -5 standing si detectada
- **Uso:** PvP en null-sec, raids

**Drogas Sintéticas:**
- **Descripción:** Estimulantes neurales ilegales con buffs potentes y debuffs severos
- **Efecto:**
  - Buff: +25% todas las skills por 12 ticks
  - Debuff posterior: -15% todas las skills por 24 ticks, -30 moral
- **Precio:** 15,000₡ por dosis
- **Consecuencia:** Adicción (mecánica futura), detección = -10 standing
- **Nombres:** "Foco Extremo", "Adrenalina Sintética", "Neuro-Boost"

**Chips de Diseño Robados:**
- **Descripción:** Blueprints robados del Sindicato Técnico, más baratos pero traceables
- **Precio:** 50% precio de Chip normal
- **Consecuencia:** 10% chance de ser rastreado si fabricas el item (Sindicato Técnico -25 standing)
- **Riesgo:** Cheaper pero peligroso a largo plazo

**Transponder Falso:**
- **Descripción:** Cambia tu identidad en radares por 48 ticks
- **Precio:** 80,000₡
- **Efecto:** Apareces como otro piloto aleatorio durante 48 ticks
- **Uso:** Evadir enemigos, infiltración
- **Consecuencia:** Si Albatross detecta (15% chance/scan), flagged como criminal permanente

**Compartimento Blindado:**
- **Tier 1:** 15% chance evasión escaneo, 500m³ carga oculta, 15 RE, 25 CPU
  - **Precio:** 250,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Tier 2:** 35% chance evasión escaneo, 1000m³ carga oculta, 25 RE, 40 CPU
  - **Precio:** 600,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Tier 3:** 60% chance evasión escaneo, 2000m³ carga oculta, 40 RE, 60 CPU
  - **Precio:** 1,500,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Disponibilidad:** Solo en Mercados Negros
- **Función:** Oculta ítems ilegales en compartimento especial, reduce detección en inspecciones

**Bloqueador de Escaneo:**
- **Tier 1:** +20% resistencia a escaneos, 30 RE, 20 CPU, consume 15 cap/s activo
  - **Precio:** 180,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Tier 2:** +45% resistencia a escaneos, 50 RE, 35 CPU, consume 25 cap/s activo
  - **Precio:** 450,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Tier 3:** +70% resistencia a escaneos + jammer activo, 75 RE, 55 CPU, consume 40 cap/s activo
  - **Precio:** 1,200,000₡
  - **Uso:** Módulo de nave (slot utilidad)
- **Disponibilidad:** Solo en Mercados Negros
- **Función:** Interfiere activamente con escáneres de carga, consume capacitor cuando está activado

**Revestimiento Anti-Detección:**
- **Descripción:** Modificación permanente del casco para evadir escaneos
- **Efecto:** +25% evasión base contra todos los escaneos de carga
- **Precio:** 800,000₡
- **Instalación:** Disponible solo en Mercados Negros
- **Reversible:** Sí, por 200,000₡
- **Nota:** No consume slots de módulos, es una modificación estructural

**Modificaciones Ilegales de Naves** (ver PRD-ShipsAndCombat.md para detalles):
- Eliminar Transponder: 200,000₡
- Amplificador RE/CPU Ilegal: 350,000₡
- Reactor Black Hole: 1,000,000₡
- Sistema Puntería Ilegal: 450,000₡

### 9.2.11 Otros Recursos

- **Combustible Preparado:** Hidrógeno procesado para viajes largos
- **Municiones Legales:** Consumibles de combate (proyectiles, torpedos, cargas)
- **Drones de Combate:** Semi-permanentes, recuperables
- **Consumibles de Buff:** Comida, bebidas, stimulantes legales (ver Comercios de Jugadores)

### 9.3 Cadena de Producción

**Flujo completo controlado por jugadores:**

```
1. EXTRACCIÓN
   ├─> Minería de Asteroides → Metálicos (Ferrita, Cobre, Titanita...)
   ├─> Recolección de Gas → Gaseosos (Hidrógeno, Deuterio, Plasma...)
   ├─> Extracción Criogénica → Volátiles (Agua, Nitrógeno, Xenón...)
   └─> Bioprospección → Orgánicos (Biomasa, Proteínas, Nanobots...)

2. REFINAMIENTO
   └─> Recursos Refinados (en Sala de Ingeniería)

3. FABRICACIÓN DE COMPONENTES
   ├─> Electrónica (Circuitos, Procesadores, Chips)
   ├─> Estructurales (Placas, Armaduras, Aleaciones)
   ├─> Energéticos (Celdas, Reactores, Núcleos)
   └─> Biológicos (Raciones, Medkits, Sueros)

4. FABRICACIÓN DE MÓDULOS
   └─> Módulos de Nave T1/T2/T3 (en Sala de Ingeniería)

5. CONSTRUCCIÓN DE NAVES
   └─> Naves T1/T2/T3 (en Astillero)

6. MERCADO
   └─> Venta a jugadores o NPCs
```

**Sistema de Blueprints Unificado:**
- **NO existen items BPO/BPC individuales**
- Los blueprints se gestionan desde la **Consola de Fabricación** (módulo de estación)
- Todos los blueprints están visibles pero bloqueados por defecto
- Se desbloquean mediante:
  1. Pago directo en Créditos (10,000₡ a 5,000,000₡ según complejidad)
  2. Consumir un **Chip de Diseño** (item obtenido como loot o recompensa)
  3. Investigación en Laboratorio (tiempo + recursos)
- Una vez desbloqueado, el blueprint es permanente para ese piloto
- Los **Chips de Diseño** sí son comercializables en el mercado

### 9.4 Mercado de Habilidades

El mercado de inyectores de habilidades funciona de manera similar al mercado de EVE Online.

**Fuentes de Inyectores:**

1. **Laboratorios NPC:**
    - Cada laboratorio vende un catálogo limitado según su especialización (ver [PRD-Universe.md](./PRD-Universe.md#6.2.3-laboratorio))
    - Precio base según multiplicador de habilidad
    - Descuentos según nivel del laboratorio (hasta 20% en nivel 5)
    - Stock generalmente infinito
2. **Mercado de Jugadores:**
    - Los jugadores pueden revender inyectores comprados
    - Permite especulación y comercio
    - Precios determinados por oferta y demanda
    - Útil para encontrar inyectores raros o de estaciones lejanas
3. **Recompensas de Misiones:**
    - Misiones de alto nivel pueden recompensar con inyectores raros
    - Algunos inyectores solo se obtienen así (skills únicos o avanzados)

**Sistema de Órdenes (Estilo EVE Online):**

**Órdenes de Compra (Buy Orders):**
- El jugador especifica: "Compro Inyector de Minería por 18,000 créditos"
- Cuando alguien vende a ese precio, la orden se ejecuta
- Permite comprar sin estar presente

**Órdenes de Venta (Sell Orders):**
- El jugador especifica: "Vendo Inyector de Escudos por 32,000 créditos"
- El item se almacena en el mercado hasta que se venda
- Otros pueden comprarlo instantáneamente

**Características del Mercado:**
- **Alcance Regional:** Los mercados de nivel 5 conectan múltiples estaciones
- **Historial de Precios:** Ver tendencias de los últimos 30 días
- **Filtros Avanzados:** Por categoría de skill, multiplicador, precio
- **Mercado de Inyectores Destacado:** Sección especial en la UI del mercado
- **Comparador:** Muestra precios en diferentes estaciones

**Interfaz de Búsqueda de Inyectores:**
Desde la vista de habilidades, el jugador puede:
1. Ver habilidad "No Inyectada"
2. Click en "Buscar en Mercado"
3. Se muestra lista de órdenes de venta disponibles
4. Puede comprar inmediatamente o crear orden de compra

**Ejemplo de Búsqueda:**

```
Inyector: Pilotaje de Cruceros (x3)

Órdenes de Venta:
┌─────────────────────────────────────────────────────────────┐
│ Precio    │ Cantidad │ Estación              │ Distancia   │
├───────────┼──────────┼───────────────────────┼─────────────┤
│ 28,500 ₡  │    5     │ Puerto Génesis        │ Esta        │
│ 29,000 ₡  │    2     │ Estación Marte-2      │ 5 saltos    │
│ 30,000 ₡  │   12     │ Centro Comercial Vax  │ 2 saltos    │
└─────────────────────────────────────────────────────────────┘

Órdenes de Compra:
┌─────────────────────────────────────────────────────────────┐
│ Precio    │ Cantidad │ Estación              │ Rango       │
├───────────┼──────────┼───────────────────────┼─────────────┤
│ 27,500 ₡  │    3     │ Puerto Génesis        │ Esta        │
│ 27,000 ₡  │   10     │ Cualquiera            │ Regional    │
└─────────────────────────────────────────────────────────────┘

[ Comprar Ahora ]  [ Crear Orden de Compra ]
```

**Economía de Inyectores:**
- Los jugadores pueden **arbitraje:** comprar barato en una estación, vender caro en otra
- **Inyectores raros** se vuelven commodities valiosos
- Estaciones alejadas pueden tener precios más altos
- Creación de **rutas comerciales** de inyectores

---

## 10. Misiones y Agentes NPC

### 10.1 Sistema de Agentes

Los agentes NPC ofrecen misiones.

**Ubicación:**
- Estaciones NPC
- Cada estación tiene 1-5 agentes

**Atributos del Agente:**
- **Nombre:** Generado
- **Corporación:** A la que pertenece
- **Facción:** A la que pertenece la corporación (ver [PRD-Universe.md](./PRD-Universe.md#4-sistema-de-facciones))
- **Tipo:** Minería, Combate, Transporte, Investigación
- **Nivel:** 1-5

### 10.2 Sistema de Reputación (Standing)

Cada piloto tiene **Standing** (reputación) con cada facción y con corporaciones NPC individuales.

**Rangos de Standing (-100 a +100):**

```
+100  Legendario      - Acceso total, precios 20% descuento
+90   Héroe           - Misiones nivel 5, precios 15% descuento
+70   Excelente       - Misiones nivel 4-5, precios 10% descuento
+50   Muy Bueno       - Misiones nivel 3-4, precios 5% descuento
+30   Bueno           - Misiones nivel 2-3
+10   Amistoso        - Misiones nivel 1-2
  0   Neutral         - Acceso básico
-10   Suspicaz        - Precios 5% incremento
-30   Malo            - Precios 10% incremento, algunas estaciones cerradas
-50   Muy Malo        - Precios 20% incremento, mayoría de estaciones cerradas
-70   Hostil          - NPCs atacan a la vista en IIC 1-2
-100  Enemigo         - KOS (Kill On Sight) en todos los sistemas de la facción
```

**Cómo se Gana/Pierde Standing:**

**Ganar Standing (+):**
- Completar misiones para corporación: +5 a +50 (según nivel)
- Destruir enemigos de la facción: +1 a +10
- Donar recursos/créditos a corporación: +1 por cada 10,000₡
- Completar proyectos de construcción de estaciones: +100 a +500

**Perder Standing (-):**
- Atacar naves de la facción: -10 a -50
- Destruir estructuras de la facción: -50 a -200
- Completar misiones contra la facción: -20 a -100
- Comerciar con enemigos de la facción: -5 por transacción

### 10.3 Sistema de Puntos de Lealtad (LP)

Además del standing, las corporaciones otorgan **Puntos de Lealtad** al completar misiones.

**Mecánica:**
```
Misión completada = Standing + LP
- Misión Nivel 1: +10 standing, +50 LP
- Misión Nivel 2: +15 standing, +100 LP
- Misión Nivel 3: +25 standing, +250 LP
- Misión Nivel 4: +40 standing, +500 LP
- Misión Nivel 5: +60 standing, +1,000 LP
```

**Los LP son específicos por corporación:**
- Mineros Unidos LP: 4,580 LP
- Corporación Militar Vaxav LP: 820 LP
- Sindicato Técnico LP: 12,450 LP

### 10.4 Nivel de Agente y Acceso

**Nivel 1:**
- Standing requerido: -20 (Neutral bajo)
- Recompensas: 50-100 LP
- Misiones sencillas

**Nivel 2:**
- Standing requerido: +10
- Recompensas: 100-250 LP
- Misiones moderadas

**Nivel 3:**
- Standing requerido: +30
- Recompensas: 250-500 LP
- Misiones buenas

**Nivel 4:**
- Standing requerido: +50
- Recompensas: 500-1,000 LP
- Misiones excelentes

**Nivel 5:**
- Standing requerido: +70
- Recompensas: 1,000-2,500 LP
- Misiones excepcionales
- Acceso a items raros en tienda de lealtad

### 10.3 Tipos de Misiones

### 10.3.1 Misiones de Minería

"Extrae X unidades de Y mineral"

**Recompensas:**
- Créditos
- +Relación con corporación/facción
- Experiencia en Minería

### 10.3.2 Misiones de Transporte

"Transporta X m³ de carga desde A hasta B"

**Dificultad:**
- Puede haber piratas en la ruta
- Límite de tiempo (ticks)

**Recompensas:**
- Créditos (proporcional a distancia y riesgo)
- +Relación
- Experiencia en Pilotaje

### 10.3.3 Misiones de Combate

"Elimina X naves enemigas en Y ubicación"

**Variantes:**
- Eliminar piratas
- Escoltar convoy
- Defender estación

**Recompensas:**
- Créditos
- Loot de enemigos
- +Relación (y -Relación con facción enemiga)
- Experiencia en combate

### 10.3.4 Misiones de Investigación

"Escanea X anomalías" o "Recupera datos"

**Recompensas:**
- Chips de Diseño
- Datos de investigación
- +Standing y +LP
- Experiencia en Exploración

### 10.5 Tiendas de Lealtad (LP Stores)

Cada corporación NPC tiene una **Tienda de Lealtad** donde puedes canjear LP + Créditos por items exclusivos.

**Estructura SQL:**

```sql
CREATE TABLE loyalty_store_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    corporation_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('ship', 'module', 'blueprint_chip', 'implant', 'resource', 'special') NOT NULL,
    item_reference_id BIGINT UNSIGNED NOT NULL,
    lp_cost INT UNSIGNED NOT NULL,
    credits_cost BIGINT UNSIGNED DEFAULT 0,
    required_standing INT DEFAULT 0,
    stock_quantity INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (corporation_id) REFERENCES npc_corporations(id) ON DELETE CASCADE
);
```

**Categorías de Items en Tiendas de Lealtad:**

1. **Naves Especializadas**
   - Fragatas T2 especializadas (minería, combate, exploración)
   - Cruceros únicos de facción
   - Cargueros especiales con bonos

2. **Módulos Avanzados**
   - Módulos T2-T3 con descuento vs mercado
   - Módulos únicos de corporación (stats especiales)
   - Munición especial (penetrante, EMP, etc.)

3. **Chips de Diseño**
   - Chips T2: 2,500-8,000 LP + 1M-5M₡
   - Chips T3: 12,000-25,000 LP + 3M-15M₡
   - Chips únicos de facción (naves/módulos exclusivos)

4. **Implantes**
   - Implantes de eficiencia (+5% a +15% según actividad)
   - Implantes de combate (+10% daño, +5% HP, etc.)
   - Implantes de minería/fabricación

5. **Recursos con Descuento**
   - Recursos refinados (20-30% descuento vs mercado)
   - Componentes intermedios raros
   - Combustibles procesados

6. **Servicios Especiales**
   - Permisos de minería en cinturones exóticos
   - Licencias de caza de piratas (+25% bounties)
   - Descifrado garantizado de Núcleos de Datos

**Ejemplo: Tienda de Lealtad - Corporación Minera Vaxav:**

```
NAVES:
• Excavador MK-II (Fragata T2): 2,500 LP + 1,200,000₡ | Req: Standing +30
• Carguero Minero Gigante: 8,000 LP + 5,000,000₡ | Req: Standing +70

MÓDULOS:
• Láser de Minería Avanzado T2: 800 LP + 150,000₡ | Req: Standing +10
• Dron Minero Automático T3: 3,500 LP + 800,000₡ | Req: Standing +50

CHIPS DE DISEÑO:
• Chip: Excavador MK-III (T3): 12,000 LP + 3,000,000₡ | Req: Standing +90
• Chip: Refinería Móvil (Único): 5,000 LP + 1,500,000₡ | Req: Standing +60

IMPLANTES:
• Implante: Eficiencia Minera +5%: 2,000 LP + 500,000₡ | Req: Standing +40
• Implante: Rendimiento Refinamiento +10%: 4,500 LP + 1,200,000₡ | Req: Standing +60

ESPECIALES:
• Permiso Minería Cinturón Exótico (30 días): 1,000 LP + 500,000₡ | Req: Standing +50
```

**Ventajas de Alto Standing con Facciones:**

**Standing +70 con Confederación Vaxav:**
- Crear estaciones espaciales en sistemas IIC 1-2 (normalmente prohibido)
- Descuento 10% en tarifas de mercado
- Acceso a sistemas militares restringidos

**Standing +70 con Colectivo de Frontera:**
- Permiso para crear estaciones en IIC 3 sin represalias
- Acceso a mercados negros "legales"
- Escoltas NPC gratuitos en rutas peligrosas

**Standing +70 con Enclave Independiente:**
- Permiso de construcción en sistemas IIC 4-5
- Acceso a Chips de Diseño experimentales únicos en tienda de lealtad
- Bonos de exploración (+15% yield en sitios temporales)

---

## 11. Corporaciones y Organizaciones

### 11.1 Corporaciones de Jugadores

**Creación:**
- Requiere: 1,000,000 Créditos
- Nombre único
- Ticker único (3-5 caracteres, ej: "MINE")
- Mínimo 5 miembros fundadores

**Estructura SQL:**

```sql
CREATE TABLE corporations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    ticker VARCHAR(5) NOT NULL UNIQUE,
    description TEXT,
    ceo_pilot_id BIGINT UNSIGNED NOT NULL,
    founded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_count INT UNSIGNED DEFAULT 1,
    tax_rate DECIMAL(5,2) DEFAULT 10.00,
    wallet_balance BIGINT DEFAULT 0,
    FOREIGN KEY (ceo_pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
);

CREATE TABLE corporation_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    corporation_id BIGINT UNSIGNED NOT NULL,
    pilot_id BIGINT UNSIGNED NOT NULL,
    role ENUM('ceo', 'director', 'manager', 'recruiter', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shares INT UNSIGNED DEFAULT 0,
    FOREIGN KEY (corporation_id) REFERENCES corporations(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pilot_corp (pilot_id)
);

CREATE TABLE corporation_assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    corporation_id BIGINT UNSIGNED NOT NULL,
    asset_type ENUM('ship', 'module', 'resource', 'blueprint_unlock', 'item') NOT NULL,
    asset_reference_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED DEFAULT 1,
    location_type ENUM('station', 'hangar_corp', 'container') NOT NULL,
    location_reference_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (corporation_id) REFERENCES corporations(id) ON DELETE CASCADE
);

CREATE TABLE corporation_hangars (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    corporation_id BIGINT UNSIGNED NOT NULL,
    station_id BIGINT UNSIGNED NOT NULL,
    division_name VARCHAR(50) DEFAULT 'General',
    access_role ENUM('ceo', 'director', 'manager', 'all_members') DEFAULT 'all_members',
    capacity_m3 BIGINT UNSIGNED DEFAULT 1000000,
    FOREIGN KEY (corporation_id) REFERENCES corporations(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE TABLE corporation_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    corporation_id BIGINT UNSIGNED NOT NULL,
    pilot_id BIGINT UNSIGNED NULL,
    transaction_type ENUM('tax_collected', 'dividend_paid', 'asset_added', 'asset_removed', 'wallet_deposit', 'wallet_withdrawal') NOT NULL,
    amount BIGINT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (corporation_id) REFERENCES corporations(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE SET NULL
);
```

**Roles y Permisos:**

- **CEO:**
  - Control total
  - Disolver corporación
  - Cambiar impuestos
  - Expulsar cualquier miembro
  - Acceso total a wallet y hangares

- **Director:**
  - Gestionar miembros (invitar, expulsar members/recruiters)
  - Acceso total a hangares
  - Retirar hasta 1,000,000₡/día del wallet
  - Declarar guerras (con aprobación CEO)

- **Manager:**
  - Gestionar hangares (mover items)
  - Acceso a wallet (solo lectura)
  - Crear flotas corporativas

- **Recruiter:**
  - Invitar nuevos miembros
  - Acceso a hangares (solo lectura)

- **Member:**
  - Acceso básico a hangares según permisos
  - Unirse a flotas corporativas

**Impuestos Corporativos:**

```php
// Cuando un piloto completa una misión o vende items
$pilotEarnings = 100000; // 100K₡
$corporationTaxRate = 10; // 10%

$taxAmount = $pilotEarnings * ($corporationTaxRate / 100);
$pilotNetEarnings = $pilotEarnings - $taxAmount;

// Piloto recibe: 90,000₡
// Corporación recibe: 10,000₡ (va a corporation.wallet_balance)
```

**Hangares Corporativos:**
- Divisiones: "General", "Minerales", "Armas", "Naves"
- Permisos por rol: CEO/Director/Manager/Todos
- Capacidad: 1,000,000 m³ base (ampliable con módulos de estación)

### 11.2 Sistema de Flotas

**Estructura SQL:**

```sql
CREATE TABLE fleets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fleet_commander_id BIGINT UNSIGNED NOT NULL,
    corporation_id BIGINT UNSIGNED NULL,
    is_public BOOLEAN DEFAULT FALSE,
    max_members INT UNSIGNED DEFAULT 50,
    current_members INT UNSIGNED DEFAULT 1,
    objective TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbanded_at TIMESTAMP NULL,
    FOREIGN KEY (fleet_commander_id) REFERENCES pilots(id) ON DELETE CASCADE,
    FOREIGN KEY (corporation_id) REFERENCES corporations(id) ON DELETE SET NULL
);

CREATE TABLE fleet_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fleet_id BIGINT UNSIGNED NOT NULL,
    pilot_id BIGINT UNSIGNED NOT NULL,
    role ENUM('commander', 'wing_commander', 'squad_commander', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
);

CREATE TABLE fleet_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fleet_id BIGINT UNSIGNED NOT NULL,
    activity_type ENUM('combat_won', 'combat_lost', 'member_joined', 'member_left', 'mining_session', 'exploration_site', 'boss_killed') NOT NULL,
    description TEXT,
    rewards_distributed BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE
);

CREATE TABLE fleet_loot (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fleet_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('credits', 'resource', 'module', 'ship', 'blueprint_chip') NOT NULL,
    item_reference_id BIGINT UNSIGNED NULL,
    quantity INT UNSIGNED DEFAULT 1,
    claimed_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    FOREIGN KEY (claimed_by) REFERENCES pilots(id) ON DELETE SET NULL
);
```

**Creación de Flotas:**
- Gratis
- Máximo 50 miembros por flota (ampliable con skills)
- Tipos: Pública, Corporativa, Privada (solo invitación)

**Bonificadores de Flota:**

```
Minería en Flota:
- 2-5 naves minando juntas: +10% eficiencia
- 6-10 naves: +15% eficiencia
- 11+ naves: +20% eficiencia

Combate en Flota:
- 2-3 naves: +5% daño, +5% HP
- 4-6 naves: +10% daño, +10% HP
- 7+ naves: +15% daño, +15% HP

Exploración en Flota:
- Compartir resultados de escaneo
- +10% probabilidad de encontrar sitios raros
```

**Distribución de Loot:**
- Manual - Comandante asigna cada item
- Equitativo - Dividir créditos/recursos por igual
- Por contribución - Según daño/minería realizado
- Need before greed - Miembros "ruedan" por items

### 11.3 Alianzas

Agrupación de múltiples corporaciones.

**Requisitos:**
- Mínimo 3 corporaciones
- Votación de corporaciones fundadoras

**Beneficios:**
- Compartir estaciones
- Sistema de defensa mutua
- Declaraciones de guerra conjuntas

### 11.4 Diplomacia

**Estados Diplomáticos:**
- Guerra
- Neutral
- Pacto de No Agresión
- Alianza

**Sistema de Guerra:**
- Declaración de guerra: 144 ticks (~24h) de cooldown
- Duración mínima: 1008 ticks (~7 días)
- Costo: Escala según tamaño

---

## 12. Comercios de Jugadores

### 12.1 Concepto

Los pilotos pueden alquilar espacios comerciales en estaciones para ofrecer servicios a otros jugadores, creando una economía paralela player-owned.

**Módulo de Estación Requerido:** "Zona Comercial"
- Debe ser construido por la corporación dueña de la estación
- Ofrece espacios alquilables para diferentes tipos de negocios

### 12.2 Tipos de Comercios

**Espacios Disponibles:**
1. Gimnasio
2. Taberna/Bar
3. Tienda General
4. Restaurante
5. Taller de Reparaciones
6. Casino (futuro)
7. Salón de Entretenimiento (futuro)

### 12.3 Mecánica de Alquiler

**Proceso:**
1. Piloto visita "Zona Comercial" de estación
2. Ve espacios disponibles y precios de renta
3. Paga primer mes de renta + depósito
4. Configura su negocio (nombre, precios, inventario)
5. Abre al público

**Costos:**
- **Renta mensual:** 50,000₡ a 500,000₡ según tipo y ubicación de estación
- **Depósito:** 2x renta mensual (reembolsable al cerrar)
- **Impuesto por transacción:** 5-10% va a la corporación dueña de estación

**Duración:**
- Mes = 144 ticks × 30 = 4,320 ticks (~30 días reales si tick = 10 min)
- Renovación automática si hay fondos
- Si no se paga renta, comercio se cierra tras 72 ticks de gracia

### 12.4 Tipos de Comercios Detallados

### 12.4.1 Gimnasio

**Servicio:** Entrenar atributos físicos temporalmente

**Requiere del Dueño:**
- Skill "Gestión Comercial" (x4) nivel 1+
- Stock de "Equipo de Gimnasio" (item comprable o fabricable)

**Configuración:**
- **Precio por sesión:** Variable (ej: 500₡ - 5,000₡)
- **Duración del buff:** 12-72 ticks según equipo usado
- **Buff otorgado:** +5% a +15% experiencia física/combate

**Mecánica:**
1. Cliente paga y selecciona rutina
2. Consume 1 uso del equipo (dueño debe reponer stock)
3. Cliente recibe buff temporal
4. Integra con sistema de atributos de PRD-SocialSystem.md

### 12.4.2 Taberna/Bar

**Servicio:** Vender comida y bebida con buffs

**Requiere del Dueño:**
- Skill "Gestión Comercial" (x4) nivel 1+
- Stock de items tipo 'food' y 'drink'

**Configuración:**
- **Menú:** Lista de items con precios (markup sobre costo base)
- **Precio sugerido:** 150% a 300% del costo base

**Buffs típicos:**
- **Comida:** +10 a +30 nutrición, +5 a +15 moral
- **Bebidas alcohólicas:** +20 moral, -5 a -10 energía (temporal)
- **Comidas Premium:** +buffs de skills (ej: +10% exp minería 24 ticks)

**Ejemplo de Menú:**
```
╔═══════════════════════════════════════════════╗
║ TABERNA "EL VACÍO ALEGRE"                    ║
╠═══════════════════════════════════════════════╣
║ 🍖 Bistec Espacial        1,500₡  (+25 nutr) ║
║ 🍺 Cerveza Estelar          750₡  (+15 moral)║
║ 🍷 Vino de Nebulosa       2,500₡  (+20 moral)║
║ 🍲 Sopa Regenerativa      3,000₡  (+30 nutr) ║
╚═══════════════════════════════════════════════╝
```

### 12.4.3 Tienda General

**Servicio:** Vender items que el dueño fabrica, compra o recolecta

**Requiere del Dueño:**
- Skill "Gestión Comercial" (x4) nivel 1+
- Inventario de items para vender

**Configuración:**
- **Precios fijos:** Dueño establece precio por item
- **Stock visible:** Clientes ven cantidad disponible
- **Categorías:** Recursos, módulos, municiones, consumibles

**Ventaja vs Mercado:**
- No hay órdenes de compra/venta, solo venta directa
- Precios más estables
- Ideal para comercio de conveniencia (estación remota)
- Dueño puede especializarse (ej: "Tienda de Municiones")

**Ejemplo:**
```
╔═══════════════════════════════════════════════╗
║ TIENDA "ARSENAL DEL MINERO"                  ║
╠═══════════════════════════════════════════════╣
║ Láser de Minería T1       25,000₡  [Stock: 5]║
║ Ferrita Refinada (x100)    1,200₡  [Stock:50]║
║ Cobre Estelar (x100)       1,500₡  [Stock:30]║
║ Expansor de Carga T1      15,000₡  [Stock: 2]║
╚═══════════════════════════════════════════════╝
```

### 12.4.4 Restaurante

**Servicio:** Similar a Taberna pero especializado en comida premium con buffs potentes

**Requiere del Dueño:**
- Skill "Gestión Comercial" (x4) nivel 2+
- Skill "Cocina" (x3) - nueva skill específica
- Stock de ingredientes premium

**Configuración:**
- **Recetas especiales:** Combinan múltiples ingredientes
- **Buffs superiores:** +15% a +25% exp, duración 48-144 ticks
- **Precio premium:** 5,000₡ a 50,000₡ por plato

**Ejemplo:**
```
╔═══════════════════════════════════════════════╗
║ RESTAURANTE "ESTRELLA MICHELIN"              ║
╠═══════════════════════════════════════════════╣
║ 🍽️ Filete de Genoma        50,000₡           ║
║    (+25% exp todas skills por 72 ticks)      ║
║ 🥗 Ensalada de Esporas     25,000₡           ║
║    (+50 nutr, regenera 10 energía/tick x12)  ║
║ 🍰 Pastel de Materia Oscura 100,000₡         ║
║    (+30% exp + 20 moral por 144 ticks)       ║
╚═══════════════════════════════════════════════╝
```

### 12.4.5 Taller de Reparaciones

**Servicio:** Reparar naves con descuento vs hangar NPC

**Requiere del Dueño:**
- Skill "Gestión Comercial" (x4) nivel 2+
- Skill "Reparación de Naves" (x3) nivel 3+
- Stock de materiales de reparación

**Configuración:**
- **Descuento:** 10% a 30% más barato que hangar NPC
- **Tiempo:** Igual o ligeramente más lento
- **Especialización:** Puede especializarse en tipo de nave (ej: "Taller de Fragatas")

**Ventaja del Dueño:**
- Gana créditos + exp en Reparación
- Puede usar sus propios recursos refinados (más barato)

### 12.5 Habilidades Necesarias

**Skill: Gestión Comercial (x4)**
- Nivel 1: Puede abrir Gimnasio, Taberna, Tienda
- Nivel 2: Puede abrir Restaurante, Taller
- Nivel 3: -15% costos operativos, +10% max precio markup
- Nivel 4: -25% costos, +20% markup, 2 comercios simultáneos
- Nivel 5: -35% costos, +30% markup, 3 comercios, acceso a Casino

**Skill: Negociación (x3)**
- Bonifica precios de compra de inventario para reventa
- Nivel 1-5: -5% a -25% en compras a NPCs

**Skill: Cocina (x3)** (nueva)
- Desbloquea recetas especiales para Restaurante
- Nivel 1-5: Desbloquea recetas progresivamente mejores

### 12.6 Economía de Comercios

**Inversión Inicial Típica:**
- Gimnasio: ~200,000₡ (renta 3 meses + equipo inicial)
- Taberna: ~150,000₡ (renta 2 meses + stock comida)
- Tienda: ~500,000₡ (renta 2 meses + inventario grande)
- Restaurante: ~1,000,000₡ (renta 3 meses + ingredientes premium)

**ROI Estimado:**
- Gimnasio bien ubicado: 20-30 clientes/semana × 2,000₡ = ~50,000₡/semana
- Taberna popular: 50-100 ventas/semana × 1,000₡ avg = ~75,000₡/semana
- Tienda especializada: Márgenes 30-50%, volumen variable
- Restaurante premium: Pocos clientes pero alto margen

**Factores de Éxito:**
- **Ubicación:** Estaciones con mucho tráfico = más clientes
- **Precios competitivos:** Demasiado caro = sin ventas
- **Reputación:** Clientes satisfechos recomiendan
- **Marketing:** Anuncios en chat, mensajes directos
- **Stock:** Nunca quedarse sin inventario

### 12.7 Integración con Otros Sistemas

**Con Sistema Social (PRD-SocialSystem.md):**
- Gimnasios otorgan buffs que afectan atributos sociales
- Tabernas son lugares de encuentro social
- Clientes pueden dejar reviews/ratings (futuro)

**Con Sistema de Estaciones (PRD-Universe.md):**
- Zona Comercial es módulo de estación nivel 1-5
- Más espacios alquilables según nivel del módulo

**Con Economía General:**
- Alternativa al mercado tradicional
- Crea empleos "pasivos" para jugadores
- Fomenta especialización (chef, comerciante, mecánico)

---

## Navegación

- [← Anterior: PRD-ShipsAndCombat.md](./PRD-ShipsAndCombat.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-SocialSystem.md](./PRD-SocialSystem.md)
