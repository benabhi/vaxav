# Vaxav — diseño

> Documento vivo. Se va corrigiendo a medida que el juego se define; lo que está
> acá es intención de diseño, no una promesa.

## Visión

Vaxav es un juego web multijugador de navegador, **textual** y de **ritmo lento**.
El jugador es un piloto independiente con una nave en un sector espacial que
ninguna facción termina de controlar. No hay campaña ni final: es un sandbox
donde cada uno decide a qué dedicarse (extraer, transportar, comerciar,
explorar, pelear) y el mundo lo comparten todos.

Se lo puede definir como una mezcla de tres juegos: el **ritmo de OGame** —dar una
orden y esperar un contador—, la **profundidad de EVE Online** —habilidades que
tardan meses, economía en manos de los jugadores, un solo universo compartido— y
la **piel y las naves de Elite Dangerous** —el HUD naranja y una nave que se arma
ranura por ranura—.

La unidad de decisión es **una nave con capacidad limitada**, no una base que sólo
crece: por eso todo lo que se lleva obliga a dejar otra cosa.

## Pilares

1. **El tiempo es el recurso.** Toda acción tarda. No se acelera con clicks: se
   planifica. Una sesión típica es entrar, ver qué se resolvió, dar la próxima
   orden y salir.
2. **Texto, no gráficos.** La interfaz imita una terminal de a bordo. La riqueza
   está en los números y en la descripción, no en la animación.
3. **Todo cuesta algo.** Combustible, espacio de bodega, desgaste. Las decisiones
   duelen porque cierran otras puertas.
4. **El mundo es compartido.** Los precios, los recursos y los peligros dependen
   de lo que hagan los demás pilotos, no de un guion.
5. **Simple de entrar, hondo de jugar.** Pocas mecánicas, pero que se combinen.

## Bucle de juego

```
elegir acción → se agenda con un tiempo de resolución → esperar
             → al vencer, se aplica el resultado (recursos, daño, posición)
             → cambia el estado del piloto → elegir la próxima acción
```

Decisión técnica central: las acciones **no** se resuelven con un proceso que
corre en segundo plano tickeando cada segundo. Se guardan con su instante de
inicio y su duración, y se resuelven de forma **perezosa**: cuando el jugador (o
cualquier consulta que las necesite) las mira, se calcula lo que ya venció. Así
el servidor no trabaja mientras nadie juega y el resultado es el mismo esté el
jugador conectado o no.

## Sistemas

El detalle de cada sistema vive en su propio documento. Todos son **propuestas**:
la mecánica es la intención de diseño y los números están para corregirse.

| Documento                                            | De qué trata                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| [El MVP](MVP.md)                                     | Qué es lo mínimo que ya es Vaxav, y qué queda afuera                            |
| [Hoja de ruta](ROADMAP.md)                           | El orden en que se construye, y por qué ese orden                               |
| [Arquitectura](systems/ARCHITECTURE.md)              | Las decisiones técnicas caras de cambiar después                                |
| [Habilidades](systems/SKILLS.md)                     | Niveles 0–5, multiplicadores, curva de XP, prerrequisitos y catálogo            |
| [Acciones, tiempo y experiencia](systems/ACTIONS.md) | Cómo se calcula la duración, cómo se resuelve y cómo se reparte la XP           |
| [El universo](systems/UNIVERSE.md)                   | Jerarquía del mapa, tipos de cuerpo y el sistema inicial                        |
| [Naves y módulos](systems/SHIPS.md)                  | Atributos del casco, los tres presupuestos, los tipos de daño y el equipamiento |
| [Profesiones](systems/PROFESSIONS.md)                | El oficio previo del piloto y las habilidades con las que arranca               |
| [Facciones](systems/FACTIONS.md)                     | De dónde viene el piloto y en qué estación empieza                              |
| [Corporaciones](systems/CORPORATIONS.md)             | Quién opera las estaciones, y la capa entre estación y facción                  |
| [Agentes y misiones](systems/MISSIONS.md)            | Los NPC de las estaciones, la reputación y los cinco niveles                    |
| [Identidad visual](systems/VISUAL.md)                | La paleta naranja, la tipografía, los medidores y la portada                    |
| [Interfaz del juego](systems/INTERFACE.md)           | El Neocom lateral, la barra superior y el área central                          |

## Progresión

Un piloto **es lo que sabe hacer**: no hay niveles de personaje ni clases, sólo
habilidades del 0 al 5 que se entrenan _haciendo_. Cada acción resuelta reparte
experiencia entre la habilidad principal que la gobierna y las secundarias que
intervienen, y esa experiencia es lo único que separa a un recién llegado de un
veterano. Las habilidades complejas exigen otras entrenadas antes, así que el
catálogo es un árbol y elegir una rama significa algo. El detalle está en
[habilidades](systems/SKILLS.md).

Al crear el piloto se eligen **dos cosas independientes**, y conviene no
confundirlas:

- La **[profesión](systems/PROFESSIONS.md)** es el oficio previo: define con qué
  habilidades ya entrenadas arranca. Todas reparten el mismo presupuesto de
  experiencia, así que ninguna empieza mejor, sino distinto.
- La **[facción](systems/FACTIONS.md)** es el origen: de dónde viene y a quién
  responde. Por ahora sólo determina en qué estación aparece.

Separarlas evita el vicio de las facciones temáticas, donde elegir "los mineros"
es a la vez elegir una historia y una planilla de bonos.

## Identidad visual

**La interfaz imita la de Elite Dangerous lo más fielmente posible**: naranja
sobre casi negro, paneles translúcidos con borde fino, esquinas rectas,
mayúsculas espaciadas y un halo suave en el texto encendido. Es el objetivo
declarado, no una inspiración suelta, y ante cualquier duda de diseño la
respuesta es cómo lo resuelve ese juego.

No es una cita decorativa: ese HUD resuelve el problema que tiene Vaxav, que es
mostrar mucha información numérica sin cansar.

El detalle —paleta, tipografía, medidores, la portada— está en
[identidad visual](systems/VISUAL.md).

El juego es de estilo viejo; **la página no**. Lo retro es la mecánica —texto,
números, esperar—, no la ejecución: espaciado generoso, jerarquía clara, grilla
responsiva, foco visible y contraste accesible.

## Glosario inicial

- **Piloto** — la cuenta del jugador. Tiene nombre, facción, créditos,
  reputación y habilidades.
- **Nave** — el vehículo del piloto: bodega, combustible, integridad, slots.
- **Bodega** — capacidad limitada de carga; obliga a elegir qué llevar.
- **Slot** — hueco de la nave donde se monta un módulo. Alto, medio o bajo.
- **Módulo** — equipamiento montado en un slot; aporta bonos.
- **Habilidad** — destreza del piloto, de nivel 0 a 5, con un multiplicador de
  dificultad de x1 a x5.
- **Acción** — una orden con instante de inicio y duración (extraer, viajar,
  reparar, comerciar).
- **Informe** — el resultado de una acción resuelta: qué pasó y cuánta XP dio.
- **Bitácora** — el registro de todos los informes; lo primero que se lee al
  volver.
- **Profesión** — el oficio previo del piloto; define sus habilidades iniciales.
- **Facción** — de dónde viene el piloto; determina su estación de partida.
- **Sistema** — una estrella y los cuerpos que la orbitan. La unidad del mapa.
- **Cuerpo** — planeta, luna, cinturón, anillo o estación dentro de un sistema.
- **Créditos** — moneda del juego.

## Hoja de ruta

Está en su propio documento: [ROADMAP.md](ROADMAP.md). El resumen es que el
camino al MVP pasa por los cimientos que no se ven (roles, libro mayor,
resolución idempotente), el universo en la base, las naves, el motor de acciones,
la minería y, por último, la gente: chat y mensajes.

Lo que define al MVP y lo que queda deliberadamente afuera está en
[MVP.md](MVP.md).

## Decisiones técnicas

- **SvelteKit + TypeScript**: pantalla y servidor en el mismo proyecto y en el
  mismo lenguaje. Encaja con un juego sin gráficos.
- **SQLite** mientras el proyecto sea chico. El acceso va detrás de Drizzle y no
  usa nada propio de SQLite, así que migrar a PostgreSQL más adelante es cambiar
  `DATABASE_URL` y el conector.
- **Reglas separadas de la interfaz**: `src/lib/game/` no importa SvelteKit ni la
  base de datos, para poder probar las reglas sin levantar la app.
- **El servidor manda**: los temporizadores que ve el jugador son decorativos; lo
  que vale es el instante guardado en la base.

## Por decidir

Lo transversal. Cada documento de sistema tiene además su propia lista.

- Si hay muerte/pérdida de nave permanente o sólo pérdida de carga.
- Cuánto PvP directo y cuánto conflicto indirecto (economía, bloqueos).
- Si el mapa es fijo o generado, y de qué tamaño.
- Ritmo real de las acciones (minutos, horas) y cuántas se pueden encolar.
