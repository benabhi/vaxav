# Hoja de ruta

> El orden en que se construye Vaxav y por qué ese orden. Cada fase deja algo que
> se puede probar; ninguna es sólo andamio.
>
> Ver también: [MVP](MVP.md) · [arquitectura](systems/ARCHITECTURE.md)

## Hecho

| Fase   | Qué dejó                                                             |
| ------ | -------------------------------------------------------------------- |
| **F0** | Esqueleto del proyecto: SvelteKit, estructura, configuración, tests  |
| **F1** | Sistema de estilos y portada                                         |
| **F2** | Pilotos: alta en cuatro pasos, ingreso, sesión, base de datos propia |
| **F3** | Interfaz Elite Dangerous, Neocom y las siete secciones               |

## Camino al MVP

Las fases están ordenadas por **dependencia**, no por entusiasmo: cada una
necesita la anterior.

### F4 · Cimientos que no se ven

Lo que hay que tener antes de que exista un solo jugador real, porque después
obliga a tocar todo.

- Roles y permisos: jugador, moderador, administrador.
- Libro mayor de créditos e ítems, con sus asientos.
- El patrón de resolución idempotente, con su prueba de concurrencia.
- Tabla de configuración para los números de balance.
- Las tres facciones definitivas, en reemplazo de las cuatro actuales.

> Es la fase menos vistosa y la más importante. Ver
> [arquitectura](systems/ARCHITECTURE.md).

### F5 · El universo en la base

- Modelo jerárquico: región, sistema, cuerpo, estación.
- El sistema Ánfora cargado como datos, no como constantes.
- Servicios de estación como módulos: astillero, equipamiento, refinería, taller.
- El piloto tiene una posición real y una estación de referencia.

### F6 · Naves y hangar · **en parte**

- ~~Cascos con estadísticas y ranuras por clase.~~
- ~~Los cinco modelos iniciales.~~
- ~~Módulos con clase y calificación; catálogo corto pero real.~~
- ~~Bonos de casco que dependen de habilidades.~~
- ~~Cada piloto con su nave guardada, y viajar con su velocidad real.~~
- Falta: tener más de una nave, comprarlas en el astillero, y la bodega.

### F7 · El motor de acciones · **el corazón**

- Encolar, resolver de forma perezosa e idempotente, informar.
- Reparto de experiencia a la habilidad principal y las secundarias.
- Bitácora de informes.
- **El indicador siempre visible** de la acción en curso.
- Primera acción real: **viajar** entre cuerpos del sistema.

### F8 · Minería

- Extraer en un cinturón, con rendimiento por habilidades, nave y módulos.
- Bodega con capacidad real y la decisión de qué llevar.
- Agotamiento y recuperación de los cinturones, con su trabajo periódico.
- Venta básica a la estación, con su asiento en el libro.

### F9 · Gente

- Chat en tiempo real, global y por sistema.
- Mensajería asíncrona entre pilotos.
- Perfil público de un piloto.

**Acá termina el MVP.** Ver [MVP](MVP.md) para la lista de aceptación.

## Después del MVP

En orden de valor, no de dificultad:

### F10 · Mercado

Órdenes de compra y venta por estación, casamiento de órdenes, historial de
precios. Es el sistema que convierte recursos en economía, y el más grande de
todos: se lleva su propia serie de fases.

### F11 · Industria

Refinado, fabricación de módulos y componentes. Le da razón de ser a la minería y
alimenta al mercado.

### F12 · Corporaciones

Grupos de pilotos, roles internos, bodega compartida, billetera común.

### F13 · La galaxia

Más sistemas, saltos entre ellos, la sección de navegación con su mapa.
Descubrimiento y cartografía.

### F14 · Combate

Encuentros, pérdida de carga y de nave, seguridad por zonas. El más difícil de
balancear y el que más daño hace mal hecho: va tarde a propósito.

### F15 · Propiedades y estaciones de jugador

Instalaciones que producen sin el piloto presente. Cierra el círculo de la
economía.

### Sin fase asignada

- Misiones de NPC y contactos en estación.
- Ingeniería y modificación de módulos.
- Reputación por facción con sus consecuencias.
- Eventos del sector.

## Lo que se decide en el camino

Preguntas abiertas que van a condicionar fases enteras y conviene resolver antes
de llegar a ellas:

| Pregunta                                          | Se necesita en |
| ------------------------------------------------- | -------------- |
| Ritmo real: ¿cuánto tarda una acción típica?      | F7             |
| ¿Se puede encolar más de una acción?              | F7             |
| ¿Qué se pierde al morir: la carga, la nave, nada? | F14            |
| ¿El mapa es fijo o generado?                      | F13            |
| ¿Cuánto PvP directo y cuánto conflicto indirecto? | F14            |
